import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grid helper
const grid = new THREE.GridHelper(20, 20);
scene.add(grid);

// Axes helper (X=vermelho, Y=verde, Z=azul)
const axes = new THREE.AxesHelper(5);
scene.add(axes);

// Luz ambiente suave
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// Luz direcional para dar volume ao cubo
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Cubo simples no centro
const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const cubeMat = new THREE.MeshStandardMaterial({ color: 0x2196f3, metalness: 0.1, roughness: 0.8 });
const cube = new THREE.Mesh(cubeGeo, cubeMat);
scene.add(cube);

camera.position.set(3, 3, 8);
camera.lookAt(0, 0, 0);

// Controles de órbita (mouse)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
// Limites de zoom e ângulos
controls.minDistance = 2;      // Aproximação mínima
controls.maxDistance = 50;     // Distância máxima
controls.minPolarAngle = 0.1;  // Evita colar no topo
controls.maxPolarAngle = Math.PI / 2; // Não deixa passar do plano (90°)
controls.update();

// Responsivo ao resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  // Animação sutil no cubo para dar vida
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.015;
  controls.update();
  renderer.render(scene, camera);
}

animate();
