#target photoshop

(function () {
  var doc = app.activeDocument;
  if (!doc) {
    alert("No active Photoshop document found.");
    return;
  }

  var warnings = [];
  var layers = [];
  var sections = [];

  function toNumber(value, fallback) {
    if (value === undefined || value === null) {
      return fallback;
    }
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      var parsed = Number(value);
      return isNaN(parsed) ? fallback : parsed;
    }
    if (value && typeof value === "object") {
      if (value.value !== undefined) {
        var num = Number(value.value);
        return isNaN(num) ? fallback : num;
      }
      if (value.toString && value.toString() !== "") {
        var num2 = Number(value.toString());
        return isNaN(num2) ? fallback : num2;
      }
    }
    return fallback;
  }

  function safeString(value) {
    if (value === undefined || value === null) {
      return "";
    }
    return String(value);
  }

  function escapeJsonString(str) {
    if (str === undefined || str === null) {
      return "";
    }

    var result = "";
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i);
      var code = str.charCodeAt(i);

      if (ch === "\\") {
        result += "\\\\";
      } else if (ch === '"') {
        result += "\\\"";
      } else if (ch === "\b") {
        result += "\\b";
      } else if (ch === "\f") {
        result += "\\f";
      } else if (ch === "\n") {
        result += "\\n";
      } else if (ch === "\r") {
        result += "\\r";
      } else if (ch === "\t") {
        result += "\\t";
      } else if (code < 0x20) {
        var hex = code.toString(16).toUpperCase();
        while (hex.length < 4) {
          hex = "0" + hex;
        }
        result += "\\u" + hex;
      } else {
        result += ch;
      }
    }
    return result;
  }

  function serializeJson(value, indentLevel) {
    var indent = "";
    for (var i = 0; i < indentLevel; i++) {
      indent += "  ";
    }

    if (value === null || value === undefined) {
      return "null";
    }

    if (typeof value === "number") {
      if (isNaN(value) || !isFinite(value)) {
        return "null";
      }
      return String(value);
    }

    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }

    if (typeof value === "string") {
      return '"' + escapeJsonString(value) + '"';
    }

    if (value instanceof Array) {
      if (value.length === 0) {
        return "[]";
      }
      var inner = "";
      for (var j = 0; j < value.length; j++) {
        inner += (j > 0 ? ",\n" : "") + indent + "  " + serializeJson(value[j], indentLevel + 1);
      }
      return "[\n" + inner + "\n" + indent + "]";
    }

    if (typeof value === "object") {
      var keys = [];
      for (var key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          keys.push(key);
        }
      }
      if (keys.length === 0) {
        return "{}";
      }
      var content = "";
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        content += (k > 0 ? ",\n" : "") + indent + "  " + '"' + escapeJsonString(key) + '"' + ": " + serializeJson(value[key], indentLevel + 1);
      }
      return "{\n" + content + "\n" + indent + "}";
    }

    return "null";
  }

  function getRgbHex(color) {
    try {
      if (!color) {
        return null;
      }
      if (color.typename === "RGBColor") {
        var r = toNumber(color.red, 0);
        var g = toNumber(color.green, 0);
        var b = toNumber(color.blue, 0);
        var toHex = function (value) {
          var hex = Number(value).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };
        return toHex(r) + toHex(g) + toHex(b);
      }
      if (color.rgb && color.rgb.hexValue) {
        return safeString(color.rgb.hexValue);
      }
    } catch (e) {
      warnings.push("Unable to read color: " + safeString(e.message));
    }
    return null;
  }

  function normalizeColor(color) {
    if (!color) {
      return null;
    }
    var result = {
      type: safeString(color.typename),
      hex: null,
      rgb: null
    };

    try {
      if (color.typename === "RGBColor") {
        result.rgb = {
          r: toNumber(color.red, 0),
          g: toNumber(color.green, 0),
          b: toNumber(color.blue, 0)
        };
        result.hex = getRgbHex(color);
      }
    } catch (e) {
      warnings.push("Unable to normalize color: " + safeString(e.message));
    }

    return result;
  }

  function getTextProperties(layer) {
    var props = {
      text: null,
      font: null,
      size: null,
      color: null,
      alignment: null,
      leading: null,
      tracking: null
    };

    try {
      if (!layer || !layer.textItem) {
        return props;
      }

      var textItem = layer.textItem;
      if (textItem.contents !== undefined) {
        props.text = safeString(textItem.contents);
      }
      if (textItem.font !== undefined) {
        props.font = safeString(textItem.font);
      }
      if (textItem.size !== undefined) {
        props.size = toNumber(textItem.size, 0);
      }
      if (textItem.color) {
        props.color = normalizeColor(textItem.color);
      }
      if (textItem.justification !== undefined) {
        props.alignment = safeString(textItem.justification);
      }
      if (textItem.leading !== undefined) {
        props.leading = toNumber(textItem.leading, null);
      }
      if (textItem.tracking !== undefined) {
        props.tracking = toNumber(textItem.tracking, null);
      }
    } catch (e) {
      warnings.push("Unable to read text properties for layer '" + safeString(layer && layer.name) + "': " + safeString(e.message));
    }

    return props;
  }

  function getBounds(layer) {
    var result = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    try {
      if (!layer || !layer.bounds) {
        return result;
      }
      var bounds = layer.bounds;
      var left = toNumber(bounds[0], 0);
      var top = toNumber(bounds[1], 0);
      var right = toNumber(bounds[2], 0);
      var bottom = toNumber(bounds[3], 0);
      result.x = left;
      result.y = top;
      result.width = Math.max(0, right - left);
      result.height = Math.max(0, bottom - top);
    } catch (e) {
      warnings.push("Unable to read bounds for layer '" + safeString(layer && layer.name) + "': " + safeString(e.message));
    }

    return result;
  }

  function layerNameOrFallback(layer) {
    if (!layer) {
      return "<unknown>";
    }
    if (layer.name !== undefined && layer.name !== null && String(layer.name) !== "") {
      return String(layer.name);
    }
    return layer.typename || "<unnamed>";
  }

  function walkLayer(layer, parentName, depth) {
    var bounds = getBounds(layer);
    var info = {
      name: layerNameOrFallback(layer),
      type: safeString(layer.typename),
      kind: layer.kind !== undefined ? safeString(layer.kind) : null,
      parent: parentName,
      depth: depth,
      group: (layer.parent && layer.parent.name) ? safeString(layer.parent.name) : null,
      visible: !!layer.visible,
      opacity: toNumber(layer.opacity, 100),
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      text: null,
      font: null,
      size: null,
      color: null,
      alignment: null,
      leading: null,
      tracking: null
    };

    try {
      if (layer.kind && layer.kind === LayerKind.TEXT) {
        var textInfo = getTextProperties(layer);
        info.text = textInfo.text;
        info.font = textInfo.font;
        info.size = textInfo.size;
        info.color = textInfo.color;
        info.alignment = textInfo.alignment;
        info.leading = textInfo.leading;
        info.tracking = textInfo.tracking;
      }
    } catch (e) {
      warnings.push("Unable to resolve textual metadata for layer '" + safeString(layer && layer.name) + "': " + safeString(e.message));
    }

    layers.push(info);

    if (layer.layers && layer.layers.length) {
      for (var i = 0; i < layer.layers.length; i++) {
        walkLayer(layer.layers[i], info.name, depth + 1);
      }
    }
  }

  function collectTopLevelSections() {
    var rootLayers = doc.layers;
    for (var i = 0; i < rootLayers.length; i++) {
      var layer = rootLayers[i];
      var bounds = getBounds(layer);
      sections.push({
        name: layerNameOrFallback(layer),
        parent: "document",
        depth: 0,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        visible: !!layer.visible,
        opacity: toNumber(layer.opacity, 100),
        type: safeString(layer.typename),
        group: null
      });
    }
  }

  function findSectionRoot() {
    var candidates = doc.layers;
    for (var i = 0; i < candidates.length; i++) {
      var layer = candidates[i];
      var name = safeString(layer.name);
      if (name.indexOf("首屏") !== -1 || name.indexOf("hero") !== -1 || name.indexOf("Hero") !== -1 || name.indexOf("HOME") !== -1 || name.indexOf("home") !== -1) {
        return layer;
      }
    }
    return candidates.length ? candidates[0] : null;
  }

  function buildDocumentSnapshot() {
    collectTopLevelSections();

    var sectionRoot = findSectionRoot();
    if (sectionRoot) {
      walkLayer(sectionRoot, "document", 0);
    } else {
      for (var i = 0; i < doc.layers.length; i++) {
        walkLayer(doc.layers[i], "document", 0);
      }
    }

    return {
      document: {
        name: safeString(doc.name),
        width: toNumber(doc.width, 0),
        height: toNumber(doc.height, 0),
        resolution: {
          horizontal: toNumber(doc.resolution, 72),
          vertical: toNumber(doc.resolution, 72)
        },
        colorMode: safeString(doc.mode),
        activeLayer: safeString(doc.activeLayer && doc.activeLayer.name)
      },
      sections: sections,
      layers: layers,
      warnings: warnings
    };
  }

  function buildUniqueOutputFile(folder) {
    var basePath = folder.fsName + "/design-spec.json";
    var outputFile = new File(basePath);
    var index = 2;

    while (outputFile.exists) {
      outputFile = new File(folder.fsName + "/design-spec-" + index + ".json");
      index++;
    }

    return outputFile;
  }

  function writeJsonFile(data, filePath) {
    var outputFile = filePath;
    outputFile.encoding = "UTF-8";
    outputFile.open("w");
    outputFile.write(serializeJson(data, 0));
    outputFile.write("\n");
    outputFile.close();
  }

  var scriptFolder = new File($.fileName).parent;
  var outputFile = buildUniqueOutputFile(scriptFolder);
  var snapshot = buildDocumentSnapshot();

  writeJsonFile(snapshot, outputFile);
  alert("Design spec exported to:\n" + outputFile.fsName);
})();
