const playerBodies = {};

const Bodies = Matter.Bodies,
      Body = Matter.Body,
      Composite = Matter.Composite,
      Constraint = Matter.Constraint,
      Engine = Matter.Engine,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Render = Matter.Render,
      Runner = Matter.Runner,
      World = Matter.World;

// MouseConstraint.update = function(mouseConstraint, bodies) {
//   const { constraint, mouse } = mouseConstraint;
//   const playerBody = playerBodies[mouseConstraint.socketID].bodies[0];

//   if (mouseConstraint.isRemote) {
//     try {
//       const { x = 0, y = 0} = localGameState.players[mouseConstraint.socketID];
//       constraint.pointA = { x, y };
//       constraint.bodyB = mouseConstraint.body = playerBody;
//       constraint.angleB = playerBody.angle;
//     } catch (err) {
//       console.log('oh no')
//     }

//   } else {
//     constraint.pointA = mouse.position;
//     constraint.bodyB = mouseConstraint.body = playerBody;
//     constraint.angleB = playerBody.angle;
//   }
// }

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
  const legOptions = {
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

  const lowerLegOptions = {
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

  const thumbUpperLeg = Bodies.rectangle(x - 60, y, 20, 50, Object.assign({}, legOptions));
  Matter.Body.rotate(thumbUpperLeg, -10)

  const pointerUpperLeg = Bodies.rectangle(x - 30, y - 60, 20, 40, Object.assign({}, legOptions));
  const pointerLowerLeg = Bodies.rectangle(x - 30, y - 100, 20, 60, Object.assign({}, lowerLegOptions));

  const leftUpperLeg = Bodies.rectangle(x, y - 60, 20, 40, Object.assign({}, legOptions));
  const leftLowerLeg = Bodies.rectangle(x, y - 100, 20, 60, Object.assign({}, lowerLegOptions));

  const rightUpperLeg = Bodies.rectangle(x + 30, y - 60, 20, 40, Object.assign({}, legOptions));
  const rightLowerLeg = Bodies.rectangle(x + 30, y - 100, 20, 60, Object.assign({}, lowerLegOptions));

  const legTorso = Body.create({
    parts: [chest, thumbUpperLeg, pointerUpperLeg, leftUpperLeg, rightUpperLeg],
    collisionFilter: {
      group: defaultCollisionGroup - 1,
    },
  });

  const upperToLowerPointerLeg = Constraint.create({
    bodyA: legTorso,
    bodyB: pointerLowerLeg,
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

  const upperToLowerLeftLeg = Constraint.create({
    bodyA: legTorso,
    bodyB: leftLowerLeg,
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

  const upperToLowerRightLeg = Constraint.create({
    bodyA: legTorso,
    bodyB: rightLowerLeg,
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
    bodies: [legTorso, pointerLowerLeg, leftLowerLeg, rightLowerLeg],
    constraints: [
      upperToLowerPointerLeg,
      upperToLowerLeftLeg,
      upperToLowerRightLeg
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

  // mouseConstraint.socketID = socketID;
  // mouseConstraint.isRemote = (socket.id !== socketID);
  if (!mouseConstraint.isRemote) render.mouse = mouse;

  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
  World.add(world, [
    playerBody,
    ground
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

// Handle connects and disconnects
// setInterval(() => {
//   for (const [key, value] of Object.entries(localGameState.players)) {
//     if (!playerBodies[key]) {
//       playerBodies[key] = newPlayer(key);
//     }
//   }
  
//   for (const [key, value] of Object.entries(playerBodies)) {
//     if (!localGameState.players[key]) {
//       console.log('deleting player');
//       Matter.Composite.remove(world, playerBodies[key])
//       delete playerBodies[key];
//     }
//   }

// }, 500);

newPlayer('123')