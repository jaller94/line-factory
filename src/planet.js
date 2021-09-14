import { Acceleratable, deg2rad, limit, randomInt } from './helper.js';

const maxHill = 30;

const surface = (size, seed, deg) => {
    let hill = limit(maxHill * Math.sin((seed + deg) / (2 * Math.PI)), 0.9 * -maxHill, 0.9 * maxHill);
    hill += maxHill / 3 * Math.sin((seed * 2 + deg + 34));
    hill += maxHill / 4 * Math.sin((seed * 2 + deg));
    hill += maxHill / 5 * Math.sin(((seed * 3 + deg + 128) * 1.6));
    hill += maxHill / 7 * Math.sin(((seed * 3 + deg + 56) * 3.2));
    return size + hill;
};

export const draw = (ctx, state) => {
    ctx.save();
    ctx.strokeStyle = state.color;
    ctx.translate(state.x.value, state.y.value);
    ctx.rotate(deg2rad(state.rotation.value));
    // Outer surface
    ctx.beginPath();
    for (let i = 0; i < 360; i += 0.5) {
        const dist = surface(state.size, state.seed, i);
        ctx.lineTo(Math.sin(deg2rad(i)) * dist, Math.cos(deg2rad(i)) * dist);
    }
    ctx.closePath();
    ctx.stroke();
    // Inner pattern
    ctx.clip();
    ctx.beginPath();
    for (let x = (-state.size - maxHill) / 10; x < (state.size + maxHill) / 10; x++) {
        ctx.moveTo(x * 10, -state.size - maxHill);
        ctx.lineTo(x * 10, state.size + maxHill);
    }
    ctx.stroke();
    ctx.restore();
}

export const step = (state, delta) => {
    state.x.step(delta);
    state.y.step(delta);
    state.rotation.step(delta);
}

export const place = (x = 0, y = 0, color = '#faa') => {
    return {
        state: {
            color,
            x: new Acceleratable(x),
            y: new Acceleratable(y),
            rotation: new Acceleratable(randomInt(0, 359)),
            seed: Math.random() * 1000,
            size: 1000,
            mass: 10000000000,
        },
    };
};
