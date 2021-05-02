let wavyBoy = function (sensors, speed, isOffroad, input) {
  input.up = true;
  input.left = false;
  input.right = false;

  let diff = sensors[10] - sensors[2];

  if (diff > 50) input.left = true;
  else if (diff < -50) input.right = true;
}
