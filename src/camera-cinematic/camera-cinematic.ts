import * as THREE from 'three';
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera';
import {BokehShaderUniforms} from "three/examples/jsm/shaders/BokehShader2";

window.onload = function () {
  init();
  animate();
}

let camera:CinematicCamera;
let scene:THREE.Scene;
let rayCaster: THREE.Raycaster;
let renderer: THREE.WebGLRenderer;
let stats: Stats;
const mouse = new THREE.Vector2();
let INTERSECTED:THREE.Mesh | null;
const radius = 100;
let theta = 0;

function init() {
  camera = new CinematicCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.setLens(5);
  camera.position.set(2,1,5);

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );
  scene.add(new THREE.AmbientLight(0xffffff));
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1,1,1).normalize();
  scene.add(light);

  const geometry = new THREE.BoxGeometry(20,20,20);

  for (let i = 0; i < 1500; i++) {
    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    object.position.x = Math.random() * 800 - 400;
    object.position.y = Math.random() * 800 - 400;
    object.position.z = Math.random() * 800 - 400;
    scene.add(object);
  }

  rayCaster = new THREE.Raycaster();

  stats = new Stats();
  stats.dom.style.left = "160px";
  document.body.appendChild(stats.dom);

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  document.addEventListener('mousemove', onDocumentMouseMove);
  window.addEventListener('resize', onWindowResize);


  const effectController:Partial<Record<keyof BokehShaderUniforms, any>> = {
    focalLength: 15,
    fstop: 2.8,
    showFocus: false,
    focalDepth: 3,
  }

  const matChanger = function () {
    for(const e in effectController) {
      if(e in camera.postprocessing.bokeh_uniforms) {
        // @ts-ignore
        camera.postprocessing.bokeh_uniforms[e].value = effectController[e];
      }
    }

    camera.postprocessing.bokeh_uniforms['znear'].value = camera.near;
    camera.postprocessing.bokeh_uniforms['zfar'].value = camera.far;
    camera.setLens(effectController.focalLength, camera.getFilmHeight(), effectController.fstop, camera.coc);
    effectController[ 'focalDepth' ] = camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;
  }

  const gui = new GUI();

  gui.add(effectController, 'focalLength', 1, 135, 0.01).onChange(matChanger);
  gui.add( effectController, 'fstop', 1.8, 22, 0.01 ).onChange( matChanger );
  gui.add( effectController, 'focalDepth', 0.1, 100, 0.001 ).onChange( matChanger );
  gui.add( effectController, 'showFocus' ).onChange( matChanger );

  matChanger();
}

function onDocumentMouseMove(event:MouseEvent) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

// function render() {
//   theta += 0.1;
//   camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta));
//   camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(theta));
//   camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(theta));
//
//   camera.lookAt(scene.position);
//   camera.updateMatrixWorld();
//
//   renderer.clear();
//   renderer.render( scene, camera );
//
//   rayCaster.setFromCamera(mouse, camera);
//
//   const intersects = rayCaster.intersectObjects(scene.children, false);
//
//   if(intersects.length > 0) {
//     const targetDistance = intersects[0].distance;
//     camera.focusAt(targetDistance);
//
//     if(INTERSECTED !== intersects[0].object) {
//       if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
//
//       INTERSECTED = intersects[ 0 ].object;
//       INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
//       INTERSECTED.material.emissive.setHex( 0xff0000 );
//     } else {
//       if(INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
//       INTERSECTED = null;
//     }
//   }
//
//   if(camera.postprocessing.enabled) {
//     camera.renderCinematic(scene, renderer);
//   } else {
//     scene.overrideMaterial = null;
//     renderer.clear();
//     renderer.render(scene, camera);
//   }
// }

function render() {

  theta += 0.1;

  camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
  camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
  camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
  camera.lookAt( scene.position );

  camera.updateMatrixWorld();

  // find intersections

  rayCaster.setFromCamera( mouse, camera );

  const intersects = rayCaster.intersectObjects( scene.children, false );

  if ( intersects.length > 0 ) {

    const targetDistance = intersects[ 0 ].distance;

    camera.focusAt( targetDistance ); // using Cinematic camera focusAt method

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );

    }

  } else {

    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

  }

  //

  if ( camera.postprocessing.enabled ) {

    camera.renderCinematic( scene, renderer );

  } else {

    scene.overrideMaterial = null;

    renderer.clear();
    renderer.render( scene, camera );

  }

}
