const FPS = 30;
const socket = io();
let startEmitting = false;
let lastMovement = [0, 0];

// setInterval(() => {
//   if (!startEmitting) return;
//   const [x, y] = lastMovement;
//   socket.emit('playerMovement', { x, y });
// }, 1000 / FPS);

setTimeout(() => startEmitting = true, 2000);

// const drawPlayer = (player) => {
//   ctx.beginPath();
//   ctx.rect(player.x, player.y);
//   ctx.fillStyle = '#0095DD';
//   ctx.fill();
//   ctx.closePath();
// };

// socket.on('state', (gameState) => {
//   for (let player in gameState.players) {
//     drawPlayer(player)
//   }
// });

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

  lastMovement = [event.pageX, event.pageY];
}

document.onmousemove = handleMouseMove;
