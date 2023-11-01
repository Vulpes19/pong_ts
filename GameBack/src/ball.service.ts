import { GameState, paddle1X, paddle2X, paddleHeight, paddleWidth, WIDTH, HEIGHT, resetBallPosition, ballRadius } from "./GameState";
import { Injectable } from "@nestjs/common";
import { ScoreService } from "./score.service";
import { paddles } from "./score.service";
@Injectable()
export class BallService {
    constructor(private gameState: GameState, private score: ScoreService) {};

    update() {
        const updatedBallPosition = this.gameState.ballPositon;
        const updatedBallVelocity = this.gameState.ballVelocity;
        if (updatedBallPosition.y < 0 || 
            updatedBallPosition.y + ballRadius > HEIGHT)
        {
            updatedBallVelocity.y = -updatedBallVelocity.y;
        }
        else if (updatedBallPosition.x < 0)
        {
            updatedBallVelocity.x = -updatedBallVelocity.x;
            this.score.updateScore(paddles.paddle2);
            updatedBallPosition.x = resetBallPosition.x;
            updatedBallPosition.y = resetBallPosition.y;
        }
        else if (updatedBallPosition.x + ballRadius > WIDTH)
        {
            updatedBallVelocity.x = -updatedBallVelocity.x;
            this.score.updateScore(paddles.paddle1);
            updatedBallPosition.x = resetBallPosition.x;
            updatedBallPosition.y = resetBallPosition.y;
        }
        else if (updatedBallPosition.y >= this.gameState.paddles.y1 &&
            updatedBallPosition.y <= this.gameState.paddles.y1 + paddleHeight &&
            updatedBallPosition.x < paddle1X + paddleWidth)
        {
            updatedBallVelocity.x = -updatedBallVelocity.x;
        }
        updatedBallPosition.x = updatedBallPosition.x + updatedBallVelocity.x;
        updatedBallPosition.y = updatedBallPosition.y + updatedBallVelocity.y;
        return (updatedBallPosition);
    }
}