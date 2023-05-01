import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
let modelLoader = new GLTFLoader();
let container, camera, scene, renderer, geometry, material, mesh, controls, portal, time;
let loader = new THREE.TextureLoader();
let texture = loader.load("AlternateUniverse.png");

init();
animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 10);

  scene = new THREE.Scene();
  const backgroundLoader = new THREE.TextureLoader();
  backgroundLoader.load('space.jpg', function (texture) {
      scene.background = texture;
  });

  geometry = new THREE.CircleGeometry( 0.8, 32 ); 
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2() },
    },
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0.2, -0.35);
  scene.add(mesh);

  portal = new THREE.Object3D();
  modelLoader.load('portalmodel.glb', function (gltf) {
    portal.add(gltf.scene.children[0]);
    portal.name = "portal";
    portal.children[0].children[0].castShadow = true;
    portal.children[0].children[0].receiveShadow = true;
    scene.add(portal);
    portal.position.set(0, -1, 0);
    portal.scale.set(12, 12, 12);
}, undefined, function (error) {
    console.error(error);
})

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 0);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

function animateObject(object, freq, amplitude, delay, currentTime, transform) { 
  switch (transform) {
    case "position":
        window.setTimeout(() => {
          var midPosition = object.position.y;
          object.position.y = midPosition + (Math.sin(currentTime * freq) * amplitude * 0.001);
        }, delay);
      break;
    case "rotation":
      window.setTimeout(() => {
        object.rotation.z = currentTime / 2;
      }, delay);
    break;
    case "scale":
      window.setTimeout(() => {
        object.scale.set((Math.sin(currentTime * freq) * amplitude) + 1, (Math.sin(currentTime * freq) * amplitude) + 1, 0);
      }, delay);
    break;
    default:
      break;
  }

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  const currentTime = Date.now() / 1000; 
  time = currentTime;
  animateObject(portal, 1, 1, 0, time, "position");
  animateObject(mesh, 1, 1, 1000, time, "position");
  animateObject(mesh, 1, 1, 0, time, "rotation");
  animateObject(mesh, 1.5, 0.1, 0, time, "scale");
  requestAnimationFrame(animate);
  render();
  controls.update();
}

function render() {
  material.uniforms.uTime.value += 0.01;
  material.uniforms.uResolution.value.set(
    renderer.domElement.width,
    renderer.domElement.height
  );
  renderer.render(scene, camera);
}