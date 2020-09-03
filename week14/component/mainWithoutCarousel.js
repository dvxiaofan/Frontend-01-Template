function createElement(Cls, attributes, ...children) {
	let o;

	if (typeof Cls === 'string') {
		o = new Wrapper(Cls);
	} else {
		o = new Cls({
			timer: {},
		});
	}

	for (let name in attributes) {
		o.setAttribute(name, attributes[name]);
	}

	console.log(o);
	for (let child of children) {
		if (typeof child === 'string') child = new Text(child);

		o.appendChild(child);
	}

	return o;
}

class Text {
	constructor(text) {
		this.children = [];
		this.root = document.createTextNode(text);
	}
	mountTo(parent) {
		parent.appendChild(this.root);
	}
}

class Wrapper {
	constructor(type) {
		this.children = [];
		this.root = document.createElement(type);
	}

	setAttribute(name, value) {
		//attribute
		this.root.setAttribute(name, value);
	}

	appendChild(child) {
		this.children.push(child);
	}

	mountTo(parent) {
		parent.appendChild(this.root);

		for (let child of this.children) {
			child.mountTo(this.root);
		}
	}
}

class MyComponent {
	constructor(config) {
		this.children = [];
		this.attributes = new Map();
		this.properties = new Map();
	}

	setAttribute(name, value) {
		//attribute
		// this.root.setAttribute(name, value);
		this.attributes.set(name, value);
	}

	appendChild(child) {
		this.children.push(child);
	}

	set title(value) {
		this.properties.set('title', value);
	}

	render() {
		return (
			<article>
				<h1>{this.attributes.get('title')}</h1>
				<h1>{this.properties.get('title')}</h1>
				<header>I'm a header</header>
				{this.slot}
				<footer>I'm a footer</footer>
			</article>
		);
	}

	mountTo(parent) {
		this.slot = <div></div>;
		for (let child of this.children) {
			this.slot.appendChild(child);
		}
		this.render().mountTo(parent);
	}
}

let component = (
	<MyComponent title='hhhh'>
		<div>text text text</div>
	</MyComponent>
);

component.title = 'hehehe';

component.mountTo(document.body);

console.log(component);
