const css = require('css')
/**
 * 解析词法总结:
 * 属性值分为单引号,双引号,无引号三种写法, 因此需要较多状态处理
 * 处理属性的方式跟标签类似
 * 属性结束后, 我们把属性加到标签Token上
 */
let currentToken = null;
let currentAttribute = null;

/**
 * 栈解析总结:
 * 从标签构建DOM书的基本技巧是使用栈
 * 遇到开始标签时创建元素并入栈,遇到结束标签时出栈
 * 自封闭节点可视为入栈后立刻出栈
 * 任何元素的父元素是它入栈前的栈顶
 */
// 创建一个栈
let stack = [{type: 'document', children: []}];

/**
 * 处理文本节点:
 * 文本节点与自封闭标签处理类似
 * 多个文本节点需要合并
 */

let currentTextNode = null;

// 把CSS规则暂存到一个数组里
let rules = [];
function addCSSRules(text) {
	let ast = css.parse(text);
	// console.log(JSON.stringify(ast, null, '   '));
	rules.push(...ast.stylesheet.rules);
}

// 计算选择器与元素匹配
function match(element, selector) {
	if (!selector || !element.attributes) return false;
	if (selector.charAt(0) == '#') {
		let attr = element.attributes.filter(attr => attr.name === 'id')[0];

		if (attr && attr.value === selector.replace('#', '')) return true;
	}
	else if (selector.charAt(0) == '.') {
		let attr = element.attributes.filter(attr => attr.name === 'class')[0];

		if (attr && attr.value === selector.replace('.', '')) return true;
	}
	else {
		if (element.tagName === selector) return true;
	}
	return false;
}

/**
 * 创建一个元素后, 立即计算CSS
 * 理论上, 当我们分析一个元素时, 所有CSS规则已经收集完毕
 * 在真是浏览器中, 可能要卸载body的style标签, 需要重新CSS计算的情况, 这里我们可以忽略
 */
function computeCSS(element) {
	// console.log(rules);
	// console.log('compute css for element ', element);
	// 从栈里取所有父元素, 复制整个数组, 再去操作
	let elements = stack.slice().reverse();
	if (!element.computedStyle) {
		element.computedStyle = {};
	}

	for (const rule of rules) {
		let selectorParts = rule.selectors[0].split(' ').reverse();

		if (!match(element, selectorParts[0])) {
			continue;
		}

		let matched = false;

		let j = 1;
		for (let i = 0; i < elements.length; i++) {
			const ele = elements[i];
			if (match(ele, selectorParts[j])) {
				j++;
			}
		}
		if (j >= selectorParts.length) {
			matched = true
		}

		if (matched) {
			// 如果匹配到
			// console.log('element', element, 'matched rule', rule)
			let sp = specificity(rule.selectors[0]);

			let computedStyle = element.computedStyle;
			for (const declaration of rule.declarations) {
				if (!computedStyle[declaration.property]) {
					computedStyle[declaration.property] = {};
				}
				// 属性不冲突, 规则没有存过, 把后进的规则赋值, specificity就要标到每个属性上
				if (!computedStyle[declaration.property].specificity) {
					computedStyle[declaration.property].value = declaration.value;
					computedStyle[declaration.property].specificity = sp;
				} 
				// 后进的computedStyle的权重大于之前的, 需要再次把后进的赋值
				else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
					computedStyle[declaration.property].value = declaration.value;
					computedStyle[declaration.property].specificity = sp;
				}
			}
			console.log(element.computedStyle);
		}
	} 
}

function specificity(selector) {
	// #id, .class, tagname
	let p = [0, 0, 0, 0];
	let selectorParts = selector.split(' ');
	for (const part of selectorParts) {
		if (part.charAt(0) === '#') p[1] += 1;
		else if (part.charAt(0) === '.') p[2] += 1;
		else p[3] += 1;
	}
	return p
}

function compare(sp1, sp2) {
	if (sp1[0] - sp2[0]) return sp1[0] - sp2[0]
	if (sp1[1] - sp2[1]) return sp1[1] - sp2[1]
	if (sp1[2] - sp2[2]) return sp1[2] - sp2[2]
	return sp1[3] - sp2[3]
}

// 把生成的token提交
function emit(token) {
  // 栈顶
  let top = stack[stack.length - 1];

  if (token.type == "startTag") {
    let element = {
      type: 'element',
      children: [],
      attributes: []
    }

    element.tagName = token.tagName;

    for (const p in token) {
      if (p != 'type' || p != 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
		}
		
		// 添加调用
		computeCSS(element)

    top.children.push(element);
    element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }

    currentTextNode = null;
  } else if (token.type == 'endTag') {
    if (top.tagName != token.tagName) {
      throw new Error('Tag start end do not match!');
    } else {
			// 遇到style标签时, 执行添加CSS规则的操作
			if(top.tagName === 'style') {
				addCSSRules(top.children[0].content)
			}
      stack.pop()
    }
    currentTextNode = null;
  } else if (token.type === 'text') {
    if (currentTextNode == null) {
      currentTextNode = {
        type: 'text',
        content: ''
      }
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content
  }
}

// 文本可能是文件结束时候自然结束, 创建一个常量, 赋值为symbol, 当做一个特殊字符
const EOF = Symbol('EOF'); // end of file

function data(c) {
	if (c == "<") {
		return tagOpen;
	} else if (c == EOF) {
		emit({
			type: 'EOF',
		});
		return;
	} else {
		emit({
			type: 'text',
			content: c,
		});
		return data;
	}
}

function tagOpen(c) {
	// 结束标签
	if (c == '/') {
		return endTagOpen;
	}
	// 字母
	else if (c.match(/^[a-zA-Z]$/)) {
		currentToken = {
			type: 'startTag',
			tagName: '',
		};
		return tagName(c);
	} else {
    emit({
      type: 'text',
      content: c
    })
		return;
	}
}

function endTagOpen(c) {
	if (c.match(/^[a-zA-Z]$/)) {
		currentToken = {
			type: 'endTag',
			tagName: '',
		};
		return tagName(c);
	} else if (c == '>') {
	} else if (c == EOF) {
	}
}

function tagName(c) {
	// 空格
	if (c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName;
	} else if (c == '/') {
		// 自封闭标签
		return selfClosingStartTag;
	} else if (c.match(/^[A-Z]$/)) {
		currentToken.tagName += c //.toLowerCase(); // 可以转成小写
		return tagName;
	} else if (c == '>') {
		emit(currentToken);
		return data;
	} else {
    currentToken.tagName += c;
		return tagName;
	}
}

// 处理属性
function beforeAttributeName(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		// 先返回自身, 不做处理
		return beforeAttributeName;
	} else if (c == '/' || c == '>' || c == EOF) {
    return afterAttributeName(c);

	} else if (c == '=') {
	} else {
		currentAttribute = {
			name: '',
			value: '',
		};
		return attributeName(c);
	}
}

function attributeName(c) {
	if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
    return afterAttributeName(c);
	} else if (c == '=') {
		return beforeAttributeValue;
	} else if (c == '\u0000') {
	
	} else if (c == "\"" || c == "'" || c == '<') {
	} else {
		currentAttribute.name += c;
		return attributeName;
	}
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == '=') {
    return beforeAttributeValue
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == EOF) {

  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function beforeAttributeValue(c) {
	if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
		return beforeAttributeValue;
	} else if (c == "\"") {
    return doubleQuotedAttributeValue;
	} else if (c == "\'") {
		return singleQuotedAttributeValue;
	} else if (c == '>') {
	} else {
		return UnquotedAttributeValue(c);
	}
}

// 双引号开头属性值
function doubleQuotedAttributeValue(c) {
	if (c == "\"") { 
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
	} else if (c == "\u0000") {

  } else if (c == EOF) {

  } else {
    currentAttribute.value += c 
    return doubleQuotedAttributeValue
  }
}

// 单引号开头属性值
function singleQuotedAttributeValue(c) {
  if (c == "\'") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c == "\u0000") {

  } else if (c == EOF) {

  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == EOF) {

  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue
  }
}

// 无引号属性值
function UnquotedAttributeValue(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		currentToken[currentAttribute.name] = currentAttribute.value;
		return beforeAttributeName;
	} else if (c == '/') {
		currentToken[currentAttribute.name] = currentAttribute.value;
		return selfClosingStartTag;
	} else if (c == '>') {
		currentToken[currentAttribute.name] = currentAttribute.value;
		emit(currentToken);
		return data;
	} else if (c == '\u0000') {
	} else if (c == "\"" || c == "'" || c == '<' || c == '=' || c == '`') {
	} else if (c == EOF) {
	} else {
		currentAttribute.value += c;
		return UnquotedAttributeValue;
	}
}

function selfClosingStartTag(c) {
	if (c == '>') {
    currentToken.isSelfClosing = true;
    emit(currentToken)
		return data;
	} else if (c == 'EOF') {
	} else {
	}
}

// 先写接口,方便调试
module.exports.parseHTML = function parseHTML(html) {
  let state = data;
  // console.log('html: ', html);
	for (let c of html) {
    state = state(c);
    // console.log(c);
  }
  state = state(EOF);
  
  return stack[0]
};
