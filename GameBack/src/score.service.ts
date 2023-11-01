import { GameState } from "./GameState";
import { Injectable } from "@nestjs/common";


export enum paddles {
    paddle1,
    paddle2
};

@Injectable()

export class ScoreService {
    constructor(private gameState: GameState) {};

    updateScore(paddle: paddles) {
        const score = this.gameState.score;
        if (paddle === paddles.paddle1)
            score.paddle1 += 1;
        else if (paddle === paddles.paddle2)
            score.paddle2 += 1;
    }
    getScore() {
        const score = this.gameState.score;
        return (score);
    }
};