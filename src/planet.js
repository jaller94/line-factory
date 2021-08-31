import { Acceleratable, deg2rad, limit, randomInt, randomItem } from './helper.js';

export const draw = (ctx, planet) => {
    ctx.save();
    ctx.strokeStyle = planet.color;
    ctx.translate(planet.x.value, planet.y.value);
    ctx.rotate(deg2rad(planet.rotation.value));
    // Outer surface
    ctx.beginPath();
    const i2 = 0;
    ctx.moveTo(Math.sin(deg2rad(i2)) * planet.size + limit(30 * Math.sin((planet.seed + i2) * 0.2), -30, 30), Math.cos(deg2rad(i2)) * planet.size);
    for (let i = 0.5; i < 360; i += 0.5) {
        ctx.lineTo(Math.sin(deg2rad(i)) * planet.size + limit(30 * Math.sin((planet.seed + i) * 0.2), -30, 30), Math.cos(deg2rad(i)) * planet.size) + limit(4 * Math.sin((planet.seed + i) * 234), -3, 3);
    }
    ctx.closePath();
    ctx.stroke();
    // Inner pattern
    ctx.clip();
    ctx.beginPath();
    for (let x = -planet.size / 10; x < planet.size / 10; x++) {
        ctx.moveTo(x * 10, -1000);
        ctx.lineTo(x * 10, 1000);
    }
    ctx.stroke();
    ctx.restore();
}

export const step = (planet, planetInputs, delta) => {
    planet.x.step(delta);
    planet.y.step(delta);
    planet.rotation.step(delta);
}

export const place = (x = 0, y = 0) => {
    return {
        state: {
            color: `#faa`,
            x: new Acceleratable(x),
            y: new Acceleratable(y),
            rotation: new Acceleratable(randomInt(0, 359)),
            seed: Math.random() * 1000,
            size: 1000,
            mass: 10000000000,
        },
    };
};
