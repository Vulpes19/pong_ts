"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketGatewayC = void 0;
const websockets_1 = require("@nestjs/websockets");
const websockets_2 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const Game_1 = require("./Game");
const event_emitter_1 = require("@nestjs/event-emitter");
let WebSocketGatewayC = class WebSocketGatewayC {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.queueDefault = [];
        this.queuePowerUps = [];
        this.games = new Map();
        this.roomsNbr = 0;
        setInterval(this.matchmaking.bind(this), 2000);
    }
    ;
    handleConnection(client) {
        console.log('client: ', client.id, ' has connected');
    }
    handleDisconnect(client) {
        console.log('client: ', client.id, ' has disconnected');
        let index = this.queueDefault?.indexOf(client);
        if (index !== -1) {
            this.queueDefault.splice(index, 1);
            return;
        }
        index = this.queuePowerUps?.indexOf(client);
        if (index !== -1) {
            this.queuePowerUps.splice(index, 1);
            return;
        }
    }
    getGameMode(client, gameMode) {
        if (gameMode === 'defaultGame')
            this.queueDefault.push(client);
        else if (gameMode == 'powerUpGame')
            this.queuePowerUps.push(client);
    }
    matchmaking() {
        let gameMode = Game_1.GAME_MODE.MULTIPLAYER;
        let queue = null;
        if (this.queueDefault?.length >= 2) {
            queue = this.queueDefault;
            console.log('DEFAULT GAME MODE');
        }
        if (this.queuePowerUps?.length >= 2) {
            queue = this.queuePowerUps;
            gameMode = Game_1.GAME_MODE.MULTIPLAYER_POWERUPS;
            console.log('POWER UP GAME MODE');
        }
        if (queue) {
            console.log('found a match !');
            const socket1 = queue.pop();
            const socket2 = queue.pop();
            const roomNbr = this.roomsNbr + 1;
            socket1.join("room " + roomNbr.toString());
            socket2.join("room " + roomNbr.toString());
            this.server?.to("room " + roomNbr.toString()).emit('startGame', true);
            this.startGame(socket1, socket2, roomNbr, gameMode);
        }
    }
    ;
    startGame(socket1, socket2, ID, gameMode) {
        const game = new Game_1.Game(socket1, socket2, this.server, this.eventEmitter, ID, gameMode);
        this.games.set("room " + ID.toString(), game);
        game.gameLoop();
    }
    ;
    startPractice(socket, gameMode) {
        let mode = Game_1.GAME_MODE.PRACTICE;
        if (gameMode === 'powerUpGame') {
            console.log('power uuup');
            mode = Game_1.GAME_MODE.PRACTICE_POWERUPS;
        }
        const game = new Game_1.Game(socket, null, this.server, this.eventEmitter, 0, mode);
        socket.join("room " + socket.id);
        this.games.set("room " + socket.id, game);
        game.gameLoop();
    }
    deleteGame(room) {
        if (this.games.delete(room)) {
            console.log('room is deleted');
            this.server.to(room).emit('GameResult', 'Player lost connection');
        }
        else
            console.log('room not found');
    }
    ;
    leftPlayerWon(room) {
        console.log('left player won');
        if (this.games.delete(room))
            console.log('room is deleted');
        else
            console.log('room not found');
        this.server.to(room).emit('GameResult', 'Left Player Wins');
    }
    ;
    rightPlayerWon(room) {
        console.log('right player won');
        if (this.games.delete(room))
            console.log('room is deleted');
        else
            console.log('room not found');
        this.server.to(room).emit('GameResult', 'Right Player Wins');
    }
    ;
};
exports.WebSocketGatewayC = WebSocketGatewayC;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketGatewayC.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('gameMode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayC.prototype, "getGameMode", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('startPractice'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayC.prototype, "startPractice", null);
__decorate([
    (0, event_emitter_1.OnEvent)('delete.game'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayC.prototype, "deleteGame", null);
__decorate([
    (0, event_emitter_1.OnEvent)('left.won'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayC.prototype, "leftPlayerWon", null);
__decorate([
    (0, event_emitter_1.OnEvent)('right.won'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayC.prototype, "rightPlayerWon", null);
exports.WebSocketGatewayC = WebSocketGatewayC = __decorate([
    (0, websockets_2.WebSocketGateway)(3001, { cors: {
            origin: "http://localhost:5173",
            transports: ['websocket']
        } }),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], WebSocketGatewayC);
;
//# sourceMappingURL=WebSocket.gateway.js.map