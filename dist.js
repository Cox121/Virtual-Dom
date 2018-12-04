"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var NODE_PATCH_TYPES = {
  CREATE: 'create node',
  REMOVE: 'remove node',
  REPLACE: 'replace node',
  UPDATE: 'update node'
};
var PROP_PATCH_TYPES = {
  REMOVE: 'remove prop',
  UPDATE: 'update prop'
};

function flatten(arr) {
  return [].concat.apply([], arr);
} //vDom 生成函数， 名称在.babelrc中配置


function h(tag) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    tag: tag,
    props: props,
    children: flatten(children) || []
  };
} //vDom 生成 真实dom


function createElement(vDom) {
  if (typeof vDom === 'string' || typeof vDom === 'number') {
    return document.createTextNode(vDom);
  }

  var tag = vDom.tag,
      props = vDom.props,
      children = vDom.children;
  var element = document.createElement(tag);
  setProps(element, props);
  children.map(createElement).forEach(element.appendChild.bind(element));
  return element;
}

function setProps(element, props) {
  for (var key in props) {
    element.setAttribute(key, props[key]);
  }
} //对比函数


function diff(oldVdom, newVdom) {
  if (oldVdom == undefined) {
    return {
      type: NODE_PATCH_TYPES.CREATE,
      vdom: newVdom
    };
  }

  if (newVdom == undefined) {
    return {
      type: NODE_PATCH_TYPES.REMOVE
    };
  }

  if (_typeof(oldVdom) !== _typeof(newVdom) || (typeof oldVdom === 'String' || typeof oldVdom === 'Number') && oldVdom !== newVdom || oldVdom.tag !== newVdom.tag) {
    return {
      type: NODE_PATCH_TYPES.REPLACE,
      vdom: newVdom
    };
  }

  if (oldVdom.tag) {
    var propsDiff = diffProps(oldVdom.props, newVdom.props);
    var childrenDiff = diffChildren(oldVdom.children, newVdom.children);
    return {
      type: NODE_PATCH_TYPES.UPDATE,
      vdom: {
        tag: newVdom.tag,
        props: propsDiff,
        children: childrenDiff
      }
    };
  }
} //属性对比函数


function diffProps(oldProps, newProps) {
  var diff = [];
  var allProps = Object.keys(_objectSpread({}, oldProps, newProps));
  allProps.forEach(function (prop) {
    var oldValue = oldProps[prop];
    var newValue = newProps[prop];

    if (newValue == undefined) {
      diff.push({
        type: PROP_PATCH_TYPES.REMOVE
      });
    }

    if (oldValue !== newValue) {
      diff.push({
        type: PROP_PATCH_TYPES.UPDATE,
        prop: prop,
        value: newValue
      });
    }
  });
  return diff;
} //子节点对比函数


function diffChildren(oldChildren, newChildren) {
  var diffa = [];
  var maxLength = Math.max(oldChildren.length, newChildren.length);

  for (var i = 0; i < maxLength; i++) {
    diffa.push(diff(oldChildren[i], newChildren[i]));
  }

  return diffa;
} //补丁函数


function patch(element, patchObj) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var currDom = element.childNodes[index];

  if (!patchObj) {
    return;
  }

  if (patchObj.type === NODE_PATCH_TYPES.CREATE) {
    return element.appendChild(createElement(patchObj.vdom));
  }

  if (patchObj.type === NODE_PATCH_TYPES.REMOVE) {
    return element.removeChild(currDom);
  }

  if (patchObj.type === NODE_PATCH_TYPES.REPLACE) {
    return element.replaceChild(createElement(patchObj.vDom), currDom);
  }

  if (patchObj.type === NODE_PATCH_TYPES.UPDATE) {
    var _patchObj$vdom = patchObj.vdom,
        props = _patchObj$vdom.props,
        children = _patchObj$vdom.children;
    patchProps(currDom, props);
    children.forEach(function (child, index) {
      patch(currDom, child, index);
    });
  }
}

function patchProps(currDom, props) {
  if (!props) {
    return;
  }

  props.forEach(function (prop) {
    if (prop.type === PROP_PATCH_TYPES.REMOVE) {
      element.removeAttribute(prop.key);
    } else if (prop.type === PROP_PATCH_TYPES.UPDATE) {
      element.setAttribute(prop.key, prop.value);
    }
  });
}

var state = {
  numList: [1, 2, 3]
};
var timer = null;
var preVDom;
var vDom = render();
preVDom = vDom;
var dom = createElement(vDom);
document.getElementById('app').appendChild(dom); //定时刷新dom

timer = setInterval(function () {
  if (state.numList.length > 20) {
    clearInterval(timer);
  }

  state.numList.push(state.numList.length + 1); // const newVDom = createElement(render())
  // document.getElementById('app').replaceChild(newVDom, dom)
  // dom = newVDom

  var newVDom = render();
  var patchObj = diff(preVDom, newVDom);
  preVDom = newVDom;
  patch(document.getElementById('app'), patchObj);
}, 500); //自定义的render

function render() {
  return h("div", null, "ddd", h("ul", null, state.numList.map(function (i) {
    return h("li", {
      id: i
    }, i);
  })));
}
