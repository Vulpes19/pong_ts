import { useCallback, useEffect, useMemo } from "react";
import { useState } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import { playerStore, ballStore, scoreStore, socketStore, powerUpsStore, gameResultStore } from "../utils/Stores";
import { LoadingScreen } from "./Loading";

interface PowerUpsTextures {
	increaseSizePower: HTMLImageElement;
	decreaseSizePower: HTMLImageElement;
	speedPower: HTMLImageElement;
}

const WIDTH = 800;
const HEIGHT = 600;

interface Textures {
	ballTexture: HTMLImageElement;
	paddle1Texture: HTMLImageElement;
	paddle2Texture: HTMLImageElement;
}
interface prop {
	powerUpGame: boolean;
}

function MultiplayerGame({ powerUpGame }: prop) {
	const textures: Textures = useMemo(
		() => ({
			ballTexture: new window.Image(),
			paddle1Texture: new window.Image(),
			paddle2Texture: new window.Image(),
		}),
		[]
	);
	const [gameMode, setGameMode] = useState<string>("defaultGame");
	const [powerUpsTextures, setPowerUpsTextures] = useState<PowerUpsTextures | undefined>(undefined);
	const { isRunning, connect, send, receive } = socketStore();
	const {hasEnded, result, GameEnds, setResult} = gameResultStore();

	// const [isRunning, setRunning] = useState<boolean>(false);
	const [count, setCount] = useState<number>(3);

	useEffect(() => {
		if (powerUpGame) {
			function loadPowerUpTextures() {
				const tmpPowerUpsTextures = {
					increaseSizePower: new window.Image(),
					decreaseSizePower: new window.Image(),
					speedPower: new window.Image(),
				};
				tmpPowerUpsTextures.increaseSizePower.src = "assets/Increase_size_power_up.png";
				tmpPowerUpsTextures.decreaseSizePower.src = "assets/decrease_size_power_up.png";
				tmpPowerUpsTextures.speedPower.src = "assets/speed_power_up.png";

				setPowerUpsTextures(tmpPowerUpsTextures);
			}
			loadPowerUpTextures();
			setGameMode("powerUpGame");
		}
	}, [powerUpGame]);

	useEffect(() => {
		textures.paddle1Texture.src = "assets/paddle.png";
		textures.paddle2Texture.src = "assets/paddle.png";
		textures.ballTexture.src = "assets/ball.png";
		connect( () => {
			receive("startGame");
			send(gameMode, "gameMode");
		});
		console.log(isRunning);
	}, []);
	
	const handleMovement = useCallback((e: KeyboardEvent) => {
		if (e.key === "ArrowUp")
			send("UP", "movePlayer");
		if (e.key === "ArrowDown")
			send("DOWN", "movePlayer");
	}, []);

    // const sendGameMode = useCallback(() => {
    //     send(gameMode, "gameMode");
    // }, []);

	useEffect(() => {
		console.log(isRunning)
		if (isRunning) {
			// receives ball position
			receive("ballUpdate");
			//receives r
			receive("rightScoreUpdate");
			//receives l
			receive("leftScoreUpdate");
			//receives left player position
			receive("leftPlayerUpdate");
			//receives right paddle position
			receive("rightPlayerUpdate");
			if (powerUpGame) {
				//receives increase size power up
				receive("increaseSize");
				//receives decrease size power up
				receive("decreaseSize");
				//receives speed ball power up
				receive("speed");
			}
			receive("startGame");
            //receives game result
            receive("GameResult");
			window.addEventListener("keydown", handleMovement);
			return () => {
				window.removeEventListener("keydown", handleMovement);
			};
		}
	}, [isRunning]);

	return (
		<PracticeGameStage count={count} isRunning={isRunning} hasEnded={hasEnded} gameResult={result} textures={textures} powerUpsTextures={powerUpsTextures} />
	);
}

export default MultiplayerGame;

interface PracticeGameStageProps {
	count: number,
	isRunning: boolean,
    hasEnded: boolean,
    gameResult: string,
	textures: Textures,
	powerUpsTextures?: PowerUpsTextures
}

function PracticeGameStage({ count, isRunning, hasEnded, gameResult, textures, powerUpsTextures }: PracticeGameStageProps) {
	const { paddle1, paddle2 } = playerStore();
	const { ballPosition } = ballStore();
	const { paddle1Score, paddle2Score } = scoreStore();
	const { increaseSize, decreaseSize, speed } = powerUpsStore();

	return (
		<Stage width={WIDTH} height={HEIGHT}>
            {/*Game background */}
			<Layer>
				<Rect width={WIDTH} height={HEIGHT} fill="BLACK"></Rect>
			</Layer>
            {/*Drawing game objects */}
			{isRunning === true ? (
				<Layer>
					<Text text={paddle1Score.toString() + " : " + paddle2Score.toString()} x={360} y={20} fill="white" fontSize={50}></Text>
					<Image image={textures.paddle1Texture} x={paddle1.x} y={paddle1.y} />
					<Image image={textures.paddle2Texture} x={paddle2.x} y={paddle2.y} />
					<Image image={textures.ballTexture} x={ballPosition.x} y={ballPosition.y} />
					{powerUpsTextures && (
						<>
							{increaseSize && <Image image={powerUpsTextures.increaseSizePower} x={390} y={150} />}
							{decreaseSize && <Image image={powerUpsTextures.decreaseSizePower} x={390} y={290} />}
							{speed && <Image image={powerUpsTextures.speedPower} x={390} y={450} />}
						</>
					)}
				</Layer>
            ) : (
            <>
                <WaitingLobby isRunning={isRunning} hasEnded={hasEnded} gameResult={gameResult}/>
                <GameResult isRunning={isRunning} hasEnded={hasEnded} gameResult={gameResult} />
            </>
            )}
        </Stage>
	);
}

interface GameRunningProps {
    isRunning: boolean,
    hasEnded: boolean,
    gameResult: string
};

function WaitingLobby({isRunning, hasEnded}: GameRunningProps) {
    return (
        <>
            { hasEnded === false && isRunning === false && <LoadingScreen/> }
        </>
    );
}

function GameResult({isRunning, hasEnded, gameResult}: GameRunningProps) {
    return (
        <>
            { hasEnded === true && isRunning === false &&
            <Layer>
                <Text text={gameResult} x={100} y={400} fill="white" fontSize={50}></Text>
            </Layer>
            }
        </>
    )
}