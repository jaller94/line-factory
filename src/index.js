import { Acceleratable, distanceOfActors, limit } from './helper.js';
import { drawAll as drawAllAsteroids, step as stepAsteroid, placeRandomly as placeAsteroidsRandomly } from './asteroid.js';
import { draw as drawPlanet, step as stepPlanet, place as placePlanet } from './planet.js';
import { draw as drawShip, AIDriver as shipAIDriver, step as stepShip, placeInAGrid as placeShipsInAGrid } from './ship.js';
import { draw as drawShot, step as stepShot } from './shot.js';

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

const playerShip = {
    color: '#fff',
    x: new Acceleratable(50),
    y: new Acceleratable(50),
    rotation: new Acceleratable(0),
    lastShot: 1000,
};

const shipInputs = {
    forward: 0,
    turnRight: 0,
    shooting: false,
};

const world = {
    ships: [
        // ...placeShipsInAGrid(canvas),
    ],
    asteroids: [
        ...placeAsteroidsRandomly(50, 0, 0),
    ],
    planets: [
        // placePlanet(4000, 0),
    ],
    shots: [],
};

setInterval(() => {
    world.shots = world.shots.filter(shot => shot.active);
}, 20000);

/* Main loop */
function step(timestamp) {
    if (start === undefined) {
        start = timestamp;
        previousTimeStamp = start;
    }
    const actualDelta = (timestamp - previousTimeStamp) / 1000;
    const delta = limit(actualDelta, 0, 0.05);
    previousTimeStamp = timestamp;

    for (const asteroid of world.asteroids) {
        stepAsteroid(asteroid.state, delta);
    }
    for (const planet of world.planets) {
        stepPlanet(planet.state, delta);
    }
    for (const ship of world.ships) {
        const inputs = shipAIDriver(ship.state, ship.desiredState);
        stepShip(ship.state, delta, world, inputs);
    }
    for (const shot of world.shots) {
        if (!shot.active) continue;
        stepShot(shot.state, delta);
        drawShot(ctx, shot.state);
    }
    stepShip(playerShip, delta, world, shipInputs);
    
    // Collisions
    for (const shot of world.shots) {
        if (!shot.active) continue;
        for (const asteroid of world.asteroids) {
            if (!shot.active) continue;
            if (distanceOfActors(shot.state, asteroid.state) < asteroid.state.size) {
                // Add 3 new asteroids
                if (asteroid.state.size === 12) {
                    world.asteroids.push(...placeAsteroidsRandomly(3, asteroid.state.x.value, asteroid.state.y.value, 0, 0, 9));
                } else if (asteroid.state.size === 9) {
                    world.asteroids.push(...placeAsteroidsRandomly(3, asteroid.state.x.value, asteroid.state.y.value, 0, 0, 5));
                }
                // Remove shot asteroid
                world.asteroids = world.asteroids.filter(a => a !== asteroid);
                // Remove shot
                shot.active = false;
            }
        }
    }

    ctx.fillStyle = '#black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(2, 2);
    ctx.translate(-playerShip.x.value, -playerShip.y.value);

    for (const ship of world.ships) {
        drawShip(ctx, ship.state);
    }

    drawAllAsteroids(ctx, world.asteroids);

    for (const planet of world.planets) {
        drawPlanet(ctx, planet.state);
    }

    for (const shot of world.shots) {
        if (!shot.active) continue;
        drawShot(ctx, shot.state);
    }

    drawShip(ctx, playerShip);

    ctx.restore();

    // ctx.fillStyle = 'white';
    // ctx.fillText(`${actualDelta - delta}`, 0, 10);
    // ctx.fillStyle = 'black';
    window.requestAnimationFrame(step);
}

window.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp') {
        shipInputs.forward = 1;
    }
    if (event.key === 'ArrowDown') {
        shipInputs.forward = -1;
    }
    if (event.key === 'ArrowRight') {
        shipInputs.turnRight = 1;
    }
    if (event.key === 'ArrowLeft') {
        shipInputs.turnRight = -1;
    }
    if (event.key === 'Space' || event.key === ' ') {
        shipInputs.shooting = true;
    }
});

window.addEventListener('keyup', event => {
    if (event.key === 'ArrowUp') {
        shipInputs.forward = 0;
    }
    if (event.key === 'ArrowDown') {
        shipInputs.forward = 0;
    }
    if (event.key === 'ArrowRight') {
        shipInputs.turnRight = 0;
    }
    if (event.key === 'ArrowLeft') {
        shipInputs.turnRight = 0;
    }
    if (event.key === 'Space' || event.key === ' ') {
        shipInputs.shooting = false;
    }
});


/*  START Mouse/Touch Controls */
const pressedPointers = {};
document.getElementById('l').addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    shipInputs.turnRight = -1;
    event.target.classList.add('pressed');
    pressedPointers[event.pointerId] = 'l';
});
document.getElementById('r').addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    shipInputs.turnRight = 1;
    event.target.classList.add('pressed');
    pressedPointers[event.pointerId] = 'r';
});
document.getElementById('f').addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    shipInputs.forward = 1;
    event.target.classList.add('pressed');
    pressedPointers[event.pointerId] = 'f';
});
document.getElementById('w').addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    shipInputs.shooting = true;
    event.target.classList.add('pressed');
    pressedPointers[event.pointerId] = 'w';
});
const handlePointerUp = () => {
    const button = pressedPointers[event.pointerId];
    if (!button) return;
    if (button === 'l' || button === 'r') {
        shipInputs.turnRight = 0;
    } else if (button === 'f') {
        shipInputs.forward = 0;
    } else if (button === 'w') {
        shipInputs.shooting = false;
    }
    document.getElementById(button).classList.remove('pressed');
};
window.addEventListener('pointerup', handlePointerUp);
window.addEventListener('pointercancel', handlePointerUp);

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
