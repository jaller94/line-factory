import { Acceleratable, limit } from './helper.js';
import { draw as drawAsteroid, step as stepAsteroid, placeRandomly as placeAsteroidsRandomly } from './asteroid.js';
import { draw as drawShip, tankAIDriver, step as stepShip, placeTanksInAGrid } from './ship.js';
import { draw as drawShot, step as stepShot, shoot } from './shot.js';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d', {alpha : false});

let start, previousTimeStamp;

ctx.lineWidth = 0.5;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

window.addEventListener('resize', () => {
    if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
});

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

const asteroids = [
    ...placeAsteroidsRandomly(canvas, 100),
];

let shots = [];

setInterval(() => {
    shots = shots.filter(shot => shot.active);
}, 20000);

function step(timestamp) {
    if (start === undefined) {
        start = timestamp;
        previousTimeStamp = start;
    }
    // const elapsed = timestamp - start;
    const delta = limit((timestamp - previousTimeStamp) / 1000, 0, 0.05);
    previousTimeStamp = timestamp;
    
    ctx.fillStyle = '#black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(2, 2);
    ctx.translate(-playerTank.x.value, -playerTank.y.value);

    for (const tank of tanks) {
        const inputs = tankAIDriver(tank.state, tank.desiredState);
        stepShip(tank.state, inputs, delta);
        drawShip(ctx, tank.state);
    }

    for (const asteroid of asteroids) {
        stepAsteroid(asteroid.state, {}, delta);
        drawAsteroid(ctx, asteroid.state);
    }

    for (const shot of shots) {
        if (!shot.active) continue;
        stepShot(shot.state, {}, delta);
        drawShot(ctx, shot.state);
    }

    stepShip(playerTank, tankInputs, delta);
    drawShip(ctx, playerTank);

    ctx.restore();

    
    // ctx.fillStyle = 'white';
    // ctx.fillText(`${elapsed.toFixed(0)} ${previousTimeStamp.toFixed(0)}`, 0, 10);
    // ctx.fillStyle = 'black';
    window.requestAnimationFrame(step);
}

window.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp') {
        tankInputs.forward = 1;
    }
    if (event.key === 'ArrowDown') {
        tankInputs.forward = -1;
    }
    if (event.key === 'ArrowRight') {
        tankInputs.turnRight = 1;
    }
    if (event.key === 'ArrowLeft') {
        tankInputs.turnRight = -1;
    }
    if (event.key === 'Space' || event.key === ' ') {
        shots.push(shoot(playerTank));
    }
});

window.addEventListener('keyup', event => {
    if (event.key === 'ArrowUp') {
        tankInputs.forward = 0;
    }
    if (event.key === 'ArrowDown') {
        tankInputs.forward = 0;
    }
    if (event.key === 'ArrowRight') {
        tankInputs.turnRight = 0;
    }
    if (event.key === 'ArrowLeft') {
        tankInputs.turnRight = 0;
    }
});

const pressedPointers = {};

document.getElementById('l').addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    tankInputs.turnRight = -1;
    event.target.classList.add('pressed');
    pressedPointers[event.pointerId] = 'l';
});
document.getElementById('r').addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    tankInputs.turnRight = 1;
    event.target.classList.add('pressed');
    pressedPointers[event.pointerId] = 'r';
});
document.getElementById('f').addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    tankInputs.forward = 1;
    event.target.classList.add('pressed');
    pressedPointers[event.pointerId] = 'f';
});
window.addEventListener('pointerup', event => {
    console.log(event.pointerId);
    const button = pressedPointers[event.pointerId];
    if (!button) return;
    if (button === 'l' || button === 'r') {
        tankInputs.turnRight = 0;
    } else if (button === 'f') {
        tankInputs.forward = 0;
    }
    document.getElementById(button).classList.remove('pressed');
});

// TODO: Handle zoom. But for now we just disable it.
document.addEventListener('wheel', event => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    }, { passive: false }
);

let controlsOn = false;
window.addEventListener('pointerover', event => {
    if (!controlsOn) {
        document.getElementById('controls').classList.remove('hide');
    }
});

window.requestAnimationFrame(step);
