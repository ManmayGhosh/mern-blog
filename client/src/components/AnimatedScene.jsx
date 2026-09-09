import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SCENES } from '../animations/index.js';

export default function AnimatedScene({ sceneKey, className = '' }) {
  const containerRef = useRef(null);
  const stateRef = useRef({});

  // One-time renderer/camera setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    let currentScene = null;
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      currentScene?.update?.(t);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    stateRef.current = { scene, renderer, container, setCurrent: (s) => (currentScene = s) };

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      currentScene?.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the active generative scene whenever sceneKey changes, without rebuilding the renderer
  useEffect(() => {
    const state = stateRef.current;
    if (!state.scene) return;

    const def = SCENES[sceneKey] || Object.values(SCENES)[0];
    const active = def.create(state.scene);
    state.setCurrent(active);

    return () => {
      state.scene.remove(active.object);
      active.dispose?.();
      state.setCurrent(null);
    };
  }, [sceneKey]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
