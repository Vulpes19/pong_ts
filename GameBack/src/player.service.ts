import { GameState } from "./GameState";

import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerService {
    constructor(private gameState: GameState) {};
    
    movePlayer(client, direction: string) {
        let playerPositions = this.gameState.playerPositions;
        if (direction === 'UP')
        {
            playerPositions.paddle1 -= 10;
        }
        if (direction === 'DOWN')
        {
            playerPositions.paddle2 += 10;
        }
        return (playerPositions);
    }
}