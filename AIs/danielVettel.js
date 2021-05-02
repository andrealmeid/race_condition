let danielVettel = function (sensors, speed, isOffroad, input) {
  input.up = true;
  input.down = false;
  input.left = false;
  input.right = false;

  function swapSides(input) {
    let tmp = input.left;
    input.left = input.right;
    input.right = tmp;
  }

  let left_sensors = sensors[10];
  let right_sensors = sensors[1];

  if (right_sensors < left_sensors) input.left = true;
  if (right_sensors > left_sensors) input.right = true;
  if (isOffroad) swapSides(input);
}
