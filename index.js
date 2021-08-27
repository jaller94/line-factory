import { Acceleratable, limit } from './helper.js';
import { draw as drawAsteroid, drawAll as drawAllAsteroids, step as stepAsteroid, placeRandomly as placeAsteroidsRandomly } from './asteroid.js';
import { draw as drawShip, AIDriver as shipAIDriver, step as stepShip, placeInAGrid as placeTanksInAGrid } from './ship.js';
import { draw as drawShot, step as stepShot, shoot } from './shot.js';

const distance = (x1, y1, x2, y2) => {
    const a = x1 - x2;
    const b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

const distanceOfActors = (actor1, actor2) => {
    return distance(actor1.x.value, actor1.y.value, actor2.x.value, actor2.y.value);
}

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

const ships = [
    ...placeTanksInAGrid(canvas),
];

let asteroids = [
    ...placeAsteroidsRandomly(100, 0, 0),
    // ...placeAsteroidsRandomly(100, 1, 0),
    // ...placeAsteroidsRandomly(100, 2, 0),
    // ...placeAsteroidsRandomly(100, 2, 0),
];

let shots = [];

setInterval(() => {
    shots = shots.filter(shot => shot.active);
}, 20000);

// setInterval(() => {
//     asteroids = asteroids.filter(asteroid => distanceOfActors(playerTank, asteroid.state) < 2000);
// }, 12000);

let activeAsteroids = asteroids;
setInterval(() => {
    activeAsteroids = asteroids.filter(asteroid => distanceOfActors(playerTank, asteroid.state) < 1500);
}, 1000);

function step(timestamp) {
    if (start === undefined) {
        start = timestamp;
        previousTimeStamp = start;
    }
    // const elapsed = timestamp - start;
    const actualDelta = (timestamp - previousTimeStamp) / 1000;
    const delta = limit(actualDelta, 0, 0.05);
    previousTimeStamp = timestamp;

    for (const ship of ships) {
        const inputs = shipAIDriver(ship.state, ship.desiredState);
        stepShip(ship.state, inputs, delta);
    }
    for (const asteroid of activeAsteroids) {
        stepAsteroid(asteroid.state, {}, delta);
    }
    for (const shot of shots) {
        if (!shot.active) continue;
        stepShot(shot.state, {}, delta);
        drawShot(ctx, shot.state);
    }
    stepShip(playerTank, tankInputs, delta);
    
    ctx.fillStyle = '#black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(2, 2);
    ctx.translate(-playerTank.x.value, -playerTank.y.value);

    for (const ship of ships) {
        drawShip(ctx, ship.state);
    }

    drawAllAsteroids(ctx, activeAsteroids);
    
    for (const shot of shots) {
        drawShot(ctx, shot.state);
    }

    drawShip(ctx, playerTank);

    ctx.restore();

    
    ctx.fillStyle = 'white';
    ctx.fillText(`${actualDelta - delta}`, 0, 10);
    ctx.fillStyle = 'black';
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


/*  START Mouse/Touch Controls */
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
/*  END Mouse/Touch Controls */

window.requestAnimationFrame(step);
