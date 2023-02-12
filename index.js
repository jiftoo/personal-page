/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
window.addEventListener("resize", () => {
	console.log(document.documentElement.clientWidth);
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;
	ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
});
window.dispatchEvent(new Event("resize"));

const scrollMaxValue = () => {
	const body = document.body;
	const html = document.documentElement;

	const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

	const windowHeight = window.innerHeight;

	return documentHeight - windowHeight;
};

window.addEventListener("scroll", () => {
	const scrolled = Math.min(window.scrollY / scrollMaxValue(), 1);

	const animations = document.getAnimations();
	const MIN_SCROLL = 0.2;
	if (scrolled > MIN_SCROLL) {
		const animation = animations.find((x) => x.animationName == "fadeInBottom");
		if (animation) {
			const maxTime = animation.effect.getTiming().duration;
			const time = ((scrolled - MIN_SCROLL) * (maxTime - 0)) / (1 - MIN_SCROLL) + 0;
			animation.currentTime = time;
		}
	}

	const canvasAnimation = animations.find((x) => x.animationName == "rotate-canvas");
	if (canvasAnimation) {
		const maxTime = canvasAnimation.effect.getTiming().duration;
		canvasAnimation.currentTime = maxTime * scrolled;
	}
});

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
	shift -= 0.01;

	seriesArray.forEach(([add, series], i) => {
		ctx.translate(shift, 0);
		renderSeries(series, i, add);
	});
	ctx.translate(-shift * seriesCount, 0);

	ctx.lineWidth = 10;
	ctx.strokeStyle = "rgba(255,255,255,0.2)";
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
