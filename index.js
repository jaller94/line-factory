import { Acceleratable, limit } from './helper.js';
import { drawTank, tankAIDriver, stepTank, placeTanksInAGrid } from './tank.js';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d', {alpha : false});

let start, previousTimeStamp;

// ctx.strokeStyle = 
ctx.lineWidth = 0.5;

const x = 50;
const y = 50;

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

const tanks = [
    ...placeTanksInAGrid(canvas),
];

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
        drawTank(ctx, tank.state);
    }

    // stepTank(playerTank, tankInputs, delta);
    // drawTank(ctx, playerTank);
    
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
