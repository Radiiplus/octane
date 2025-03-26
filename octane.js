(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = factory();
  else if (typeof define === 'function' && define.amd) define(factory);
  else global.octane = factory();
})(typeof window !== 'undefined' ? window : this, () => {
  const [state, watchers, eventHandlers, components] = [new Map(), new Map(), new Map(), new Map()],
    HFE = ['scroll','resize','mousemove','touchmove','pointermove','mouseover','mouseout','touchstart','touchend','wheel','input','dragover','animationframe'],
    D3 = 5,
    debounce = (fn, delay) => { let t; return (...args) => { clearTimeout(t), t = setTimeout(() => fn.apply(this, args), delay) } },
    eventUtils = {
      generateHandlerId: () => Math.random().toString(36).substr(2, 9),
      storeHandler: (el, eventName, handler, options) => { const id = eventUtils.generateHandlerId(); return eventHandlers.set(id, { el, eventName, handler, options }), id },
      removeHandler: id => { const data = eventHandlers.get(id); data && (data.el.removeEventListener(data.eventName, data.handler, data.options), eventHandlers.delete(id)) },
      delegate: (el, selector, eventName, handler) => x => { const target = x.target.closest(selector); target && el.contains(target) && handler.call(target, x) },
      wrapEventHandler: (handler, eventName, options) =>
        HFE.includes(eventName) && options.debounce !== false ? debounce(handler, typeof options.debounce === 'number' ? options.debounce : D3) : handler
    },
    query = (selector, context = document, options = {}) => {
      if (selector === 'window' || selector === window) return window;
      if (selector === 'document' || selector === document) return document;
      let elements;
      return Array.isArray(selector) ? elements = selector
        : typeof selector === 'string' ? elements = context && typeof context.querySelector === 'function'
          ? Array.from(context.querySelectorAll(selector)) : Array.from(document.querySelectorAll(selector))
        : selector && typeof selector.nodeType === 'number' ? elements = [selector]
        : (() => { throw new Error(`Invalid selector: ${selector}`) })(),
      options.array ? elements : elements.length === 1 ? elements[0] : elements;
    },
    octane = (selector, context, options) => query(selector, context, options),
    dom = {
      create: tag => document.createElement(tag),
      add: (parent, child) => parent.appendChild(child),
      remove: el => el.remove(),
      attr: (el, name, value) =>
        typeof name === 'object'
          ? (Object.entries(name).forEach(([k, v]) => el.setAttribute(k, v)), el)
          : value === undefined
            ? el.getAttribute(name)
            : (el.setAttribute(name, value), el),
      css: (el, styles) => (Array.isArray(el)
        ? el.forEach(e => typeof styles === 'string' ? e.style.cssText = styles : Object.assign(e.style, styles))
        : typeof styles === 'string' ? el.style.cssText = styles : Object.assign(el.style, styles), null),
      html: (el, content) => content === undefined ? el.innerHTML : (el.innerHTML = content, el),
      text: (el, content) => content === undefined ? el.textContent : (el.textContent = content, el),
      classes: {
        add: (el, ...classes) => el.classList.add(...classes),
        remove: (el, ...classes) => el.classList.remove(...classes),
        toggle: (el, className) => el.classList.toggle(className),
        has: (el, className) => el.classList.contains(className)
      }
    },
    events = {
      on: (el, eventName, handler, options = {}) => {
        let element = typeof el === 'string'
          ? query(el)
          : el;
        if (!element) return null;
        if (options.delegate) {
          const delegated = eventUtils.delegate(element, options.delegate, eventName, handler),
            wrapped = eventUtils.wrapEventHandler(delegated, eventName, options);
          return element.addEventListener(eventName, wrapped, options), eventUtils.storeHandler(element, eventName, wrapped, options);
        }
        if (eventName.includes(' ')) return eventName.split(' ').map(evt => events.on(element, evt, handler, options));
        if (Array.isArray(element)) return element.map(elem => events.on(elem, eventName, handler, options));
        const wrapped = eventUtils.wrapEventHandler(handler, eventName, options);
        return element.addEventListener(eventName, wrapped, options), eventUtils.storeHandler(element, eventName, wrapped, options);
      },
      off: (el, eventName, handler) => {
        const element = query(el);
        if (!element) return null;
        if (!eventName || typeof eventName !== 'string') return console.error('Invalid eventName:', eventName), null;
        return typeof handler === 'string'
          ? eventUtils.removeHandler(handler)
          : eventName.includes(' ')
            ? eventName.split(' ').forEach(evt => events.off(element, evt, handler))
            : Array.isArray(element)
              ? element.forEach(elem => events.off(elem, eventName, handler))
              : element.removeEventListener(eventName, handler);
      },
      trigger: (el, eventName, detail = null, options = {}) => {
        const element = query(el);
        if (!element) return null;
        const event = detail !== null
          ? new CustomEvent(eventName, Object.assign({ bubbles: true, cancelable: true, detail }, options))
          : new Event(eventName, Object.assign({ bubbles: true, cancelable: true }, options));
        return Array.isArray(element)
          ? element.forEach(elem => elem.dispatchEvent(event))
          : element.dispatchEvent(event);
      }
    },
    autoSerialize = value => typeof value === 'string'
      ? value.length && value[0] === '"' && value[value.length - 1] === '"' ? value : value
      : JSON.stringify(value),
    autoDeserialize = value => { try { return JSON.parse(value) } catch (e) { return value } },
    storage = {
      local: (key, value) => value === undefined
        ? localStorage.getItem(key) !== null ? autoDeserialize(localStorage.getItem(key)) : null
        : value === null ? (localStorage.removeItem(key), null)
          : (localStorage.setItem(key, autoSerialize(value)), value),
      session: (key, value) => value === undefined
        ? sessionStorage.getItem(key) !== null ? autoDeserialize(sessionStorage.getItem(key)) : null
        : value === null ? (sessionStorage.removeItem(key), null)
          : (sessionStorage.setItem(key, autoSerialize(value)), value),
      cookie: (key, value, options = {}) => value === undefined
        ? (document.cookie.split('; ').find(row => row.startsWith(`${key}=`))
          ? autoDeserialize(document.cookie.split('; ').find(row => row.startsWith(`${key}=`)).split('=')[1])
          : null)
        : value === null ? (document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`, null)
          : (document.cookie = `${key}=${autoSerialize(value)}${options.expires ? `; expires=${new Date(options.expires).toUTCString()}` : ''}${options.path ? `; path=${options.path}` : '; path=/'}${options.domain ? `; domain=${options.domain}` : ''}${options.secure ? '; secure' : ''}`, value),
      indexDB: {
        open: (name, version, upgradeCallback) =>
          new Promise((resolve, reject) => {
            const request = indexedDB.open(name, version);
            request.onupgradeneeded = e => upgradeCallback && upgradeCallback(e.target.result, e);
            request.onsuccess = e => resolve(e.target.result);
            request.onerror = e => reject(e.target.error);
          })
      },
      cache: {
        open: async cacheName => await caches.open(cacheName),
        add: async (cacheName, requestOrUrl) => { const cache = await caches.open(cacheName); await cache.add(requestOrUrl); return true },
        get: async (cacheName, requestOrUrl) => { const cache = await caches.open(cacheName); return await cache.match(requestOrUrl) },
        delete: async (cacheName, requestOrUrl) => { const cache = await caches.open(cacheName); return await cache.delete(requestOrUrl) }
      }
    },
    debug = {
      log: console.log.bind(console, '[Octane]'),
      error: console.error.bind(console, '[Octane]'),
      state: () => Object.fromEntries(state)
    },
    network = {
      fetch: (url, options = {}) => fetch(url, options),
      worker: (scriptUrl, options = {}) => {
        const worker = new Worker(scriptUrl);
        worker.onmessage = options.onMessage && (e => options.onMessage(e.data));
        worker.onerror = options.onError;
        return { send: data => worker.postMessage(data), terminate: () => worker.terminate(), on: (event, handler) => worker.addEventListener(event, handler), off: (event, handler) => worker.removeEventListener(event, handler) };
      }
    },
    utils = {
      delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
      template: (string, data) => string.replace(/\${(.*?)}/g, (_, key) => data[key.trim()] || ''),
      animate: (el, keyframes, options) => el.animate(keyframes, options),
      form: {
        serialize: form => Object.fromEntries(new FormData(form)),
        validate: (form, rules) => Object.entries(rules).reduce((errors, [field, validator]) => {
          const value = form[field], error = validator(value);
          return error ? { ...errors, [field]: error } : errors;
        }, {})
      },
      url: {
        params: new URLSearchParams(window.location.search),
        get: key => utils.url.params.get(key),
        set: (key, value) => { utils.url.params.set(key, value); history.pushState({}, '', `${location.pathname}?${utils.url.params.toString()}`) },
        getAll: () => Object.fromEntries(utils.url.params.entries()),
        remove: key => { utils.url.params.delete(key); history.pushState({}, '', `${location.pathname}?${utils.url.params.toString()}`) },
        clear: () => { utils.url.params = new URLSearchParams(); history.pushState({}, '', location.pathname) }
      },
      fn: func => {
        if (typeof func !== 'function') throw new Error('Expected a function');
        return (...args) => func.apply(this, args);
      }
    },
    stateManager = {
      set: (key, value) => {
        const currentValue = state.get(key);
        return currentValue === value ? value : (state.set(key, value), (watchers.get(key) || []).forEach(fn => fn(value)), value);
      },
      get: key => state.get(key),
      watch: (key, callback) => {
        watchers.set(key, [...(watchers.get(key) || []), callback]);
        return () => watchers.get(key).splice(watchers.get(key).indexOf(callback), 1);
      }
    },
    OBSL = 20,
    mutationObservers = [],
    getObs = () => {
      for (let entry of mutationObservers) if (entry.elements.size < OBSL) return entry;
      const newEntry = { observer: null, elements: new Map() };
      return newEntry.observer = new MutationObserver((mutations, obs) => mutations.forEach(mutation => {
        const cb = newEntry.elements.get(mutation.target);
        cb && typeof cb === 'function' && cb(mutation, obs);
      })), mutationObservers.push(newEntry), newEntry;
    },
    obs = (target, callback, options) => {
      if (!target) throw new Error('No target provided for mutation observer');
      (Array.isArray(target) ? target : [target]).forEach(el => {
        const observerEntry = getObs();
        observerEntry.elements.set(el, callback);
        observerEntry.observer.observe(el, options || { attributes: true, childList: true, subtree: true });
      });
    },
    unobs = target => (Array.isArray(target) ? target : [target]).forEach(el => {
      for (let entry of mutationObservers) {
        if (entry.elements.has(el)) {
          entry.elements.delete(el);
          entry.observer.disconnect();
          entry.elements.forEach((cb, observedEl) => entry.observer.observe(observedEl, { attributes: true, childList: true, subtree: true }));
          break;
        }
      }
    }),
    component = (name, template) => (components.set(name, template), {
      render: (props = {}) => { const el = dom.create('div'); return el.innerHTML = typeof template === 'function' ? template(props) : template, el.firstElementChild }
    }),
    ready = callback => document.readyState !== 'loading' ? callback() : document.addEventListener('DOMContentLoaded', callback);
  return Object.assign(octane, {
    query, dom, events, storage, debug, network, utils, state: stateManager, component, ready,
    mutation: { observe: obs, disconnect: unobs }
  }), octane;
});
