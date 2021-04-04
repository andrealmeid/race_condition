let canvas = document.getElementById("game");
let context = canvas.getContext("2d");

var globalX = 0;
var globalY = 0;
var globalScale = 1;

canvas.width = 1280;
canvas.height = 720;

let image = new Image();
image.onload = function() {
	context.drawImage(image, 0, 0, image.width, image.height, 100, 0,
		image.width * 0.1, image.height * 0.1);
	}

image.src = "assets/car.png";

function normalize(x, y)
{
	let norm = Math.sqrt(x*x + y*y);
	return [x / norm, y / norm];
}

function generateTrack()
{
	let track = [canvas.width / 2, canvas.height / 2];

	let dir = [1, 0];

	let scale = 60;

	for (let i = 2; i < 300; i += 2) {
		track.push(track[i-2] + dir[0] * scale);
		track.push(track[i-1] + dir[1] * scale);

		let angle = 0.3;
		let rand = Math.floor(Math.random() * 3);
		if (rand == 0)
			angle = 0;
		else if (rand == 1)
			angle *= -1;

		let cs = Math.cos(angle, "deg");
		let sn = Math.sin(angle, "deg");
		let px = dir[0] * cs - dir[1] * sn;
		let py = dir[0] * sn + dir[1] * cs;

		dir[0] = px;
		dir[1] = py;
	}

	return track;
}

function generateBorders(track)
{
	let trackRadius = 100;

	let posX1 = track[0];
	let posX2 = track[0];
	let posY1 = track[1];
	let posY2 = track[1];

	let borderL = [];
	let borderR = [];

	for (let i = 2; i < track.length; i += 2) {
		let dirX = track[i] - track[i-2];
		let dirY = track[i+1] - track[i-1];
		let dir = normalize(dirX, dirY);
		let newDirX1 = dir[1];
		let newDirY1 = -dir[0];
		let newDirX2 = -dir[1];
		let newDirY2 = dir[0];

		posX1 = track[i] + newDirX1 * trackRadius;
		posY1 = track[i+1] + newDirY1 * trackRadius;

		borderL.push(posX1);
		borderL.push(posY1);

		posX2 = track[i] + newDirX2 * trackRadius;
		posY2 = track[i+1] + newDirY2 * trackRadius;

		borderR.push(posX2);
		borderR.push(posY2);
	}

	return [borderL, borderR];
}

function drawTrack(borders)
{
	let [borderL, borderR] = borders;
	context.clearRect(0, 0, canvas.width, canvas.height);

	context.lineWidth = 5;
	context.beginPath();
	for (let i = 0; i < borderL.length - 2; i += 2) {
		context.moveTo(borderL[i], borderL[i+1]);
		context.lineTo(borderL[i+2], borderL[i+3]);

		context.moveTo(borderR[i], borderR[i+1]);
		context.lineTo(borderR[i+2], borderR[i+3]);

	}
	context.stroke();
	window.requestAnimationFrame(() => drawTrack(borders));
}

let track = generateTrack();
let borders = generateBorders(track);
drawTrack(borders);

document.onkeypress = function (e) {
	let speed = 35;
	let offsetX = 0, offsetY = 0;

	e = e || window.event;
	if (e.key === "w")
		offsetY = speed;
	else if (e.key == "s")
		offsetY = -speed;
	else if (e.key == "a")
		offsetX = speed;
	else if (e.key == "d")
		offsetX = -speed;

	context.translate(offsetX, offsetY);
};


function zoom(event)
{
	globalScale -= event.deltaY * 0.01;
	context.scale(globalScale, globalScale);
}

canvas.addEventListener("wheel", zoom);
