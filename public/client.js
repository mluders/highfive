const socket = io();
let startEmitting = false;
let localGameState = {};
let lastPosition = { x: 0, y: 0 };

const handleMouseMove = (event) => {
  let eventDoc, doc, body;

  event = event || window.event; // IE-ism

  if (event.pageX == null && event.clientX != null) {
    eventDoc = (event.target && event.target.ownerDocument) || document;
    doc = eventDoc.documentElement;
    body = eventDoc.body;

    event.pageX = event.clientX +
    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
    (doc && doc.clientLeft || body && body.clientLeft || 0);
    event.pageY = event.clientY +
    (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
    (doc && doc.clientTop  || body && body.clientTop  || 0 );
  }

  lastPosition = { x: event.pageX, y: event.pageY };
}

document.onmousemove = handleMouseMove;

setInterval(() => {
  if (!startEmitting) return;

  socket.emit('playerMovement', lastPosition);
}, 1000 / 20);

setTimeout(() => startEmitting = true, 2000);

socket.on('state', (gameState) => {
  localGameState = gameState;
});