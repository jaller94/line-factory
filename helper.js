export class Acceleratable {
    constructor(value = 0, speed = 0, acceleration = 0) {
        this.value = value;
        this.speed = speed;
        this.acceleration = acceleration;
    }

    step(delta) {
        this.speed += this.acceleration * delta;
        this.value += this.speed * delta;
    }
}

/**
 * Degrees to Radians
 */
export const deg2rad = (deg) => {
    return (Math.PI / 180) * deg;
}

export const limit = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
}

export const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

export const withinRange = (value, target, range = 0) => {
    return value <= target + range && value >= target - range;
}

