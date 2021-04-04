let canvas = document.getElementById("game");
let context = canvas.getContext("2d");

const panSpeedFactor = 10;
const minZoom = 0.5;
const maxZoom = 5;

let globalX = 0;
let globalY = 0;
let globalScale = 1;
let mouseX = 0, mouseY = 0;

let pressedKeys = {};

canvas.width = 1280;
canvas.height = 720;

function clamp(val, max, min) {
	return Math.min(Math.max(val,min), max);
}

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

function clearCanvas()
{
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawTrack(borders)
{
	let [borderL, borderR] = borders;

	const actualSpeed = panSpeedFactor * (1 / globalScale);
	if (pressedKeys["w"])
		globalY += actualSpeed
	if (pressedKeys["s"])
		globalY -= actualSpeed
	if (pressedKeys["a"])
		globalX += actualSpeed
	if (pressedKeys["d"])
		globalX -= actualSpeed

	clearCanvas();

	context.save();
	context.scale(globalScale, globalScale);
	context.translate(globalX, globalY);
	context.fillRect(0, 0, 10, 10); // eu sou um ponto; bota mais

	context.lineWidth = 5;
	context.beginPath();
	for (let i = 0; i < borderL.length - 2; i += 2) {
		context.moveTo(borderL[i], borderL[i+1]);
		context.lineTo(borderL[i+2], borderL[i+3]);

		context.moveTo(borderR[i], borderR[i+1]);
		context.lineTo(borderR[i+2], borderR[i+3]);
	}

	context.stroke();

	context.drawImage(image, 0, 0, image.width, image.height, 100, 0,
		image.width * 0.1, image.height * 0.1);

	context.restore();

	window.requestAnimationFrame(() => drawTrack(borders));
}

let track = generateTrack();
let borders = generateBorders(track);
drawTrack(borders);

document.onkeypress = function (e) {
	pressedKeys[e.key] = true;
};

document.onkeyup = function (e) {
	pressedKeys[e.key] = false;
};

function zoom(event)
{
	let bound = canvas.getBoundingClientRect();

	mouseX = (event.clientX - bound.left - canvas.clientLeft);
	mouseY = (event.clientY - bound.top - canvas.clientTop);

	let oldScale = globalScale;
	globalScale -= event.deltaY * 0.001;
	globalScale = clamp(globalScale, maxZoom, minZoom);

	globalX -= (mouseX / oldScale) - (mouseX / globalScale);
	globalY -= (mouseY / oldScale) - (mouseY / globalScale);
}

canvas.addEventListener("wheel", zoom);
