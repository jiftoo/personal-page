/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.fillStyle = "whitesmoke";
});
window.dispatchEvent(new Event("resize"));

function genRandomSeries(steps, mag) {
	let randomValues = Array(steps)
		.fill(0)
		.map(() => Math.random());
	const randomInMag = (i) => randomValues[i] * mag * 2 - mag;

	let coefs = Array(steps)
		.fill(0)
		.map((_, i) => randomInMag(i) + randomInMag(i) / 2);
	let sineFuncs = coefs.map((coef, i) => {
		let fn = Math.sin;
		return (x) => coef * fn(x + randomInMag(i)) + randomInMag(i) / 2;
	});

	return function (x) {
		return sineFuncs.reduce((acc, func) => acc + func(x), 0);
	};
}

function renderSeries(series, i, add) {
	step = 400;
	let start = [0, Math.min(Math.max(series(10) + 400, 300), 350)];

	ctx.beginPath();
	ctx.moveTo(start[0], start[1]);
	let lastX = start[0];
	let lastY = start[1];
	for (let i = 1; i < canvas.width / step + 10; i++) {
		let x = i * step;
		let y = start[1] + series(x + add);
		let y2 = start[1] + series(x + add);
		ctx.bezierCurveTo(lastX / 2 + x / 2, lastY, lastX / 2 + x / 2, y, x, y);
		lastX = x;
		lastY = y;
	}
	ctx.stroke();
}

const gradient = ctx.createLinearGradient(0, 0, 2000, 2000);
gradient.addColorStop(0, "rgba(255, 166, 0, 0.25)");
gradient.addColorStop(0.65, "rgba(255, 0, 255, 0.25)");
gradient.addColorStop(1, "rgba(0, 128, 255, 0.5)");

let seriesCount = Math.random() < 0.5 ? 2 : 3;
let seriesArray = Array(seriesCount)
	.fill(0)
	.map(() => [0, genRandomSeries(115, 8)]);
let shift = -110;

function animate(time) {
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = gradient;
	ctx.lineWidth = 50;
	ctx.filter = "blur(1px)";
	shift -= 0.01;

	seriesArray.forEach(([add, series], i) => {
		ctx.translate(shift, 0);
		renderSeries(series, i, add);
	});
	ctx.translate(-shift * seriesCount, 0);

	ctx.lineWidth = 10;
	ctx.strokeStyle = "rgba(255,255,255,0.2)";
	let trBack = 40;
	seriesArray.forEach(([add, series], i) => {
		ctx.translate(shift, 0);
		renderSeries(series, i, add);
	});
	ctx.translate(-shift * seriesCount, 0);

	seriesArray = seriesArray.map(([add, series], i) => {
		return [add + i / 1000000 + 0.0021, series];
	});

	window.requestAnimationFrame(animate);
}
animate(0);
