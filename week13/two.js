let handlers = new Map(); // callback
let reactivities = new Map();

let usedReactivities = [];

let object = {
	a: 1,
	b: 2,
};

function reactive(obj) {
	if (reactivities.has(obj)) {
		return reactivities.get(obj);
	}
	let proxy = new Proxy(obj, {
		get(obj, prop) {
			usedReactivities.push([obj, prop]);
			if (typeof obj[prop] === 'object') return reactive(obj[prop]);
			return obj[prop];
		},
		set(obj, prop, val) {
			obj[prop] = val;
			// console.log(handlers)
			if (handlers.get(obj)) {
				if (handlers.get(obj).get(prop)) {
					for (let handler of handlers.get(obj).get(prop)) {
						handler();
					}
				}
			}
			return obj[prop];
		},
	});

	reactivities.set(obj, proxy);
	reactivities.set(proxy, proxy);

	return proxy;
}

// 依赖收集
// 先监听 再收集
function effect(handler) {
	usedReactivities = [];
	handler();
	// console.log(usedReactivities)
	for (let usedReactivity of usedReactivities) {
		let [obj, prop] = usedReactivity;
		// console.log([obj, prop])
		if (!handlers.has(obj)) {
			handlers.set(obj, new Map());
		}
		if (!handlers.get(obj).has(prop)) {
			handlers.get(obj).set(prop, []);
		}
		handlers.get(obj).get(prop).push(handler);
	}
}

let p = reactive({ r: 100, g: 100, b: 100 });

effect(() => {
	document.getElementById('r').value = p.r;
});

effect(() => {
	document.getElementById('g').value = p.g;
});

effect(() => {
	document.getElementById('b').value = p.b;
});

document.getElementById('r').addEventListener('input', (event) => {
	p.r = event.target.value;
});

document.getElementById('g').addEventListener('input', (event) => {
	p.g = event.target.value;
});

document.getElementById('b').addEventListener('input', (event) => {
	p.b = event.target.value;
});

effect(() => {
	document.getElementById(
		'color'
	).style.backgroundColor = `rgb(${p.r}, ${p.g}, ${p.b})`;
});
