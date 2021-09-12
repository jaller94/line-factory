import { Acceleratable, deg2rad, limit, randomInt } from './helper.js';

export const draw = (ctx, state) => {
    ctx.save();
    ctx.strokeStyle = state.color;
    const maxHill = 30;
    ctx.translate(state.x.value, state.y.value);
    ctx.rotate(deg2rad(state.rotation.value));
    // Outer surface
    ctx.beginPath();
    for (let i = 0; i < 360; i += 0.5) {
        let hill = limit(maxHill * Math.sin((state.seed + i) / (2 * Math.PI)), 0.9 * -maxHill, 0.9 * maxHill);
        hill += maxHill / 3 * Math.sin((state.seed * 2 + i + 34));
        hill += maxHill / 4 * Math.sin((state.seed * 2 + i));
        hill += maxHill / 5 * Math.sin(((state.seed * 3 + i + 128) * 1.6));
        hill += maxHill / 7 * Math.sin(((state.seed * 3 + i + 56) * 3.2));
        const x = Math.sin(deg2rad(i)) * state.size + Math.sin(deg2rad(i)) * hill;
        const y = Math.cos(deg2rad(i)) * state.size + Math.cos(deg2rad(i)) * hill;
        ctx.lineTo(x, y);
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
