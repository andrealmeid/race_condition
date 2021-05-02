let wavyBoy = function (sensors, speed, isOffroad, input) {
  input.down = false;
  input.left = false;
  input.right = false;
  input.up = true;

  if (sensors[9] < 100) input.right = true;
  else if (sensors[10] > sensors[9]) input.left = true;
}
