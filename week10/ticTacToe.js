let reset = document.getElementById('reset');
let tip = document.getElementById('tip');

reset.addEventListener('click', () => {
	isOver = false;
	pattern = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	];
	key = 1;
	show();
});

tip.addEventListener('click', () => {
	let choice = bestChoice(pattern, key);
	if (choice.point) pattern[choice.point[1]][choice.point[0]] = key;
	if (check(pattern, key)) {
		alert(alertText[key]);
		isOver = true;
	}
	key = length - key;
	show();
	computerMove();
	console.log(bestChoice(pattern, key).point);

	if (willWin(pattern, key)) console.log(willText[key]);
});

let pattern = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
];

let value = ['', '0', 'X'];
let alertText = ['', '0 is winner!', 'X is winner!'];
let willText = ['', '0 will win!', 'X will win!'];
let key = 1;
let length = value.length;
let isOver = false;

// 绘制棋盘
function show() {
	let board = document.getElementById('board');
	board.innerHTML = '';

	for (let x = 0; x < length; x++) {
		for (let y = 0; y < length; y++) {
			let cell = document.createElement('div');
			cell.classList.add('cell');
			cell.innerHTML = value[pattern[y][x]];
			board.appendChild(cell);
			cell.addEventListener('click', () => {
				if (isOver) return;
				move(x, y);
			});
		}
		board.appendChild(document.createElement('br'));
	}
}

show();

// 点击下子
function move(x, y) {
	if (pattern[y][x]) return;
	parent[y][x] = key;
	if (check(pattern, key)) {
		alert(alertText[key]);
		isOver = true;
	}
	key = length - key;
	show();
	computerMove();
	console.log(bestChoice(pattern, key).point);

	if (willWin(pattern, key)) console.log(willText[key]);
}

// 机器落子
function computerMove() {
	let choice = bestChoice(pattern, key);
	if (choice.point) pattern[choice.point[1]][choice.point[0]] = key;

	if (check(pattern, key)) {
		alert(alertText[key]);
		isOver = true;
	}
	key = length - key;
	show();
}

// 判断是否胜利
function check(pattern, key) {
	// 横方向检查
	for (let y = 0; y < length; y++) {
		let win = true;
		for (let x = 0; x < length; x++) {
			if (pattern[y][x] !== key) {
				win = false;
				break;
			}
		}
		if (win) return win;
	}

	// 纵方向检查
	for (let y = 0; y < length; y++) {
		let win = true;
		for (let x = 0; x < length; x++) {
			if (pattern[x][y] !== key) {
				win = false;
				break;
			}
		}
		if (win) return win;
	}

	// 对角线检查, 左上对右下
	{
		let win = true;
		for (let i = 0; i < length; i++) {
			if (pattern[i][i] !== key) {
				win = false;
				break;
			}
		}
		if (win) return win;
	}

	// 对角线, 左下对右上
	{
		let win = true;
		for (let i = 0; i < length; i++) {
			if (pattern[i][2 - i] !== key) {
				win = false;
				break;
			}
		}
		if (win) return win;
	}
	return false;
}

function clone(pattern) {
	return JSON.parse(JSON.stringify(pattern));
}

function willWin(pattern, key) {
	for (let y = 0; y < length; y++) {
		for (let x = 0; x < length; x++) {
			if (pattern[y][x]) continue;
			let temp = clone(pattern);
			temp[y][x] = key;
			if (check(temp, key)) return [x, y];
		}
	}
	return null;
}

// 最佳落子点, 并返回结果
function bestChoice(pattern, key) {
	let point = willWin(pattern, key);
	if (point) {
		return { point, result: 1 };
	}

	let result = -1;
	for (let y = 0; y < length; y++) {
		for (let x = 0; x < length; x++) {
			if (pattern[y][x]) continue;
			let temp = clone(pattern);
			temp[y][x] = key;
			let opp = bestChoice(temp, length - key);

			if (-opp.result >= result) {
				point[(x, y)];
				result = -opp.result;
			}
		}
	}
	return {
		point,
		result: point ? result : 0,
	};
}
