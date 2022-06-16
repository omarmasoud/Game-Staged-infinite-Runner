import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import { Water } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/objects/Water.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';

const rockOffsetsMin = -400;
const rockOffsetsMax = 400;
const rockSpace = 400;
const rockCount = 100;

const islandcount =3;

const Mothershipscount=3;
// const rockCount = 0;

// const crystalOffsetsMin = -400;
// const crystalOffsetsMax = 400;
const crystalSpace = 800;
const crystalCount = 50;
const crystalExtraOffset = 150;
// const crystalCount = 0;
const crystalRotationSpeed = 1;
const crystalExtraScore = 10;

const rockInitialOffset = 1500;
const rockCollideOffset = 80;
const crystalCollideOffset = 65;

const cliffOffsets = 600;
const cliffSpace = 150;
const cliffCount = 50;
const islandoffset=6000;
// const cliffCount = 0;
const cliffScaleMin = 0.05;
const cliffScaleMax = 0.15;

const destroyZ = 500;



const rocketMaxX = 225;
const rocketMinX = -325;

const rocketSpeedX = 600;

var score = 0;
var scoreDivider = 200;

const rocketOffsetX = 60;
// const rocketOffsetY = 0;
const rocketOffsetZ = -60;

let cliffs = []
let rocks = []
let crystals = []

let islands=[]

let Motherships=[]

var start = false;
var stop = false;

var water;
var loader = new GLTFLoader();
//var Island_scene, Island_scene2;
var rocket;
const SCALE = 30000;

let sceneAcceleration = 10;
let sceneVelocity = 100;

const waterSpeedDivision = 3000;

let renderer;
let camera;
var cameraOffset;
var rocketPosition = new THREE.Vector3();
var previousRocketPosition = new THREE.Vector3();
var cameraLookAt = new THREE.Vector3();
var previousCameraLookAt = new THREE.Vector3();
var cameraTarget = new THREE.Vector3();
let controls;
let box;

let movementDelta = 0;
let movementClock = new THREE.Clock();
const progressloader=cliffCount*2+rockCount+crystalCount+islandcount*2+4;//3 motherships 1 rocket
var currentprogress=0

let clock = new THREE.Clock();
let scene;
const waterGeometry = new THREE.PlaneGeometry(SCALE, SCALE);
const parameters = {
	Sound: false,
	SoundMixer: 50,
	CameraLock: true,
  };
var BGAudioListener, CrystalAudioListener, RocketAudioListener;
var BGSound, CrystalSound, RocketSound;
const Sound = false;

function randomRange(start, end)
{
	return start + Math.random() * (end-start);
}

function init() {
	scene = new THREE.Scene();
	box = getBox(1, 1, 1);
	var pointLight = getPointLight(1);
	var sphere = getSphere(0.05);
	water = new Water(waterGeometry, {
		textureWidth: 512,
		textureHeight: 512,
		waterNormals: new THREE.TextureLoader().load('./assets/textures/waternormals.jpg', function (texture) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		}),
		sunDirection: new THREE.Vector3(),
		sunColor: 0xffffff,
		waterColor: 0x004a7e,
		distortionScale: 100,
		fog: scene.fog !== undefined,
	});
	water.rotation.x = -Math.PI / 2;
	water.rotation.z = -Math.PI / 2;
	scene.add(water);
	console.log('entering	 loading');
	//   loader.load('./assets/Models/rocket_ship/scene.gltf',function(object){
	// 	  console.log('started loading');
	// 	  object.position.x=0;
	// 	  object.position.y=0;
	// 	  object.position.z=0;
	// 	  //object.scale.x=10;
	// 	 // object.scale.y=10;
	// 	  //object.scale.z=10;
	// 	  scene.add(object);
	// 	  console.log('done loading');		  

	//   });
	// Island_scene = new island(-500, 0, 100);
	// Island_scene2 = new island(500, 0, 100);
	// new crystal(0,200,200)

	var Mothership1=new Mothership(0,900,-2000,0,0,0,700,true);//central moving ship
	var Mothership2=new Mothership(2000,170,-4000,-1,1.2,0,700);//sunken ship 1
	var Mothership3=new Mothership(-2000,170,-4200,-1,-1.6,0,700);//sunken ship 2
	Motherships.push(Mothership1,Mothership2,Mothership3);
	for (let i = 0; i < islandcount; i++){
		islands.push(new island(-islandoffset,0,-islandoffset*i),new island(islandoffset,0,-islandoffset*i))

	}
	
	for(let i = 0; i < cliffCount; i++){
		cliffs.push([new cliff(-cliffOffsets, 0, -cliffSpace*i), new cliff(cliffOffsets, 0, -cliffSpace*i)])
		
	}
	for(let i = 0; i < rockCount; i++){
		rocks.push(new rock(randomRange(rockOffsetsMin, rockOffsetsMax), 50, -rockSpace*i - rockInitialOffset))
		
	}

		// cliffs.push(new rock(randomRange(rockOffsetsMin, rockOffsetsMax), 200, -rockSpace*i))
	for(let i = 0; i < crystalCount; i++){
		crystals.push(new crystal(randomRange(rockOffsetsMin, rockOffsetsMax), 50, -crystalSpace*(i+1) - rockInitialOffset - crystalExtraOffset))
	
	}
	// crystals.push(new crystal(randomRange(rockOffsetsMin, rockOffsetsMax), 50, -crystalSpace*(i-2) - rockInitialOffset))

	// cliff = new cliff(cliffOffsets, 0, 0);

	rocket = new Rocket();

	// Stars

	//var particleGeo = new THREE.SphereGeometry(10000,80,40);
	var particlegeobuffer = new THREE.BufferGeometry();

	var particleCount = 100000;
	var particleDistance = 6000*3;
	var starsarr = new Float32Array(particleCount * 3);//for xyz
	for (let i = 0; i < particleCount * 3; i += 3) {

		var theta = THREE.Math.randFloatSpread(360);
		var phi = THREE.Math.randFloatSpread(360);
		starsarr[i] = particleDistance * Math.sin(theta) * Math.cos(phi);
		starsarr[i + 1] = particleDistance * Math.sin(theta) * Math.sin(phi);
		starsarr[i + 2] = particleDistance * Math.cos(theta);

	}
	particlegeobuffer.setAttribute('position', new THREE.BufferAttribute(starsarr, 3));


	var particleMat = new THREE.PointsMaterial({
		color: 'rgb(255, 255, 255)',
		size: 40,
		map: new THREE.TextureLoader().load('/assets/textures/particle.jpg'),
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthWrite: false
	});

	var particlesmesh = new THREE.Points(particlegeobuffer, particleMat);

	particlesmesh.name = 'stars';

	scene.add(particlesmesh);

	box.position.y = box.geometry.parameters.height / 2;

	pointLight.position.y = 2;
	pointLight.intensity = 2;

	pointLight.add(sphere);
	scene.add(pointLight);


	camera = new THREE.PerspectiveCamera(
		65,
		window.innerWidth / window.innerHeight,
		1,
		1000000
	);

	//camera initial positions
	camera.position.x = 70;
	camera.position.y = 90;
	camera.position.z = 70;
	camera.lookAt(new THREE.Vector3(80, 80, 80));


	cameraOffset = new THREE.Vector3(0,200,400);
	previousRocketPosition = null;
	previousCameraLookAt = null;
	//end camera

		//Sound
		var BGAudioListener = new THREE.AudioListener();
		var CrystalAudioListener = new THREE.AudioListener();
		var RocketAudioListener = new THREE.AudioListener();
  
		camera.add(BGAudioListener);
		camera.add(CrystalAudioListener);
		camera.add(RocketAudioListener);
  
	   BGSound = new THREE.Audio(BGAudioListener);
	   CrystalSound = new THREE.Audio(CrystalAudioListener);
	   RocketSound = new THREE.Audio(RocketAudioListener);
	  
	  var BGAudioLoader = new THREE.AudioLoader();
	  var CrystalAudioLoader = new THREE.AudioLoader();
	  var RocketAudioLoader = new THREE.AudioLoader();
	  
	  BGAudioLoader.load('assets/Sounds/Background.mp3', function (buffer) {
		  BGSound.setBuffer(buffer);
		  BGSound.setLoop(true);
		  BGSound.setVolume(parameters.SoundMixer / 100);
	  });
	  
	  CrystalAudioLoader.load('assets/Sounds/Crystal_Collecting.mp3', function (buffer) {
		  CrystalSound.setBuffer(buffer);
		  CrystalSound.setLoop(false);
		  CrystalSound.setVolume(parameters.SoundMixer / 100);
	  });
  
	  RocketAudioLoader.load('assets/Sounds/Spaceship_Engine.mp3', function (buffer) {
		  RocketSound.setBuffer(buffer);
		  RocketSound.setLoop(true);
		  RocketSound.setVolume(parameters.SoundMixer / 100);
	  });

	  updateSoundMixer();
	  
	function updateSound() {
		if (parameters.Sound) {
			BGSound.play();
			RocketSound.play();
			//CrystalSound.play();
		} 
		else{
			BGSound.stop();
			RocketSound.stop();
			CrystalSound.stop();
		}
	  }
	
	function updateSoundMixer() {
		BGSound.setVolume(parameters.SoundMixer / 100);
		CrystalSound.setVolume(parameters.SoundMixer / 100);
		RocketSound.setVolume(parameters.SoundMixer / 100);
	}
	const gui = new GUI();
	const folderSettings = gui.addFolder('Sound Settings');
  	folderSettings.add(parameters,'Sound').listen().onChange(updateSound);
  	folderSettings.add(parameters,'SoundMixer').name('Sound Mixer').min(1).max(100).step(1).listen().onChange(updateSoundMixer);

  

	//renderer block
	renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor('rgb(0, 0, 30)');
	// renderer.setClearColor('rgb(113, 113, 104)');
	document.getElementById('gameScene').appendChild(renderer.domElement);
	//endrenderer

	//Lights
	// soft white light
	const light = new THREE.AmbientLight( 0x404040 , 12);
	scene.add( light );
	
	//rocket light
	//const rocketLight = new THREE.SpotLight(0xFF0000,10,100,Math.PI/1.0, 0.5 , 1.0);
    //rocketLight.position.set(0,70,0); 
	//rocketLight.target.position.set(cameraOffset);
    //camera.add(rocketLight);

	//orbit controls for using mouse drag viewing
	controls = new OrbitControls(camera, renderer.domElement);

	//initial call for update to start rendering the scene frame by frame
	


	return scene;
}

//was used to try adding some geometry to the scene
function getBox(w, h, d) {
	var geometry = new THREE.BoxGeometry(w, h, d);
	var material = new THREE.MeshPhongMaterial({
		color: 'rgb(120, 120, 120)'
	});
	var mesh = new THREE.Mesh(
		geometry,
		material
	);
	mesh.castShadow = true;

	return mesh;
}

//was used to try adding some geometry to the scene
function getSphere(size) {
	var geometry = new THREE.SphereGeometry(size, 24, 24);
	var material = new THREE.MeshBasicMaterial({
		color: 'rgb(255, 255, 255)'
	});
	var mesh = new THREE.Mesh(
		geometry,
		material
	);

	return mesh;
}
function incrementobjectloaded(){
			currentprogress+=1;
			console.log("current progress"+currentprogress+"/"+progressloader);
			document.getElementById('progressbarid').setAttribute("aria-valuenow",(currentprogress/progressloader)*100);
			document.getElementById('progressbarid').style.setProperty("--value",(currentprogress/progressloader)*100);

			document.getElementById('progressbarid').style.pgPercentage=(currentprogress/progressloader)*100;
			if(currentprogress== progressloader){
				 document.getElementById('progressbarid').remove();
				update(renderer, scene, camera, controls);
			}
}
class Rocket {
	constructor() {
		this.timebefore = 0;
		this.calctime = false;
		this.initialized = false;
		this.decayflag = false;
		this.rocketscene = null;
		this.rotateright = false;
		this.rotateleft = false;
		this.rotatespeed = 0.15;
		loader.load('assets/Models/rocket_ship/rocket.gltf', (gltf) => {
			console.log('created rocket');
			this.rocketscene = gltf.scene;
			this.rocketscene.scale.set(0.5, 0.5, 0.5);
			scene.add(this.rocketscene);
			//rocketscene.name='rocket';
			this.rocketscene.position.x = 0;
			this.rocketscene.position.y = 70;
			this.rocketscene.position.z = 0;
			//dont change these unless having some scene animations
			this.rocketscene.rotation.z = -0.70;
			this.rocketscene.rotation.x = -1.55;
			this.rocketscene.rotation.y -= 0.1;
			this.initialized = true;
			incrementobjectloaded();
			
		});

		this.rocketvelocity = 0;

		return this.rocketscene;
	}
	update() {
		if (this.rocketscene && !stop) {
			isCameraColliding();
			// camera.position.x=rocket.position.x;
			// camera.position.y=rocket.position.y+20;
			// camera.position.z=rocket.position.z+10;
			//console.log('initialized');
			// if (this.calctime) {
			// 	this.timebefore = clock.getElapsedTime();
			// 	this.calctime = false;
			// }
			// console.log("time before is " + this.timebefore);
			// if (this.decayflag) {
			// 	this.decayspeed();
			// }
			if (this.rotateright && this.rocketscene.position.x < rocketMaxX) {
				this.rocketscene.position.x += rocketSpeedX*movementDelta;
				this.rocketscene.position.x = this.rocketscene.position.x > rocketMaxX ? rocketMaxX : this.rocketscene.position.x;
				// this.rotateright = false;
			}
			if (this.rotateleft && this.rocketscene.position.x > rocketMinX) {
				this.rocketscene.position.x -= rocketSpeedX*movementDelta;
				this.rocketscene.position.x = this.rocketscene.position.x < rocketMinX ? rocketMinX : this.rocketscene.position.x;
				// this.rotateleft = false;
				// if (clock.getElapsedTime() - this.timebefore < 1) {
				// 	this.rocketscene.rotation.y -= this.rotatespeed;
				// 	console.log("rotating left");
				// }
				// else {
				// 	this.rotateleft = false;
				// }
			}
			// this.rocketscene.position.z += -this.rocketvelocity;

		}
	}
	getposition() {
		if (this.rocketscene) {
			return this.rocketscene.position;
		}
		else {
			return null;
		}
	}
	speedup() {
		this.rocketvelocity += 10;
		console.log('speed is ' + this.rocketvelocity);
		this.decayflag = false;
	}
	speeddown() {
		if (this.rocketvelocity > 0) {
			this.rocketvelocity -= 5;
		}
		console.log('speed is ' + this.rocketvelocity);
	}
	decayspeed() {
		if (this.rocketvelocity > 0) {
			this.rocketvelocity -= 0.5;
		}
	}
	rotateRocket(rightorleft) {
		this.calctime = false;

		if (rightorleft === "right") {
			this.rotateright = true;
		}

		if (rightorleft === "left") {
			this.rotateleft = true;
		}
	}

	stopRotateRocket(rightorleft) {
		this.calctime = false;

		if (rightorleft === "right") {
			this.rotateright = false;
		}

		if (rightorleft === "left") {
			this.rotateleft = false;
		}
	}
}

class island {
	constructor(x, y, z,rotz=-1.2, rotx=-1.55) {
		let instance=this;
		this.created=false;
		loader.load('assets/Models/island/island.gltf', (gltf) => {
			instance.Island_scene = gltf.scene;
			instance.Island_scene.scale.set(100, 100, 100);
			scene.add(instance.Island_scene);
			instance.Island_scene.position.x = x;
			instance.Island_scene.position.y = y;
			instance.Island_scene.position.z = z;
			instance.Island_scene.rotation.z = rotz;
			instance.Island_scene.rotation.x = rotx;
			instance.Island_scene.rotation.z = Math.random() * Math.PI * 2;
			this.created=true;
			incrementobjectloaded()
		});
		return this.Island_scene;
	}
	update(){
		if (this.Island_scene){
				this.Island_scene.position.z += movementDelta*sceneVelocity;
				if(this.Island_scene.position.z >= destroyZ)
				{
					this.Island_scene.rotation.z = Math.random() * Math.PI * 2;
					this.Island_scene.position.z -= islandcount*islandoffset;
				}
		}

	}
}

class cliff {

	constructor(x, y, z) {
		let instance = this;
		loader.load('assets/Models/cliffs/scene.gltf', (gltf) => {
			console.log('created cliff');
			instance.cliffScene = gltf.scene;
			let scale = randomRange(cliffScaleMin,cliffScaleMax);
			instance.cliffScene.scale.set(scale, scale, scale);
			scene.add(instance.cliffScene);
			instance.cliffScene.position.x = x;
			instance.cliffScene.position.y = y;
			instance.cliffScene.position.z = z;
			instance.cliffScene.rotation.y = Math.random() * Math.PI * 2;
			// cliffScene.rotation.x = -1.55;
			incrementobjectloaded();
		});
		return this.cliffScene;
	}
	
	update()
	{
		if(this.cliffScene)
		{
			this.cliffScene.position.z += movementDelta*sceneVelocity;

			if(this.cliffScene.position.z >= destroyZ)
			{
				let scale = randomRange(cliffScaleMin,cliffScaleMax);
				this.cliffScene.scale.set(scale, scale, scale);
				this.cliffScene.position.z -= cliffCount*cliffSpace;
			}
			// console.log(this.cliffScene);
		}
	}

}


// class crystal {

// 	constructor(x, y, z) {
// 		let instance = this;
// 		loader.load('assets/Models/glowing_crystals/scene.gltf', (gltf) => {
// 			console.log('created cliff');
// 			instance.scene = gltf.scene;
// 			instance.scene.scale.set(0.1, 0.1, 0.1);
// 			scene.add(instance.scene);
// 			instance.scene.position.x = x;
// 			instance.scene.position.y = y;
// 			instance.scene.position.z = z;
// 			instance.scene.rotation.y = Math.random() * Math.PI * 2;
// 			// cliffScene.rotation.x = -1.55;
// 		});
// 		return this.scene;
// 	}
	
// 	update()
// 	{
// 		if(this.scene)
// 		{
// 			this.scene.position.z += movementDelta*sceneVelocity;

// 			if(this.scene.position.z >= destroyZ)
// 			{
// 				let scale = randomRange(cliffScaleMin,cliffScaleMax);
// 				this.scene.scale.set(scale, scale, scale);
// 				this.scene.position.z -= cliffCount*cliffSpace;
// 			}
// 			// console.log(this.cliffScene);
// 		}
// 	}

// }

class rock {

	constructor(x, y, z) {
		let instance = this;
		loader.load('assets/Models/glowing_rock/scene.gltf', (gltf) => {
			console.log('created rock');
			instance.scene = gltf.scene;
			instance.scene.scale.set(65, 65, 65);
			scene.add(instance.scene);
			instance.scene.position.x = x;
			instance.scene.position.y = y;
			instance.scene.position.z = z;
			instance.scene.rotation.y = Math.random() * Math.PI * 2;
			incrementobjectloaded();
		});
		return this.scene;
	}
	
	update()
	{
		if(this.scene)
		{
			this.scene.position.z += movementDelta*sceneVelocity;

			if(this.scene.position.z >= destroyZ)
			{
				// let scale = randomRange(cliffScaleMin,cliffScaleMax);
				// this.scene.scale.set(scale, scale, scale);
				this.scene.position.z -= rockCount*rockSpace;
				this.scene.visible=true;
			}

			if(rocket.getposition())
			{
				let offset = rocket.getposition().clone();
				offset.x += rocketOffsetX;
				offset.z += rocketOffsetZ;
	
				offset = offset.distanceTo(this.scene.position);
				if(offset <= rockCollideOffset && this.scene.visible)
				{	
					start = false;
					//if (rocketMaxX-this.scene.position.x<100)
					//	this.scene.position.x-=100;//relocating rocket
					//else
						this.scene.visible=false;
						//if
					//RocketSound.stop();
					sceneVelocity=100;//reseting scene velocity
					score*=0.6;
					document.getElementById("score").innerHTML = "<h1>Score: " + Math.floor(score) + "</h1>";
					console.log("collide")
				}
			}
		}
	}

}


class crystal {

	constructor(x, y, z) {
		let instance = this;
		// loader.load('assets/Models/crystal_stone_rock/scene.gltf', (gltf) => {
		loader.load('assets/Models/glowing_crystals/scene.gltf', (gltf) => {
			console.log('created crystal');
			instance.scene = gltf.scene;
			// instance.scene.scale.set(65, 65, 65);
			instance.scene.scale.set(0.2, 0.2, 0.2);
			scene.add(instance.scene);
			instance.scene.position.x = x;
			instance.scene.position.y = y;
			instance.scene.position.z = z;
			instance.scene.rotation.y = Math.random() * Math.PI * 2;
			incrementobjectloaded()
		});
		return this.scene;
	}
	
	update()
	{
		if(this.scene)
		{
			this.scene.rotation.y += movementDelta * crystalRotationSpeed;
			this.scene.position.z += movementDelta*sceneVelocity;

			if(this.scene.position.z >= destroyZ)
			{
				// let scale = randomRange(cliffScaleMin,cliffScaleMax);
				// this.scene.scale.set(scale, scale, scale);
				this.scene.visible = true;
				this.scene.position.z -= crystalCount*crystalSpace;
			}

			if(rocket.getposition())
			{
				let offset = rocket.getposition().clone();
				offset.x += rocketOffsetX;
				offset.z += rocketOffsetZ;
	
				offset = offset.distanceTo(this.scene.position);
				if(this.scene.visible && offset <= crystalCollideOffset)
				{
					score += crystalExtraScore;
					this.scene.visible = false;
					if(CrystalSound!=null)
						CrystalSound.play();
					console.log("crystal")
				}
			}
		}
	}

}

class Mothership {
	constructor(x, y, z,rotx=0,roty=0,rotz=0,scalefactor=600,moving=false) {
		let instance =this;
		this.moving=moving;
		loader.load('assets/Models/colony_tactical_ship/scene.gltf', (gltf) => {
			instance.Mothership = gltf.scene;
			instance.Mothership.scale.set(scalefactor, scalefactor, scalefactor);
			scene.add(instance.Mothership);
			instance.Mothership.position.x = x;
			instance.Mothership.position.y = y;
			instance.Mothership.position.z = z;
			instance.Mothership.rotation.z = rotz;
			instance.Mothership.rotation.y = roty;
			instance.Mothership.rotation.x = rotx;
			incrementobjectloaded();
		});
		return instance.Mothership;
		
	}
	update(){

		if(this.Mothership)
		{


				if(this.moving)//simulate space ship moving faster than scene
					this.Mothership.position.z -= movementDelta*sceneVelocity*2.5;
				else
					this.Mothership.position.z += movementDelta*sceneVelocity;
				//else it is moving with same speed

				if(this.Mothership.position.z >= destroyZ)
				{
					this.Mothership.position.z -= 8000;
					this.Mothership.rotation.y=randomRange(1.5, -1.5);
					this.Mothership.position.x += randomRange(200, -200);
				}
				else if(this.Mothership.position.z < -9000)
				{
					this.Mothership.position.z += 9000;
					this.Mothership.position.x += randomRange(200, -200);
				}
		
		}
	}
}
// class RocketToken {
// 	constructor() { }
// }

function moveSceneUpdate()
{
	if(stop || !start) return;

	score += movementDelta * sceneVelocity / scoreDivider;
	document.getElementById("score").innerHTML = "<h1>Score: " + Math.floor(score) + "</h1>";

	for(let i = 0; i < cliffCount; i++)
	{
		cliffs[i][0].update();
		cliffs[i][1].update();
	}

	// if(rocket.getposition() != null)
	// {
	// 	rocks[0].scene.position.x = rocket.getposition().x + rocketOffsetX;
	// 	rocks[0].scene.position.y = rocket.getposition().y;
	// 	rocks[0].scene.position.z = rocket.getposition().z + rocketOffsetZ;
	// }
	// new rock(.x, rocket.getposition().y, rocket.getposition().z);
	for(let i = 0; i < rockCount; i++)
		rocks[i].update();
	for(let i = 0; i < crystalCount; i++)
		crystals[i].update();

	for(let i = 0; i < islandcount*2; i++)
		islands[i].update();
	for(let i = 0; i < Mothershipscount; i++)
		Motherships[i].update();
}

function getPointLight(intensity) {
	var light = new THREE.PointLight(0xffffff, intensity);
	light.castShadow = true;

	return light;
}

function update(renderer, scene, camera, controls) {
	movementDelta = movementClock.getDelta();

	sceneVelocity += sceneAcceleration * movementDelta;

	//trying to attach the camera to the rocket so that we follow it as it moves
	if (rocket.initialized = true) {
		//rocket.rocketscene.add(camera);
		//camera.lookAt(rocket.getposition)
		//console.log('rocket position is '+rocket.getposition());
	}
	renderer.render(
		scene,
		camera
	);

    water.material.uniforms['time'].value -= 4.0 / 60.0;// increase value here to speedup water

    if(!stop && start)
        water.material.uniforms['time'].value -= sceneVelocity / waterSpeedDivision;

	controls.update();
	//guard condition for first call of method render;
	//console.log('hey');
	rocket.update();
	moveSceneUpdate();

	updatestars();

	updateCamera();

	requestAnimationFrame(function () {
		update(renderer, scene, camera, controls);
	})
}
// to be used in conditions preventing the rocket from colliding with islands or other things than rocket tokens
// change limitcollision hyperparameter to satisfy your barier needs in the game
function isColliding(Object1, Object2, limitcollision = 300) {
	if (obj1) {
		if (obj2) {
			return Math.abs(Object1.position.x - Object2.position.x) < limitcollision && Math.abs(Object1.position.x - Object2.position.x) < limitcollision;
		}
	}
}
//to be used to avoid camera leaving scene space
function isCameraColliding(Object) {
	if (camera) {
		if (Object) {
			if (Math.abs(camera.position.x - Object.position.x) < 300 && Math.abs(camera.position.z - Object.position.z) < 300) {
				camera.position.x = camera.position.x > 0 ? camera.position.x++ : camera.position.x--;
				camera.position.z = camera.position.z > 0 ? camera.position.z++ : camera.position.z--;
			}
		}
	}
}
window.addEventListener('resize', onWindowResize)
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	//fcomposer.setSize(window.innerWidth, window.innerHeight);
}

// event listeners for the document when keys are pressed
window.addEventListener('keydown', function (event) {
	
	
	if ((event.key == 'w') || (event.key == 'W')) {
		start = true;
		rocket.speedup();
		//debug
		console.log('!!rocket speed increasing');
	}

	else if ((event.key == 's') || (event.key == 'S')) {
		rocket.speeddown();
		//debug
		console.log('rocket speed decreasing');
	}
	else if ((event.key == 'd') || (event.key == 'D')) {
		//todo
		rocket.rotateRocket('right');
	}
	else if ((event.key == 'a') || (event.key == 'A')) {
		//todo
		rocket.rotateRocket('left');
	}
	// event.preventDefault();
	// renderer.render(scene, camera);
});

window.addEventListener("keyup", function(event){
	if ((event.key == 'w') || (event.key == 'W')) {
		rocket.speedup();
		//debug
		console.log('!!rocket speed increasing');
	}

	else if ((event.key == 's') || (event.key == 'S')) {
		rocket.speeddown();
		//debug
		console.log('rocket speed decreasing');
	}
	else if ((event.key == 'd') || (event.key == 'D')) {
		//todo
		rocket.stopRotateRocket('right');
	}
	else if ((event.key == 'a') || (event.key == 'A')) {
		//todo
		rocket.stopRotateRocket('left');
	}
	else if ((event.key == 'M') || (event.key == 'm')) {
		//todo
		
		parameters.Sound=!parameters.Sound;
	}
	// event.preventDefault();
	// renderer.render(scene, camera);
})

//event handler when releasing w key 
document.addEventListener('keyup', function (event) {
	if ((event.key == 'w') || (event.key == 'W')) {
		rocket.decayflag = true;

	}
});

//update stars
function updatestars() {
    // if(stop) return;

	var particleSystem = scene.getObjectByName('stars');
	particleSystem.rotation.z += 0.0005;
	particleSystem.rotation.x += 0.0005;
	particleSystem.rotation.y += 0.0005;
	if (!particleSystem.geometry.vertices) {
		return;
	}
	particleSystem.geometry.vertices.forEach(function (particle) {
		particle.x += (Math.random() - 1) * 0.15;
		particle.y += (Math.random() - 0.75) * 0.15;
		particle.z += (Math.random()) * 0.15;

		if (particle.x < -4000) {
			particle.x = 4000;
		}
		if (particle.y < -4000) {
			particle.y = 4000;
		}
		if (particle.z < -4000) {
			particle.z = 4000;
		}
		if (particle.z > 4000) {
			particle.z = -4000;
		}
	});
	particleSystem.geometry.verticesNeedUpdate = true;

}

//might help later
function cameraPositionLimit() {
	//isCameraColliding(Island_scene);

	if (parameters.CameraLock) {
		camera.position.x = rocket.position.x;
		camera.position.y = rocket.position.y;
		camera.position.z = rocket.position.z;
		camera.rotation.x = rocket.rotation.x;
		camera.rotation.y = rocket.rotation.y - Math.PI / 2;
		camera.rotation.z = rocket.rotation.z;
		camera.translateX(5.6);
		camera.translateY(-3);
		camera.translateZ(40);
	} else {
		if (camera.position.x > SCALE / 4) {
			camera.position.x = SCALE / 4;
		}

		if (camera.position.x < -SCALE / 4) {
			camera.position.x = SCALE / 4;
		}

		if (camera.position.z > SCALE / 4) {
			camera.position.z = SCALE / 4;
		}

		if (camera.position.z < -SCALE / 4) {
			camera.position.z = SCALE / 4;
		}

		if (camera.position.y > SCALE * 0.09) {
			camera.position.y = SCALE * 0.09;
		}
	}
}

function updateCamera()
{
	if (rocket.getposition() != null) {

		rocketPosition = rocket.getposition().clone();
		cameraTarget = rocketPosition.clone().add(cameraOffset);

		//rocketPosition.x += 60;
		//cameraTarget.x += 40;

		// if (previousRocketPosition == null)
		// {
		//  	previousRocketPosition = rocketPosition;
		// }

		cameraLookAt.x = 0 + rocketPosition.x;
		cameraLookAt.y = 100 + rocketPosition.y;
		cameraLookAt.z = 0 + rocketPosition.z;

		
		// if(Math.abs((previousRocketPosition.x - rocketPosition.x)) > 40 || Math.abs((previousRocketPosition.y - rocketPosition.y)) > 40  || Math.abs((previousRocketPosition.z - rocketPosition.z)) > 40 )
		// {
		// 	camera.lookAt(cameraLookAt);
		// 	previousRocketPosition = rocketPosition;
		// 	camera.position.lerp(cameraTarget, 0.3);
		// }
		camera.position.lerp(cameraTarget, 0.3);
		camera.lookAt(cameraLookAt);

		// if(Math.abs(rocketPosition.x - previousRocketPosition.x) > 50)
		// {
		//   camera.position.lerp(cameraTarget, 0.3);
		//   previousRocketPosition = rocketPosition;
		// }

	}
}
var sceneview = init();