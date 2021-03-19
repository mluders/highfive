const INSPIRATIONAL_MESSAGES = [
  'Go Team!',
  'Wow',
  "You're amazing!",
  "Right on!",
  "Coolio",
  "Rockin'",
];

const HAPPY_HOUR_MESSAGES = [
  "Quittin' time",
  "Beer me",
  "Cheers"
];

const HAND_COLORS = [
  '#1ABC9C',
  '#3498DB',
  '#9B59B6',
  '#C0392B'
];

let currentlyInspiring = false;
let currentlyConfettiing = false;
let currentlyFilling = false;

const playerBodies = {};
const beerParticles = [];

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
        constraint.pointA.x = constraint.pointA.x - 13;
        constraint.pointA.y = constraint.pointA.y;
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

function generateCup() {
  const x = 0;
  const y = 0;

  const defaultCollisionGroup = -1;

  const cupOptions = {
    friction: 1,
    frictionAir: 0.05,
    density: 0.1,
    collisionFilter: {
      group: defaultCollisionGroup,
    },
    label: 'cup',
    render: {
      fillStyle: '#AAAAAA',
    },
  };

  const cupBottomOptions = {
    ...cupOptions,
    density: 1
  };

  const cupLeft = Bodies.rectangle(x - 40, y, 10, 135, cupOptions);
  const cupRight = Bodies.rectangle(x + 40, y, 10, 135, cupOptions);
  const cupBottom = Bodies.rectangle(x, y + 55, 75, 25, cupBottomOptions);

  const handleLeft = Bodies.rectangle(x - 65, y, 10, 70, cupOptions);
  const handleTop = Bodies.rectangle(x - 55, y - 30, 25, 10, cupOptions);
  const handleBottom = Bodies.rectangle(x - 55, y + 30, 25, 10, cupOptions);

  const cup = Body.create({
    parts: [cupLeft, cupRight, cupBottom, handleLeft, handleTop, handleBottom],
    collisionFilter: {
      group: defaultCollisionGroup - 1,
    },
  });

  const playerBody = Composite.create({
    bodies: [cup]
  });

  return playerBody;
}

function openTheTap(x, y) {
  const beerOptions = {
    friction: 1,
    frictionAir: 0.05,
    density: 0.001,
    label: 'beerParticle',
    render: {
      fillStyle: '#FFCD02',
    },
  };

  const beerParticle = Bodies.circle(x, y - 100, 5, beerOptions);
  beerParticle.offScreen = function() {
    var pos = this.position;
    return pos.y > 1000;
  };

  beerParticles.push(beerParticle);
  World.add(world, beerParticle);
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space'){
    if (currentlyFilling) return;

    socket.emit('openTap');
    currentlyFilling = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space'){
    currentlyFilling = false;
    socket.emit('closeTap');
  }
});

// Create beer particles when spacebar is pressed
setInterval(() => {
  if (currentlyFilling) openTheTap(lastPosition.x, lastPosition.y);
  
  for (const [key, value] of Object.entries(localGameState.players)) {
    if (key == socket.id) continue;
    if (!value.filling) continue;

    console.log('Opening remote tap');
    openTheTap(value.x, value.y)
  }
}, 15);

// Delete beer particles when off screen
setInterval(() => {
  for (let i = 0; i < beerParticles.length; i++) {
    if (beerParticles[i].offScreen()) {
      World.remove(world, beerParticles[i]);
      beerParticles.splice(i, 1);
      console.log('Removing beer particle');
    }
  }
}, 2000);

function generateHand() {
  const handColor = HAND_COLORS[Math.floor(Math.random() * HAND_COLORS.length)]

  const x = 100;
  const y = 100;
  const defaultCollisionGroup = -1;

  const palmOptions = {
    friction: 1,
    frictionAir: 0.05,
    density: 1,
    collisionFilter: {
      group: defaultCollisionGroup,
    },
    chamfer: {
      radius: 20,
    },
    label: 'palm',
    render: {
      fillStyle: handColor,
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
      fillStyle: handColor,
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
      fillStyle: handColor,
    },
  };

  const palm = Bodies.rectangle(x, y, 90, 80, palmOptions);
  palm.size = 40; // To determine overlap of goal

  const thumbUpperFinger = Bodies.rectangle(x - 60, y, 20, 50, Object.assign({}, fingerOptions));
  Matter.Body.rotate(thumbUpperFinger, -10)

  const pointerUpperFinger = Bodies.rectangle(x - 30, y - 60, 20, 40, Object.assign({}, fingerOptions));
  const pointerLowerFinger = Bodies.rectangle(x - 30, y - 100, 20, 60, Object.assign({}, lowerFingerOptions));

  const leftUpperFinger = Bodies.rectangle(x, y - 60, 20, 40, Object.assign({}, fingerOptions));
  const leftLowerFinger = Bodies.rectangle(x, y - 100, 20, 60, Object.assign({}, lowerFingerOptions));

  const rightUpperFinger = Bodies.rectangle(x + 30, y - 60, 20, 40, Object.assign({}, fingerOptions));
  const rightLowerFinger = Bodies.rectangle(x + 30, y - 100, 20, 60, Object.assign({}, lowerFingerOptions));

  const fingerPalm = Body.create({
    parts: [palm, thumbUpperFinger, pointerUpperFinger, leftUpperFinger, rightUpperFinger],
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

  return playerBody;
}

function newPlayer(socketID) {
  let playerBody = null;
  if (happyHour) {
    playerBody = generateCup();
  } else {
    playerBody = generateHand();
  }

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
      if (!happyHour) launchConfetti(myBody.position.x, myBody.position.y);
    }

  } catch (err) {}
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
  
  const message = happyHour ?
    HAPPY_HOUR_MESSAGES[Math.floor(Math.random() * HAPPY_HOUR_MESSAGES.length)] :
    INSPIRATIONAL_MESSAGES[Math.floor(Math.random() * INSPIRATIONAL_MESSAGES.length)];

  const canvas = document.getElementById('inspiration');
  canvas.style.display = 'block';

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center"; 
  ctx.font = "50px Helvetica";
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(message, x + 25, y - 120);

  setTimeout(() => {
    canvas.style.display = 'none';
    currentlyInspiring = false;
  }, 750);
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function launchConfetti(x, y) {
  if (currentlyConfettiing) return;
  currentlyConfettiing = true;

  setTimeout(() => currentlyConfettiing = false, 750);

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
