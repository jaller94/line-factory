const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d', {alpha : false});

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

const randomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
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

const playerTank = {
    color: '#fff',
    x: new Acceleratable(50),
    y: new Acceleratable(50),
    rotation: new Acceleratable(0),
    towerRotation: new Acceleratable(0),
};

const tankInputs = {
    forward: 0,
    turnRight: 0,
    turnTowerRight: 0,
};

function drawTank(tank) {
    const width = 64;
    const height = 48;
    ctx.save();
    ctx.strokeStyle = tank.color;
    ctx.translate(tank.x.value, tank.y.value);
    ctx.rotate(deg2rad(tank.rotation.value));
    // Base
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    // Klappen
    ctx.strokeRect(-width / 2, -height / 3, width / 9, height / 9);
    ctx.strokeRect(-width / 2, height / 3 - height / 9, width / 9, height / 9);
    // Tower
    ctx.save();
    ctx.rotate(deg2rad(tank.towerRotation.value));
    ctx.strokeRect(-width / 4, -height / 4, width / 2, height / 2);
    // Zielrohr
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.6, 0);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
}

function stepTank(tank, tankInputs, delta) {
    tank.x.acceleration = Math.cos(deg2rad(tank.rotation.value)) * tankInputs.forward * 30;
    tank.y.acceleration = Math.sin(deg2rad(tank.rotation.value)) * tankInputs.forward * 30;
    tank.rotation.acceleration = tankInputs.turnRight * 5;
    tank.towerRotation.acceleration = tankInputs.turnTowerRight * 50;

    // Friction
    tank.x.speed *= 0.9;
    tank.y.speed *= 0.9;
    tank.rotation.speed *= 0.9;
    tank.towerRotation.speed *= 0.6;

    tank.x.step(delta);
    tank.y.step(delta);
    tank.rotation.step(delta);
    tank.towerRotation.step(delta);
}

const tanks = [];

for (let i = 0; i < 50; i++) {
    const tank = {
        color: `#${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}`,
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

    
    for (const tank of tanks) {
        stepTank(tank, {
            forward: randomInt(-1, 1),
            turnRight: randomInt(-1, 1),
        }, delta);
        drawTank(tank);
    }

    stepTank(playerTank, tankInputs, delta);
    drawTank(playerTank);
    
    // ctx.fillText(tank1.x.value, 0, 10);

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
    if (event.key === 'ArrowRight') {
        tankInputs.turnTowerRight = 1;
    }
    if (event.key === 'ArrowLeft') {
        tankInputs.turnTowerRight = -1;
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
    if (event.key === 'ArrowRight') {
        tankInputs.turnTowerRight = 0;
    }
    if (event.key === 'ArrowLeft') {
        tankInputs.turnTowerRight = 0;
    }
});

window.requestAnimationFrame(step);
