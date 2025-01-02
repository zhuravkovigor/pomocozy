import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

// Get the game container
const gameContainer = document.getElementById("game");
const width = gameContainer.clientWidth;
const height = gameContainer.clientHeight;

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
gameContainer.appendChild(renderer.domElement);

// Add a cube to the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position the camera on top of the cube and slightly change its position by x
camera.position.set(
  cube.position.x + 2,
  cube.position.y + 3,
  cube.position.z + 4
);
camera.lookAt(cube.position);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false; // Disable rotation
controls.enableZoom = false; // Disable zoom
controls.enablePan = false; // Disable panning

// Add a sky
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms["turbidity"].value = 20;
skyUniforms["rayleigh"].value = 2;
skyUniforms["mieCoefficient"].value = 0.005;
skyUniforms["mieDirectionalG"].value = 1;

const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(90 - 10);
const theta = THREE.MathUtils.degToRad(180);
sun.setFromSphericalCoords(1, phi, theta);
skyUniforms["sunPosition"].value.copy(sun);

// Keyboard controls
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
};

// Event listeners for keyboard controls
window.addEventListener("keydown", (event) => {
  if (event.code in keys) {
    keys[event.code] = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code in keys) {
    keys[event.code] = false;
  }
});

// Track if the mouse is over the game container
let mouseOverGameContainer = false;

gameContainer.addEventListener("mouseenter", () => {
  mouseOverGameContainer = true;
});

gameContainer.addEventListener("mouseleave", () => {
  mouseOverGameContainer = false;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update camera position based on keyboard input only if mouse is over the game container
  if (mouseOverGameContainer) {
    if (keys.ArrowRight || keys.KeyD) {
      camera.position.x += 0.1;
    }
    if (keys.ArrowLeft || keys.KeyA) {
      camera.position.x -= 0.1;
    }

    if (keys.ArrowUp || keys.KeyW) {
      camera.position.z -= 0.1;
    }

    if (keys.ArrowDown || keys.KeyS) {
      camera.position.z += 0.1;
    }
  }

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", () => {
  const width = gameContainer.clientWidth;
  const height = gameContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
