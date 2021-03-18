const INSPIRATIONAL_MESSAGES = [
  'Go Team!',
  'Wow',
  "You're amazing!",
  "Right on!",
  "Coolio",
  "Rockin'",
];

let currentlyInspiring = false;
let currentlyConfettiing = false;

const playerBodies = {};

const {
  Bodies,
  Body,
  Composite,
  Constraint,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  Query,
  World,
} = Matter;

// Create engine
var engine = Engine.create(),
world = engine.world;

MouseConstraint.update = function(mouseConstraint, bodies) {
  try {
    const { constraint, mouse } = mouseConstraint;
    const playerBody = playerBodies[mouseConstraint.socketID].bodies[0];

    if (mouseConstraint.isRemote) {
        const { x = 0, y = 0} = localGameState.players[mouseConstraint.socketID];
        constraint.pointA = { x, y };
        constraint.bodyB = mouseConstraint.body = playerBody;
        constraint.angleB = playerBody.angle;
    } else {
      if (mouse.position.x == 0 && mouse.position.y == 0) {
        constraint.pointA = { x: 200, y: 200 };
      } else {
        constraint.pointA = mouse.position;
      }

      constraint.bodyB = mouseConstraint.body = playerBody;
      constraint.angleB = playerBody.angle;
    }
  } catch (err) {
    // TODO: figure out how to delete orphaned mouse constraints
  }
}

// Create renderer
var render = Render.create({
  canvas: document.getElementById('world'),
  engine: engine,
  options: {
    width: 800,
    height: 600,
    showAngleIndicator: false,
    wireframes: false
  }
});

function newPlayer(socketID) {
  const x = 100;
  const y = 100;
  const defaultCollisionGroup = -1;

  const chestOptions = {
    friction: 1,
    frictionAir: 0.05,
    density: 1,
    collisionFilter: {
      group: defaultCollisionGroup,
    },
    chamfer: {
      radius: 20,
    },
    label: "chest",
    render: {
      fillStyle: "#E0A423",
    },
  };
  const fingerOptions = {
    friction: 1,
    frictionAir: 0.03,
    collisionFilter: {
      group: defaultCollisionGroup,
    },
    chamfer: {
      radius: 0,
    },
    render: {
      fillStyle: '#E0A423',
    },
  };

  const lowerFingerOptions = {
    friction: 1,
    frictionAir: 0.03,
    collisionFilter: {
      group: defaultCollisionGroup,
    },
    chamfer: {
      radius: 0,
    },
    render: {
      fillStyle: "#E0A423",
    },
  };

  chest = Bodies.rectangle(x, y, 90, 80, chestOptions);
  chest.size = 40; // To determine overlap of goal

  const thumbUpperFinger = Bodies.rectangle(x - 60, y, 20, 50, Object.assign({}, fingerOptions));
  Matter.Body.rotate(thumbUpperFinger, -10)

  const pointerUpperFinger = Bodies.rectangle(x - 30, y - 60, 20, 40, Object.assign({}, fingerOptions));
  const pointerLowerFinger = Bodies.rectangle(x - 30, y - 100, 20, 60, Object.assign({}, lowerFingerOptions));

  const leftUpperFinger = Bodies.rectangle(x, y - 60, 20, 40, Object.assign({}, fingerOptions));
  const leftLowerFinger = Bodies.rectangle(x, y - 100, 20, 60, Object.assign({}, lowerFingerOptions));

  const rightUpperFinger = Bodies.rectangle(x + 30, y - 60, 20, 40, Object.assign({}, fingerOptions));
  const rightLowerFinger = Bodies.rectangle(x + 30, y - 100, 20, 60, Object.assign({}, lowerFingerOptions));

  const fingerPalm = Body.create({
    parts: [chest, thumbUpperFinger, pointerUpperFinger, leftUpperFinger, rightUpperFinger],
    collisionFilter: {
      group: defaultCollisionGroup - 1,
    },
  });

  const upperToLowerPointerFinger = Constraint.create({
    bodyA: fingerPalm,
    bodyB: pointerLowerFinger,
    pointA: {
      x: -30,
      y: -80,
    },
    pointB: {
      x: 0,
      y: 25,
    },
    stiffness: 1,
    render: {
      visible: false,
    },
  });

  const upperToLowerLeftFinger = Constraint.create({
    bodyA: fingerPalm,
    bodyB: leftLowerFinger,
    pointA: {
      x: 0,
      y: -80,
    },
    pointB: {
      x: 0,
      y: 25,
    },
    stiffness: 1,
    render: {
      visible: false,
    },
  });

  const upperToLowerRightFinger = Constraint.create({
    bodyA: fingerPalm,
    bodyB: rightLowerFinger,
    pointA: {
      x: 30,
      y: -80,
    },
    pointB: {
      x: 0,
      y: 25,
    },
    stiffness: 1,
    render: {
      visible: false,
    },
  });

  const playerBody = Composite.create({
    bodies: [fingerPalm, pointerLowerFinger, leftLowerFinger, rightLowerFinger],
    constraints: [
      upperToLowerPointerFinger,
      upperToLowerLeftFinger,
      upperToLowerRightFinger
    ],
  });

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

// Collisions
setInterval(() => {
  try {
    const myBody = playerBodies[socket.id].bodies[0];
    const otherBodies = [];
    for (const [key, value] of Object.entries(playerBodies)) {
      if (key == socket.id) continue;
      otherBodies.push(value.bodies[0]);
    }

    if (!otherBodies.length) return;

    if (Matter.Query.collides(myBody, otherBodies).length > 0) {
      inspire(myBody.position.x, myBody.position.y);
      launchConfetti(myBody.position.x, myBody.position.y);
    }

  } catch (err) {
    console.log(err)
  }
}, 50);

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
      Composite.remove(world, playerBodies[key]);
      delete playerBodies[key];
    }
  }

}, 500);

function inspire(x, y) {
  if (currentlyInspiring) return;
  currentlyInspiring = true;
  
  const message = INSPIRATIONAL_MESSAGES[Math.floor(Math.random() * INSPIRATIONAL_MESSAGES.length)];

  const canvas = document.getElementById('inspiration');
  canvas.style.display = 'block';

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center"; 
  ctx.font = "50px Helvetica";
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(message, x + 25, y - 10); 

  setTimeout(() => {
    canvas.style.display = 'none';
    currentlyInspiring = false;
  }, 500);
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}


function launchConfetti(x, y) {
  if (currentlyConfettiing) return;
  currentlyConfettiing = true;

  setTimeout(() => currentlyConfettiing = false, 300);

  const canvas = document.getElementById('confetti');
  const originX = x / canvas.width;
  const originY = y / canvas.height;

  const myConfetti = confetti.create(canvas, {
    resize: true,
    useWorker: true
  });

  myConfetti({
    particleCount: 100,
    spread: 160,
    origin: { x: originX, y: originY }
  });
}
