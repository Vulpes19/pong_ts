import { KeyboardEventHandler, useEffect, useRef } from "react";
import { useState } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import Konva from "konva";
interface Vertices {
	x: number,
	y: number
};

interface Ball {
	position: Vertices,
	velocity: Vertices,
	img: HTMLImageElement
};

interface Paddle {
	position: Vertices,
	img: HTMLImageElement
};

function addVertices(v1: Vertices, v2: Vertices): Vertices {
	// console.log(v1.x, v2.x)
	let ret: Vertices = {
		x: v1.x + v2.x,
		y: v1.y + v2.y
	};
	return (ret);
};


const WIDTH: number = 800;
const HEIGHT: number = 600;

function App() {
	const player: Paddle = {
		position: {x: 0, y: 250},
		img: new window.Image()
	};
	const oponent: Paddle = {
		position: {x: 780, y: 250},
		img: new window.Image()
	};
	const ball: Ball = {
		position: {x: 400, y: 300},
		velocity: {x: 0, y: 10},
		img: new window.Image()
	};
	const [position, setPositon] = useState<Vertices>({x:0, y: 250});
	const [ballX, setBallX] = useState<number>(400);
	const [ballY, setBallY] = useState<number>(300);
	const [velX, setVelX] = useState<number>(5);
	const [velY, setVelY] = useState<number>(5);
	const [isRunning, setRunning] = useState<boolean>(false);
	const [playerScore, setPlayerScore] = useState<number>(0);
	const [oponentScore, setOponentScore] = useState<number>(0);
	player.img.src = 'assets/paddle.png';
	oponent.img.src = 'assets/paddle.png';
	ball.img.src = 'assets/ball.png';
	const handleMovement = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp' && position.y > 0 )
		{
			setPositon({x: 0, y: position.y - 20})
		}
		if (e.key === 'ArrowDown' && position.y + 100 < 600)
		{
			setPositon({x: 0, y: position.y + 20})
		}
	}
	useEffect( () => {
		const updateBall = () => {
			setBallX( (x: number): number => {
				if (x < position.x + 25 && ballY >= position.y && ballY <= position.y + 100)
					setVelX(5);
				if (x > oponent.position.x && ballY >= oponent.position.y && ballY <= position.y + 100)
					setVelX(-5);
				if (x < 0)
				{
					setOponentScore(oponentScore + 1);
					if (Math.floor(Math.random() * 4) > 2)
						setVelX(-5);
					else
						setVelX(5);
					setBallY(300);
					return (400);
				}
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
			setBallY( (y: number): number => {
				if (y < 0 )
					setVelY(5);
				if (y + 40 > HEIGHT)
					setVelY(-5);
				return (y + velY);
			})
		}
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
			<Layer>
				<Text text={playerScore.toString() + ' : ' + oponentScore.toString()} x={360} y={20} fill="white" fontSize={50}></Text>
			</Layer>
			<Layer>
				<Image image={player.img} x={position.x} y={position.y} />
				<Image image={oponent.img} x={oponent.position.x} y={oponent.position.y} />
				<Image image={ball.img} x={ballX} y={ballY} />
			</Layer>
		</Stage>
		);
	}
	
export default App
