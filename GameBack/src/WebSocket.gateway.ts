import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketServer
} from '@nestjs/websockets';

import { WebSocketGateway } from '@nestjs/websockets';
import { subscribe } from 'diagnostics_channel';
import { Server, Socket } from 'socket.io';
import { Game, GAME_MODE } from './Game';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway(3001,{ cors: {
	origin: "http://localhost:5173",
	transports: ['websocket']
}})

export class WebSocketGatewayC implements OnGatewayConnection, OnGatewayDisconnect {
	
	@WebSocketServer() server: Server;

	constructor(private eventEmitter: EventEmitter2) {
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
			const roomNbr: number = this.roomsNbr + 1;
			socket1.join("room " + roomNbr.toString());
			socket2.join("room " + roomNbr.toString());
			this.server?.to("room " + roomNbr.toString()).emit('startGame', true);
			this.startGame(socket1, socket2, roomNbr);
		}
	};

	//start multiplayer game
	startGame(socket1: Socket, socket2: Socket, ID: number) {
		const game = new Game(socket1, socket2, this.server, this.eventEmitter, ID, GAME_MODE.MULTIPLAYER);
		this.games.set("room " + ID.toString(), game);
		game.gameLoop();
	};

	//start practice game
	@SubscribeMessage('startPractice')
	startPractice(socket: Socket) {
		console.log('wassuuuup')
		const game = new Game(socket, null, this.server, this.eventEmitter, 0, GAME_MODE.PRACTICE);
		socket.join("room " + socket.id);
		this.games.set("room " + socket.id, game);
		game.gameLoop();
	}

	@OnEvent('delete.game')
	deleteGame(room: string) {
		if (this.games.delete(room))
		{
			console.log('room is deleted');
			this.server.to(room).emit('GameResult', 'Player lost connection');
		}
		else
			console.log('room not found');
	};

	@OnEvent('left.won')
	leftPlayerWon(room: string) {
		console.log('left player won');
		if (this.games.delete(room))
			console.log('room is deleted');
		else
			console.log('room not found');
		this.server.to(room).emit('GameResult', 'Left Player Wins');
	};
	@OnEvent('right.won')
	rightPlayerWon(room: string) {
		console.log('right player won');
		if (this.games.delete(room))
			console.log('room is deleted');
		else
			console.log('room not found');
		this.server.to(room).emit('GameResult', 'Right Player Wins');
	};
	private queue: Socket[] = [];
	private games = new Map<string, Game>();
	private roomsNbr: number;
};