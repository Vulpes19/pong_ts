import { Injectable } from "@nestjs/common";

export interface Vector {
    x: number,
    y: number
};
export const WIDTH = 800;
export const HEIGHT = 600;
export const paddle1X = 0;
export const paddle2X = 780;
export const paddleWidth = 25;
export const paddleHeight = 100;
export const resetBallPosition = {x: 400, y: 300};
export const ballRadius = 25;

@Injectable()
export class GameState {
    paddles: {y1: number, y2: number};
    // playerPositions: {paddle1: Vector, paddle2: Vector};
    ballPositon: {x: number, y: number};
    ballVelocity: {x: number, y: number};
    score: {paddle1: number, paddle2: number};

    constructor() {
        this.reset();
    };
    reset() {
        this.paddles = {y1: 250, y2: 250};
        this.ballPositon = resetBallPosition;
        this.ballVelocity = {x: 5, y: 5};
        this.score = {paddle1: 0, paddle2: 0};
    }
}