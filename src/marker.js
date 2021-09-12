import { deg2rad, directionOfActor, distanceOfActors, limit } from './helper.js';

export const draw = (ctx, targetState, originState) => {
    const direction = directionOfActor(originState, targetState);
    const distance = distanceOfActors(originState, targetState);
    const radius = limit(3 - Math.log(distance / 1000), 0, 3); 
    ctx.save();
    ctx.translate(originState.x.value, originState.y.value);
    ctx.translate(Math.sin(deg2rad(direction)) * 50, -Math.cos(deg2rad(direction)) * 50);
    ctx.fillStyle = targetState.color;
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}
