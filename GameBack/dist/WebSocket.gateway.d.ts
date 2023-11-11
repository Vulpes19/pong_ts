import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GAME_MODE } from './Game';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class WebSocketGatewayC implements OnGatewayConnection, OnGatewayDisconnect {
    private eventEmitter;
    server: Server;
    constructor(eventEmitter: EventEmitter2);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    getGameMode(client: Socket, gameMode: string): void;
    matchmaking(): void;
    startGame(socket1: Socket, socket2: Socket, ID: number, gameMode: GAME_MODE): void;
    startPractice(socket: Socket, gameMode: string): void;
    deleteGame(room: string): void;
    leftPlayerWon(room: string): void;
    rightPlayerWon(room: string): void;
    private queueDefault;
    private queuePowerUps;
    private games;
    private roomsNbr;
}
