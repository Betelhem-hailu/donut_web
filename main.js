import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const canvas = document.querySelector('canvas.webgl');


const scene = new THREE.Scene();

const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  vertexShader: `
  void main(){
    gl_Position = vec4(position, 1.0);
  }`,
  fragmentShader: `
  uniform float uAlpha;
  void main(){
    gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
  }`,
  uniforms: {
    uAlpha: {
      value: 1.0
    }
  },
  transparent: true
});

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

const loadingBarElement = document.querySelector('.loading-bar')
const bodyElement = document.querySelector('body')
const loadingManager = new THREE.LoadingManager(
  () => {
    window.setTimeout(() => {
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1
    })

    loadingBarElement.classList.add('ended')
    bodyElement.classList.add('loaded')
    loadingBarElement.style.transform = ''

    }, 500)
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal
    loadingBarElement.style.transform = `scaleX(${progressRatio})`
    console.log(progressRatio)
  },
  () => {
    console.error('error')
  }
)

let donut = null;
const gltfloader = new GLTFLoader(loadingManager);
gltfloader.load('/scene.gltf', (gltf) => {
  console.log(gltf)
  donut = gltf.scene;


  donut.position.x = 1.5;
  donut.rotation.x = Math.PI * 0.2
  donut.rotation.z = Math.PI * 0.15

  const radius = 8.5;
  donut.scale.set(radius, radius, radius)
  scene.add(donut);
})


const transformDonut = [
  {
    rotationZ: 0.45,
    positionX: 1.5
  }, {
    rotationZ: -0.45,
    positionX: -1.5
  }, {
    rotationZ: 0.0314,
    positionX: 0
  }
]

let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
  scrollY = window.scrollY
  const newSection = Math.round(scrollY / sizes.height)


  if (newSection != currentSection) {
    currentSection = newSection;

    if (!!donut) {
      gsap.to(
        donut.rotation, {
        duration: 1.5,
        ease: `power2.inOut`,
        z: transformDonut[currentSection].rotationZ
      }
      )
      gsap.to(
        donut.position, {
        duration: 1.5,
        ease: `power2.inOut`,
        x: transformDonut[currentSection].positionX
      }
      )
      gsap.to(
        sphereShadow.position, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: transformDonut[currentSection].positionX - 0.2
        }
    )
    }
  }


})

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 2, 0)
scene.add(directionalLight)

const renderer = new THREE.WebGLRenderer(
  {
    canvas: canvas,
    antialias: true,
    alpha: true
  })

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  if (!!donut) {
    donut.position.y = Math.sin(elapsedTime * 0.5) * 0.1 - 0.1
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick)
}

tick()

window.onbeforeunload = function () {
  window.scrollTo(0, 0)
}
