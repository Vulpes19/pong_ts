import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketServer
} from '@nestjs/websockets';

import { WebSocketGateway } from '@nestjs/websockets';
import { PlayerService } from './player.service';
import { BallService } from './ball.service';
import { ScoreService } from './score.service';
import { subscribe } from 'diagnostics_channel';
import { Server } from 'socket.io';

@WebSocketGateway(3001,{ cors: {
    origin: "http://localhost:5173",
    transports: ['websocket']
}})

export class WebSocketGatewayC implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private player: PlayerService, private ball: BallService, private score: ScoreService) {};

    handleConnection(client: any, ...args: any[]) {
        console.log(client.id)
        console.log('client: ', client.id, ' has connected');
    }
    handleDisconnect(client: any) {
        console.log('client: ', client.id, ' has disconnected');
    }

    @WebSocketServer() server: Server;

    @SubscribeMessage('message')
    sendMsg(client: any, data: string) {
        this.server.emit('msg', 'helooooooo');
    }
    
    @SubscribeMessage('movePlayer')
    movePlayer(client: any, direction: string) {
        // console.log('movePlayer');
        const updatedPositions = this.player.movePlayer(client, direction);
        this.server.emit('PlayerPositionsUpdate', updatedPositions);
        return 'positions updated';
    }

    @SubscribeMessage('updateBall')
    updateBall(client: any) {
        const updatedBall = this.ball.update();
        this.server.emit('BallPositionUpdate', updatedBall);
    }
    @SubscribeMessage('updateScore')
    updateScore(client: any) {
        const updatedScore = this.score.getScore();
        this.server.emit('scoreUpdate', updatedScore);
    }
}