export interface Vector {
    x: number,
    y: number
};

export class GameState {
    paddles: {y1: number, y2: number};
    // playerPositions: {paddle1: Vector, paddle2: Vector};
    ballPositon: {x: number, y: number};

    constructor() {
        this.paddles = {y1: 250, y2: 250};
        this.ballPositon = {x: 400, y: 300};
    };
}