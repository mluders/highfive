const playerBodies = {};

const Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Constraint = Matter.Constraint,
      Engine = Matter.Engine,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Render = Matter.Render,
      Runner = Matter.Runner,
      World = Matter.World;

MouseConstraint.update = function(mouseConstraint, bodies) {
  const { constraint, mouse } = mouseConstraint;
  const body = playerBodies[mouseConstraint.socketID];

  if (mouseConstraint.isRemote) {
    try {
      const { x = 0, y = 0} = localGameState.players[mouseConstraint.socketID];
      constraint.pointA = { x, y };
      constraint.bodyB = mouseConstraint.body = body;
      constraint.angleB = body.angle;
    } catch (err) {
      console.log('oh no')
    }

  } else {
    constraint.pointA = mouse.position;
    constraint.bodyB = mouseConstraint.body = body;
    constraint.angleB = body.angle;
  }
}

// Create engine
var engine = Engine.create(),
world = engine.world;

// Create renderer
var render = Render.create({
  canvas: document.getElementById('world'),
  engine: engine,
  options: {
    width: 800,
    height: 600,
    showAngleIndicator: false
  }
});

function newPlayer(socketID) {
  const playerBody = Bodies.rectangle(600, 460, 80, 80);
  const mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.9,
      render: {
        visible: false
      }
    }
  });

  mouseConstraint.socketID = socketID;
  mouseConstraint.isRemote = (socket.id !== socketID);
  if (!mouseConstraint.isRemote) render.mouse = mouse;

  World.add(world, [
    playerBody
  ]);

  World.add(world, mouseConstraint);

  return playerBody;
}

Render.run(render);

Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 }
});

const runner = Runner.create();
Runner.run(runner, engine);

// const hand = Bodies.rectangle(600, 460, 80, 80);
// const finger = Bodies.rectangle(600, 400, 50, 25);

// const fingerToHand = Constraint.create({
//   bodyA: hand,
//   pointA: {
//     x: 0,
//     y: 0
//   },
//   pointB: {
//     x: 0,
//     y: 0
//   },
//   bodyB: finger,
//   stiffness: 1,
//   render: {
//     visible: false
//   }
// });

// const player = Composite.create({
//   bodies: [
//     hand,
//     finger,
//   ],
//   constraints: [
//     fingerToHand
//   ]
// });

// add mouse control

// fit the render viewport to the scene

// MouseConstraint.update = function(mouseConstraint, bodies) {
//   var mouse = mouseConstraint.mouse;
//   var constraint = mouseConstraint.constraint
//   var body = hand;

//   constraint.pointA =  mouse.position;
//   constraint.bodyB = mouseConstraint.body = body;
//   constraint.angleB = body.angle;
// }

// Handle connects and disconnects
setInterval(() => {
  for (const [key, value] of Object.entries(localGameState.players)) {
    if (!playerBodies[key]) {
      playerBodies[key] = newPlayer(key);
    }
  }
  
  for (const [key, value] of Object.entries(playerBodies)) {
    if (!localGameState.players[key]) {
      console.log('deleting player');
      Matter.Composite.remove(world, playerBodies[key])
      delete playerBodies[key];
    }
  }

}, 500);
