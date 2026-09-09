import * as THREE from 'three';

// Concentric ring "postmarks" orbiting each other, echoing the app's stamp motif in 3D.
export function createPostmarkOrbit(scene) {
  const group = new THREE.Group();
  const rings = [];
  const ringCount = 7;

  for (let i = 0; i < ringCount; i++) {
    const radius = 1.2 + i * 0.55;
    const curve = new THREE.TorusGeometry(radius, 0.015, 8, 64);
    const material = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x9c3d34 : 0xb3872f,
      transparent: true,
      opacity: 0.4 - i * 0.02
    });
    const ring = new THREE.Mesh(curve, material);
    ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    ring.rotation.y = (Math.random() - 0.5) * 0.6;
    group.add(ring);
    rings.push({ mesh: ring, speed: (i % 2 === 0 ? 1 : -1) * (0.08 + i * 0.015) });
  }

  group.position.set(2, 0.5, -2);
  scene.add(group);

  return {
    object: group,
    update(t) {
      rings.forEach(({ mesh, speed }) => {
        mesh.rotation.z = t * speed;
      });
      group.rotation.y = Math.sin(t * 0.1) * 0.3;
    },
    dispose() {
      rings.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
    }
  };
}
