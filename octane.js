(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.octane = factory();
  }
})(typeof window !== 'undefined' ? window : this, function() {
  const [state, watchers, eventHandlers, components] = [new Map(), new Map(), new Map(), new Map()];
  const HFE = ['scroll', 'resize', 'mousemove', 'touchmove', 'pointermove', 'mouseover', 'mouseout', 'touchstart', 'touchend', 'wheel', 'input', 'dragover', 'animationframe'];
  const D3 = 5;
  
  const debounce = (fn, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const eventUtils = {
    generateHandlerId: () => Math.random().toString(36).substr(2, 9),
    storeHandler: (el, eventName, handler, options) => {
      const id = eventUtils.generateHandlerId();
      eventHandlers.set(id, { el, eventName, handler, options });
      return id;
    },
    removeHandler: id => {
      const data = eventHandlers.get(id);
      if (data) {
        data.el.removeEventListener(data.eventName, data.handler, data.options);
        eventHandlers.delete(id);
      }
    },
    delegate: (el, selector, eventName, handler) => x => {
      const target = x.target.closest(selector);
      if (target && el.contains(target)) handler.call(target, x);
    },
    wrapEventHandler: (handler, eventName, options) => {
      if (HFE.includes(eventName) && options.debounce !== false) {
        const delay = typeof options.debounce === 'number' ? options.debounce : D3;
        return debounce(handler, delay);
      }
      return handler;
    }
  };

  const query = (selector, context = document, options = {}) => {
    let elements;
    if (Array.isArray(selector)) {
      elements = selector;
    } else if (typeof selector === 'string') {
      if (context && typeof context.querySelector === 'function') {
        elements = Array.from(context.querySelectorAll(selector));
      } else {
        elements = Array.from(document.querySelectorAll(selector));
      }
    } else if (selector && typeof selector.nodeType === 'number') {
      elements = [selector];
    } else {
      throw new Error(`Invalid selector: ${selector}`);
    }
    if (options.array) {
      return elements;
    }
    return elements.length === 1 ? elements[0] : elements;
  };

  const octane = function(selector, context, options) {
    return query(selector, context, options);
  };

  const dom = {
    create: tag => document.createElement(tag),
    add: (parent, child) => parent.appendChild(child),
    remove: el => el.remove(),
    attr: (el, name, value) =>
      typeof name === 'object'
        ? (Object.entries(name).forEach(([k, v]) => el.setAttribute(k, v)), el)
        : value === undefined
        ? el.getAttribute(name)
        : el.setAttribute(name, value),
    css: (el, styles) => ((e, f) => Array.isArray(e) ? e.forEach(f) : f(e))(el, e => typeof styles === 'string' ? e.style.cssText = styles : Object.assign(e.style, styles)),
    html: (el, content) => content === undefined ? el.innerHTML : (el.innerHTML = content, el),
    text: (el, content) => content === undefined ? el.textContent : (el.textContent = content, el),
    classes: {
      add: (el, ...classes) => el.classList.add(...classes),
      remove: (el, ...classes) => el.classList.remove(...classes),
      toggle: (el, className) => el.classList.toggle(className),
      has: (el, className) => el.classList.contains(className)
    }
  };

  const events = {
    on: (el, eventName, handler, options = {}) => {
      const element = octane(el);
      if (!element) return null;
      if (options.delegate) {
        const delegatedHandler = eventUtils.delegate(element, options.delegate, eventName, handler);
        const wrappedHandler = eventUtils.wrapEventHandler(delegatedHandler, eventName, options);
        element.addEventListener(eventName, wrappedHandler, options);
        return eventUtils.storeHandler(element, eventName, wrappedHandler, options);
      }
      if (eventName.includes(' ')) {
        return eventName.split(' ').map(evt => events.on(element, evt, handler, options));
      }
      if (Array.isArray(element)) {
        return element.map(elem => events.on(elem, eventName, handler, options));
      }
      const wrappedHandler = eventUtils.wrapEventHandler(handler, eventName, options);
      element.addEventListener(eventName, wrappedHandler, options);
      return eventUtils.storeHandler(element, eventName, wrappedHandler, options);
    },
    off: (el, eventName, handler) => {
      const element = octane(el);
      if (!element) return null;
      if (!eventName || typeof eventName !== 'string') {
        console.error('Invalid eventName:', eventName);
        return null;
      }
      if (typeof handler === 'string') {
        eventUtils.removeHandler(handler);
      } else if (eventName.includes(' ')) {
        eventName.split(' ').forEach(evt => events.off(element, evt, handler));
      } else if (Array.isArray(element)) {
        element.forEach(elem => events.off(elem, eventName, handler));
      } else {
        element.removeEventListener(eventName, handler);
      }
    },
    trigger: (el, eventName, detail = null, options = {}) => {
      const element = octane(el);
      if (!element) return null;
      const event = detail !== null
        ? new CustomEvent(eventName, { bubbles: true, cancelable: true, ...options, detail })
        : new Event(eventName, { bubbles: true, cancelable: true, ...options });
      Array.isArray(element)
        ? element.forEach(elem => elem.dispatchEvent(event))
        : element.dispatchEvent(event);
    }
  };

  const storage = {
    local: (key, value) =>
      value === undefined
        ? localStorage.getItem(key)
        : value === null
        ? localStorage.removeItem(key)
        : (localStorage.setItem(key, JSON.stringify(value)), value),
    session: (key, value) =>
      value === undefined
        ? sessionStorage.getItem(key)
        : value === null
        ? sessionStorage.removeItem(key)
        : (sessionStorage.setItem(key, JSON.stringify(value)), value),
    cookie: (key, value, options = {}) => {
      if (value === undefined) {
        const cookieRow = document.cookie.split('; ').find(row => row.startsWith(`${key}=`));
        return cookieRow ? cookieRow.split('=')[1] : undefined;
      }
      const cookieString = `${key}=${value}` +
        `${options.expires ? `; expires=${new Date(options.expires).toUTCString()}` : ''}` +
        `${options.path ? `; path=${options.path}` : ''}` +
        `${options.domain ? `; domain=${options.domain}` : ''}` +
        `${options.secure ? '; secure' : ''}`;
      document.cookie = cookieString;
      return octane;
    }
  };

  const debug = {
    log: console.log.bind(console, '[Octane]'),
    error: console.error.bind(console, '[Octane]'),
    state: () => Object.fromEntries(state)
  };

  const network = {
    fetch: (url, options = {}) => fetch(url, options),
    worker: (scriptUrl, options = {}) => {
      const worker = new Worker(scriptUrl);
      worker.onmessage = options.onMessage && (e => options.onMessage(e.data));
      worker.onerror = options.onError;
      return {
        send: data => worker.postMessage(data),
        terminate: () => worker.terminate(),
        on: (event, handler) => worker.addEventListener(event, handler),
        off: (event, handler) => worker.removeEventListener(event, handler)
      };
    }
  };

  const utils = {
    delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
    template: (string, data) => string.replace(/\${(.*?)}/g, (_, key) => data[key.trim()] || ''),
    animate: (el, keyframes, options) => el.animate(keyframes, options),
    form: {
      serialize: form => Object.fromEntries(new FormData(form)),
      validate: (form, rules) => Object.entries(rules).reduce((errors, [field, validator]) => {
        const value = form[field];
        const error = validator(value);
        return error ? { ...errors, [field]: error } : errors;
      }, {})
    },
    url: {
      params: new URLSearchParams(window.location.search),
      get: key => utils.url.params.get(key),
      set: (key, value) => {
        utils.url.params.set(key, value);
        history.pushState({}, '', `${location.pathname}?${utils.url.params.toString()}`);
      },
      getAll: () => Object.fromEntries(utils.url.params.entries()),
      remove: key => {
        utils.url.params.delete(key);
        history.pushState({}, '', `${location.pathname}?${utils.url.params.toString()}`);
      },
      clear: () => {
        utils.url.params = new URLSearchParams();
        history.pushState({}, '', location.pathname);
      }
    },
    fn: func => {
      if (typeof func !== 'function') {
        throw new Error('Expected a function');
      }
      return function(...args) {
        return func.apply(this, args);
      };
    }
  };

  const stateManager = {
    set: (key, value) => {
      const currentValue = state.get(key);
      if (currentValue === value) return value;
      state.set(key, value);
      (watchers.get(key) || []).forEach(fn => fn(value));
      return value;
    },
    get: key => state.get(key),
    watch: (key, callback) => {
      watchers.set(key, [...(watchers.get(key) || []), callback]);
      return () => watchers.get(key).splice(watchers.get(key).indexOf(callback), 1);
    }
  };

  const OBSL = 20;
  const mutationObservers = [];
  function getObs() {
    for (let entry of mutationObservers) {
      if (entry.elements.size < OBSL) {
        return entry;
      }
    }
    const newEntry = {
      observer: null,
      elements: new Map()
    };
    newEntry.observer = new MutationObserver((mutations, obs) => {
      mutations.forEach(mutation => {
        const cb = newEntry.elements.get(mutation.target);
        if (cb && typeof cb === 'function') {
          cb(mutation, obs);
        }
      });
    });
    mutationObservers.push(newEntry);
    return newEntry;
  }
  function obs(target, callback, options) {
    if (!target) {
      throw new Error('No target provided for mutation observer');
    }
    const targets = Array.isArray(target) ? target : [target];
    targets.forEach(el => {
      const observerEntry = getObs();
      observerEntry.elements.set(el, callback);
      observerEntry.observer.observe(el, options || { attributes: true, childList: true, subtree: true });
    });
  }
  function unobs(target) {
    const targets = Array.isArray(target) ? target : [target];
    targets.forEach(el => {
      for (let entry of mutationObservers) {
        if (entry.elements.has(el)) {
          entry.elements.delete(el);
          entry.observer.disconnect();
          entry.elements.forEach((cb, observedEl) => {
            entry.observer.observe(observedEl, { attributes: true, childList: true, subtree: true });
          });
          break;
        }
      }
    });
  }

  const component = (name, template) => {
    components.set(name, template);
    return {
      render: (props = {}) => {
        const el = dom.create('div');
        el.innerHTML = typeof template === 'function' ? template(props) : template;
        return el.firstElementChild;
      }
    };
  };

  const ready = callback => document.readyState !== 'loading'
    ? callback()
    : document.addEventListener('DOMContentLoaded', callback);

  Object.assign(octane, {
    query,
    dom,
    events,
    storage,
    debug,
    network,
    utils,
    state: stateManager,
    component,
    ready,
    mutation: {
      observe: obs,
      disconnect: unobs
    }
  });

  return octane;
});