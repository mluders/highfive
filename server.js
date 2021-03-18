const FPS = 30;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const gameState = {
  players: {}
}

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    delete gameState.players[socket.id]
  });

  socket.on('playerMovement', (playerMovement) => {
    console.log(playerMovement);
    const player = gameState.players[socket.id]
    player.x = playerMovement.x;
    player.y = playerMovement.y;
  });

  gameState.players[socket.id] = { x: 0, y: 0 };
});

setInterval(() => {
  // io.sockets.emit('state', gameState);
  //console.log(gameState);
}, 1000 / FPS);

http.listen(8080, () => {
  console.log('listening on localhost:8080');
});
