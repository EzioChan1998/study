import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import mesh1 from './mesh1';

const scene = new THREE.Scene();
const pointLight = new THREE.PointLight(0xffffff, 10000);
pointLight.position.set(0, 0, 80);
scene.add(pointLight);
scene.add(mesh1);

const axesHelper = new THREE.AxesHelper(200);
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(200,200,200);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop( animate );
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

const controller = new OrbitControls(camera, renderer.domElement);

function animate() {
  controller.update();
  renderer.render(scene, camera);
}


window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}
