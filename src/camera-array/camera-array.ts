import * as THREE from 'three';

let camera:THREE.ArrayCamera;
let scene:THREE.Scene;
let renderer: THREE.WebGLRenderer;
let mesh:THREE.Mesh;

const AMOUNT = 6;

window.onload = function () {
  init();
  animate();
}

function init() {
  const aspect = window.innerWidth / window.innerHeight;
  const width = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
  const height = (window.innerHeight / AMOUNT) * window.devicePixelRatio;

  const cameras = [];
  for (let y = 0; y < AMOUNT; y++) {
    for (let x = 0; x < AMOUNT; x++) {
      const subCamera = new THREE.PerspectiveCamera(40, aspect, 0.1, 10);
      subCamera.viewport = new THREE.Vector4(
        Math.floor(x * width),
        Math.floor(y * height),
        Math.ceil(width),
        Math.ceil(height)
      );
      subCamera.position.x = (x / AMOUNT) - 0.5;
      subCamera.position.y = 0.5 - (y / AMOUNT);
      subCamera.position.z = 1.5;
      subCamera.position.multiplyScalar(2);
      subCamera.lookAt(0,0,0);
      subCamera.updateMatrixWorld();
      cameras.push(subCamera);
    }
  }

  camera = new THREE.ArrayCamera(cameras);
  camera.position.z = 4;

  scene = new THREE.Scene();
  scene.add( new THREE.AmbientLight(0x999999) );
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(0.5, 0.5, 1);
  light.castShadow = true;
  light.shadow.camera.zoom = 4;
  scene.add(light);

  const geometryBackground = new THREE.PlaneGeometry( 100, 100 );
  const materialBackground = new THREE.MeshPhongMaterial( { color: 0x000066 } );
  const background = new THREE.Mesh(geometryBackground, materialBackground);
  background.receiveShadow = true;
  background.position.set(0,0,-1);
  scene.add(background);

  const geometryCylinder = new THREE.CylinderGeometry(0.5,0.5,1,32);
  const materialCylinder = new THREE.MeshPhongMaterial({ color: 0xff0000 });

  mesh = new THREE.Mesh(geometryCylinder, materialCylinder);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);


  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );
  renderer.render( scene, camera );
}

function animate() {
  mesh.rotation.x += 0.005;
  mesh.rotation.z += 0.01;

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
