/**
 * @external PaperScope
 * @external View
 * @external Project
 * @external Tool
 * 
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
const TRACK_SEGMENT_SCALE = 50;
const TRACK_CURVE_ANGLES = 15;
const TRACK_RADIUS = 50;
const MIDDLE_TRACK_COLOR = "yellow";
const MIDDLE_TRACK_WIDTH = 5;
const BORDER_COLOR = "black";
const BORDER_WIDTH = 10;

// Car
const CAR_SCALE = 0.05;
const CAR_ACCEL = 100;
const CAR_DE_ACCEL = 1.0 * CAR_ACCEL;
const CAR_ANGULAR_SPEED = 2;
const CAR_MAX_SPEED = 1000;
const CAR_MIN_SPEED = -100;

let track = undefined;
let road = undefined;
let car = undefined;

// Car speed must be global, as it is 
let carSpeed = 0;

let globalStats = {
  min: Number.MAX_SAFE_INTEGER,
  max: 0,
  avg: 0,
}

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

  for (let i = 1; i < 150; i += 1) {
    let lastPoint = track.lastSegment.point;
    track.add(lastPoint + dir * TRACK_SEGMENT_SCALE);
    const dirAngle = TRACK_CURVE_ANGLES * getRandomIntInclusive(-1, 1);
    dir = dir.rotate(dirAngle);
  }

  track.simplify();

  track.strokeColor = MIDDLE_TRACK_COLOR;
  track.strokeWidth = MIDDLE_TRACK_WIDTH;

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

  leftBorder.simplify();
  rightBorder.simplify();

  let road = new Path();
  road.join(leftBorder);
  road.join(rightBorder);

  road.strokeColor = BORDER_COLOR;
  road.strokeWidth = BORDER_WIDTH;
  road.closed = true;
  road.fillColor = "black";

  return road;
}

function loadCar() {
  let car = new Raster("./assets/car_red.png");
  car.position = view.center;
  car.scale(CAR_SCALE);
  return car;
}

// Input handlers
// Mouse pan
function onMouseDrag(event) {
  view.translate(event.point - event.downPoint);
}

// Keyboard pan
/**
 * @param {object} event - PaperJS
 * @property {number} event.delta - seconds between frames
 */
function onFrame(event) {
  const { delta } = event;

  // Panning
  const pan = new Point(0, 0);
  const panSpeed = PAN_SPEED_FACTOR * (1 / view.zoom) * delta;

  if (Key.isDown("w"))
    pan.y += panSpeed;
  if (Key.isDown("s"))
    pan.y -= panSpeed;
  if (Key.isDown("a"))
    pan.x += panSpeed;
  if (Key.isDown("d"))
    pan.x -= panSpeed;

  view.translate(pan);

  // Car control
  if (car) {
    if (Key.isDown("up"))
      carSpeed += CAR_ACCEL * delta;
    else if (carSpeed > 0)
      carSpeed -= CAR_DE_ACCEL * delta;

    if (Key.isDown("down"))
      carSpeed -= CAR_ACCEL * delta;
    else if (carSpeed < 0)
      carSpeed += CAR_DE_ACCEL * delta;

    carSpeed = Math.round(clamp(carSpeed, CAR_MIN_SPEED, CAR_MAX_SPEED));

    let carRotation = 0;
    if (Key.isDown("left"))
      carRotation -= CAR_ANGULAR_SPEED;
    if (Key.isDown("right"))
      carRotation += CAR_ANGULAR_SPEED;
    carRotation *= carSpeed > 0 ? carSpeed / CAR_MAX_SPEED : -carSpeed / CAR_MIN_SPEED;

    car.rotate(carRotation);
    const carDir = new Point(1, 0).rotate(car.rotation);
    car.translate(carDir * carSpeed * delta);
  }

  globalStats.min = Math.min(globalStats.min, delta);
  globalStats.max = Math.max(globalStats.max, delta);
  globalStats.avg = globalStats.avg * 0.3 + delta * 0.7;

  if (event.count % 50 === 0) {
    console.log(road.contains(car?.position))
  }
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
