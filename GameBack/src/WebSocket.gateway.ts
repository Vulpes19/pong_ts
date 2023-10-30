import {
    OnGatewayConnection,
    OnGatewayDisconnect,
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

export class WebSocketGatewayC implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private player: PlayerService) {};

    handleConnection(client: any, ...args: any[]) {
        console.log(client.id)
    }
    handleDisconnect(client: any) {
        console.log("hello", client.id)
    }

    @WebSocketServer() server: Server;

    @SubscribeMessage('message')
    sendMsg(client: any, data: string) {
        this.server.emit('msg', 'helooooooo');
    }
    
    @SubscribeMessage('movePlayer')
    movePlayer(client: any, direction: string) {
        console.log('movePlayer');
        const updatedPositions = this.player.movePlayer(client, direction);
        this.server.emit('PlayerPositionsUpdate', updatedPositions);
        return 'positions updated';
    }
}