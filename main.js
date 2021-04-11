// Movement
const panSpeedFactor = 1000;
const zoomSpeedFactor = 1.2;
const minZoom = 0.5;
const maxZoom = 5;
// Track
const trackSegmentScale = 50;
const trackCurveAngles = 15;
const trackRadius = 50;
const middleTrackColor = "yellow";
const middleTrackWidth = 5;
const borderColor = "black";
const borderWidth = 10;
let track = undefined;
let borders = undefined;
// Car
const carScale = 0.05;
const carAccel = 100;
const carDeAccel = 1.0 * carAccel;
const carAngularSpeed = 2;
const carMaxSpeed = 1000;
const carMinSpeed = -100;
let carSpeed = 0;
let car = undefined;

let stats = {
  min: Number.MAX_SAFE_INTEGER,
  max: 0,
  avg: 0,
}

// Globals
const canvas = document.getElementById("mainCanvas");

// Helpers
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTrack() {
  let track = new Path();
  track.add(new Point(view.size.width / 2, view.size.height / 2));

  let dir = new Point(1, 0);

  for (let i = 1; i < 150; i += 1) {
    let lastPoint = track.lastSegment.point;
    track.add(lastPoint + dir * trackSegmentScale);
    const dirAngle = trackCurveAngles * getRandomIntInclusive(-1, 1);
    dir = dir.rotate(dirAngle);
  }

  track.simplify();

  track.strokeColor = middleTrackColor;
  track.strokeWidth = middleTrackWidth;

  return track;
}

function generateBorders(track) {
  let leftBorder = new Path();
  let rightBorder = new Path();

  for (let curve of track.curves) {
    let curveDir = curve.point2 - curve.point1;
    curveDir = curveDir.normalize();

    let leftDir = curveDir.rotate(-90);
    let rightDir = curveDir.rotate(90);

    let leftBorderPoint = curve.point1 + leftDir * trackRadius;
    let rightBorderPoint = curve.point1 + rightDir * trackRadius;

    leftBorder.add(leftBorderPoint);
    rightBorder.add(rightBorderPoint);
  }

  // Add last point
  let curveDir = track.lastCurve.point1 - track.lastCurve.point2;
  curveDir = curveDir.normalize();

  let leftDir = curveDir.rotate(90);
  let rightDir = curveDir.rotate(-90);

  let leftBorderPoint = track.lastCurve.point2 + leftDir * trackRadius;
  let rightBorderPoint = track.lastCurve.point2 + rightDir * trackRadius;

  leftBorder.add(leftBorderPoint);
  rightBorder.add(rightBorderPoint);

  leftBorder.strokeColor = borderColor;
  leftBorder.strokeWidth = borderWidth;
  leftBorder.simplify();

  rightBorder.strokeColor = borderColor;
  rightBorder.strokeWidth = borderWidth;
  rightBorder.simplify();

  return [leftBorder, rightBorder];
}

function loadCar() {
  let car = new Raster("./assets/car.png");
  car.position = view.center;
  car.scale(carScale);

  return car;
}

// Input handlers
// Mouse pan
function onMouseDrag(event) {
  view.translate(event.point - event.downPoint);
}

// Keyboard pan
function onFrame(event) {
  let pan = new Point(0, 0);
  const actualPanSpeed = panSpeedFactor * (1 / view.zoom) * event.delta;

  if (Key.isDown("w"))
    pan.y += actualPanSpeed
  if (Key.isDown("s"))
    pan.y -= actualPanSpeed
  if (Key.isDown("a"))
    pan.x += actualPanSpeed
  if (Key.isDown("d"))
    pan.x -= actualPanSpeed

  view.translate(pan);

  // Car control
  if (car !== undefined) {
    let carRotation = 0;

    if (Key.isDown("up"))
      carSpeed += carAccel * event.delta;
    else if (carSpeed > 0)
      carSpeed -= carDeAccel * event.delta;
    if (Key.isDown("down"))
      carSpeed -= carAccel * event.delta;
    else if (carSpeed < 0)
      carSpeed += carDeAccel * event.delta;
    if (Key.isDown("left"))
      carRotation -= carAngularSpeed;
    if (Key.isDown("right"))
      carRotation += carAngularSpeed;
    carRotation *= carSpeed > 0 ? carSpeed / carMaxSpeed : -carSpeed / carMinSpeed;

    carSpeed = Math.round(clamp(carSpeed, carMinSpeed, carMaxSpeed));

    car.rotate(carRotation);
    const carDir = new Point(1, 0).rotate(car.rotation);
    car.translate(carDir * carSpeed * event.delta);
  }

  stats.min = Math.min(stats.min, event.delta);
  stats.max = Math.max(stats.max, event.delta);
  stats.avg = stats.avg * 0.3 + event.delta * 0.7;
  console.log(stats);
}

canvas.addEventListener("wheel", event => {
  let mouseProjectPos = view.viewToProject(new Point(event.offsetX, event.offsetY));

  const zoomFactor = event.deltaY < 0 ? zoomSpeedFactor : 1 / zoomSpeedFactor;
  const afterZoom = zoomFactor * view.zoom;

  if (afterZoom >= minZoom && afterZoom <= maxZoom)
    view.scale(zoomFactor, mouseProjectPos);
});

// Main code
track = generateTrack();
borders = generateBorders(track);
car = loadCar();