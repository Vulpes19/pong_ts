import { KeyboardEventHandler, useEffect, useRef } from "react";
import { useState } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import Konva from "konva";
interface Vector {
	x: number,
	y: number
};

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
	const [playerPosition, setPlayerPositon] = useState<Vector>({x:0, y: 250});
	const [oponentPosition, setOponentrPositon] = useState<Vector>({x:780, y: 250});
	const [ballX, setBallX] = useState<number>(400);
	const [ballY, setBallY] = useState<number>(300);
	const [velX, setVelX] = useState<number>(5);
	const [velY, setVelY] = useState<number>(5);
	const [isRunning, setRunning] = useState<boolean>(true);
	const [playerScore, setPlayerScore] = useState<number>(0);
	const [oponentScore, setOponentScore] = useState<number>(0);
	const [count, setCount] = useState<number>(3);
	textures.paddleTexture.src = 'assets/paddle.png';
	textures.ballTexture.src = 'assets/ball.png';
	const handleMovement = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp' && playerPosition.y > 0 )
		{
			const pos: Vector = {x: 0, y: playerPosition.y - 20};
			setPlayerPositon(pos);
			// setPlayerPositon({x: 0, y: playerPosition.y - 20})
		}
		if (e.key === 'ArrowDown' && playerPosition.y + 100 < 600)
		{
			const pos: Vector = {x: 0, y: playerPosition.y + 20};
			setPlayerPositon(pos);
			// setPlayerPositon({x: 0, y: playerPosition.y + 20})
		}
	}
	useEffect( () => {
		if (isRunning === false)
		{
			if (count === 0)
			{
				setRunning(true);
				setCount(3);
				return ;
			}
			console.log('helo')
			const id: number = setInterval( () => {
				setCount(count - 1);
			}, 1000);
			return () => {
				clearInterval(id);
			}
		}
	}, [isRunning, count])

	useEffect( () => {
		const updateBall = () => {
			//collision with side window borders
			setBallX( (x: number): number => {
				//player paddle collision
				if (x < playerPosition.x + 25 && ballY >= playerPosition.y && ballY <= playerPosition.y + 100)
					setVelX(5);
				//oponent paddle collision
				if (x > oponentPosition.x && ballY >= oponentPosition.y && ballY <= playerPosition.y + 100)
					setVelX(-5);
				//oponent scores
				if (x < 0)
				{
					//resets player paddle position
					setRunning(false);
					const pos: Vector = {x: 0, y: 250};
					setPlayerPositon(pos);
					setOponentScore(oponentScore + 1);
					if (Math.floor(Math.random() * 4) > 2)
						setVelX(-5);
					else
						setVelX(5);
					setBallY(300);
					return (400);
				}
				//player scores
				if (x + 40 > WIDTH)
				{
					setPlayerScore(playerScore + 1);
					if (Math.floor(Math.random() * 4) > 2)
						setVelX(5);
					else
						setVelX(-5);
					setBallY(300);
					return (400);
				}
				return (x + velX);
			})
			//collision with the top and bottom window border
			setBallY( (y: number): number => {
				if (y <= 0 )
					setVelY(5);
				if (y + 30 >= HEIGHT)
					setVelY(-5);
				return (y + velY);
			})
		}
		//player movement
		window.addEventListener('keydown', handleMovement);
		let id: number = requestAnimationFrame(updateBall);
		return () => {
			window.removeEventListener('keydown', handleMovement);
			cancelAnimationFrame(id);
		}
	}, [ballX, ballY, velX, velY])
	return (
		<Stage width={WIDTH} height={HEIGHT}>
			<Layer>
				<Rect width={WIDTH} height={HEIGHT} fill="black"></Rect>
			</Layer>
			{isRunning ? (
			<Layer>
				<Text text={playerScore.toString() + ' : ' + oponentScore.toString()} x={360} y={20} fill="white" fontSize={50}></Text>
				<Image image={textures.paddleTexture} x={playerPosition.x} y={playerPosition.y} />
				<Image image={textures.paddleTexture} x={oponentPosition.x} y={oponentPosition.y} />
				<Image image={textures.ballTexture} x={ballX} y={ballY} />
			</Layer>) : 
			(<Layer>
				<Text text={'wait ' + count.toString()} fill="white" x={350} y={300} fontSize={40}></Text>
			</Layer>) } 
		</Stage>
		);
	}
	
export default App
