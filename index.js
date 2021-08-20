const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

let start, previousTimeStamp;

/**
 * Degrees to Radians
 */
const deg2rad = (deg) => {
    return (Math.PI / 180) * deg;
}

const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ctx.strokeStyle = 
ctx.lineWidth = 0.5;

const x = 50;
const y = 50;

class Acceleratable {
    constructor(value = 0, speed = 0, acceleration = 0) {
        this.value = value;
        this.speed = speed;
        this.acceleration = acceleration;
    }

    step(delta) {
        this.speed += this.acceleration * delta;
        this.value += this.speed * delta;
    }
}

const tank1 = {
    x: new Acceleratable(50),
    y: new Acceleratable(50),
    rotation: new Acceleratable(0),
    towerRotation: new Acceleratable(0),
};

const tank2 = {
    x: new Acceleratable(200),
    y: new Acceleratable(200),
    rotation: new Acceleratable(0),
    towerRotation: new Acceleratable(0),
};

const tankInputs = {
    forward: 0,
    turnRight: 0,
};

function drawTank(tank) {
    const width = 64;
    const height = 48;
    ctx.save();
    ctx.translate(tank.x.value, tank.y.value);
    ctx.rotate(deg2rad(tank.rotation.value));
    // Base
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 3, width / 9, height / 9);
    ctx.strokeRect(-width / 2, height / 3, width / 9, height / 9);
    // Tower
    ctx.save();
    ctx.rotate(deg2rad(tank.towerRotation.value));
    ctx.strokeRect(-width / 4, -height / 4, width / 2, height / 2);
    // Zielrohr
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-width * 0.6, 0);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
}

function stepTank(tank, tankInputs, delta) {
    tank.x.acceleration = Math.cos(deg2rad(tank.rotation.value)) * tankInputs.forward * 30;
    tank.y.acceleration = Math.sin(deg2rad(tank.rotation.value)) * tankInputs.forward * 30;
    tank.rotation.acceleration = tankInputs.turnRight * 5;

    // Friction
    tank.x.speed *= 0.9;
    tank.y.speed *= 0.9;
    tank.rotation.speed *= 0.9;

    tank.x.step(delta);
    tank.y.step(delta);
    tank.rotation.step(delta);
    tank.towerRotation.step(delta);
}

const tanks = [];

for (let i = 0; i < 50; i++) {
    const tank = {
        x: new Acceleratable(randomInt(0, 1500)),
        y: new Acceleratable(randomInt(0, 700)),
        rotation: new Acceleratable(0),
        towerRotation: new Acceleratable(0),
    };
    tanks.push(tank);
}

function step(timestamp) {
    if (start === undefined) {
        start = timestamp;
        previousTimeStamp = start;
    }
    const elapsed = timestamp - start;
    const delta = (elapsed - previousTimeStamp) / 1000;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stepTank(tank1, tankInputs, delta);
    drawTank(tank1);

    for (const tank of tanks) {
        stepTank(tank, {
            forward: randomInt(-1, 1),
            turnRight: randomInt(-1, 1),
        }, delta);
        drawTank(tank);
    }
    
    ctx.fillText(tank1.x.value, 0, 10);

    previousTimeStamp = timestamp;
    window.requestAnimationFrame(step);
}

window.addEventListener('keydown', event => {
    console.log(event);
    if (event.key === 'w') {
        tankInputs.forward = 1;
    }
    if (event.key === 's') {
        tankInputs.forward = -1;
    }
    if (event.key === 'd') {
        tankInputs.turnRight = 1;
    }
    if (event.key === 'a') {
        tankInputs.turnRight = -1;
    }
});

window.addEventListener('keyup', event => {
    if (event.key === 'w') {
        tankInputs.forward = 0;
    }
    if (event.key === 's') {
        tankInputs.forward = 0;
    }
    if (event.key === 'd') {
        tankInputs.turnRight = 0;
    }
    if (event.key === 'a') {
        tankInputs.turnRight = 0;
    }
});

window.requestAnimationFrame(step);
