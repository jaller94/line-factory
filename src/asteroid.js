import { Acceleratable, deg2rad, limit, randomInt, randomItem } from './helper.js';

export const draw = (ctx, ship) => {
    ctx.save();
    ctx.strokeStyle = ship.color;
    ctx.translate(ship.x.value, ship.y.value);
    ctx.rotate(deg2rad(ship.rotation.value));
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 40) {
        ctx.lineTo(Math.sin(deg2rad(i)) * 12 + limit(4 * Math.sin((ship.seed + i) * 100), -3, 3), Math.cos(deg2rad(i)) * 12) + limit(4 * Math.sin((ship.seed + i) * 234), -3, 3);
    }
    ctx.closePath()
    ctx.stroke();
    ctx.restore();
}

export const drawAll = (ctx, asteroids) => {
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    for (const asteroid of asteroids) {
        const { state } = asteroid;
        ctx.save();
        ctx.translate(state.x.value, state.y.value);
        ctx.rotate(deg2rad(state.rotation.value));
        
        ctx.moveTo(Math.sin(0) * 12 + limit(4 * Math.sin(state.seed), -3, 3), Math.cos(0) * 12);
        for (let i = 40; i < 360; i += 40) {
            ctx.lineTo(Math.sin(deg2rad(i)) * 12 + limit(4 * Math.sin(state.seed + i * state.seed * 1.2321), -3, 3), Math.cos(deg2rad(i)) * 12) + limit(4 * Math.sin(state.seed + i * state.seed * 1.523), -3, 3);
        }
        ctx.lineTo(Math.sin(0) * 12 + limit(4 * Math.sin(state.seed), -3, 3), Math.cos(0) * 12);

        ctx.restore();
    }
    ctx.stroke();
}

export const step = (ship, shipInputs, delta) => {
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
            color: `#fff`,
            x: new Acceleratable(randomInt(x * width, x * width + width), randomInt(-7, 7)),
            y: new Acceleratable(randomInt(y * height, y * height + height, 700), randomInt(-7, 7)),
            rotation: new Acceleratable(randomInt(0, 359)),
            seed: Math.random() * 1000,
        };
        tanks.push({
            state,
        });
    }
    return tanks;
};
