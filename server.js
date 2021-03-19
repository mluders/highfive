var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

const gameState = {
  players: {}
}

app.get('/beer', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    delete gameState.players[socket.id]
  });

  socket.on('playerMovement', (playerMovement) => {
    const player = gameState.players[socket.id]
    player.x = playerMovement.x;
    player.y = playerMovement.y;
  });

  socket.on('openTap', () => {
    const player = gameState.players[socket.id];
    player.filling = true;
  });

  socket.on('closeTap', () => {
    const player = gameState.players[socket.id];
    player.filling = false;
  });

  gameState.players[socket.id] = { x: 200, y: 200, filling: false };
});

setInterval(() => {
  io.sockets.emit('state', gameState);
}, 1000 / 20);

server.listen(process.env.PORT || 8080, () => {
  console.log('listening on localhost:8080');
});
