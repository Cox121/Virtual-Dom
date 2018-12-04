const NODE_PATCH_TYPES = {
  CREATE: 'create node',
  REMOVE: 'remove node',
  REPLACE: 'replace node',
  UPDATE: 'update node'
}

const PROP_PATCH_TYPES = {
  REMOVE: 'remove prop',
  UPDATE: 'update prop'
}

function flatten(arr) {
  return [].concat.apply([], arr);
}

//vDom 生成函数， 名称在.babelrc中配置
function h(tag, props = {}, ...children){
  return {
    tag,
    props,
    children: flatten(children) || []
  }
}

//vDom 生成 真实dom
function createElement (vDom){
  if(typeof vDom === 'string' || typeof vDom === 'number'){
    return document.createTextNode(vDom)
  }

  const {tag, props, children} = vDom

  const element = document.createElement(tag)

  setProps(element, props)
  children.map(createElement)
          .forEach(element.appendChild.bind(element))

  return element
}

function setProps(element, props){
  for(let key in props){
    element.setAttribute(key, props[key])
  }
}

//对比函数
function diff(oldVdom, newVdom){
  if(oldVdom == undefined){
    return {
      type: NODE_PATCH_TYPES.CREATE,
      vdom: newVdom
    }
  }

  if(newVdom == undefined){
    return {
      type: NODE_PATCH_TYPES.REMOVE
    }
  }

  if(typeof oldVdom !== typeof newVdom ||
    ((typeof oldVdom === 'String' || typeof oldVdom === 'Number') && oldVdom !== newVdom) ||
    oldVdom.tag !== newVdom.tag
    ) {
      return {
        type: NODE_PATCH_TYPES.REPLACE,
        vdom: newVdom
      }
    }

  if(oldVdom.tag){
    const propsDiff = diffProps(oldVdom.props, newVdom.props)
    const childrenDiff = diffChildren(oldVdom.children, newVdom.children)

    return {
      type: NODE_PATCH_TYPES.UPDATE,
      vdom: {
        tag: newVdom.tag,
        props: propsDiff,
        children: childrenDiff
      }
    }
  }
}

//属性对比函数
function diffProps(oldProps, newProps){
  let diff = []

  const allProps =  Object.keys({...oldProps ,...newProps})

  allProps.forEach((prop) => {
    const oldValue = oldProps[prop]
    const newValue = newProps[prop]

    if(newValue == undefined){
      diff.push({
        type: PROP_PATCH_TYPES.REMOVE
      })
    }

    if(oldValue !== newValue){
      diff.push({
        type: PROP_PATCH_TYPES.UPDATE,
        prop,
        value: newValue
      })
    }
  })

  return diff
}

//子节点对比函数
function diffChildren(oldChildren, newChildren){
  let diffa = []

  const maxLength = Math.max(oldChildren.length, newChildren.length)

  for(let i = 0; i < maxLength; i++){
    diffa.push(diff(oldChildren[i], newChildren[i]))
  }

  return diffa
}

//补丁函数
function patch(element, patchObj, index = 0){
  const currDom = element.childNodes[index]

  if(!patchObj){
    return 
  }

  if(patchObj.type === NODE_PATCH_TYPES.CREATE){
    return element.appendChild(createElement(patchObj.vdom))
  }

  if(patchObj.type === NODE_PATCH_TYPES.REMOVE){
    return element.removeChild(currDom)
  }

  if(patchObj.type === NODE_PATCH_TYPES.REPLACE){
    return element.replaceChild(createElement(patchObj.vDom), currDom)
  }

  if(patchObj.type === NODE_PATCH_TYPES.UPDATE){
    const {props, children} = patchObj.vdom

    patchProps(currDom, props)

    children.forEach((child, index) => {
      patch(currDom, child, index)
    })
  }
}

function patchProps(currDom, props){
  if(!props){
    return 
  }

  props.forEach((prop) => {
    if(prop.type === PROP_PATCH_TYPES.REMOVE){
      element.removeAttribute(prop.key)
    }
    else if (prop.type === PROP_PATCH_TYPES.UPDATE){
      element.setAttribute(prop.key, prop.value);
    }
  })
}

let state = {
  numList: [1, 2, 3]
}

let timer = null

let preVDom

const vDom = render()
preVDom = vDom
let dom = createElement(vDom)
document.getElementById('app').appendChild(dom)

//定时刷新dom
timer = setInterval(() => {
  if(state.numList.length > 20){
    clearInterval(timer)
  }

  state.numList.push(state.numList.length + 1)
  
  // const newVDom = createElement(render())
  // document.getElementById('app').replaceChild(newVDom, dom)
  // dom = newVDom

  const newVDom = render()
  const patchObj = diff(preVDom, newVDom)
  preVDom = newVDom

  patch(document.getElementById('app'), patchObj)
  
}, 500)

//自定义的render
function render(){
  return (
    <div>
      ddd
      <ul>
      {
        state.numList.map( i => (
          <li id={i}>
           {i}
          </li>
        ))
      }
      </ul>
    </div>
  )
}