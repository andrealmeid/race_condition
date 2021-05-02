let praFrenteX = function (sensors, speed, isOffroad, input) {
  const MAX_TURN_SPEED = 120;

  input.up = true;
  input.down = false;
  input.left = false;
  input.right = false;

  function swapSides(input) {
    let tmp = input.left;
    input.left = input.right;
    input.right = tmp;
  }

  let left_sensors = sensors[11] + sensors[10] + sensors[9];
  let right_sensors = sensors[1] + sensors[2] + sensors[3];

  if ((sensors[0] < 500 && right_sensors < left_sensors) || right_sensors * 1.3 < left_sensors) input.left = true;
  if ((sensors[0] < 500 && right_sensors > left_sensors) || right_sensors > left_sensors * 1.3) input.right = true;
  if (isOffroad) swapSides(input);
}

