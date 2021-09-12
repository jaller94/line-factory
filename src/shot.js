import { Acceleratable, deg2rad } from './helper.js';

export const draw = (ctx, state) => {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.translate(state.x.value, state.y.value);
    ctx.rotate(deg2rad(state.rotation.value));
    // Base
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.restore();
}

export const shoot = (originState) => {
    const shot = {
        active: true,
        state: {
            x: new Acceleratable(originState.x.value, originState.x.speed + Math.sin(deg2rad(90 + originState.rotation.value)) * 300),
            y: new Acceleratable(originState.y.value, originState.y.speed - Math.cos(deg2rad(90 + originState.rotation.value)) * 300),
            rotation: new Acceleratable(originState.rotation.value),
        },
    };
    setTimeout(() => shot.active = false, 10000);
    return shot;
};

export const step = (state, delta) => {
    state.x.step(delta);
    state.y.step(delta);
    state.rotation.step(delta);
}
