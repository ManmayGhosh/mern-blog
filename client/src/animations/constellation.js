import * as THREE from 'three';

// A drifting constellation of connected points — evokes ideas/notes linking together.
export function createConstellation(scene) {
  const count = 60;
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push(
      new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
    );
  }

  const pointsGeometry = new THREE.BufferGeometry().setFromPoints(nodes);
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0x1b1d24,
    size: 0.08,
    transparent: true,
    opacity: 0.6
  });
  const points = new THREE.Points(pointsGeometry, pointsMaterial);

  const maxDist = 3;
  const linePositions = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (nodes[i].distanceTo(nodes[j]) < maxDist) {
        linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
      }
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x9c3d34, transparent: true, opacity: 0.15 });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

  const group = new THREE.Group();
  group.add(points, lines);
  scene.add(group);

  return {
    object: group,
    update(t) {
      group.rotation.y = t * 0.05;
      group.rotation.x = Math.sin(t * 0.03) * 0.1;
    },
    dispose() {
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    }
  };
}
