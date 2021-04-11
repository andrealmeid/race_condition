/* global Point, Path, Raster, view */

/**
 * @var {PaperScope} paper
 * @var {View} view
 * @var {Project} project
 * @var {Tool} tool
 */

// Movement
const PAN_SPEED_FACTOR = 1000;
const ZOOM_SPEED_FACTOR = 1.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;

// Track
const TRACK_LENGTH = 150;
const TRACK_SEGMENT_SCALE = 150;
const TRACK_CURVE_ANGLES = 20;
const TRACK_RADIUS = 75;
const MIDDLE_TRACK_COLOR = "#F7C856";
const MIDDLE_TRACK_WIDTH = 5;
const BORDER_COLOR = "black";
const BORDER_WIDTH = 10;

// Car
const CAR_SCALE = 0.05;
const CAR_ACCEL = 100;
const CAR_BREAK = 7 * CAR_ACCEL;
const ROAD_FRICTION = 1.0 * CAR_ACCEL;
const OFF_ROAD_FRICTION = 7.0 * CAR_ACCEL;
const CAR_ANGULAR_SPEED = 2;
const CAR_DISPLAY_SPEED = 180;
const CAR_MAX_SPEED = 500;
const CAR_MIN_SPEED = -0.20 * CAR_MAX_SPEED;
const OFF_ROAD_MAX_SPEED = 0.20 * CAR_MAX_SPEED;

let track = undefined;
let road = undefined;
let car = undefined;

// Car speed must be global, as it is an state
let carSpeed = 0;
let followCar = true;
const pressedKeys = {};

const globalStats = {
	frameTimeMs: {
		min: Number.MAX_SAFE_INTEGER,
		max: 0,
		avg: 0,
	},
	fps: {

	},
	isOffRoad: false,
};

// Globals
const CANVAS = document.getElementById("mainCanvas");

// Helpers
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function getRandomIntInclusive(min, max) {
	const roundedMin = Math.ceil(min);
	const roundedMax = Math.floor(max);
	return Math.floor(Math.random() * (roundedMax - roundedMin + 1)) + roundedMin;
}

function generateTrack() {
	let track = new Path();
	track.add(new Point(view.size.width / 2, view.size.height / 2));

	let dir = new Point(1, 0);

	for (let i = 0; i < TRACK_LENGTH; i += 1) {
		let lastPoint = track.lastSegment.point;
		track.add(lastPoint + dir * TRACK_SEGMENT_SCALE);
		const dirAngle = TRACK_CURVE_ANGLES * getRandomIntInclusive(-1, 1);
		dir = dir.rotate(dirAngle);
	}

	track.smooth();

	track.strokeColor = MIDDLE_TRACK_COLOR;
	track.strokeWidth = MIDDLE_TRACK_WIDTH;
	track.dashArray = [25, 17];

	return track;
}

/**
 * Returns the Road path array
 */
function generateRoad(track) {
	let leftBorder = new Path();
	let rightBorder = new Path();

	for (let curve of track.curves) {
		let curveDir = curve.point2 - curve.point1;
		curveDir = curveDir.normalize();

		let leftDir = curveDir.rotate(-90);
		let rightDir = curveDir.rotate(90);

		let leftBorderPoint = curve.point1 + leftDir * TRACK_RADIUS;
		let rightBorderPoint = curve.point1 + rightDir * TRACK_RADIUS;

		leftBorder.add(leftBorderPoint);
		rightBorder.insert(0, rightBorderPoint);
	}

	// Add last point
	let curveDir = track.lastCurve.point1 - track.lastCurve.point2;
	curveDir = curveDir.normalize();

	let leftDir = curveDir.rotate(90);
	let rightDir = curveDir.rotate(-90);

	let leftBorderPoint = track.lastCurve.point2 + leftDir * TRACK_RADIUS;
	let rightBorderPoint = track.lastCurve.point2 + rightDir * TRACK_RADIUS;

	leftBorder.add(leftBorderPoint);
	rightBorder.insert(0, rightBorderPoint);

	leftBorder.smooth();
	rightBorder.smooth();

	let road = new Path();
	road.join(leftBorder);
	road.join(rightBorder);

	road.strokeColor = BORDER_COLOR;
	road.strokeWidth = BORDER_WIDTH;
	road.closed = true;
	road.fillColor = "#ACA8AF";

	// Draw the road bellow the yellow strip
	road.sendToBack();

	return road;
}

function loadCar() {
	let car = new Raster("./images/car_red.png");
	car.position = view.center;
	car.scale(CAR_SCALE);
	return car;
}

// Input handlers
// Mouse pan
// eslint-disable-next-line no-unused-vars
function onMouseDrag(event) {
	view.translate(event.point - event.downPoint);
	followCar = false;
}

// eslint-disable-next-line no-unused-vars
function onKeyDown(event) {
	pressedKeys[event.key] = true;

	if (["w", "s", "a", "d"].some(key => pressedKeys[key]))
		followCar = false;

	if (event.key === "space")
		followCar = !followCar;
}

// eslint-disable-next-line no-unused-vars
function onKeyUp(event) {
	pressedKeys[event.key] = false;
}

// Keyboard pan
/**
 * @param {object} event - PaperJS
 * @property {number} event.delta - seconds between frames
 */
// eslint-disable-next-line no-unused-vars
function onFrame(event) {
	const { delta } = event;

	// Panning
	const pan = new Point(0, 0);
	const panSpeed = PAN_SPEED_FACTOR * (1 / view.zoom) * delta;

	if (pressedKeys["w"])
		pan.y += panSpeed;
	if (pressedKeys["s"])
		pan.y -= panSpeed;
	if (pressedKeys["a"])
		pan.x += panSpeed;
	if (pressedKeys["d"])
		pan.x -= panSpeed;

	view.translate(pan);

	// Car control
	if (car) {
		let speedInc = 0;

		// Accelerate
		if (pressedKeys["up"])
			speedInc = CAR_ACCEL * delta;

		// Breaking and reverse gear
		if (pressedKeys["down"]) {
			speedInc = -(carSpeed > 0 ? CAR_BREAK : CAR_ACCEL) * delta;
		}
		carSpeed += speedInc;

		globalStats.isOffRoad = !road.contains(car?.position);
		
		// Friction
		if (carSpeed !== 0 && speedInc === 0)
			carSpeed -= Math.sign(carSpeed) * ROAD_FRICTION * delta;

		if (globalStats.isOffRoad && Math.abs(carSpeed) > OFF_ROAD_MAX_SPEED)
			carSpeed -= Math.sign(carSpeed) * OFF_ROAD_FRICTION * delta;
		else {
			const maxSpeed = globalStats.isOffRoad ? OFF_ROAD_MAX_SPEED : CAR_MAX_SPEED;
			carSpeed = Math.round(clamp(carSpeed + speedInc, CAR_MIN_SPEED, maxSpeed));
		}

		let carRotation = 0;
		if (pressedKeys["left"])
			carRotation -= CAR_ANGULAR_SPEED;
		if (pressedKeys["right"])
			carRotation += CAR_ANGULAR_SPEED;
		carRotation *= carSpeed > 0 ? carSpeed / CAR_MAX_SPEED : -carSpeed / CAR_MIN_SPEED;

		car.rotate(carRotation);
		const carDir = new Point(1, 0).rotate(car.rotation);
		car.translate(carDir * carSpeed * delta);

		if (followCar)
			view.center = car.position;
	}

	const deltaMs = Math.round(delta * 1000);
	globalStats.frameTimeMs.curr = deltaMs;
	globalStats.frameTimeMs.min = Math.min(globalStats.frameTimeMs.min, deltaMs);
	globalStats.frameTimeMs.max = Math.max(globalStats.frameTimeMs.max, deltaMs);
	globalStats.frameTimeMs.avg = Math.ceil(globalStats.frameTimeMs.avg * 0.3 + deltaMs * 0.7);
	globalStats.fps.avg = Math.ceil(1000/globalStats.frameTimeMs.avg);

	// Update speedometer
	const displayCarSpeed = Math.round(carSpeed / CAR_MAX_SPEED * CAR_DISPLAY_SPEED);
	document.getElementById("speedometer").textContent = `Speed: ${displayCarSpeed} km/h`;
	document.getElementById("globalStats").textContent = JSON.stringify(globalStats);
}

CANVAS.addEventListener("wheel", event => {
	const mouseProjectPos = view.viewToProject(new Point(event.offsetX, event.offsetY));

	const zoomFactor = event.deltaY < 0 ? ZOOM_SPEED_FACTOR : 1 / ZOOM_SPEED_FACTOR;
	const afterZoom = zoomFactor * view.zoom;

	if (afterZoom >= MIN_ZOOM && afterZoom <= MAX_ZOOM)
		view.scale(zoomFactor, mouseProjectPos);
});

// Main code
track = generateTrack();
road = generateRoad(track);
car = loadCar();