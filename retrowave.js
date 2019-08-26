"use strict";
const THREE = window.THREE;

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.backgroundImage = "linear-gradient(rgb(57,58,137), rgb(200,17,116), rgb(57,58,137))";
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const gridWidth = 60;
const gridLength = 100;
const rectWidth = 4;
const rectLength = 4;
const rectHeight = 4;

const pointLight = new THREE.PointLight(0xFFFFFF, 2, gridLength * rectLength);
pointLight.position.set(gridWidth / 2 * rectWidth, 0, 1);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5); // soft white light
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(gridWidth / 2 * rectWidth, 0, 10);
camera.lookAt(gridWidth / 2 * rectWidth, gridLength, 10);

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', handleResize, false);

const clock = new THREE.Clock();
let time = 0;

noise.seed(Math.random());

const grid = [];
function randomGrid() {
  for (let y = 0; y <= gridLength; y++) {
    grid[y] = randomGridRow(y);
  }
}
let yCounter = 0;
let scale = 10;
const roadWidth = 3;
function randomGridRow() {
  yCounter++;
  const row = [];
  for (let x = 0; x <= gridWidth; x++) {
    const n = Math.max(0, noise.simplex2(x / scale, yCounter / scale));
    const r = Math.log(0.5 + Math.abs(x - gridWidth / 2) / roadWidth);
    row[x] = Math.max(0, Math.pow(n, 2.4) * 5 * r);
  }
  return row;
}
randomGrid();

const geometry = new THREE.BufferGeometry();

const rectLen = 3 * 6;
const gridVertices = gridWidth * gridLength * rectLen;
const vertices = new Float32Array(gridVertices);
const colors = new Float32Array(gridVertices);
geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.computeFaceNormals();
geometry.computeVertexNormals();

function updateVertexColors() {
  const rainbow = new Rainbow();
  rainbow.setSpectrum("83148C", "5B1FD5");
  // rainbow.setSpectrum("FF0000", "00FF00", "0000FF");
  rainbow.setNumberRange(0, gridLength);

  for (let y = 0; y < gridLength; y++) {
    const offsetY = y * gridWidth * rectLen;
    // 130 20 140
    // 91  31 213
    let colourIndex = Math.pow(y / gridLength, 0.3) * gridLength;
    let color = new THREE.Color(parseInt(rainbow.colourAt(colourIndex), 16));

    for (let x = 0; x < gridWidth; x++) {
      const offsetX = x * rectLen;
      const offset = offsetX + offsetY;

      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;

      colors[offset + 3] = color.r;
      colors[offset + 4] = color.g;
      colors[offset + 5] = color.b;

      colors[offset + 6] = color.r;
      colors[offset + 7] = color.g;
      colors[offset + 8] = color.b;

      colors[offset + 9] = color.r;
      colors[offset + 10] = color.g;
      colors[offset + 11] = color.b;

      colors[offset + 12] = color.r;
      colors[offset + 13] = color.g;
      colors[offset + 14] = color.b;

      colors[offset + 15] = color.r;
      colors[offset + 16] = color.g;
      colors[offset + 17] = color.b;
    }
  }
}
updateVertexColors();

function updateVertices() {
  for (let t = 1; t < time; t++) {
    grid.shift();
    grid.push(randomGridRow());
  }
  time = time % 1;
  const shift = -time;
  for (let y = 0; y < gridLength; y++) {
    const offsetY = y * gridWidth * rectLen;
    for (let x = 0; x < gridWidth; x++) {
      const offsetX = x * rectLen;
      const offset = offsetX + offsetY;

      vertices[offset] = (x) * rectWidth;
      vertices[offset + 1] = (y + shift) * rectLength;
      vertices[offset + 2] = (grid[y][x]) * rectHeight;
      vertices[offset + 3] = (x + 1) * rectWidth;
      vertices[offset + 4] = (y + shift) * rectLength;
      vertices[offset + 5] = (grid[y][x + 1]) * rectHeight;
      vertices[offset + 6] = (x + 1) * rectWidth;
      vertices[offset + 7] = (y + shift + 1) * rectLength;
      vertices[offset + 8] = (grid[y + 1][x + 1]) * rectHeight;

      vertices[offset + 9] = (x + 1) * rectWidth;
      vertices[offset + 10] = (y + shift + 1) * rectLength;
      vertices[offset + 11] = (grid[y + 1][x + 1]) * rectHeight;
      vertices[offset + 12] = (x) * rectWidth;
      vertices[offset + 13] = (y + shift + 1) * rectLength;
      vertices[offset + 14] = (grid[y + 1][x]) * rectHeight;
      vertices[offset + 15] = (x) * rectWidth;
      vertices[offset + 16] = (y + shift) * rectLength;
      vertices[offset + 17] = (grid[y][x]) * rectHeight;
    }
  }

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
}

const meshMaterial = new THREE.MeshStandardMaterial({vertexColors: THREE.VertexColors, side: THREE.DoubleSide});
const mesh = new THREE.Mesh(geometry, meshMaterial);
scene.add(mesh);

const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
const line = new THREE.LineSegments(geometry, lineMaterial);
scene.add(line);

function render() {
  requestAnimationFrame(render);
  // randomGrid();
  updateVertices();

  geometry.attributes.position.needsUpdate = true;

  time += clock.getDelta() * 2;
  renderer.render(scene, camera);
}

window.onload = function () {
  render();
};