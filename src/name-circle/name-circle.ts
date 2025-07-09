import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const RING_HEIGHT = 40;

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
const container = document.createElement('div');
document.body.appendChild(container);
const oneDeg = Math.PI / 180;

init();

function init() {
  const svg1 = loadSvg(`${window.location.origin}/svg/dog.svg`);
  const svg2 = loadSvg(`${window.location.origin}/svg/cat.svg`, THREE.BackSide);
  const texture = initCanvas('Ezio', '#d6d6d6', '#000', 0);
  const texture2 = initCanvas('Chen', '#000', '#d6d6d6', 550, true);
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 300);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xEBAE5B);
  // scene.add(new THREE.GridHelper(400, 10, 0xff0000));

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop( animate );
  container.appendChild(renderer.domElement);

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.minDistance = 300;
  // controls.maxDistance = 700;

  const group = new THREE.Group();
  group.name = 'group';

  const geometry1 = new THREE.CylinderGeometry( 80, 80, RING_HEIGHT, 32, 1, true, -30 * oneDeg );
  const material1 = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide } );
  const cylinder1 = new THREE.Mesh( geometry1, material1 );

  const geometry2 = new THREE.CylinderGeometry( 79, 79, RING_HEIGHT, 32, 1, true );
  const material2 = new THREE.MeshBasicMaterial( {map: texture2, side: THREE.BackSide } );
  const cylinder2 = new THREE.Mesh( geometry2, material2 );

  group.add(svg1);
  group.add(svg2);

  group.add(cylinder1);
  group.add(cylinder2);
  group.position.set(0,0,0);
  group.rotation.z = Math.PI / 6;
  scene.add( group );

  renderer.render( scene, camera );
  window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
  const group = scene.getObjectByName('group') as THREE.Mesh;
  group.rotation.y += 2 * oneDeg;

  // controls.update();
  renderer.render( scene, camera );
}

function initCanvas(text = '', backColor = '#000', textColor = '#fff', offset = 0, reverse = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 100;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.save();
  ctx.fillStyle = backColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = "120px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";
  ctx.textBaseline = "middle";
  if(reverse) {
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
  }

  ctx.fillText(text, offset, 60);
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

function loadSvg(url: string, side: typeof THREE.FrontSide|typeof THREE.BackSide = THREE.FrontSide) {
  const loader = new SVGLoader();
  let group = new THREE.Group();
  group.name = url;


  loader.load(url, function (data) {
    //@ts-ignore
    const [,,height] = data.xml.attributes.viewBox.value.split(' ');
    const scale = RING_HEIGHT / Number(height);
    group.scale.set(scale, -scale, 1);
    group.position.set(-RING_HEIGHT / 2, RING_HEIGHT / 2, 0);

    let renderOrder = 0;
    for(const path of data.paths) {

      const fillColor = path.userData?.style.fill;
      if(fillColor !== undefined && fillColor !== 'none') {
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setStyle( fillColor ),
          opacity: path.userData?.style.fillOpacity,
          transparent: true,
          side: side,
          depthWrite: false,
        });

        const shapes = SVGLoader.createShapes( path );
        for ( const shape of shapes ) {

          const geometry = new THREE.ShapeGeometry( shape );
          const mesh = new THREE.Mesh( geometry, material );
          mesh.renderOrder = renderOrder ++;

          group.add( mesh );
        }
      }
    }
  });
  return group;
}
