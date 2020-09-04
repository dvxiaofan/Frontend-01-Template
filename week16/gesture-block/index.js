window.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('selectstart', (event) => event.preventDefault());
document.addEventListener('touchmove', (event) => event.preventDefault(), {
	passive: false,
});
enableGesture(document.body);
let x = 0,
	y = 0;
let my = document.getElementById('my');
document.body.addEventListener('pan', (event) => {
	console.log('x', x + event.clientX - event.startX);
	console.log('y', y + event.clientY - event.startY);
	my.style.transform = `translate(${x + event.clientX - event.startX}px, ${
		y + event.clientY - event.startY
	}px)`;
});
document.body.addEventListener('panend', (event) => {
	x = x + event.clientX - event.startX;
	y = y + event.clientY - event.startY;
});
