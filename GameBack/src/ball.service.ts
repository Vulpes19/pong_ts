import { GameState } from "./GameState";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BallService {
    constructor(private gameState: GameState) {};

    update() {
        const updatedBallPosition = this.gameState.ballPositon;
        const updatedBallVelocity = this.gameState.ballVelocity;
        if (updatedBallPosition.y < 0 || 
            updatedBallPosition.y + 20 > 600)
        {
            updatedBallVelocity.y = -updatedBallVelocity.y;
        }
        if (updatedBallPosition.x < 0 || 
            updatedBallPosition.x + 20 > 800)
        {
            updatedBallVelocity.x = -updatedBallVelocity.x;
        }
        updatedBallPosition.x = updatedBallPosition.x + updatedBallVelocity.x;
        updatedBallPosition.y = updatedBallPosition.y + updatedBallVelocity.y;
        // console.log(updatedBallPosition);
        return (updatedBallPosition);
    }
}