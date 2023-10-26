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
export class WebSocketGatewayC implements OnGatewayConnection {
    constructor(private player: PlayerService) {};


    handleConnection(client: any, ...args: any[]) {
        console.log("-------->", client.id);
    }

    @WebSocketServer() server: Server;

    @SubscribeMessage('message')
    sendMessage(client: any, payload: any): string {
        return ('You sent: ${payload}');
    }

    
    @SubscribeMessage('movePlayer')
    movePlayer(client: any, data: {direction: string}) {
        console.log('hello')
        const updatedPositions = this.player.movePlayer(client, data.direction);
        this.server.emit('PlayerPositionsUpdate', updatedPositions);
    }
}