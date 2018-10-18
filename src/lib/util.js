export const append = (element,　string) => {
  const div = document.createElement('div');
  div.innerHTML = string;
  while (div.children.length > 0) {
    element.appendChild(div.children[0]);
  }
}

export const getUniqId = () => {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}

export const remove = (element) => {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

export const addClass = (element, className) => {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += ` ${className}`;
  }
}

export const triggerEvent = (el, eventName, options) => {
  let event;
  if (window.CustomEvent) {
    event = new CustomEvent(eventName, { cancelable: true });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, false, false, options);
  }
  el.dispatchEvent(event);
}

export const loadScript = (source, beforeEl, async = true, defer = true) => {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    const prior = beforeEl || document.getElementsByTagName('script')[0];

    script.async = async;
    script.defer = defer;

    function onloadHander(_, isAbort) {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = null;
        script.onreadystatechange = null;
        script = undefined;

        if (isAbort) { reject(); } else { resolve(); }
      }
    }

    script.onload = onloadHander;
    script.onreadystatechange = onloadHander;

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
  });
}