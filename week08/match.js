
// 类选择器, 例如能判断 .a 是否能选中 <div class='a b'></div>
function matchByClassSelector(selector, element) {
  return element.className.split(/\s+/g).includes(selector.replace('.', ''));
}

// 标签选择器, 判断是否能选中 <div></div>
function matchByTypeSelector(selector, element) {
  return element.tagName === selector.toUpperCase();
}

// ID选择器
function matchByIdSelector(selector, element) {
  return element.id === selector.replace('#', '');
}

// 属性值比较的函数
const attrValueCompareFoo = {
  '=': (attrValue, value) => attrValue === value,
  '~=': (attrValue, value) => attrValue.split(/\s+/g).includes(value),
  '|=': (attrValue, value) => attrValue === value || attrValue.startWith(`${value}-`),
  '^=': (attrValue, value) => attrValue.startWith(value),
  '$=': (attrValue, value) => attrValue.endWith(value),
  '*=': (attrValue, value) => attrValue.includes(value)
}

// 属性选择器
function matchByAttributeSelector(selector, element) {
  const match = /^\[\s*([\w-]+)\s*(?:([~|^$*]?=)\s*(\S+))?\s*\]$/.exec(selector);

  if (!match) return false;

  // 比较属性名
  const name = match[1];
  const attrValue = element.getAttribute(name);
  
  if (attrValue === null) return false;

  // 符号没有对比就没有属性值对比
  const comparator = match[2];

  if (!comparator) return true;

  // 比较属性值, 先去除value的引号
  const value = match[3].replace(/["']/g, '');
  return attrValueCompareFoo[comparator](attrValue, value);
}

// 判断一个元素是否和简单选择器3完全匹配
function matchBySimpleSelectorSequence(simpleSelectorSequence, element) {
  if (!simpleSelectorSequence || !element) return false;

  const simpleSelectors = simpleSelectorSequence.split(/(?<=[\w\]\)])(?=[#.:\[])/);

  return simpleSelectors.every(simpleSelector => matchBySimpleSelector(simpleSelector, element));
}

// 判断一个元素是否和简单选择器匹配
function matchBySimpleSelector(selector, element) {
  if (!selector || !element) return false;
  else if (selector.startWith('#')) {
    return matchByIdSelector(selector, element);
  }
  else if (selector.startWith('.')) {
    return matchByClassSelector(selector, element);
  }
  else if (selector.match(/^\[(.+?)\]$/)) {
    return matchByAttributeSelector(selector, element);
  } else if (selector.match(/^:not\((.*)\)$/)) {
    return !matchBySimpleSelector(element, RegExp.$1)
  }
  else return matchByTypeSelector(selector, element);
}

// 取得下一个转变匹配的元素
function getNextElementKey(combinator) {
  return {
    '>': 'parentElement',
    ' ': 'parentElement',
    '+': 'parentElementSibling',
    '~': 'parentElementSibling'
  }[combinator];
}

// 查找一个元素与选择器匹配的element
function findMatchedElement(selector, element) {
  if (!selector || !element) return null;

  const combinator = /[>+ ~]$/.test(selector) 
    ? selector[selector.length - 1] 
    : '';
  const getNextElementKey = getNextElementKey(combinator);

  if (/[>+]$/.test(selector)) {
    selector = selector.replace(/[>+]$/, '');
    element = element[nextElementKey];
    
    if (!matchBySimpleSelectorSequence(selector, element)) element = null;
  } else if (/[ ~]$/.test(selector)) {
    selector = selector.replace(/[ ~]$/, '');

    do {
      element = element[nextElementKey];
    } while (element && !matchBySimpleSelectorSequence(selector, element));
  }
  
  else if (!matchBySimpleSelectorSequence(selector, element)) element = null;
  return element || null;
}

// 判断一个元素和一个选择器是否匹配
function match(selector, element) {
  const selectors = rule.trim().replace(/(?<=[+>])\s+/g, '').replace(/\s+(?<=[+>])/g, '').split(/(?<=[+>])/g);

  while(element && selectorParts.length) {
    element = findMatchedElement(selectorParts.pop(), element);
  }
  return !!element;


}