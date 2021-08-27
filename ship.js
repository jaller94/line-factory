import { Acceleratable, deg2rad, limit, randomInt, randomItem, withinRange } from './helper.js';

export const AIDriver = (tank, desiredState) => {
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

export const draw = (ctx, ship) => {
    ctx.save();
    ctx.strokeStyle = ship.color;
    ctx.translate(ship.x.value, ship.y.value);
    ctx.rotate(deg2rad(ship.rotation.value + 90));
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

export const step = (ship, shipInputs, delta) => {
    ship.x.acceleration = Math.cos(deg2rad(ship.rotation.value)) * shipInputs.forward * 300;
    ship.y.acceleration = Math.sin(deg2rad(ship.rotation.value)) * shipInputs.forward * 300;
    ship.rotation.acceleration = shipInputs.turnRight * 1400;

    // Friction
    ship.x.speed *= 0.99;
    ship.y.speed *= 0.99;
    ship.rotation.speed *= 0.9;

    ship.x.step(delta);
    ship.y.step(delta);
    ship.rotation.step(delta);
}

export const placeInAGrid = (canvas, width = 10, height = 8) => {
    const tanks = [];
    const screenWidth = Number.parseInt(canvas.width);
    const screenHeight = Number.parseInt(canvas.height);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
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
    return tanks;
}

export const placeRandomly = (amount, x = 0, y = 0, width = 1024, height = 1024) => {
    const tanks = [];
    for (let i = 0; i < amount; i++) {
        const state = {
            color: `#${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}`,
            x: new Acceleratable(randomInt(x, x + width)),
            y: new Acceleratable(randomInt(y, y + height)),
            rotation: new Acceleratable(0),
            towerRotation: new Acceleratable(0),
        };
        const desiredState = {
            ...state,
            x: new Acceleratable(randomInt(x, x + width)),
            y: new Acceleratable(randomInt(y, y + height)),
            rotation: new Acceleratable(randomInt(0, 359)),
            towerRotation: new Acceleratable(randomInt(0, 359)),
        };
        const color = `#${'5,7,9,a,c,d,d,e,f'.split(',')[Math.floor(desiredState.x.value / (screenWidth / 8))]}${'6,7,8,9,b,e,b,8,6'.split(',')[Math.floor(desiredState.y.value / (screenHeight / 9))]}${'5,6,7,8,9,a,b,c,d'.split(',')[Math.floor(desiredState.y.value / (screenHeight / 9))]}`;
        state.color = color;
        desiredState.color = color;
        tanks.push({
            state,
            desiredState,
        });
    }
    return tanks;
};
