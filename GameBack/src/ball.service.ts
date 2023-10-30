import { GameState } from "./GameState";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BallService {
    constructor(private gameState: GameState) {};

    update() {
        if ()
        this.gameState.ballPositon
    }
}