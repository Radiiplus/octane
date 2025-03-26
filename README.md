# Octane Library Documentation

Octane is a lightweight, modular JavaScript utility library designed to simplify common tasks in web development. It provides tools for DOM manipulation, event handling, state management, storage, animations, mutation observation, and more.

## Table of Contents

- [Installation](#installation)
- [Core Features](#core-features)
- [DOM Manipulation](#dom-manipulation)
- [Event Handling](#event-handling)
- [State Management](#state-management)
- [Storage Utilities](#storage-utilities)
- [Networking and Workers](#networking-and-workers)
- [Utilities](#utilities)
- [Components](#components)
- [Form Handling](#form-handling)
- [URL and History](#url-and-history)
- [Debugging Tools](#debugging-tools)
- [Mutation Observer](#mutation-observer)
- [Advanced Usage](#advanced-usage)

## Installation

Octane supports multiple module formats: CommonJS, AMD, and global variable.

```javascript
// ESM (ECMAScript Modules)
import octane from 'octane';
// or specific modules
import { dom, events } from 'octane';

// CommonJS (Node.js)
const octane = require('octane');

// AMD (RequireJS)
define(['octane'], function(octane) {
  // Your code here
});

// IIFE via Script Tag (Browser)
// Option 1: Local file
<script src="path/to/octane.iife.js"></script>
// Option 2: Using CDN (jsDelivr, minified)
<script src="https://cdn.jsdelivr.net/gh/Radiiplus/octane@main/octane.min.js"></script>
// Then use it as:
octane.ready(() => {
  console.log('Ready!');
});

// Global variable (Browser)
// Option 1: Local file
<script src="path/to/octane.js"></script>
// Option 2: Using CDN (jsDelivr, minified)
<script src="https://cdn.jsdelivr.net/gh/Radiiplus/octane@main/octane.min.js"></script>
// Just include the script and use window.octane
```

## Core Features

Octane provides a unified API for common JavaScript operations.

- **Element Selection:**  
  The main function `octane()` acts as an element selector. It now supports special inputs for `document` and `window`:
  - Passing `"document"` or the document object will return the document.
  - Passing `"window"` or the window object will return the window.
  
  This makes it easy to attach events or manipulate these global objects. For example:
  
  ```javascript
  // Attach an event to the window
  octane.events.on(window, 'resize', () => {
    console.log('Window resized!');
  });
  
  // Query the document directly
  const doc = octane('document');
  console.log(doc.title);
  ```

- **DOM Manipulation and More:**  
  Octane streamlines tasks such as DOM creation, event binding, state management, and advanced storage.

## DOM Manipulation

Octane simplifies DOM manipulation with a clean and consistent API.

```javascript
// Create a new element
const div = octane.dom.create('div');

// Add element to the DOM
octane.dom.add(document.body, div);

// Set multiple attributes
octane.dom.attr(div, {
  id: 'container',
  'data-value': '42',
  tabindex: '0'
});

// Add classes
octane.dom.classes.add(div, 'panel', 'active');

// Apply styles
octane.dom.css(div, {
  backgroundColor: '#f5f5f5',
  padding: '15px',
  borderRadius: '4px'
});

// Set HTML content
octane.dom.html(div, '<p>Hello World</p>');

// Check if element has a class
if (octane.dom.classes.has(div, 'active')) {
  console.log('Element is active');
}
```

Available methods:
- `octane.dom.create(tag)`
- `octane.dom.add(parent, child)`
- `octane.dom.remove(el)`
- `octane.dom.attr(el, name, value)`
- `octane.dom.css(el, styles)`
- `octane.dom.html(el, content)`
- `octane.dom.text(el, content)`
- `octane.dom.classes.add(el, ...classes)`
- `octane.dom.classes.remove(el, ...classes)`
- `octane.dom.classes.toggle(el, className)`
- `octane.dom.classes.has(el, className)`

## Event Handling

Octane provides a robust event handling system with automatic debouncing for high-frequency events.

```javascript
// Basic event handling
const clickHandler = octane.events.on('#submit', 'click', () => {
  console.log('Button clicked!');
});

// Event delegation
octane.events.on(document, 'click', () => {
  console.log('Item clicked');
}, { 
  delegate: '.item' 
});

// Multiple events
octane.events.on('#myElement', 'mouseenter mouseleave', () => {
  console.log('Mouse interaction');
});

// Removing event listeners
octane.events.off('#submit', 'click', clickHandler);

// Custom events
octane.events.trigger('#myElement', 'custom-event', { detail: { value: 42 } });
```

Available methods:
- `octane.events.on(el, eventName, handler, options)`
- `octane.events.off(el, eventName, handler)`
- `octane.events.trigger(el, eventName, detail, options)`

## State Management

Octane includes a simple state management system with reactive capabilities.

```javascript
// Set and get state values
octane.state.set('theme', 'dark');
const theme = octane.state.get('theme');

// Watch for state changes
const unsubscribe = octane.state.watch('theme', (newValue) => {
  console.log(`Theme changed to: ${newValue}`);
  document.body.className = newValue;
});

// Later, stop watching for changes
unsubscribe();
```

Available methods:
- `octane.state.set(key, value)`
- `octane.state.get(key)`
- `octane.state.watch(key, callback)`

## Storage Utilities

Octane simplifies working with storage mechanisms, now including support for IndexedDB and Cache Storage.

```javascript
// Local storage
octane.storage.local('user', { name: 'John', id: 123 });
const user = octane.storage.local('user');
octane.storage.local('user', null);

// Session storage
octane.storage.session('cart', [1, 2, 3]);
const cart = octane.storage.session('cart');

// Cookies
octane.storage.cookie('token', 'abc123', { 
  expires: new Date(Date.now() + 86400000),
  path: '/',
  secure: true
});

// IndexedDB
octane.storage.indexDB.open('myDatabase', 1, (db, e) => {
  // Upgrade logic here (create object stores, etc.)
}).then(db => {
  console.log('IndexedDB is open:', db);
}).catch(error => {
  console.error('IndexedDB error:', error);
});

// Cache Storage
(async () => {
  await octane.storage.cache.open('myCache');
  await octane.storage.cache.add('myCache', '/index.html');
  const response = await octane.storage.cache.get('myCache', '/index.html');
  console.log('Cached response:', response);
})();
```

Available methods:
- `octane.storage.local(key, value)`
- `octane.storage.session(key, value)`
- `octane.storage.cookie(key, value, options)`
- `octane.storage.indexDB.open(name, version, upgradeCallback)`
- `octane.storage.cache.open(cacheName)`
- `octane.storage.cache.add(cacheName, requestOrUrl)`
- `octane.storage.cache.get(cacheName, requestOrUrl)`
- `octane.storage.cache.delete(cacheName, requestOrUrl)`

## Networking and Workers

Octane provides utilities for networking and Web Workers.

```javascript
// Fetch API wrapper
octane.network.fetch('/api/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Web Worker management
const worker = octane.network.worker('worker.js', {
  onMessage: data => console.log('Worker sent:', data),
  onError: error => console.error('Worker error:', error)
});

// Send data to worker
worker.send({ task: 'process', data: [1, 2, 3] });
worker.on('messageerror', errorHandler);
worker.terminate();
```

Available methods:
- `octane.network.fetch(url, options)`
- `octane.network.worker(scriptUrl, options)`

## Utilities

Octane includes a variety of utility functions for common tasks.

```javascript
// Delay execution (Promise-based)
await octane.utils.delay(500);

// Template string interpolation
const greeting = octane.utils.template('Hello, ${name}!', { name: 'John' });

// Animation helper
octane.utils.animate(element, [
  { opacity: 0, transform: 'translateY(20px)' },
  { opacity: 1, transform: 'translateY(0)' }
], { duration: 300, easing: 'ease-out' });

// Function wrapper for consistent behavior
const greet = octane.utils.fn(function(name) {
  return `Hello, ${name}!`;
});
```

Available methods:
- `octane.utils.delay(ms)`
- `octane.utils.template(string, data)`
- `octane.utils.animate(el, keyframes, options)`
- `octane.utils.fn(func)`

## Components

Octane provides a simple component system for creating reusable UI elements.

```javascript
// Define a component
const button = octane.component('custom-button', (props) => `
  <button class="btn ${props.variant || 'default'}">
    ${props.label || 'Button'}
  </button>
`);

// Render component with props
const myButton = button.render({ variant: 'primary', label: 'Click Me' });
document.body.appendChild(myButton);
```

Available methods:
- `octane.component(name, template)`
- `component.render(props)`

## Form Handling

Octane simplifies form serialization and validation.

```javascript
// Serialize form to object
const form = octane.query('form');
const formData = octane.utils.form.serialize(form);

// Validate form data
const errors = octane.utils.form.validate(formData, {
  username: value => value.length < 3 ? 'Too short' : null,
  email: value => !value.includes('@') ? 'Invalid email' : null
});

if (Object.keys(errors).length === 0) {
  submitForm(formData);
} else {
  console.log(errors);
}
```

Available methods:
- `octane.utils.form.serialize(form)`
- `octane.utils.form.validate(data, rules)`

## URL and History

Octane provides utilities for managing query parameters and browser history.

```javascript
// Get a single parameter
const page = octane.utils.url.get('page');

// Set a parameter (updates URL)
octane.utils.url.set('filter', 'active');

// Get all parameters as an object
const allParams = octane.utils.url.getAll();

// Remove a parameter
octane.utils.url.remove('sort');

// Clear all parameters
octane.utils.url.clear();
```

Available methods:
- `octane.utils.url.get(key)`
- `octane.utils.url.set(key, value)`
- `octane.utils.url.getAll()`
- `octane.utils.url.remove(key)`
- `octane.utils.url.clear()`

## Debugging Tools

Octane includes debugging utilities for development.

```javascript
// Log messages with Octane prefix
octane.debug.log('Application initialized');

// Log errors with Octane prefix
octane.debug.error('Connection failed');

// Inspect current application state
console.table(octane.debug.state());
```

Available methods:
- `octane.debug.log(message)`
- `octane.debug.error(message)`
- `octane.debug.state()`

## Mutation Observer

Octane provides a mutation observer utility to efficiently monitor DOM changes.

```javascript
// Observe mutations on a target element or an array of targets
octane.mutation.observe(targetElement, (mutation, observer) => {
  console.log('Mutation detected:', mutation);
}, { attributes: true, childList: true, subtree: true });

// Disconnect mutation observation for a target element or an array of targets
octane.mutation.disconnect(targetElement);
```

Available methods:
- `octane.mutation.observe(target, callback, options)`
- `octane.mutation.disconnect(target)`

## Advanced Usage

### Event Debouncing

Octane automatically debounces high-frequency events, but you can customize this behavior:

```javascript
// Disable debouncing for a scroll event
octane.events.on(window, 'scroll', handleScroll, { debounce: false });

// Custom debounce delay (in milliseconds)
octane.events.on(window, 'resize', handleResize, { debounce: 100 });
```

### Dynamic Components

Create dynamic components with internal state:

```javascript
const counter = octane.component('counter', () => {
  let count = 0;
  const el = octane.dom.create('div');
  octane.dom.html(el, `
    <div class="counter">
      <span class="value">${count}</span>
      <button class="increment">+</button>
    </div>
  `);
  octane.events.on(octane.query('.increment', el), 'click', () => {
    count++;
    octane.query('.value', el).textContent = count;
  });
  return el;
});
const myCounter = counter.render();
document.body.appendChild(myCounter);
```
