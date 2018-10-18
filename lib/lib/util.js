'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var append = exports.append = function append(element, string) {
  var div = document.createElement('div');
  div.innerHTML = string;
  while (div.children.length > 0) {
    element.appendChild(div.children[0]);
  }
};

var getUniqId = exports.getUniqId = function getUniqId() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
};

var remove = exports.remove = function remove(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
};

var addClass = exports.addClass = function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += ' ' + className;
  }
};

var triggerEvent = exports.triggerEvent = function triggerEvent(el, eventName, options) {
  var event = void 0;
  if (window.CustomEvent) {
    event = new CustomEvent(eventName, { cancelable: true });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, false, false, options);
  }
  el.dispatchEvent(event);
};

var loadScript = exports.loadScript = function loadScript(source, beforeEl) {
  var async = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var defer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    var prior = beforeEl || document.getElementsByTagName('script')[0];

    script.async = async;
    script.defer = defer;

    function onloadHander(_, isAbort) {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = null;
        script.onreadystatechange = null;
        script = undefined;

        if (isAbort) {
          reject();
        } else {
          resolve();
        }
      }
    }

    script.onload = onloadHander;
    script.onreadystatechange = onloadHander;

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
  });
};