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

  let left_sensors = sensors[10] + sensors[9] + sensors[8];
  let right_sensors = sensors[1] + sensors[2] + sensors[3];

  if (right_sensors < left_sensors) input.left = true;
  if (right_sensors > left_sensors) input.right = true;
  if (isOffroad) swapSides(input);
}

