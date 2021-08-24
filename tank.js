import { Acceleratable, deg2rad, limit, randomInt, randomItem, withinRange } from './helper.js';

export const tankAIDriver = (tank, desiredState) => {
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

export const drawTank = (ctx, tank) => {
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

export const stepTank = (tank, tankInputs, delta) => {
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

export const placeTanksInAGrid = (canvas) => {
    const tanks = [];
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
    return tanks;
}

export const placeTanksRandomly = (canvas, amount) => {
    const tanks = [];
    const screenWidth = Number.parseInt(canvas.width);
    const screenHeight = Number.parseInt(canvas.height);
    for (let i = 0; i < amount; i++) {
        const state = {
            color: `#${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}${randomItem('5,7,9,a,c,d,d,e,f'.split(','))}`,
            x: new Acceleratable(randomInt(0, screenWidth)),
            y: new Acceleratable(randomInt(0, screenHeight)),
            rotation: new Acceleratable(0),
            towerRotation: new Acceleratable(0),
        };
        const desiredState = {
            ...state,
            x: new Acceleratable(randomInt(0, screenWidth)),
            y: new Acceleratable(randomInt(0, screenWidth)),
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
