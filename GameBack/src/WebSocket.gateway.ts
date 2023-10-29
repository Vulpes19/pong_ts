import {
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketServer
} from '@nestjs/websockets';

import { WebSocketGateway } from '@nestjs/websockets';
import { PlayerService } from './player.service';
import { subscribe } from 'diagnostics_channel';
import { Server } from 'socket.io';

@WebSocketGateway(3001,{ cors: {
    origin: "http://localhost:5173",
    transports: ['websocket']
}})

export class WebSocketGatewayC {
    constructor(private player: PlayerService) {};

    @WebSocketServer() server: Server;

    @SubscribeMessage('message')
    sendMsg(client: any, data: string) {
        this.server.emit('msg', 'helooooooo');
    }
    
    @SubscribeMessage('movePlayer')
    movePlayer(client: any, direction: string) {
        const updatedPositions = this.player.movePlayer(client, direction);
        this.server.emit('PlayerPositionsUpdate', updatedPositions);
        return 'positions updated';
    }
}