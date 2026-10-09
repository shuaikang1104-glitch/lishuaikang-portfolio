'use client';

import { useEffect, useRef } from 'react';
import styles from './case.module.css';

export default function FloatingPin() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const header = host?.parentElement;
    if (!host || !header) return;
    let alive = true;
    let cleanup = () => {};

    async function initialize() {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import('three'),
        import('three/addons/loaders/GLTFLoader.js'),
      ]);
      if (!alive || !host || !header) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(180, 180);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, 0.1, 20);
      camera.position.set(0, 0, 6);
      const stack = new THREE.Group();
      scene.add(stack, new THREE.AmbientLight(0xffffff, 1.4));
      const key = new THREE.DirectionalLight(0xffffff, 2);
      key.position.set(-3, 4, 6);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.6);
      fill.position.set(4, 0, 3);
      scene.add(fill);

      const initialX = THREE.MathUtils.degToRad(-3);
      const initialY = THREE.MathUtils.degToRad(-5);
      stack.rotation.set(initialX, initialY, 0);
      let model: import('three').Object3D | null = null;
      let frame = 0;
      let idleTimer: ReturnType<typeof setTimeout> | undefined;
      let visible = false;
      let roomAvailable = false;
      let bounds = host.getBoundingClientRect();
      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      let previousTime = 0;
      let visibleRight = 180;
      let inside = false;
      let sweepStarted = 0;
      let sweeping = false;
      const sweepCenter = { value: -0.18 };
      const sweepStrength = { value: 0 };
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');

      const update = (time: number) => {
        frame = 0;
        if (!alive || !visible || !roomAvailable || document.hidden || !model) return;
        const delta = previousTime ? Math.min(time - previousTime, 40) : 16.67;
        previousTime = time;
        const damping = 1 - Math.exp(-delta / 100);
        currentX += (targetX - currentX) * damping;
        currentY += (targetY - currentY) * damping;
        const settled = Math.abs(targetX - currentX) < 0.0001 && Math.abs(targetY - currentY) < 0.0001;
        if (settled) { currentX = targetX; currentY = targetY; }
        stack.rotation.set(initialX + currentX, initialY + currentY, 0);
        if (sweeping) {
          const progress = Math.min(1, (time - sweepStarted) / 700);
          sweepCenter.value = -0.18 + progress * 1.36;
          sweepStrength.value = progress < 1 ? Math.sin(progress * Math.PI) * 0.32 : 0;
          sweeping = progress < 1;
        }
        renderer.render(scene, camera);
        if (!settled || sweeping) frame = requestAnimationFrame(update);
      };
      const requestRender = () => {
        if (frame || !model || !visible || !roomAvailable || document.hidden) return;
        previousTime = 0;
        frame = requestAnimationFrame(update);
      };
      const reset = () => {
        clearTimeout(idleTimer);
        const needsRender = currentX !== 0 || currentY !== 0 || targetX !== 0 || targetY !== 0;
        targetX = targetY = 0;
        if (needsRender) requestRender();
      };
      const leave = () => {
        inside = false;
        reset();
      };
      const cancelSweep = () => {
        const hadHighlight = sweeping || sweepStrength.value !== 0;
        sweeping = false;
        sweepStrength.value = 0;
        if (hadHighlight) requestRender();
      };
      const visibilityChanged = () => {
        leave();
        if (document.hidden) cancelSweep();
        else requestRender();
      };
      const motionChanged = () => {
        reset();
        if (motion.matches) cancelSweep();
      };
      const positionInWhitespace = () => {
        const nav = header.querySelector('nav');
        const intro = header.querySelector('dl')?.nextElementSibling;
        if (!nav || !intro) return;
        const headerBox = header.getBoundingClientRect();
        const navBox = nav.getBoundingClientRect();
        const introBox = intro.getBoundingClientRect();
        const gap = introBox.top - navBox.bottom;
        // Keep the frozen narrow-screen layout intact when there is no independent right-hand space.
        const previousRoom = roomAvailable;
        roomAvailable = introBox.left > headerBox.left + headerBox.width * 0.4 && gap >= 228;
        host.style.visibility = roomAvailable ? 'visible' : 'hidden';
        host.style.left = `${introBox.right - headerBox.left - visibleRight}px`;
        host.style.top = `${navBox.bottom - headerBox.top + (gap - 180) / 2}px`;
        bounds = host.getBoundingClientRect();
        if (roomAvailable && !previousRoom) requestRender();
      };
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || motion.matches || !pointer.matches || !roomAvailable) return;
        const x = (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2 + 24);
        const y = (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2 + 24);
        if (Math.abs(x) > 1 || Math.abs(y) > 1) { leave(); return; }
        if (!inside) {
          inside = true;
          sweeping = true;
          sweepStarted = performance.now();
        }
        targetX = -y * THREE.MathUtils.degToRad(11);
        targetY = x * THREE.MathUtils.degToRad(17);
        requestRender();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(reset, 220);
      };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          leave();
          cancelSweep();
          cancelAnimationFrame(frame);
          frame = 0;
          currentX = currentY = 0;
        } else requestRender();
      });
      observer.observe(host);
      const resize = new ResizeObserver(positionInWhitespace);
      resize.observe(header);
      const intro = header.querySelector('dl')?.nextElementSibling;
      if (intro) resize.observe(intro);
      header.addEventListener('pointermove', move, { passive: true });
      header.addEventListener('pointerleave', leave);
      window.addEventListener('scroll', positionInWhitespace, { passive: true });
      window.addEventListener('resize', positionInWhitespace);
      document.addEventListener('visibilitychange', visibilityChanged);
      motion.addEventListener('change', motionChanged);
      positionInWhitespace();

      const disposeModel = (root: import('three').Object3D) => {
        const geometries = new Set<import('three').BufferGeometry>();
        const materials = new Set<import('three').Material>();
        const textures = new Set<import('three').Texture>();
        root.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          geometries.add(node.geometry);
          for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
            materials.add(material);
            for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
          }
        });
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        textures.forEach((texture) => texture.dispose());
      };
      cleanup = () => {
        clearTimeout(idleTimer);
        cancelAnimationFrame(frame);
        observer.disconnect();
        resize.disconnect();
        header.removeEventListener('pointermove', move);
        header.removeEventListener('pointerleave', leave);
        window.removeEventListener('scroll', positionInWhitespace);
        window.removeEventListener('resize', positionInWhitespace);
        document.removeEventListener('visibilitychange', visibilityChanged);
        motion.removeEventListener('change', motionChanged);
        if (model) disposeModel(model);
        renderer.dispose();
        renderer.domElement.remove();
      };
      const gltf = await new GLTFLoader().loadAsync('/models/zhu_bingren_floating_pin_clean%20(1).glb');
      if (!alive) { disposeModel(gltf.scene); return; }
      model = gltf.scene;
      // Center the original asset through its parent transform; materials and geometry remain untouched.
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      const centered = new THREE.Group();
      centered.position.copy(center).multiplyScalar(-1);
      centered.add(model);
      stack.add(centered);

      // Add a temporary highlight only to fragments of the original mesh surfaces.
      // Alpha, texture, metalness and roughness still use the unmodified GLB material.
      const surfaceMaterials = new Set<import('three').MeshStandardMaterial>();
      model.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          if (material instanceof THREE.MeshStandardMaterial) surfaceMaterials.add(material);
        }
      });
      surfaceMaterials.forEach((material) => {
        const originalCompile = material.onBeforeCompile;
        material.onBeforeCompile = (shader, activeRenderer) => {
          originalCompile.call(material, shader, activeRenderer);
          shader.uniforms.uPinSweepCenter = sweepCenter;
          shader.uniforms.uPinSweepStrength = sweepStrength;
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nvarying float vPinSweepCoord;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPinSweepCoord = (position.x - position.y) / 4.0 + 0.5;');
          shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', '#include <common>\nvarying float vPinSweepCoord;\nuniform float uPinSweepCenter;\nuniform float uPinSweepStrength;')
            .replace('#include <opaque_fragment>', `
              float pinSweepDistance = (vPinSweepCoord - uPinSweepCenter) / 0.09;
              float pinSweep = exp(-pinSweepDistance * pinSweepDistance) * uPinSweepStrength;
              outgoingLight += vec3(pinSweep);
              #include <opaque_fragment>
            `);
        };
        material.customProgramCacheKey = () => 'floating-pin-surface-sweep-v1';
      });

      // Measure alpha at the resting pose, including the original silhouette/texture edges.
      // The private target never appears in the page; it only supplies the visible right edge.
      const pixels = Math.round(180 * renderer.getPixelRatio());
      const measurement = new THREE.WebGLRenderTarget(pixels, pixels, { samples: 4 });
      renderer.setRenderTarget(measurement);
      renderer.render(scene, camera);
      const rgba = new Uint8Array(pixels * pixels * 4);
      renderer.readRenderTargetPixels(measurement, 0, 0, pixels, pixels, rgba);
      renderer.setRenderTarget(null);
      measurement.dispose();
      let rightmost = -1;
      for (let y = 0; y < pixels; y++) {
        for (let x = rightmost + 1; x < pixels; x++) {
          if (rgba[(y * pixels + x) * 4 + 3] > 8) rightmost = x;
        }
      }
      if (rightmost < 0) throw new Error('Unable to measure the visible pin silhouette.');
      visibleRight = (rightmost + 1) * 180 / pixels;
      positionInWhitespace();
      host.dataset.badgeState = 'ready';
      requestRender();
    }

    initialize().catch((error) => {
      cleanup();
      if (alive) { host.dataset.badgeState = 'error'; console.error('Floating pin failed to load:', error); }
    });
    return () => { alive = false; cleanup(); };
  }, []);

  return <div ref={hostRef} className={styles.floatingPin} data-badge-state="loading" aria-hidden="true" />;
}
