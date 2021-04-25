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

// Globals
let road = undefined;
let pressedKeys = {};
let cars = [];
let followCar = true;
let globalStats = {
  min: Number.MAX_SAFE_INTEGER,
  max: 0,
  avg: 0,
}

const CANVAS = document.getElementById("mainCanvas");

function generateTrack() {
  let track = new Path();
  track.add(new Point(view.size.width / 2, view.size.height / 2));

  let dir = new Point(1, 0);

  for (let i = 0; i < TRACK_LENGTH; i += 1) {
    let lastPoint = track.lastSegment.point;
    track.add(lastPoint + dir * TRACK_SEGMENT_SCALE);
    const dirAngle = TRACK_CURVE_ANGLES * shared.getRandomIntInclusive(-1, 1);
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

function loadCars(cars) {
  for (let car of cars) {
    for (let sensor of car.sensors) {
      sensor.strokeColor = SENSOR_COLOR;
      sensor.strokeWidth = SENSOR_WIDTH;
    }
  }
}

// Input handlers
// Mouse pan
function onMouseDrag(event) {
  view.translate(event.point - event.downPoint);
  followCar = false;
}

function onKeyDown(event) {
  pressedKeys[event.key] = true;

  if (["w", "s", "a", "d"].some(key => pressedKeys[key]))
    followCar = false;

  if (event.key === "space")
    followCar = !followCar;
}

function onKeyUp(event) {
  pressedKeys[event.key] = false;
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

  if (pressedKeys["w"])
    pan.y += panSpeed;
  if (pressedKeys["s"])
    pan.y -= panSpeed;
  if (pressedKeys["a"])
    pan.x += panSpeed;
  if (pressedKeys["d"])
    pan.x -= panSpeed;

  view.translate(pan);

  // Draw cars from this keyframe
  for (let car of cars) {
    // TODO: use keyframe
    //let keyframe = shared.nextKeyframe();

    //shared.getAIInput(car, sensors);

    shared.gameLogic(pressedKeys, car, road, delta);

    let intersections = shared.calculateSensors(car, road);
    //console.log(intersections);

    for (var i = 0; i < car.circles.length; i++) {
      car.circles[i].remove();
    }
    car.circles = [];

    for (var i = 0; i < intersections.length; i++) {
      car.circles.push(new Path.Circle({
        center: intersections[i].point,
        radius: 5,
        fillColor: '#009dec'
      }));
    }



    /*
    car.rotate(car.rotation - car.lastRotation);
    car.dir = new Point(1, 0).rotate(car.rotation);
    car.translate(car.position - car.lastPos);
    */

    if (followCar)
      view.center = car.position;

    // Make this work for multiple cars
    let displayCarSpeed = Math.round(car.speed / CAR_MAX_SPEED * CAR_DISPLAY_SPEED);
    document.getElementById('speedometer').textContent = `Speed: ${displayCarSpeed} km/h`;
  }

  globalStats.min = Math.min(globalStats.min, delta);
  globalStats.max = Math.max(globalStats.max, delta);
  globalStats.avg = globalStats.avg * 0.3 + delta * 0.7;
}

CANVAS.addEventListener("wheel", event => {
  const mouseProjectPos = view.viewToProject(new Point(event.offsetX, event.offsetY));

  const zoomFactor = event.deltaY < 0 ? ZOOM_SPEED_FACTOR : 1 / ZOOM_SPEED_FACTOR;
  const afterZoom = zoomFactor * view.zoom;

  if (afterZoom >= MIN_ZOOM && afterZoom <= MAX_ZOOM)
    view.scale(zoomFactor, mouseProjectPos);
});

// Main code
let track = generateTrack();
road = generateRoad(track);

console.log(view.center);
shared.newCar(cars, view.center, 'assets/car_red.png');
loadCars(cars);


