let deadLock = function (sensors, speed, isOffroad, input) {
  let frontRight = sensors.slice(1, 3).reduce((acc, value) => acc + value);
  let frontLeft = sensors.slice(10, 12).reduce((acc, value) => acc + value);

  input.up = true;
  input.left = false;
  input.right = false;

  if (Math.min(frontRight, frontLeft) === Infinity) {
    input.left = true;
  } else {
    if (frontRight < frontLeft) input.left = true;
    if (frontLeft < frontRight) input.right = true;
    if (isOffroad) {
      let tmp = input.left;
      input.left = input.right;
      input.right = tmp;
    }
  }
}