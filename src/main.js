import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import Alpine from "alpinejs";

document.addEventListener("alpine:init", () => {
  Alpine.data("game", () => ({
    coins: 9999,
  }));
});

window.Alpine = Alpine;
Alpine.start();

// Get the game container
const gameContainer = document.getElementById("game");
const width = gameContainer.clientWidth;
const height = gameContainer.clientHeight;

// Create the scene
const scene = new THREE.Scene();

const aspect = width / height;
const frustumSize = 10;
const cameraSize = 2.2;
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -cameraSize,
  (frustumSize * aspect) / cameraSize,
  frustumSize / cameraSize,
  frustumSize / -cameraSize,
  0.1
);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
gameContainer.appendChild(renderer.domElement);

// Add a cube to the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position the camera to get an isometric view
// make it closer to the scene

camera.position.set(5, 5, 5);
camera.lookAt(scene.position);

// Add orbit controls

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

// Track if the mouse is inside the game container
let isMouseInside = false;

gameContainer.addEventListener("mouseenter", () => {
  isMouseInside = true;
});

gameContainer.addEventListener("mouseleave", () => {
  isMouseInside = false;

  // stop movementX and movementY
});

// Event listeners for keyboard controls
window.addEventListener("keydown", (event) => {
  if (isMouseInside && event.code in keys) {
    keys[event.code] = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (isMouseInside && event.code in keys) {
    keys[event.code] = false;
  }
});

// Mouse controls
let isMouseDown = false;

window.addEventListener("mousedown", () => {
  isMouseDown = true;
});

window.addEventListener("mouseup", () => {
  isMouseDown = false;
});

let targetX = camera.position.x;
let targetZ = camera.position.z;

window.addEventListener("mousemove", (event) => {
  if (isMouseDown && isMouseInside) {
    const angle = Math.PI / 4; // 45 degrees for isometric view
    targetX -=
      event.movementX * 0.02 * Math.cos(angle) +
      event.movementY * 0.02 * Math.sin(angle);
    targetZ +=
      event.movementX * 0.02 * Math.sin(angle) -
      event.movementY * 0.02 * Math.cos(angle);
  }
});

function smoothScroll() {
  camera.position.x += (targetX - camera.position.x) * 0.1;
  camera.position.z += (targetZ - camera.position.z) * 0.1;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update target position based on keyboard input
  const moveSpeed = 0.1;
  const angle = Math.PI / 4; // 45 degrees for isometric view

  if (keys.ArrowRight || keys.KeyD) {
    targetX += moveSpeed * Math.cos(angle);
    targetZ -= moveSpeed * Math.sin(angle);
  }
  if (keys.ArrowLeft || keys.KeyA) {
    targetX -= moveSpeed * Math.cos(angle);
    targetZ += moveSpeed * Math.sin(angle);
  }

  if (keys.ArrowUp || keys.KeyW) {
    targetX -= moveSpeed * Math.sin(angle);
    targetZ -= moveSpeed * Math.cos(angle);
  }

  if (keys.ArrowDown || keys.KeyS) {
    targetX += moveSpeed * Math.sin(angle);
    targetZ += moveSpeed * Math.cos(angle);
  }

  smoothScroll();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", () => {
  const width = gameContainer.clientWidth;
  const height = gameContainer.clientHeight;
  const aspect = width / height;
  camera.left = (frustumSize * aspect) / -2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

const planeSize = 1;
const map = [
  [0, 1, 2, 3, 2, 3, 0, 1],
  [3, 2, 1, 0, 2, 3, 0, 1],
  [1, 0, 3, 2, 2, 3, 0, 1],
  [2, 3, 0, 1, 2, 3, 0, 1],
  [0, 1, 2, 3, 2, 3, 0, 1],
  [3, 2, 1, 0, 2, 3, 0, 1],
  [1, 0, 3, 2, 2, 3, 0, 1],
  [2, 3, 0, 1, 2, 3, 0, 1],
];
const colorMap = {
  0: 0x808080,
  1: 0xff0000,
  2: 0x00ff00,
  3: 0x0000ff,
};
const planes = [];

for (let i = 0; i < map.length; i++) {
  for (let j = 0; j < map[i].length; j++) {
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: colorMap[map[i][j]],
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(i * planeSize, 0, j * planeSize);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    planes.push(plane);
  }
}

// Set camera to look at the center of the grid
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Raycaster for detecting hover
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1; // Increase precision
const mouse = new THREE.Vector2();
let previousIntersected = [];
let hoverMode = "home"; // Default hover mode

function onMouseMove(event) {
  const rect = gameContainer.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planes);

  // Reset previous intersected planes
  previousIntersected.forEach((intersect) => {
    intersect.object.material.color.set(
      colorMap[map[intersect.object.position.x][intersect.object.position.z]]
    );
  });
  previousIntersected = [];

  if (intersects.length > 0) {
    const intersected = intersects[0];
    const x = intersected.object.position.x;
    const z = intersected.object.position.z;

    if (hoverMode === "tree") {
      // Highlight 1x1 grid
      intersected.object.material.color.set(0xffffff); // Highlight color
      previousIntersected.push({ object: intersected.object });
    } else if (hoverMode === "home") {
      // Highlight 3x3 grid
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const plane = planes.find(
            (p) => p.position.x === x + i && p.position.z === z + j
          );
          if (plane) {
            plane.material.color.set(0xffffff); // Highlight color
            previousIntersected.push({ object: plane });
          }
        }
      }
    }
  }
}

window.addEventListener("mousemove", onMouseMove);

// Event listeners to switch hover modes
window.addEventListener("keydown", (event) => {
  if (event.code === "KeyT") {
    hoverMode = "tree";
  } else if (event.code === "KeyH") {
    hoverMode = "home";
  }
});
