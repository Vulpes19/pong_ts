import { Socket, Server } from "socket.io";
import { EventEmitter2 } from "@nestjs/event-emitter";
export declare enum GAME_MODE {
    MULTIPLAYER = 0,
    PRACTICE = 1,
    MULTIPLAYER_POWERUPS = 2,
    PRACTICE_POWERUPS = 3
}
export declare class Game {
    private client1;
    private client2;
    private server;
    private eventEmitter;
    private ID;
    private mode;
    constructor(client1: Socket, client2: Socket | null, server: Server, eventEmitter: EventEmitter2, ID: number, mode: GAME_MODE);
    clean(): void;
    paddleMovement(): void;
    gameLoop(): void;
    powerUpsCollision(): void;
    updateBall(): void;
    AIpaddle(): void;
    endGame(): void;
    private room;
    private leftPaddlePosition;
    private rightPaddlePosition;
    private ballPosition;
    private ballVelocity;
    private score;
    private gameLoopInterval;
    private isPaddleSizeBig;
    private isPaddleSizeSmall;
    private isBallSpedUp;
    private finalPaddle;
}
