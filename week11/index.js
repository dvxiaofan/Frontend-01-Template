void (async function () {
	while (true) {
		red();
		await sleep(3000);
		green();
		await sleep(5000);
		yellow();
		await sleep(1000);
	}
})();

function sleep(t) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, t);
	});
}

function hide() {
	let ligths = document.getElementsByTagName('div');
	for (let i = 0; i < ligths.length; i++) {
		const element = ligths[i];
		element.classList.add('hide');
	}
}

function red() {
	hide();
	let red = document.getElementsByClassName('red')[0];
	red.classList.remove('hide');
}

function green() {
	hide();
	let green = document.getElementsByClassName('green')[0];
	green.classList.remove('hide');
}

function yellow() {
	hide();
	let yellow = document.getElementsByClassName('yellow')[0];
	yellow.classList.remove('hide');
}
