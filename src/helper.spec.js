import {
    Acceleratable,
    deg2rad,
    directionOfActor,
    distance,
    distanceOfActors,
} from './helper';

describe('deg2rad', () => {
    test('0 -> 0', () => {
        expect(deg2rad(0)).toBe(0);
    });
    test('180 -> PI', () => {
        expect(deg2rad(180)).toBe(Math.PI);
    });
    test('360 -> 2 * PI', () => {
        expect(deg2rad(360)).toBe(2 * Math.PI);
    });
});

describe('directionOfActor', () => {
    test('returns 0 for north', () => {
        expect(directionOfActor(
            {
                x: new Acceleratable(0),
                y: new Acceleratable(0),
            },
            {
                x: new Acceleratable(0),
                y: new Acceleratable(-1),
            },
        )).toBe(0);
    });
    test('returns 90 for east', () => {
        expect(directionOfActor(
            {
                x: new Acceleratable(0),
                y: new Acceleratable(0),
            },
            {
                x: new Acceleratable(1),
                y: new Acceleratable(0),
            },
        )).toBe(90);
    });
    test('returns 180 for south', () => {
        expect(directionOfActor(
            {
                x: new Acceleratable(0),
                y: new Acceleratable(0),
            },
            {
                x: new Acceleratable(0),
                y: new Acceleratable(1),
            },
        )).toBe(180);
    });
    test('returns 270 for north', () => {
        expect(directionOfActor(
            {
                x: new Acceleratable(0),
                y: new Acceleratable(0),
            },
            {
                x: new Acceleratable(-1),
                y: new Acceleratable(0),
            },
        )).toBe(270);
    });
});

describe('distance', () =>{
    test('distances of zero', () => {
        expect(distance(0, 0, 0, 0)).toBe(0);
        expect(distance(1, 2, 1, 2)).toBe(0);
    });
    test('distances of one', () => {
        expect(distance(0, 0, 1, 0)).toBe(1);
        expect(distance(0, 0, 0, 1)).toBe(1);
        expect(distance(100, 0, 99, 0)).toBe(1);
        expect(distance(0, 112, 0, 111)).toBe(1);
    });
});

describe('distanceOfActors', () => {
    test('distances of one', () => {
        expect(distanceOfActors(
            {
                x: new Acceleratable(0),
                y: new Acceleratable(0),
            },
            {
                x: new Acceleratable(1),
                y: new Acceleratable(0),
            },
        )).toBe(1);
        expect(distanceOfActors(
            {
                x: new Acceleratable(0),
                y: new Acceleratable(0),
            },
            {
                x: new Acceleratable(0),
                y: new Acceleratable(-1),
            },
        )).toBe(1);
    });
});
