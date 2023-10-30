import { KeyboardEventHandler, useEffect, useRef } from "react";
import { useState } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import Konva from "konva";
import io from 'socket.io-client';
import { playerStore, ballStore, scoreStore, socketStore } from "./Stores";


interface Textures {
	ballTexture: HTMLImageElement,
	paddleTexture: HTMLImageElement 
};

const WIDTH: number = 800;
const HEIGHT: number = 600;

function App() {
	const textures: Textures = {
		ballTexture: new window.Image,
		paddleTexture: new window.Image,
	}
	const {paddle1, paddle2, movePaddle1, movePaddle2} = playerStore();
	const {ballPosition, ballVelocity, update, setVelX, setVelY} = ballStore();
	const {paddle1Score, paddle2Score, updatePaddle1Score, updatePaddle2Score} = scoreStore();
	const {socket, connect, send, receive, disconnect} = socketStore();
	const [isRunning, setRunning] = useState<boolean>(true);
	const [count, setCount] = useState<number>(3);
	// const [msg, setMsg] = useState<boolean>(false);
	const [testMsg, setTestMsg] = useState<string>();

	textures.paddleTexture.src = 'assets/paddle.png';
	textures.ballTexture.src = 'assets/ball.png';
	useEffect( () => {
		connect();
	}, []);
	const handleMovement = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp' && paddle1.y > 0 )
		{
			send(socket, 'UP', 'movePlayer');
		}
		if (e.key === 'ArrowDown' && paddle1.y + 100 < 600)
		{
			send(socket, 'DOWN', 'movePlayer');
		}
	}
	// //countdown
	// useEffect( () => {
		// 	if (isRunning === false)
		// 	{
			// 		if (count === 0)
			// 		{
				// 			setRunning(true);
				// 			setCount(3);
	// 			return ;
	// 		}
	// 		const id: number = setInterval( () => {
		// 			setCount(count - 1);
		// 		}, 1000);
		// 		return () => {
			// 			clearInterval(id);
			// 		}
			// 	}
			// }, [isRunning, count])
			
			// //gameloop
			useEffect( () => {
				// // 	if (isRunning) {
					// 		const update = () => {
						// 			//collision with side window borders
						// 			setBallX( (x: number): number => {
							// 				//player paddle collision
							// 				if (x < playerPosition.x + 25 && ballY >= playerPosition.y && ballY <= playerPosition.y + 100)
							// 				{	
								// 					setVelX(5);
								// 					return (x + velX);
								// 				}
								// 				//oponent paddle collision
								// 				if (x + 30 > opponentPosition.x && ballY >= opponentPosition.y && ballY <= playerPosition.y + 100)
								// 				{	
									// 					setVelX(-5);
									// 					return (x + velX);
									// 				}
									// 				//oponent scores
									// 				if (x < 0)
									// 				{
										// 					//resets player paddle position
										// 					setRunning(false);
										// 					const pos: Vector = {x: 0, y: 250};
										// 					const opPos: Vector = {x: 780, y: 250};
										// 					setPlayerPositon(pos);
										// 					setOpponentPositon(opPos);
										// 					setOpponentScore(opponentScore + 1);
										// 					if (Math.floor(Math.random() * 4) > 2)
										// 						setVelX(-5);
										// 					else
										// 						setVelX(5);
										// 					setBallY(300);
										// 					return (400);
										// 				}
										// 				//player scores
										// 				if (x + 40 > WIDTH)
										// 				{
											// 					setRunning(false);
											// 					const pos: Vector = {x: 0, y: 250};
											// 					const opPos: Vector = {x: 780, y: 250};
	// 					setPlayerPositon(pos);
	// 					setOpponentPositon(opPos);
	// 					setPlayerScore(playerScore + 1);
	// 					if (Math.floor(Math.random() * 4) > 2)
	// 						setVelX(5);
	// 					else
	// 						setVelX(-5);
	// 					setBallY(300);
	// 					return (400);
	// 				}
	// 				return (x + velX);
	// 			})
	// 			//collision with the top and bottom window border
	// 			setBallY( (y: number): number => {
		// 				if (y <= 0 )
		// 					setVelY(5);
		// 				if (y + 30 >= HEIGHT)
		// 					setVelY(-5);
		// 				return (y + velY);
		// 			})
		
		// 			setOpponentPositon( (pos: Vector): Vector => {
			// 				if (opponentPosition.y >= 0 && opponentPosition.y + 100 <= 600)
	// 				{
		// 					console.log('helo im setting oponent position', opponentPosition);
		// 					if (ballY >= pos.y)
		// 						return ({x: pos.x, y: pos.y + 5});
		// 					else if (ballY < pos.y)
		// 						return ({x: pos.x, y: pos.y - 5});
		// 				}
		// 				return (opponentPosition);
		// 			})
		// // 		}
		// // 		//player movement

				receive(socket, (data) => {
					console.log(data)
					movePaddle1(data.y1);
					movePaddle2(data.y2);
				}, 'PlayerPositionsUpdate')
				window.addEventListener('keydown', handleMovement);
				// 		// let id: number = requestAnimationFrame(update);
				return () => {
					socket?.off('PlayerPositionsUpdate');
					window.removeEventListener('keydown', handleMovement);
					// disconnect(socket);
					// 			// cancelAnimationFrame(id);
		}
	}, [paddle1, paddle2, socket])
	return (
		<Stage width={WIDTH} height={HEIGHT}>
			<Layer>
				<Rect width={WIDTH} height={HEIGHT} fill="black"></Rect>
			</Layer>
			{isRunning ? (
			<Layer>
				<Text text={paddle1Score.toString() + ' : ' + paddle2Score.toString()} x={360} y={20} fill="white" fontSize={50}></Text>
				<Image image={textures.paddleTexture} x={paddle1.x} y={paddle1.y} />
				<Image image={textures.paddleTexture} x={paddle2.x} y={paddle2.y} />
				<Image image={textures.ballTexture} x={ballPosition.x} y={ballPosition.y} />
			</Layer>) : 
			(<Layer>
				<Text text='Get ready ! ' fill="white" x={310} y={200} fontSize={40}></Text>
				<Text text={count.toString()} fill="white" x={400} y={250} fontSize={40}></Text>
				<Image image={textures.paddleTexture} x={0} y={250} />
				<Image image={textures.paddleTexture} x={780} y={250} />
				<Image image={textures.ballTexture} x={400} y={300} />
			</Layer>) } 
		</Stage>
		);
	}
	
export default App
