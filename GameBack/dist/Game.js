"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.GAME_MODE = void 0;
;
;
const WIDTH = 800;
const HEIGHT = 600;
const paddle1X = 0;
const paddle2X = 780;
const paddleWidth = 25;
const paddleHeight = 100;
const resetBallPosition = { x: 400, y: 300 };
const ballRadius = 25;
const FRAME_RATE = 1000 / 60;
const increasePowerUpPosition = { x: 390, y: 150 };
const decreasePowerUpPosition = { x: 390, y: 290 };
const speedPowerUpPosition = { x: 390, y: 450 };
const powerUpSize = 25;
var GAME_MODE;
(function (GAME_MODE) {
    GAME_MODE[GAME_MODE["MULTIPLAYER"] = 0] = "MULTIPLAYER";
    GAME_MODE[GAME_MODE["PRACTICE"] = 1] = "PRACTICE";
    GAME_MODE[GAME_MODE["MULTIPLAYER_POWERUPS"] = 2] = "MULTIPLAYER_POWERUPS";
    GAME_MODE[GAME_MODE["PRACTICE_POWERUPS"] = 3] = "PRACTICE_POWERUPS";
})(GAME_MODE || (exports.GAME_MODE = GAME_MODE = {}));
;
var PADDLE;
(function (PADDLE) {
    PADDLE[PADDLE["LEFT_PADDLE"] = 0] = "LEFT_PADDLE";
    PADDLE[PADDLE["RIGHT_PADDLE"] = 1] = "RIGHT_PADDLE";
    PADDLE[PADDLE["NONE"] = 2] = "NONE";
})(PADDLE || (PADDLE = {}));
;
class Game {
    constructor(client1, client2, server, eventEmitter, ID, mode) {
        this.client1 = client1;
        this.client2 = client2;
        this.server = server;
        this.eventEmitter = eventEmitter;
        this.ID = ID;
        this.mode = mode;
        this.isPaddleSizeBig = false;
        this.isPaddleSizeSmall = false;
        this.isBallSpedUp = false;
        if (ID && ID !== 0)
            this.room = "room " + ID.toString();
        else
            this.room = "room " + client1?.id;
        this.ballPosition = { x: 400, y: 300 };
        this.ballVelocity = { x: 5, y: 5 };
        this.score = { left: 0, right: 0 };
        this.leftPaddlePosition = 250;
        this.rightPaddlePosition = 250;
        this.finalPaddle = PADDLE.NONE;
        this.client1?.on('disconnect', () => {
            this.eventEmitter.emit('delete.game', this.room);
            this.clean();
            console.log('left paddle disconected');
        });
        if (this.client2 != null) {
            this.client2?.on('disconnect', () => {
                this.eventEmitter.emit('delete.game', this.room);
                this.clean();
                console.log('right paddle disconected');
            });
        }
        this.paddleMovement();
    }
    ;
    clean() {
        this.client1.removeAllListeners();
        this.client2.removeAllListeners();
        this.client1 = null;
        this.client2 = null;
        clearInterval(this.gameLoopInterval);
    }
    paddleMovement() {
        this.client1?.on('movePlayer', (direction) => {
            if (direction == 'UP' && this.leftPaddlePosition > 0)
                this.leftPaddlePosition -= 10;
            else if (direction == 'DOWN' && this.leftPaddlePosition + paddleHeight < HEIGHT)
                this.leftPaddlePosition += 10;
            this.server.to(this.room).emit('leftPlayerUpdate', this.leftPaddlePosition);
        });
        if (this.mode === GAME_MODE.MULTIPLAYER) {
            this.client2?.on('movePlayer', (direction) => {
                if (direction == 'UP' && this.rightPaddlePosition > 0)
                    this.rightPaddlePosition -= 10;
                else if (direction == 'DOWN' && this.rightPaddlePosition + paddleHeight < HEIGHT)
                    this.rightPaddlePosition += 10;
                this.server.to(this.room).emit('rightPlayerUpdate', this.rightPaddlePosition);
            });
        }
    }
    ;
    gameLoop() {
        this.gameLoopInterval = setInterval(this.updateBall.bind(this), FRAME_RATE);
    }
    ;
    powerUpsCollision() {
        if (increasePowerUpPosition.x >= this.ballPosition.x && increasePowerUpPosition.x + powerUpSize <= this.ballPosition.x + ballRadius) {
            if (increasePowerUpPosition.y >= this.ballPosition.y && increasePowerUpPosition.y + powerUpSize <= this.ballPosition.y + ballRadius && this.isPaddleSizeBig === false) {
                console.log('yo biatch1');
                switch (this.finalPaddle) {
                    case PADDLE.LEFT_PADDLE:
                        this.server.to(this.room).emit('increaseSize', 'leftPaddle');
                    case PADDLE.RIGHT_PADDLE:
                        this.server.to(this.room).emit('increaseSize', 'rightPaddle');
                }
                this.isPaddleSizeBig = true;
            }
            else if (decreasePowerUpPosition.y >= this.ballPosition.y && decreasePowerUpPosition.y + powerUpSize <= this.ballPosition.y + ballRadius && this.isPaddleSizeSmall === false) {
                console.log('yo biatch2');
                switch (this.finalPaddle) {
                    case PADDLE.LEFT_PADDLE:
                        this.server.to(this.room).emit('decreaseSize', 'leftPaddle');
                    case PADDLE.RIGHT_PADDLE:
                        this.server.to(this.room).emit('decreaseSize', 'rightPaddle');
                }
                this.isPaddleSizeSmall = true;
            }
            else if (speedPowerUpPosition.y >= this.ballPosition.y && speedPowerUpPosition.y + powerUpSize <= this.ballPosition.y + ballRadius && this.isBallSpedUp === false) {
                console.log('yo biatch3');
                this.server.to(this.room).emit('speed');
                this.isBallSpedUp = true;
                this.ballVelocity.x += 4;
                this.ballVelocity.y += 4;
            }
        }
    }
    updateBall() {
        if (this.ballPosition.y < 0 ||
            this.ballPosition.y + ballRadius >= HEIGHT) {
            this.ballVelocity.y = -this.ballVelocity.y;
        }
        else if (this.ballPosition.x + ballRadius < 0) {
            this.ballVelocity.x = -this.ballVelocity.x;
            this.score.right += 1;
            this.ballPosition.x = resetBallPosition.x;
            this.ballPosition.y = resetBallPosition.y;
            this.server.to(this.room).emit('rightScoreUpdate', this.score.right);
        }
        else if (this.ballPosition.x > WIDTH) {
            this.ballVelocity.x = -this.ballVelocity.x;
            this.score.left += 1;
            this.ballPosition.x = resetBallPosition.x;
            this.ballPosition.y = resetBallPosition.y;
            this.server.to(this.room).emit('leftScoreUpdate', this.score.left);
        }
        else if ((this.ballPosition.y >= this.leftPaddlePosition &&
            this.ballPosition.y <= this.leftPaddlePosition + paddleHeight &&
            this.ballPosition.x < paddle1X + paddleWidth)) {
            this.finalPaddle = PADDLE.LEFT_PADDLE;
            this.ballVelocity.x = -this.ballVelocity.x;
        }
        else if (this.ballPosition.y >= this.rightPaddlePosition &&
            this.ballPosition.y <= this.rightPaddlePosition + paddleHeight &&
            this.ballPosition.x + ballRadius >= paddle2X) {
            this.finalPaddle = PADDLE.RIGHT_PADDLE;
            this.ballVelocity.x = -this.ballVelocity.x;
        }
        if (this.mode === GAME_MODE.PRACTICE || this.mode === GAME_MODE.PRACTICE_POWERUPS)
            this.AIpaddle();
        if (this.mode === GAME_MODE.MULTIPLAYER_POWERUPS || this.mode === GAME_MODE.PRACTICE_POWERUPS)
            this.powerUpsCollision();
        this.ballPosition.x = this.ballPosition.x + this.ballVelocity.x;
        this.ballPosition.y = this.ballPosition.y + this.ballVelocity.y;
        this.endGame();
        this.server.to(this.room).emit('ballUpdate', this.ballPosition);
    }
    ;
    AIpaddle() {
        let ballY = this.ballPosition.y;
        if (ballY > this.rightPaddlePosition && this.rightPaddlePosition + paddleHeight < HEIGHT)
            this.rightPaddlePosition += 10;
        else if (ballY < this.rightPaddlePosition && this.rightPaddlePosition > 0)
            this.rightPaddlePosition -= 10;
        this.server.to(this.room).emit('rightPlayerUpdate', this.rightPaddlePosition);
    }
    ;
    endGame() {
        if (this.score.left >= 10) {
            this.eventEmitter.emit('left.won', this.room);
            this.clean();
        }
        else if (this.score.right >= 10) {
            this.eventEmitter.emit('right.won', this.room);
            this.clean();
        }
    }
    ;
}
exports.Game = Game;
;
//# sourceMappingURL=Game.js.map