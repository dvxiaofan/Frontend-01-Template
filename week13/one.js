let dragAble = document.getElementById('drag-able');

let baseX = 0,
	baseY = 0;

dragAble.addEventListener('mousedown', (event) => {
	let startX = event.clientX,
		startY = event.clientY;

	let move = (event) => {
		let nearestRange = nearest(event.clientX, event.clientY);
		nearestRange.insertNode(dragAble);
	};

	let up = (event) => {
		baseX = baseX + event.clientX - startX;
		baseY = baseY + event.clientY - startY;

		document.removeEventListener('mousemove', move);
		document.removeEventListener('mouseup', up);
	};

	document.addEventListener('mousemove', move);
	document.addEventListener('mouseup', up);
});

// 创建文字 range 间隙矩阵
let ranges = [];
let container = document.getElementById('container');

for (let i = 0; i < container.childNodes[0].textContent.length; i++) {
	let range = document.createRange();
	range.setStart(container.childNodes[0], i);
	range.setEnd(container.childNodes[0], i);
	ranges.push(range);
}

// 拖进文字区域
function nearest(x0, y0) {
	let nearestRange = null;
	let distance = Infinity;
	for (const range of ranges) {
		let { x, y } = range.getBoundingClientRect();
		let d = (x0 - x) ** 2 + (y0 - y) ** 2;
		if (d < distance) {
			nearestRange = range;
			distance = d;
		}
	}
	return nearestRange;
}

document.addEventListener('selectstart', (event) => event.preventDefault());
