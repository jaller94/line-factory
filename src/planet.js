import { Acceleratable, deg2rad, limit, randomInt } from './helper.js';

export const draw = (ctx, state) => {
    ctx.save();
    ctx.strokeStyle = state.color;
    ctx.translate(state.x.value, state.y.value);
    ctx.rotate(deg2rad(state.rotation.value));
    // Outer surface
    ctx.beginPath();
    ctx.moveTo(Math.sin(deg2rad(0)) * state.size + limit(30 * Math.sin((state.seed + 0) * 0.2), -30, 30), Math.cos(deg2rad(0)) * state.size);
    for (let i = 0.5; i < 360; i += 0.5) {
        ctx.lineTo(Math.sin(deg2rad(i)) * state.size + limit(30 * Math.sin((state.seed + i) * 0.2), -30, 30), Math.cos(deg2rad(i)) * state.size) + limit(4 * Math.sin((state.seed + i) * 234), -3, 3);
    }
    ctx.closePath();
    ctx.stroke();
    // Inner pattern
    ctx.clip();
    ctx.beginPath();
    for (let x = -state.size / 10; x < state.size / 10; x++) {
        ctx.moveTo(x * 10, -1000);
        ctx.lineTo(x * 10, 1000);
    }
    ctx.stroke();
    ctx.restore();
}

export const step = (state, delta) => {
    state.x.step(delta);
    state.y.step(delta);
    state.rotation.step(delta);
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
