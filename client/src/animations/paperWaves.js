import * as THREE from 'three';

// A rippling wireframe plane, like paper catching light and moving in a breeze.
export function createPaperWaves(scene) {
  const width = 16;
  const depth = 10;
  const segX = 40;
  const segY = 24;
  const geometry = new THREE.PlaneGeometry(width, depth, segX, segY);
  geometry.rotateX(-Math.PI / 2.4);

  const material = new THREE.MeshBasicMaterial({
    color: 0xb3872f,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -1.5;
  scene.add(mesh);

  const basePositions = geometry.attributes.position.array.slice();

  return {
    object: mesh,
    update(t) {
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = basePositions[i];
        const z = basePositions[i + 2];
        pos[i + 1] = Math.sin(x * 0.5 + t * 0.6) * 0.35 + Math.cos(z * 0.6 + t * 0.4) * 0.25;
      }
      geometry.attributes.position.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}
