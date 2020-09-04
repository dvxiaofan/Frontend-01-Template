import { Timeline, Animation, ColorAnimation } from './animation';
import { cubicBezier } from './cubicBezier';

let linear = (t) => t;
let ease = cubicBezier(0.25, 0.1, 0.25, 1);

let el = document.getElementById('el');
let el2 = document.getElementById('el2');

let tl = new Timeline();

tl.add(
	new Animation(
		el.style,
		'transform',
		(v) => `translateX(${v}px)`,
		0,
		200,
		5000,
		0,
		linear
	)
);
tl.start();

document.getElementById('pause-id').addEventListener('click', () => {
	tl.pause();
});
document.getElementById('resume-id').addEventListener('click', () => {
	tl.resume();
});
document.getElementById('el2-start-id').addEventListener('click', () => {
	tl.add(
		new ColorAnimation(
			el.style,
			'background',
			{ r: 0, g: 0, b: 0, a: 1 },
			{ r: 255, g: 0, b: 0, a: 1 },
			5000,
			0,
			linear
		)
	);
});
