let Overshooter = function (sensors, speed, isOffroad, input) {
  input.up = true;
  input.down = false;
  input.left = false;
  input.right = false;

  if (input.turn_right >= 4) {
    input.right = true;
  }
  if (input.turn_left >= 4) {
    input.left = true;
  }

  if (sensors[0] < 500) {
    input.left = false; input.right = false;
    if (sensors[1] < sensors[11] && (sensors[1] >= sensors[2] + 5 || sensors[0] < 320)) {
      input.left = true;
    }
    if (sensors[1] > sensors[11] && (sensors[11] >= sensors[10] + 5 || sensors[0] < 320)) {
      input.right = true;
    }
  }

  if (input.left) { input.turn_left += 1; input.turn_right = 0; }
  if (input.right) { input.turn_right += 1; input.turn_left = 0; }
}
