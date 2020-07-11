import * as THREE from 'Three';
import { FirstPersonControls } from 'Three/examples/jsm/controls/FirstPersonControls.js';
import { water, sky } from './environment';
import { TreeModels } from './tree';

window.THREE = THREE;

let RENDER_WIDTH = window.innerWidth,
    RENDER_HEIGHT = window.innerHeight;

const container = document.querySelector('.container');
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT);
renderer.setClearColor(0xE5E5E5, 1);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.add(water);
scene.add(sky);

const models = TreeModels();

const treeMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333
});
const mesh = new THREE.Mesh(models[0].geometry, treeMaterial);
mesh.position.set(0, -1, 0);
scene.add(mesh);

const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(45, RENDER_WIDTH / RENDER_HEIGHT, 0.1, 10000);
camera.position.set(0, 10, 50);
camera.lookAt(new THREE.Vector3(0, 10, 0));
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 10;
controls.lookSpeed = 40;
controls.lon = 196;

const clock = new THREE.Clock();
const intControl = setInterval(() => {
    const delta = clock.getDelta();
    //controls.update(delta);

    water.material.uniforms['time'].value += 1.0 / 240.0;
    renderer.render(scene, camera);
}, 10);

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    //windowHalfX = window.innerWidth / 2;
    //windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
