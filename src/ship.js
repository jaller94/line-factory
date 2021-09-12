import { Acceleratable, deg2rad, directionOfActor, distanceOfActors, limit, randomInt, randomItem, withinRange } from './helper.js';
import { shoot } from './shot.js';

export const AIDriver = (state, desiredState) => {
    const inputs = {
        forward: 0,
        shooting: false,
        turnRight: 0,
    };
    // Do we need to drive to a different location?
    if (!withinRange(state.x.value, desiredState.x.value, 3) || !withinRange(state.y.value, desiredState.y.value, 3)) {
        if (state.x.value < desiredState.x.value) {
            inputs.forward = Math.sin(deg2rad(90 + state.rotation.value % 360));
        } else if (state.x.value > desiredState.x.value) {
            inputs.forward = -Math.sin(deg2rad(90 + state.rotation.value % 360));
        }
        if (state.y.value < desiredState.y.value) {
            inputs.forward += -Math.cos(deg2rad(90 + state.rotation.value % 360));
        } else if (state.y.value > desiredState.y.value) {
            inputs.forward += Math.cos(deg2rad(90 + state.rotation.value % 360));
        }
    }
    inputs.forward = limit(inputs.forward, -1, 1);
    // Do we need to rotate?
    const rotationDiff = ((state.rotation.value - desiredState.rotation.value) % 360 + 360) % 360;
    if (rotationDiff > 180) {
        inputs.turnRight = 1;
    } else if (rotationDiff < 180) {
        inputs.turnRight = -1;
    }
    // TODO: Increase acceptable error if the ship is far away from the destination and reduce it when we get closer
    if (withinRange(state.x.value, desiredState.x.value, 25) && !withinRange(state.y.value, desiredState.y.value, 25)) {
        // X position is correct, but Y position needs correction
        // TODO: Intelligently pick the direction to turn to
        inputs.turnRight = 1;
        // TODO: Increase acceptable error if the ship is far away from the destination and reduce it when we get closer
    } else if (withinRange(state.y.value, desiredState.y.value, 25) && !withinRange(state.x.value, desiredState.x.value, 25)) {
        // Y position is good, but X position needs correction
        // TODO: Intelligently pick the direction to turn to
        inputs.turnRight = -1;
    }
    if (withinRange(inputs.forward, 0, 0.01) && !withinRange(state.x.value, desiredState.x.value, 25) && !withinRange(state.y.value, desiredState.y.value, 25)) {
        // Handle edge case: We're slowing down, but we haven't reached our destination
        inputs.turnRight = 1;
    }
    return inputs;
};

export const draw = (ctx, state) => {
    ctx.save();
    ctx.strokeStyle = state.color;
    ctx.translate(state.x.value, state.y.value);
    ctx.rotate(deg2rad(state.rotation.value + 90));
    // Base
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(3, 3);
    ctx.lineTo(0, 1);
    ctx.lineTo(-3, 3);
    ctx.lineTo(0, -6);
    ctx.stroke();
    ctx.restore();
}

export const step = (state, delta, world = {}, inputs) => {
    state.x.acceleration = Math.cos(deg2rad(state.rotation.value)) * inputs.forward * 300;
    state.y.acceleration = Math.sin(deg2rad(state.rotation.value)) * inputs.forward * 300;
    state.rotation.acceleration = inputs.turnRight * 1400;

    // Friction
    if (delta > 0) {
        state.x.speed *= 1 - (0.6 * delta);
        state.y.speed *= 1 - (0.6 * delta);
        state.rotation.speed *= 1 - (8 * delta);
    }

    for(const planet of (world.planets ?? [])) {
        const distance = distanceOfActors(state, planet.state);
        if (distance < 3000) {
            const drag = -(planet.state.mass) / Math.pow(distance, 2);
            const direction = directionOfActor(state, planet.state);
            // console.debug(distance, drag, direction);
            state.x.acceleration -= Math.sin(deg2rad(direction)) * drag * delta;
            state.y.acceleration += Math.cos(deg2rad(direction)) * drag * delta;
        }
    }

    state.x.step(delta);
    state.y.step(delta);
    state.rotation.step(delta);

    state.lastShot += delta;

    if (inputs.shooting && state.lastShot > 0.5) {
        world.shots.push(shoot(state));
        state.lastShot = 0;
    }
}

export const placeInAGrid = (canvas, width = 10, height = 8) => {
    const ships = [];
    const screenWidth = Number.parseInt(canvas.width);
    const screenHeight = Number.parseInt(canvas.height);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const state = {
                color: `#${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}`,
                x: new Acceleratable(randomInt(0, screenWidth)),
                y: new Acceleratable(randomInt(0, screenHeight)),
                rotation: new Acceleratable(randomInt(0, 360)),
                lastShot: 1000,
            };
            const desiredState = {
                ...state,
                x: new Acceleratable(x * screenWidth / 10 + 32),
                y: new Acceleratable(y * screenHeight / 8 + 32),
                rotation: new Acceleratable(-90),
            };
            const color = `#${'5,7,9,a,c,d,d,e,f'.split(',')[Math.floor(desiredState.x.value / (screenWidth / 8))]}${'6,7,8,9,b,e,b,8,6'.split(',')[Math.floor(desiredState.y.value / (screenHeight / 9))]}${'5,6,7,8,9,a,b,c,d'.split(',')[Math.floor(desiredState.y.value / (screenHeight / 9))]}`;
            state.color = color;
            desiredState.color = color;
            ships.push({
                state,
                desiredState,
            });
        }
    }
    return ships;
}

export const placeRandomly = (amount, x = 0, y = 0, width = 1024, height = 1024) => {
    const ships = [];
    for (let i = 0; i < amount; i++) {
        const state = {
            color: `#${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}`,
            x: new Acceleratable(randomInt(x, x + width)),
            y: new Acceleratable(randomInt(y, y + height)),
            rotation: new Acceleratable(randomInt(0, 359)),
        };
        const desiredState = {
            ...state,
            x: new Acceleratable(randomInt(x, x + width)),
            y: new Acceleratable(randomInt(y, y + height)),
            rotation: new Acceleratable(randomInt(0, 359)),
        };
        ships.push({
            state,
            desiredState,
        });
    }
    return ships;
};
