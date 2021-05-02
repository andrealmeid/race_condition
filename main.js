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

  // We have two border paths: the white one, and the red dashes
  let border = road.clone();
  border.dashArray = [KERB_GAP, KERB_GAP];
  border.strokeColor = KERB_COLOR;
  border.strokeWidth = BORDER_WIDTH;

  road.strokeColor = BORDER_COLOR;
  road.strokeWidth = BORDER_WIDTH;
  road.closed = true;
  road.fillColor = TRACK_COLOR;

  return road;
}

function loadCars(cars) {
  for (let car of cars) {
    for (let sensor of car.sensors) {
      // do nothing yet
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
  let activeElement = document.activeElement.tagName;
  if (activeElement == 'BUTTON' || activeElement == 'TEXTAREA')
    return;

  pressedKeys[event.key] = true;

  if (["w", "s", "a", "d"].some(key => pressedKeys[key]))
    followCar = false;

  if (event.key === "space")
    followCar = !followCar;

  if (["up", "down", "left", "right"].includes(event.key))
    player_car.input[event.key] = true;
}

function onKeyUp(event) {
  let activeElement = document.activeElement.tagName;
  if (activeElement == 'BUTTON' || activeElement == 'TEXTAREA')
    return;

  pressedKeys[event.key] = false;

  if (player_car.input[event.key] === true)
    player_car.input[event.key] = false;
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

  // Clear the speedometer
  document.getElementById('speedometer').textContent = '';

  // Draw cars from this keyframe
  for (let car of cars) {

    // logic

    // TODO: use keyframe
    //let keyframe = shared.nextKeyframe();

    shared.gameLogic(car.input, car, road, delta);

    let intersections = shared.calculateIntersections(car, road);

    let isOffroad = !road.contains(car.position);
    car.driver(intersections, car.speed, isOffroad, car.input);


    // rendering

    for (var i = 0; i < car.prettysensors.length; i++) {
      car.prettysensors[i].remove();
    }
    car.prettysensors = [];

    for (let i = 0; i < intersections.length; i++) {
      if (intersections[i] == Infinity)
        continue;

      let path = new Path();
      path.add(new Point(car.position));
      path.add(new Point(car.position + (car.sensors[i].getTangentAt(0) * intersections[i])));
      path.strokeColor = SENSOR_COLOR;
      path.strokeWidth = SENSOR_WIDTH;
      car.addChild(path);

      car.prettysensors.push(path);
    }
    car.raster.bringToFront();

    // Display car speed
    let displayCarSpeed = Math.round(car.speed / CAR_MAX_SPEED * CAR_DISPLAY_SPEED);
    document.getElementById('speedometer').textContent += `${car.name}: ${displayCarSpeed} km/h\r\n`;
  }

  if (followCar)
    view.center = player_car.position;

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
let starting_position = view.center;
let track = generateTrack();
road = generateRoad(track);

player_car = shared.newCar(cars, starting_position, 'assets/car_red.png', 'Player');

// Dummy AI for testing
let ai_car = shared.newCar(cars, starting_position, 'assets/car_blue.png', 'AI');
ai_car.driver = shared.driver;

// Maybe remove? maybe reappropriate for loading the cars when the race is starting?
loadCars(cars);

// Button to test AI
let driverApplyButton = document.getElementById('driver-submit');
driverApplyButton.onclick = function () {
  let driver = shared.driver;
  try {
    let func = Function('return (' + document.getElementById('driver-code').value + ')')();
    console.log(func);
    func(ai_car.sensors, ai_car.speed, false, ai_car.input);
    driver = func;
  } catch (e) {
    console.log("BBB");
  }
  //eval('try { driver = ' + func + ' } catch (e) { console.log(e); }');
  ai_car.driver = driver;
  shared.restart(cars, starting_position);
}

