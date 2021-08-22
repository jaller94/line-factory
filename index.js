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

const withinRange = (value, target, range = 0) => {
    return value <= target + range && value >= target - range;
}

const limit = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
}

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

const tankAIDriver = (tank, desiredState) => {
    const inputs = {
        forward: 0,
        turnRight: 0,
        turnTowerRight: 0,
    };
    // Do we need to drive to a different location?
    if (!withinRange(tank.x.value, desiredState.x.value, 3) || !withinRange(tank.y.value, desiredState.y.value, 3)) {
        if (tank.x.value < desiredState.x.value) {
            inputs.forward = Math.sin(deg2rad(90 + tank.rotation.value % 360));
        } else if (tank.x.value > desiredState.x.value) {
            inputs.forward = -Math.sin(deg2rad(90 + tank.rotation.value % 360));
        }
        if (tank.y.value < desiredState.y.value) {
            inputs.forward += -Math.cos(deg2rad(90 + tank.rotation.value % 360));
        } else if (tank.y.value > desiredState.y.value) {
            inputs.forward += Math.cos(deg2rad(90 + tank.rotation.value % 360));
        }
    }
    inputs.forward = limit(inputs.forward, -1, 1);
    // Do we need to rotate?
    const rotationDiff = ((tank.rotation.value - desiredState.rotation.value) % 360 + 360) % 360;
    if (rotationDiff > 180) {
        inputs.turnRight = 1;
    } else if (rotationDiff < 180) {
        inputs.turnRight = -1;
    }
    // TODO: Increase acceptable error if the tank is far away from the destination and reduce it when we get closer
    if (withinRange(tank.x.value, desiredState.x.value, 25) && !withinRange(tank.y.value, desiredState.y.value, 25)) {
        // X-Position stimmt, aber Y-Position nicht
        // TODO: Intelligently pick the direction to turn to
        inputs.turnRight = 1;
    // TODO: Increase acceptable error if the tank is far away from the destination and reduce it when we get closer
    } else if (withinRange(tank.y.value, desiredState.y.value, 25) && !withinRange(tank.x.value, desiredState.x.value, 25)) {
        // Y-Position stimmt, aber X-Position nicht
        // TODO: Intelligently pick the direction to turn to
        inputs.turnRight = -1;
    }
    if (withinRange(inputs.forward, 0, 0.01) && !withinRange(tank.x.value, desiredState.x.value, 25) && !withinRange(tank.y.value, desiredState.y.value, 25)) {
        // Langsame Geschwindigkeit, aber wir sind nicht da
        inputs.turnRight = 1;
    }
    // Do we need to rotate the tower?
    const towerRotationDiff = ((tank.towerRotation.value - desiredState.towerRotation.value) % 360 + 360) % 360;
    if (towerRotationDiff > 180) {
        inputs.turnTowerRight = 1;
    } else if (towerRotationDiff < 180) {
        inputs.turnTowerRight = -1;
    }
    return inputs;
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
    tank.x.acceleration = Math.cos(deg2rad(tank.rotation.value)) * tankInputs.forward * 300;
    tank.y.acceleration = Math.sin(deg2rad(tank.rotation.value)) * tankInputs.forward * 300;
    tank.rotation.acceleration = tankInputs.turnRight * 100;
    tank.towerRotation.acceleration = tankInputs.turnTowerRight * 1000;

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

// Bots get placed in a grid

const screenWidth = Number.parseInt(canvas.width);
const screenHeight = Number.parseInt(canvas.height);
for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 8; y++) {
        const state = {
            color: `#${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}`,
            x: new Acceleratable(randomInt(0, screenWidth)),
            y: new Acceleratable(randomInt(0, screenHeight)),
            rotation: new Acceleratable(randomInt(0, 360)),
            towerRotation: new Acceleratable(randomInt(0, 360)),
        };
        const desiredState = {
            ...state,
            x: new Acceleratable(x * screenWidth / 10 + 32),
            y: new Acceleratable(y * screenHeight / 8 + 32),
            rotation: new Acceleratable(-90),
            towerRotation: new Acceleratable(0),
        };
        const color = `#${'5,7,9,a,c,d,d,e,f'.split(',')[Math.floor(desiredState.x.value / (screenWidth / 8))]}${'6,7,8,9,b,e,b,8,6'.split(',')[Math.floor(desiredState.y.value / (screenHeight / 9))]}${'5,6,7,8,9,a,b,c,d'.split(',')[Math.floor(desiredState.y.value / (screenHeight / 9))]}`;
        state.color = color;
        desiredState.color = color;
        tanks.push({
            state,
            desiredState,
        });
    }
}

// Randomly placed bots

// const screenWidth = Number.parseInt(canvas.width);
// const screenHeight = Number.parseInt(canvas.height);
// for (let i = 0; i < 200; i++) {
//     const state = {
//         color: `#${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}`,
//         x: new Acceleratable(randomInt(0, screenWidth)),
//         y: new Acceleratable(randomInt(0, screenHeight)),
//         rotation: new Acceleratable(0),
//         towerRotation: new Acceleratable(0),
//     };
//     const desiredState = {
//         ...state,
//         x: new Acceleratable(randomInt(0, screenWidth)),
//         y: new Acceleratable(randomInt(0, screenWidth)),
//         rotation: new Acceleratable(randomInt(0, 359)),
//         towerRotation: new Acceleratable(randomInt(0, 359)),
//     };
//     const color = `#${'5,7,9,a,c,d,d,e,f'.split(',')[Math.floor(desiredState.x.value / (screenWidth / 8))]}${'6,7,8,9,b,e,b,8,6'.split(',')[Math.floor(desiredState.y.value / (screenHeight / 9))]}${'5,6,7,8,9,a,b,c,d'.split(',')[Math.floor(desiredState.y.value / (screenHeight / 9))]}`;
//     state.color = color;
//     desiredState.color = color;
//     tanks.push({
//         state,
//         desiredState,
//     });
// }

function step(timestamp) {
    if (start === undefined) {
        start = timestamp;
        previousTimeStamp = start;
    }
    // const elapsed = timestamp - start;
    const delta = limit((timestamp - previousTimeStamp) / 1000, 0, 0.05);
    previousTimeStamp = timestamp;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    for (const tank of tanks) {
        const inputs = tankAIDriver(tank.state, tank.desiredState);
        stepTank(tank.state, inputs, delta);
        drawTank(tank.state);
        // drawTank(tank.desiredState);
    }

    // stepTank(playerTank, tankInputs, delta);
    // drawTank(playerTank);
    
    // ctx.fillStyle = 'white';
    // ctx.fillText(`${elapsed.toFixed(0)} ${previousTimeStamp.toFixed(0)}`, 0, 10);
    // ctx.fillStyle = 'black';
    window.requestAnimationFrame(step);
}

window.addEventListener('keydown', event => {
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
