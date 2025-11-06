import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grid helper
const grid = new THREE.GridHelper(20, 20);
scene.add(grid);

camera.position.z = 10;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();