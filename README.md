# Octane Library Documentation

Octane is a lightweight, modular JavaScript utility library designed to simplify common tasks in web development. It provides tools for DOM manipulation, event handling, state management, storage, animations, and more.

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
<script src="path/to/octane.iife.js"></script>
// Then use it as:
octane.ready(() => {
  console.log('Ready!');
});

// Global variable (Browser)
// Just include the script and use window.octane
<script src="path/to/octane.js"></script>
```

## Core Features

Octane provides a unified API for common JavaScript operations.

```javascript
// Select elements from the DOM
const button = octane('#submit'); // Selects #submit
const buttons = octane('.btn'); // Selects all .btn elements

// Execute code when DOM is fully loaded
octane.ready(() => {
  console.log('DOM is fully loaded and ready');
});

// Scoped query with octane.query
const container = octane('#container');
const buttons = octane.query('.btn', container); // Scoped query within #container
buttons.forEach(button => {
  octane.events.on(button, 'click', () => {
    console.log('Button clicked');
  });
});
```

The main function `octane()` is an element selector that supports both single and multiple element selection:
- When selecting multiple elements, it returns an array
- When selecting a single element, it returns just that element

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
- `octane.dom.create(tag)`: Creates a new DOM element
- `octane.dom.add(parent, child)`: Appends a child element to a parent
- `octane.dom.remove(el)`: Removes an element from the DOM
- `octane.dom.attr(el, name, value)`: Gets or sets attributes (supports object notation)
- `octane.dom.css(el, styles)`: Applies CSS styles to an element
- `octane.dom.html(el, content)`: Gets or sets the inner HTML of an element
- `octane.dom.text(el, content)`: Gets or sets the text content of an element
- `octane.dom.classes.add(el, ...classes)`: Adds classes to an element
- `octane.dom.classes.remove(el, ...classes)`: Removes classes from an element
- `octane.dom.classes.toggle(el, className)`: Toggles a class on an element
- `octane.dom.classes.has(el, className)`: Checks if an element has a specific class

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
octane.events.trigger('#myElement', 'custom-event', { 
  detail: { value: 42 } 
});
```

Octane automatically handles debouncing for high-frequency events like:
- scroll, resize, mousemove, touchmove
- pointermove, mouseover, mouseout
- touchstart, touchend, wheel
- input, dragover, animationframe

Available methods:
- `octane.events.on(el, eventName, handler, options)`: Attaches an event listener
- `octane.events.off(el, eventName, handler)`: Removes an event listener
- `octane.events.trigger(el, eventName, detail, options)`: Triggers a custom event

Event options:
- `delegate`: CSS selector for event delegation
- `debounce`: Set to false to disable automatic debouncing, or provide a custom delay in milliseconds

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
- `octane.state.set(key, value)`: Sets a state value and triggers watchers
- `octane.state.get(key)`: Retrieves a state value
- `octane.state.watch(key, callback)`: Watches for changes to a state value (returns unsubscribe function)

## Storage Utilities

Octane simplifies working with local storage, session storage, and cookies with automatic JSON serialization.

```javascript
// Local storage
octane.storage.local('user', { name: 'John', id: 123 });  // Store object (JSON serialized)
const user = octane.storage.local('user');                // Retrieve
octane.storage.local('user', null);                       // Remove

// Session storage
octane.storage.session('cart', [1, 2, 3]);  // Store array
const cart = octane.storage.session('cart'); // Retrieve

// Cookies
octane.storage.cookie('token', 'abc123', { 
  expires: new Date(Date.now() + 86400000),  // 1 day
  path: '/',
  secure: true
});
```

Available methods:
- `octane.storage.local(key, value)`: Manages localStorage with JSON serialization
- `octane.storage.session(key, value)`: Manages sessionStorage with JSON serialization
- `octane.storage.cookie(key, value, options)`: Manages cookies with additional options

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

// Add custom event listeners
worker.on('messageerror', handleError);

// Terminate worker when done
worker.terminate();
```

Available methods:
- `octane.network.fetch(url, options)`: Wrapper around the Fetch API
- `octane.network.worker(scriptUrl, options)`: Creates and manages Web Workers

## Utilities

Octane includes a variety of utility functions for common tasks.

```javascript
// Delay execution (Promise-based)
await octane.utils.delay(500);  // Wait for 500ms

// Template string interpolation
const greeting = octane.utils.template('Hello, ${name}!', { name: 'John' });

// Animation helper
octane.utils.animate(element, [
  { opacity: 0, transform: 'translateY(20px)' },
  { opacity: 1, transform: 'translateY(0)' }
], {
  duration: 300,
  easing: 'ease-out'
});

// Function wrapper for consistent behavior
const greet = octane.utils.fn(function(name) {
  return `Hello, ${name}!`;
});
```

Available methods:
- `octane.utils.delay(ms)`: Returns a promise that resolves after a delay
- `octane.utils.template(string, data)`: Interpolates template strings with data
- `octane.utils.animate(el, keyframes, options)`: Wrapper for the Web Animations API
- `octane.utils.fn(func)`: Abstracts both arrow and traditional functions

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
const myButton = button.render({
  variant: 'primary',
  label: 'Click Me'
});

// Add to DOM
document.body.appendChild(myButton);
```

Available methods:
- `octane.component(name, template)`: Creates a reusable component
- `component.render(props)`: Renders a component with the given props

## Form Handling

Octane simplifies form serialization and validation.

```javascript
// Serialize form to object
const form = octane.query('form'); // Use octane.query
const formData = octane.utils.form.serialize(form);

// Validate form data
const errors = octane.utils.form.validate(formData, {
  username: value => value.length < 3 ? 'Too short' : null,
  email: value => !value.includes('@') ? 'Invalid email' : null
});

if (Object.keys(errors).length === 0) {
  // Form is valid
  submitForm(formData);
} else {
  // Display errors
  console.log(errors);
}
```

Available methods:
- `octane.utils.form.serialize(form)`: Converts form data into an object
- `octane.utils.form.validate(data, rules)`: Validates data based on provided rules

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
- `octane.utils.url.get(key)`: Gets a query parameter
- `octane.utils.url.set(key, value)`: Sets a query parameter and updates URL
- `octane.utils.url.getAll()`: Gets all query parameters as an object
- `octane.utils.url.remove(key)`: Removes a query parameter
- `octane.utils.url.clear()`: Removes all query parameters

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
- `octane.debug.log(message)`: Logs messages with '[Octane]' prefix
- `octane.debug.error(message)`: Logs errors with '[Octane]' prefix
- `octane.debug.state()`: Returns the current state as an object for inspection

## Advanced Usage

### Event Debouncing

Octane automatically debounces high-frequency events, but you can customize this behavior:

```javascript
// Disable debouncing for a scroll event
octane.events.on(window, 'scroll', handleScroll, { debounce: false });

// Custom debounce delay (in milliseconds)
octane.events.on(window, 'resize', handleResize, { debounce: 100 });
```

### Chaining DOM Operations

Many Octane DOM methods return the element, allowing for method chaining:

```javascript
const div = octane.dom.create('div');
octane.dom.attr(div, 'id', 'container')
  .dom.classes.add(div, 'panel')
  .dom.html(div, '<p>Content</p>')
  .dom.add(document.body, div);
```

### Dynamic Components

Create dynamic components with state:

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
  
  // Use octane.query for scoped queries
  octane.events.on(octane.query('.increment', el), 'click', () => {
    count++;
    octane.query('.value', el).textContent = count;
  });
  
  return el;
});

// Render and use the component
const myCounter = counter.render();
document.body.appendChild(myCounter);
```