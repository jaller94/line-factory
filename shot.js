import { Acceleratable, deg2rad, limit, randomInt, randomItem } from './helper.js';

export const draw = (ctx, shot) => {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.translate(shot.x.value, shot.y.value);
    ctx.rotate(deg2rad(shot.rotation.value));
    // Base
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.restore();
}

export const shoot = (tank) => {
    const shot = {
        active: true,
        state: {
            x: new Acceleratable(tank.x.value, tank.x.speed + Math.sin(deg2rad(90 + tank.rotation.value)) * 300),
            y: new Acceleratable(tank.y.value, tank.y.speed - Math.cos(deg2rad(90 + tank.rotation.value)) * 300),
            rotation: new Acceleratable(tank.rotation.value),
        },
    };
    setTimeout(() => shot.active = false, 10000);
    return shot;
};

export const step = (ship, shipInputs, delta) => {
    ship.x.step(delta);
    ship.y.step(delta);
    ship.rotation.step(delta);
}
