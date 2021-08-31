import { Acceleratable, deg2rad, limit, randomInt, randomItem } from './helper.js';

export const draw = (ctx, ship) => {
    ctx.save();
    ctx.strokeStyle = ship.color;
    ctx.translate(ship.x.value, ship.y.value);
    ctx.rotate(deg2rad(ship.rotation.value));
    ctx.beginPath();
    const i2 = 0;
    ctx.moveTo(Math.sin(deg2rad(i2)) * ship.size + limit(30 * Math.sin((ship.seed + i2) * 0.2), -30, 30), Math.cos(deg2rad(i2)) * ship.size);
    for (let i = 0; i < 360; i += 0.1) {
        ctx.lineTo(Math.sin(deg2rad(i)) * ship.size + limit(30 * Math.sin((ship.seed + i) * 0.2), -30, 30), Math.cos(deg2rad(i)) * ship.size) + limit(4 * Math.sin((ship.seed + i) * 234), -3, 3);
    }
    ctx.lineTo(Math.sin(deg2rad(i2)) * ship.size + limit(30 * Math.sin((ship.seed + i2) * 0.2), -30, 30), Math.cos(deg2rad(i2)) * ship.size);
    ctx.closePath();
    ctx.stroke();
    ctx.clip();
    ctx.beginPath();
    for (let x = -ship.size / 10; x < ship.size / 10; x++) {
        ctx.moveTo(x * 10, -1000);
        ctx.lineTo(x * 10, 1000);
    }
    ctx.stroke();
    ctx.restore();
}

export const step = (ship, shipInputs, delta) => {
    ship.x.step(delta);
    ship.y.step(delta);
    ship.rotation.step(delta);
}

export const place = (amount, x = 0, y = 0, width = 1024, height = 1024) => {
    const planet = [];
    for (let i = 0; i < amount; i++) {
        const state = {
            color: `#fff`,
            x: new Acceleratable(4000),
            y: new Acceleratable(0),
            rotation: new Acceleratable(randomInt(0, 359)),
            seed: Math.random() * 1000,
            size: 1000,
            mass: 10000000000,
        };
        planet.push({
            state,
        });
    }
    return planet;
};
