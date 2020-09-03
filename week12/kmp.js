function find(source, pattern) {
	const table = new Array(pattern.length).fill(0);
	let k = 0;
	for (let p = 1; p < pattern.length; p++) {
		if (pattern[p] === pattern[k]) k++;
		else k = 0;

		table[p] = k;
	}

	let p = 0;
	for (let i = 0; i < source.length; i++) {
		if (source[i] === pattern[p]) p++;
		else {
			while (source[i] !== pattern[p] && p > 0) {
				p = table[p - 1];
			}
			if (source[i] === pattern[p]) p++;
			else p = 0;
		}
	}
	if (p === pattern.length) return true;
	return false;
}
