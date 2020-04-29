/* TODO: String to Number */

// 参数默认为十进制
const convertStringToNumber = (string, hex = 10) => {
	if (string.indexOf('e') != -1) {
		let chars = string.split('e');
		let eLeft = Number(chars[0]);
		let eRight = Number(chars[1]);
		return eLeft * Math.pow(10, eRight);
	}

	let chars = string.split('');
	let number = 0;
	let i = 0;

	while (i < chars.length && chars[i] !== '.') {
		number *= hex;
		number += chars[i].codePointAt(0) - '0'.codePointAt(0);
		i++;
	}

	if (chars[i] === '.') {
		i++;
	}

	// 小数部分
	let fraction = 1;

	while (i < chars.length) {
		fraction = fraction / hex;
		number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * fraction;
		i++;
	}

	return number;
};

let resultNum = convertStringToNumber('98.97', 2);
console.log(resultNum);

/* TODO: Number to String */
const covertNumberToString = (number, hex = 10) => {
	let integer = Math.floor(number);
	let fraction = number - integer;

	// 处理小数部分
	if (fraction && hex === 10) {
		fraction = ('' + number).match(/\.\d*/)[0];
	}

	let string = '';
	while (integer > 0) {
		string = String(integer % hex) + string;
		integer = Math.floor(integer / hex);
	}

	return fraction ? `${string}${fraction}` : string;
};

let resultStr = covertNumberToString(9.9);
console.log(resultStr);
