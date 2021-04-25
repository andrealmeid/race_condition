// Track
const TRACK_LENGTH = 150;
const TRACK_SEGMENT_SCALE = 150;
const TRACK_CURVE_ANGLES = 20;
const TRACK_RADIUS = 75;
const MIDDLE_TRACK_COLOR = "#F7C856";
const MIDDLE_TRACK_WIDTH = 5;
const BORDER_COLOR = "black";
const BORDER_WIDTH = 10;
const SENSOR_LEN = 500;
const SENSOR_WIDTH = 5;
const SENSOR_COLOR = "lightblue";

// Car
const CAR_SCALE = 0.05;
const CAR_ACCEL = 100;
const CAR_BREAK = 7 * CAR_ACCEL;
const CAR_FRICTION = 1.0 * CAR_ACCEL;
const CAR_ANGULAR_SPEED = 2;
const CAR_DISPLAY_SPEED = 180;
const CAR_MAX_SPEED = 500;
const CAR_MIN_SPEED = -100;
const OFFROAD_MAX_SPEED = 0.25 * CAR_MAX_SPEED;

(function(exports){

  // Helpers
  exports.clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  exports.getRandomIntInclusive = function (min, max) {
    const roundedMin = Math.ceil(min);
    const roundedMax = Math.floor(max);
    return Math.floor(Math.random() * (roundedMax - roundedMin + 1)) + roundedMin;
  }

  exports.newCar = function (cars, pos, imgurl) {
    let car = new paper.Group();

    car.raster = new paper.Raster(imgurl);
    car.raster.scale(CAR_SCALE);
    car.pivot = car.raster.position;
    car.addChild(car.raster);

    car.sensors = []
    car.prettysensors = [];

    let arc = 30;
    for (let i = 0; i < 360/arc; i++) {
      let dir = new paper.Point(1,0).rotate(arc * i);

      let sensor = new paper.Path();
      sensor.add(new paper.Point(car.position));
      sensor.add(new paper.Point(car.position.add(dir.multiply(SENSOR_LEN))));
      car.addChild(sensor);
      car.sensors.push(sensor);
    }

    car.speed = 0;
    car.position = pos;
    car.lastPos = pos;
    car.rotation = 0;
    car.lastRotation = 0;

    car.input = {up: false, down: false, left: false, right: false};
    car.driver = shared.driver;

    cars.push(car);

    return car;
  }

  exports.inputAccel = function (input, car, delta) {
    let speedInc = 0;

    // Accelerate
    if (input["up"])
      speedInc = CAR_ACCEL * delta;

    // Breaking and reverse gear
    if (input["down"])
      speedInc = -(car.speed > 0 ? CAR_BREAK : CAR_ACCEL) * delta;

    return speedInc;
  }

  exports.inputAngle = function (input, car) {
    let rotation = 0;

    if (input["left"])
      rotation -= CAR_ANGULAR_SPEED;
    if (input["right"])
      rotation += CAR_ANGULAR_SPEED;
    rotation *= car.speed > 0 ? car.speed / CAR_MAX_SPEED : -car.speed / CAR_MIN_SPEED;

    return rotation;
  }

  // TODO: separate this into a AI version and a player version
  exports.gameLogic = function (input, car, road, delta) {
    let speedInc = shared.inputAccel(input, car, delta);

    // Friction
    if (speedInc === 0 && car.speed !== 0)
      car.speed -= Math.sign(car.speed) * CAR_FRICTION * delta;

    const isOffroad = !road.contains(car.position);
    if (isOffroad && Math.abs(car.speed) > OFFROAD_MAX_SPEED) {
      car.speed -= Math.sign(car.speed) * CAR_BREAK * delta;
    } else {
      const maxSpeed = isOffroad ? OFFROAD_MAX_SPEED : CAR_MAX_SPEED;
      car.speed = Math.round(shared.clamp(car.speed + speedInc, CAR_MIN_SPEED, maxSpeed));
    }

    car.lastRotation = car.rotation;
    car.rotation += shared.inputAngle(input, car);

    // miguezao, car.rotation n funciona
    let dir = new paper.Point(1,0).rotate(car.raster.rotation);

    car.lastPos = car.position;
    car.position = car.position.add(dir.multiply(car.speed).multiply(delta));
  };

  exports.calculateSensors = function (carPos, intersections) {
    let sensors = [];

    for (let intersection of intersections) {
      sensors.push(shared.getSensorDistance(intersection));
    }

    return sensors;
  }

  exports.getIntersectionDistance = function (car, intersection) {
    let minDist = Infinity;
    for (let i = 0; i < intersection.length; i++) {
      let dist = intersection[i].point.subtract(car.position).length;
      minDist = Math.min(minDist, dist);
    }
    return minDist;
  }

  // Must be run after gameLogic runs at least once
  exports.calculateIntersections = function (car, road) {
    let intersections = [];

    for (let sensor of car.sensors) {
      let tmp = sensor.getIntersections(road);
      intersections.push(shared.getIntersectionDistance(car, tmp));
    }

    return intersections;
  };

  /* TODO
  exports.getRaceKeyframes = function () {
  }
  */

  // This is the default AI, other AIs will overwrite this function.
  // Must change the "input" parameter to control the car.
  // TODO: how far is the car from the start/end of the race
  // TODO: what place is the car in the race?
  exports.driver = function (sensors, speed, isOffroad, input) {
    //console.log('speed = ', speed, 'sensors = ', sensors, 'isOffroad = ', isOffroad);
    console.log(input);    
  }

}(typeof exports === 'undefined' ? this.shared = {} : exports));
