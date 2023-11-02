import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketServer
} from '@nestjs/websockets';

import { WebSocketGateway } from '@nestjs/websockets';
import { subscribe } from 'diagnostics_channel';
import { Server, Socket } from 'socket.io';
import { Game } from './Game';

@WebSocketGateway(3001,{ cors: {
	origin: "http://localhost:5173",
	transports: ['websocket']
}})

export class WebSocketGatewayC implements OnGatewayConnection, OnGatewayDisconnect {
	
	@WebSocketServer() server: Server;

	constructor() {
		this.roomsNbr = 0;
		setInterval(this.matchmaking.bind(this), 2000);
	};

	handleConnection(client: Socket) {
		console.log('client: ', client.id, ' has connected');
		this.queue.push(client);
	}
	handleDisconnect(client: Socket) {
		console.log('client: ', client.id, ' has disconnected');
		const index = this.queue?.indexOf(client);
		if (index !== -1)
			this.queue.splice(index, 1);
	}

	matchmaking() {
		// console.log('Im in matchmaking', this.queue?.length);
		if (this.queue?.length >= 2)
		{
			console.log('found a match !');
			const socket1: Socket = this.queue.pop();
			const socket2: Socket = this.queue.pop();
			const roomNbr = this.roomsNbr + 1;
			socket1.join("room " + roomNbr.toString());
			socket2.join("room " + roomNbr.toString());
			this.server?.to("room " + roomNbr.toString()).emit('startGame', true);
			this.startGame(socket1, socket2, roomNbr);
		}
	};

	startGame(socket1: Socket, socket2: Socket, ID: number) {
		const game = new Game(socket1, socket2, this.server, ID);
		this.games.set("room " + ID.toString(), game);
		game.gameLoop();
	};

	private queue: Socket[] = [];
	private games = new Map<string, Game>();
	private roomsNbr: number;
};