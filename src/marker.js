import { deg2rad, directionOfActor, limit } from './helper.js';

export const draw = (ctx, state, origin) => {
    const direction = directionOfActor(origin, state);
    ctx.save();
    ctx.translate(origin.x.value, origin.y.value);
    ctx.translate(Math.sin(deg2rad(direction)) * 50, -Math.cos(deg2rad(direction)) * 50);
    ctx.fillStyle = 'orange';
    ctx.fillRect(-2.5, -2.5, 5, 5);
    ctx.restore();
}
