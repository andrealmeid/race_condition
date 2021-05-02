function(sensors, speed, isOffroad, input)
{
	input.up = true;
	input.down = false;
	input.right = false;
	input.left = false;

	if (sensors[0] < 500)
	{
		if (sensors[11] > sensors[1])
		{
			input.left = true;
		}
		else
		{
			input.right = true;
		}
	}
}