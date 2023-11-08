import { useEffect } from "react";
import { useState } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import { playerStore, ballStore, scoreStore, socketStore, gameResultStore } from "../utils/Stores";
import { LoadingScreen } from "./Loading";

interface Textures {
	ballTexture: HTMLImageElement,
	paddleTexture: HTMLImageElement,
};

interface PowerUpsTextures {
	increaseSizePower: HTMLImageElement,
	decreaseSizePower: HTMLImageElement,
	speedPower: HTMLImageElement
};

interface prop {
	powerUpGame: boolean
};
const WIDTH: number = 800;
const HEIGHT: number = 600;
// const FRAME_RATE = 1000 / 60;

function OnlineGame({powerUpGame}: prop) {
	console.log('the prop is', powerUpGame);
	const textures: Textures = {
		ballTexture: new window.Image,
		paddleTexture: new window.Image,
	};
	let powerUpsTextures: PowerUpsTextures | undefined;
	const {paddle1, paddle2, movePaddle1, movePaddle2} = playerStore();
	const {ballPosition, updateBall} = ballStore();
	const {paddle1Score, paddle2Score, updatePaddle1Score, updatePaddle2Score} = scoreStore();
	const {socket, connect, send, receive, disconnect} = socketStore();
	const {hasEnded, result, GameEnds, setResult} = gameResultStore();
	const [isRunning, setRunning] = useState<boolean>(false);
	let intervalId: NodeJS.Timeout;

	textures.paddleTexture.src = 'assets/paddle.png';
	textures.ballTexture.src = 'assets/ball.png';
	
	function loadPowerUpTextures() {
		powerUpsTextures = {
			increaseSizePower: new window.Image,
			decreaseSizePower: new window.Image,
			speedPower: new window.Image	
		};
		powerUpsTextures.increaseSizePower.src = 'assets/Increase_size_power_up.png';
		powerUpsTextures.decreaseSizePower.src = 'assets/decrease_size_power_up.png';
		powerUpsTextures.speedPower.src = 'assets/speed_power_up.png';
		console.log('images are loaded')
	};
	if (powerUpGame)
		loadPowerUpTextures();

	function sendGameMode(){
		//console.log('I sent a message');
		if (powerUpGame == true)
		{
			console.log('wazuuup')
			send(socket, 'powerUpGame', 'gameMode');
		}
		else
		{
			send(socket, 'defaultGame','gameMode');
		}
	}

	useEffect( () => {
		connect();
	}, []);
	
	const handleMovement = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp')
		{
			send(socket, 'UP', 'movePlayer');
		}
		if (e.key === 'ArrowDown')
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
		receive(socket, (start) => {
			setRunning(start);
			clearInterval(intervalId);
		}, 'startGame');
		receive(socket, (status) => {
			if (status == 'connected')
			{
				sendGameMode();
			}
		}, 'status');
		if (isRunning)
		{
			const update = () => {
				receive(socket, (data) => {
					updateBall(data.x, data.y);
				}, 'ballUpdate');
			}
			receive(socket, (data) => {
				updatePaddle2Score(data);
			}, 'rightScoreUpdate');
			//receives l
			receive(socket, (data) => {
				updatePaddle1Score(data);
			}, 'leftScoreUpdate');
			//receives left player position
			receive(socket, (data) => {
				movePaddle1(data);
			}, 'leftPlayerUpdate');
			//receives right paddle position
			receive(socket, (data) => {
				movePaddle2(data);
			}, 'rightPlayerUpdate');
			//receives game result
			receive(socket, (data) => {
				console.log('yoo')
				GameEnds(true);
				setResult(data);
				setRunning(false);
				disconnect(socket);
			}, 'GameResult');
			window.addEventListener('keydown', handleMovement);
			let id: number = requestAnimationFrame(update);
			return () => {
				window.removeEventListener('keydown', handleMovement);
				cancelAnimationFrame(id);
			}
		}
	}, [paddle1, paddle2, ballPosition, paddle1Score, paddle2Score, socket, isRunning])

	return (
		<Stage width={WIDTH} height={HEIGHT}>
			{/*Game background */}
			<Layer>
				<Rect width={WIDTH} height={HEIGHT} fill="black"></Rect>
			</Layer>
			{/*Drawing game objects */}
			{ isRunning === true &&
                <Layer>
                    <Text text={paddle1Score.toString() + ' : ' + paddle2Score.toString()} x={360} y={20} fill="white" fontSize={50}></Text>
                    <Image image={textures.paddleTexture} x={paddle1.x} y={paddle1.y} />
                    <Image image={textures.paddleTexture} x={paddle2.x} y={paddle2.y} />
                    <Image image={textures.ballTexture} x={ballPosition.x} y={ballPosition.y} />
					{powerUpGame === true && powerUpsTextures &&
					<> 
						<Image image={powerUpsTextures.increaseSizePower} x={390} y={150} />
						<Image image={powerUpsTextures.decreaseSizePower} x={390} y={290} />
						<Image image={powerUpsTextures.speedPower} x={390} y={450} />
					</>}
				</Layer>
			}

			{/*Waiting for players */}
			{hasEnded === false && isRunning === false && <LoadingScreen/>}
				
			{/*Game Result */}
			{hasEnded === true && 
				<Layer>
					<Text text={result} x={100} y={400} fill="white" fontSize={50}></Text>
				</Layer>
			}
		</Stage>
		);
	}
	
export default OnlineGame;
