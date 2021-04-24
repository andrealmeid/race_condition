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

  exports.newCar = function (cars, pos) {
    let car = {
      raster: undefined, // used only in frontend as `new Raster(...)`
      speed: 0,
      pos: pos,
      lastPos: pos,
      rotation: 0,
    };
    cars.push(car);
  }

  exports.inputAccel = function (keys, car, delta) {
    let speedInc = 0;

    // Accelerate
    if (keys["up"])
      speedInc = CAR_ACCEL * delta;

    // Breaking and reverse gear
    if (keys["down"])
      speedInc = -(car.speed > 0 ? CAR_BREAK : CAR_ACCEL) * delta;

    return speedInc;
  }

  exports.inputAngle = function (keys, car) {
    let rotation = 0;

    if (keys["left"])
      rotation -= CAR_ANGULAR_SPEED;
    if (keys["right"])
      rotation += CAR_ANGULAR_SPEED;
    rotation *= car.speed > 0 ? car.speed / CAR_MAX_SPEED : -car.speed / CAR_MIN_SPEED;

    return rotation;
  }

  // TODO: separate this into a AI version and a player version
  exports.gameLogic = function (keys, car, road, delta) {
    let speedInc = shared.inputAccel(keys, car, delta);

    // Friction
    if (speedInc === 0 && car.speed !== 0)
      car.speed -= Math.sign(car.speed) * CAR_FRICTION * delta;

    const isOffroad = !road.contains(car.pos);
    if (isOffroad && Math.abs(car.speed) > OFFROAD_MAX_SPEED) {
      car.speed -= Math.sign(car.speed) * CAR_BREAK * delta;
    } else {
      const maxSpeed = isOffroad ? OFFROAD_MAX_SPEED : CAR_MAX_SPEED;
      car.speed = Math.round(shared.clamp(car.speed + speedInc, CAR_MIN_SPEED, maxSpeed));
    }

    car.lastRotation = car.rotation;
    car.rotation += shared.inputAngle(keys, car);

    car.dir = new paper.Point(1, 0).rotate(car.rotation);

    car.lastPos = car.pos;
    car.pos = car.pos.add(car.dir.multiply(car.speed).multiply(delta));
  };

  /* TODO
  exports.getRaceKeyframes = function () {
  }
  */

}(typeof exports === 'undefined' ? this.shared = {} : exports));
