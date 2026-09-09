import * as THREE from 'three';

// Ink diffusing upward through water — soft particles drifting with gentle turbulence.
export function createInkDrift(scene) {
  const count = 900;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10 - 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    velocities[i] = 0.15 + Math.random() * 0.3;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x9c3d34,
    size: 0.06,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    object: points,
    update(t) {
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += velocities[i] * 0.01;
        pos[i * 3] += Math.sin(t * 0.5 + phases[i]) * 0.002;
        if (pos[i * 3 + 1] > 6) {
          pos[i * 3 + 1] = -6;
          pos[i * 3] = (Math.random() - 0.5) * 14;
        }
      }
      geometry.attributes.position.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}
