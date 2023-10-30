import { GameState } from "./GameState";
import {Vector} from "./GameState"
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerService {
    constructor(private gameState: GameState) {};
    
    movePlayer(client, direction: string) {
        let playerPositions = this.gameState.paddles;
        // console.log(direction)
        if (direction === 'UP' && playerPositions.y1 > 0)
        {
            playerPositions.y1 -= 20;
        }
        if (direction === 'DOWN'  && playerPositions.y1 + 100 < 600)
        {
            playerPositions.y1 += 20;
        }
        // console.log(playerPositions)
        return (playerPositions);
    }
}