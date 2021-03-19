# High Five

High Five is a multiplayer celebration simulator built with Socket.IO and Matter.js. Slap some skin or clink some beers, all without leaving your house.

```
npm install
npm start
```

# Hand mode ✋
![Demo](images/hand_mode.gif)

# Beer mode 🍺
Press spacebar to fill your cup.

![Demo](images/beer_mode.gif)

# Context
I built this in one day (for the annual AppFolio Hackathon). I wanted to learn more about the WebSocket protocol.

The physics simulations are built with [Matter.js](https://brm.io/matter-js/), and are local to each client. The only data that's sent between clients is their mouse positions.

