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
let displaySensors = false;
let globalStats = {
  min: Number.MAX_SAFE_INTEGER,
  max: 0,
  avg: 0,
}

// UI
let cameraFocus = {
  followCar: false,
  focusedCarIdx: -1
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
 * Create some ex-POTUS around the track
 */
function generateBush(curves) {
  var bushPath = "M 25.700491,0.37527836 C 21.28065,4.7951193 18.634066,16.579174 17.17388,25.893615 13.619575,17.681787 8.7938281,7.7803073 4.5979045,3.5843833 c 0,0 5.0757971,13.0758057 7.7617995,23.2419917 C 8.5088356,22.786986 4.0786166,18.78873 0.10618925,16.818201 L 10.209448,38.653043 c 0,0 3.491512,-0.01613 7.014558,-0.03359 2.121836,-9e-5 4.072625,-0.01621 4.638995,-0.02119 2.327267,0.0092 11.373321,-0.135203 10.848801,-0.139343 -0.520519,-1.601685 9.898252,-17.067873 9.898252,-17.067873 -5.022093,1.967818 -10.765036,6.490417 -15.154114,10.407118 2.298732,-8.182758 8.546248,-20.89795 8.546248,-20.89795 -4.325376,3.41662 -9.329356,11.630999 -12.909806,18.226278 0.07187,-11.290329 2.608109,-28.75121464 2.608109,-28.75121464 z";
  let bush = new Path(bushPath);
  bush.scale(0.5);
  bush.fillColor = '#2D5016';

  for (let curve of curves) {
    let chance = shared.getRandomIntInclusive(0, 2);
    let startPoint = curve.point1;
    let endPoint = curve.point2;

    let curveDir = curve.point2 - curve.point1;
    curveDir = curveDir.normalize();

    let leftDir = curveDir.rotate(-90);
    let rightDir = curveDir.rotate(90);
    let newBush = bush.clone();

    if (chance > 0) {
      let dist = 2 + shared.getRandomIntInclusive(50, 100) / 100;
      newBush.position = startPoint + leftDir * (TRACK_RADIUS * dist);
    }

    if (shared.getRandomIntInclusive(0, 2) > 0)
	  continue;

    newBush = bush.clone();
    let dist = 2 + shared.getRandomIntInclusive(50, 100) / 100;
    newBush.position = startPoint + rightDir * (TRACK_RADIUS * dist);
  }

  bush.remove();
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

  generateBush(track.curves);

  return road;
}

function loadCars(cars) {
  for (let car of cars) {
    for (let sensor of car.sensors) {
      // do nothing yet
    }
  }

  // Set camera focus
  cameraFocus.followCar = true;
  cameraFocus.focusedCarIdx = 0;
}

// Input handlers
// Mouse pan
function onMouseDrag(event) {
  view.translate(event.point - event.downPoint);
  cameraFocus.followCar = false;
}

function onKeyDown(event) {
  let activeElement = document.activeElement.tagName;
  if (activeElement == 'BUTTON' || activeElement == 'TEXTAREA')
    return;

  pressedKeys[event.key] = true;

  if (["w", "s", "a", "d"].some(key => pressedKeys[key]))
    cameraFocus.followCar = false;

  if (event.key === "space")
    cameraFocus.followCar = !cameraFocus.followCar;

  if (["up", "down", "left", "right"].includes(event.key))
    player_car.input[event.key] = true;

  if (event.key === "q") {
    cameraFocus.focusedCarIdx = (cameraFocus.focusedCarIdx + cars.length - 1) % cars.length;
    cameraFocus.followCar = true;
  }

  if (event.key === "e") {
    cameraFocus.focusedCarIdx = (cameraFocus.focusedCarIdx + cars.length + 1) % cars.length;
    cameraFocus.followCar = true;
  }

  if (event.key === "1")
    displaySensors = !displaySensors;
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

    if (displaySensors) {
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
    }
    car.raster.bringToFront();

    // Display car speed
    let displayCarSpeed = Math.round(car.speed / CAR_MAX_SPEED * CAR_DISPLAY_SPEED);
    document.getElementById('speedometer').textContent += `${car.name}: ${displayCarSpeed} km/h\r\n`;
  }

  if (cameraFocus.followCar)
    view.center = cars[cameraFocus.focusedCarIdx].position;

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

player_car = shared.newCar(cars, starting_position, 'assets/car_red.png', 'Player', shared.driver);

// Dummy AI for testing
let ai_car = shared.newCar(cars, starting_position, 'assets/car_blue.png', 'AI', shared.driver);

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
    console.log(e);
  }
  ai_car.driver = driver;
  shared.restart(cars, starting_position);
}

// AIs!! Add yours' here.
shared.newCar(cars, starting_position, 'assets/car_green.png', 'praFrentex', praFrenteX);
shared.newCar(cars, starting_position, 'assets/car_underground2.png', 'danielVettel', danielVettel);
shared.newCar(cars, starting_position, 'assets/car_orange.png', 'deadLock', deadLock);
