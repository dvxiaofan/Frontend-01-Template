var tty = require('tty');
var ttys = require('ttys');
var rl = require('readline');

var stdin = ttys.stdin;
var stdout = ttys.stdout;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf-8');

function getChar() {
	return new Promise((resolve) => {
		stdin.on('data', function (key) {
			resolve(key);
		});
	});
}

function up(n = 1) {
	stdout.write('\033[' + n + 'A'); // Move the cursor up N lines: \033[<N>A
}

function down(n = 1) {
	stdout.write('\033[' + n + 'B'); // Move the cursor up N lines: \033[<N>A
}

function right(n = 1) {
	stdout.write('\033[' + n + 'C'); // Move the cursor up N lines: \033[<N>A
}

function left(n = 1) {
	stdout.write('\033[' + n + 'D'); // Move the cursor up N lines: \033[<N>A
}

async function select(choices) {
	let selected = 0;
	for (let i = 0; i < choices.length; i++) {
		if (i === selected) {
			stdout.write('[x] ' + choices[i] + '\n');
		} else {
			stdout.write('[ ] ' + choices[i] + '\n');
		}
	}
	up(choices.length);
	right();

	while (true) {
		let char = await getChar();
		if (char === '\u0003') {
			process.exit();
		}
		// w s a d control
		if (char === 'w' && selected > 0) {
			stdout.write(' ');
			left();
			selected--;
			up();
			stdout.write('x');
			left();
		}
		if (char === 's' && selected < choices.length - 1) {
			stdout.write(' ');
			left();
			selected++;
			down();
			stdout.write('x');
			left();
		}
		if (char === '\r') {
			down(choices.length - selected);
			left();
			return choices[selected];
		}
	}
}

void (async function () {
	stdout.write('Which framework do you want to use?\n');
	let answer = await select(['react', 'vue', 'angular']);
	stdout.write('You selected ' + answer + '.\n');
	process.exit();
})();
