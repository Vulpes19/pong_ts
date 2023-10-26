export class GameState {
    playerPositions: {paddle1: number, paddle2: number};
    ballPositon: {x: number, y: number};

    constructor() {
        this.playerPositions = {paddle1: 250, paddle2: 250};
        this.ballPositon = {x: 400, y: 300};
    };
}