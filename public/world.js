let pseudoMouseX = 0;
let pseudoMouseY = 0;

setInterval(() => {
  pseudoMouseX += 1;
  pseudoMouseY += 1;
}, 10);

var Engine = Matter.Engine,
Render = Matter.Render,
Runner = Matter.Runner,
Constraint = Matter.Constraint,
MouseConstraint = Matter.MouseConstraint,
Mouse = Matter.Mouse,
World = Matter.World,
Composite = Matter.Composite,
IMousePoint = Matter.IMousePoint,
Bodies = Matter.Bodies;

// create engine
var engine = Engine.create(),
world = engine.world;

// create renderer
var render = Render.create({
  canvas: document.getElementById('world'),
  engine: engine,
  options: {
    width: 800,
    height: 600,
    showAngleIndicator: false
  }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

const hand = Bodies.rectangle(600, 460, 80, 80);
const finger = Bodies.rectangle(600, 400, 50, 25);

const fingerToHand = Constraint.create({
  bodyA: hand,
  pointA: {
    x: 0,
    y: 0
  },
  pointB: {
    x: 0,
    y: 0
  },
  bodyB: finger,
  stiffness: 1,
  render: {
    visible: false
  }
});

const player = Composite.create({
  bodies: [
    hand,
    finger,
  ],
  constraints: [
    fingerToHand
  ]
});

World.add(world, [
  player
]);

// add mouse control
var mouse = Mouse.create(render.canvas),
mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.9,
    render: {
      visible: false
    }
  }
});
mouseConstraint.isRemote = false;

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 }
});

// MouseConstraint.update = function(mouseConstraint, bodies) {
//   var mouse = mouseConstraint.mouse;
//   var constraint = mouseConstraint.constraint
//   var body = hand;

//   constraint.pointA =  mouse.position;
//   constraint.bodyB = mouseConstraint.body = body;
//   constraint.angleB = body.angle;
// }

MouseConstraint.update = function(mouseConstraint, bodies) {
  if (mouseConstraint.isRemote) {
    var constraint = mouseConstraint.constraint
    var body = hand;

    constraint.pointA = { x: pseudoMouseX, y: pseudoMouseY };
    constraint.bodyB = mouseConstraint.body = body;
    constraint.angleB = body.angle;
  } else {
    var mouse = mouseConstraint.mouse;
    var constraint = mouseConstraint.constraint
    var body = hand;

    constraint.pointA =  mouse.position;
    constraint.bodyB = mouseConstraint.body = body;
    constraint.angleB = body.angle;
  }
}
