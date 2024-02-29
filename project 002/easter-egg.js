
const engine = Matter.Engine.create();
const world = engine.world;
engine.gravity.y = 0.9;

const render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
});

const ground = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 40, window.innerWidth, 50, { isStatic: true });
Matter.World.add(world, ground);
const ground1 = Matter.Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 50, window.innerWidth, { isStatic: true });
Matter.World.add(world, ground1);
const ground2 = Matter.Bodies.rectangle(-26, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true });
Matter.World.add(world, ground2);

function generateAsciiArt() {
    const x = Math.random() * window.innerWidth;
    const asciiElement = document.createElement('div');
    asciiElement.className = 'ascii-art';
    asciiElement.textContent = `
           .,
           ::
          :==
==------=++=.
 .:-=+=--:   `;
    document.body.appendChild(asciiElement);

    const vertices = [
        { x: 0, y: 55 }, { x: 95, y: 10 }, { x: 93, y: 85 }, { x: 0, y: 85 }
    ];

    const angle = Math.random() * Math.PI * 2;

    const customShape = Matter.Bodies.fromVertices(x, -100, vertices, {
        isStatic: false,
        friction: 0.5,
        restitution: 0.3,
        angle: angle,
  
        render: {
            fillStyle: 'transparent',
            strokeStyle: 'transparent',
            lineWidth: 0
        }
    }, true);

    Matter.World.add(world, customShape);

    Matter.Events.on(engine, 'beforeUpdate', function() {
        const bounds = customShape.bounds;
        const width = bounds.max.x - bounds.min.x;
        const height = bounds.max.y - bounds.min.y;

        asciiElement.style.left = `${customShape.position.x - width / 2}px`;
        asciiElement.style.top = `${customShape.position.y - height / 2 - 40}px`;
        asciiElement.style.transform = `rotate(${customShape.angle}rad)`;
    });
}

setInterval(generateAsciiArt, 315);

Matter.Engine.run(engine);
Matter.Render.run(render);
