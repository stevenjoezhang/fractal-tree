import * as THREE from 'Three';
import { Water } from 'Three/examples/jsm/objects/Water.js';
import { Sky } from 'Three/examples/jsm/objects/Sky.js';

// Ground
// https://github.com/mrdoob/three.js/blob/r118/examples/webgl_shaders_ocean.html
const sun = new THREE.Vector3();
const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);

const water = new Water(
    waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: true
}
);

water.rotation.x = - Math.PI / 2;

const sky = new Sky();
sky.scale.setScalar(10000);

const uniforms = sky.material.uniforms;

uniforms['turbidity'].value = 10;
uniforms['rayleigh'].value = 2;
uniforms['mieCoefficient'].value = 0.005;
uniforms['mieDirectionalG'].value = 0.8;

const parameters = {
    inclination: .5,
    azimuth: .15
};

const theta = Math.PI * (parameters.inclination - 0.5);
const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

sun.x = Math.cos(phi);
sun.y = Math.sin(phi) * Math.sin(theta);
sun.z = Math.sin(phi) * Math.cos(theta);

sky.material.uniforms['sunPosition'].value.copy(sun);
water.material.uniforms['sunDirection'].value.copy(sun).normalize();

export {
    water,
    sky
};
