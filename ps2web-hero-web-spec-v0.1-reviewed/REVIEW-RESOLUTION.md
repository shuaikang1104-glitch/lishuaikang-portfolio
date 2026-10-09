# Hero Review Resolution

Status: **RESOLVED FOR BENCHMARK**

- Reference crop is exactly **1920×1136**. The Photoshop group extends below the viewport, but content beginning below y=1136 is excluded from this benchmark.
- Hidden source layers **18 / 21 / 56** are confirmed visually in `reference.png` and must render.
- The lower `Professional Skills` group beginning around y=1193 is outside the benchmark and is excluded.
- No raster/smart-object asset is required by the reviewed Hero render set.
- Font availability in Photoshop is known from Scanner; availability in the web implementation runtime must still be checked by the implementation agent. Silent fallback is forbidden.
- Responsive inference is intentionally deferred.
