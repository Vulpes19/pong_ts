import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface Vector {
    x: number;
    y: number;
}

interface PlayerPositions {
    paddle1: Vector;
    paddle2: Vector;
    paddle1Texture: HTMLImageElement | null;
    paddle2Texture: HTMLImageElement | null;
    movePaddle1: (newPosition: number) => void;
    movePaddle2: (newPosition: number) => void;
    setPaddle1: (src: string) => void;
    setPaddle2: (src: string) => void;
}

export const playerStore = create<PlayerPositions>((set, get) => ({
    paddle1: { x: 0, y: 250 },
    paddle2: { x: 780, y: 250 },
    paddle1Texture: null,
    paddle2Texture: null,

    movePaddle1: (newPosition: number) => set({ paddle1: { x: 0, y: newPosition } }),
    movePaddle2: (newPosition: number) => set({ paddle2: { x: 780, y: newPosition } }),
    setPaddle1: (src: string) => {
        const img: HTMLImageElement = new window.Image;
        img.onload = () => {
            set({paddle1Texture: img});
        };
        img.src = src;
        img.onload = null;
    },
    setPaddle2: (src: string) => {
        const img: HTMLImageElement = new window.Image;
        img.onload = () => {
            set({paddle2Texture: img});
        };
        img.src = src;
        img.onload = null;
    },
}));

interface BallMovement {
    ballPosition: Vector;
    velocity: Vector;
    updateBall: (x: number, y: number) => void;
}
export const ballStore = create<BallMovement>((set) => ({
    ballPosition: { x: 400, y: 300 },
    velocity: { x: 10, y: 10 },

    updateBall: (newX: number, newY: number) =>
        set({
            ballPosition: { x: newX, y: newY },
        }),
}));

interface Score {
    paddle1Score: number;
    paddle2Score: number;
    updatePaddle1Score: (score: number) => void;
    updatePaddle2Score: (score: number) => void;
}
export const scoreStore = create<Score>((set) => ({
    paddle1Score: 0,
    paddle2Score: 0,

    updatePaddle1Score: (score: number) =>
        set((state) => ({
            paddle1Score: score,
            paddle2Score: state.paddle2Score,
        })),
    updatePaddle2Score: (score: number) =>
        set((state) => ({
            paddle2Score: score,
            paddle1Score: state.paddle1Score,
        })),
}));

interface GameResultStore {
    hasEnded: boolean;
    result: string;

    GameEnds: (end: boolean) => void;
    setResult: (res: string) => void;
}

export const gameResultStore = create<GameResultStore>((set) => ({
    hasEnded: false,
    result: "",

    GameEnds: (end: boolean) =>
        set(() => ({
            hasEnded: end,
        })),
    setResult: (res: string) =>
        set(() => ({
            result: res,
        })),
}));

interface PowerUpsStore {
    increaseSize: boolean;
    decreaseSize: boolean;
    speed: boolean;

    setIncreaseSize: (val: boolean) => void;
    setDecreaseSize: (val: boolean) => void;
    setSpeed: (val: boolean) => void;
}

export const powerUpsStore = create<PowerUpsStore>((set) => ({
    increaseSize: true,
    decreaseSize: true,
    speed: true,

    setIncreaseSize: (val: boolean) =>
        set(() => ({
            increaseSize: val,
        })),
    setDecreaseSize: (val: boolean) =>
        set(() => ({
            decreaseSize: val,
        })),
    setSpeed: (val: boolean) =>
        set(() => ({
            speed: val,
        })),
}));

interface SocketStore {
    socket: Socket | null;
    isRunning: boolean;

    connect: (onConnect: Function | null) => void;
    send: (msg: string, type: string) => void;
    receive: (type: string) => void;
    setRunning: (type: boolean) => void;
    disconnect: () => void;
}

export const socketStore = create<SocketStore>((set, get) => ({
    socket: null,
    isRunning: false,

    connect: (onConnect: Function | null) => {
        const socket = io("ws://localhost:3001", { transports: ["websocket"], autoConnect: false });
        socket.on("connect", () => {
            set({ socket });
            if (onConnect)
                onConnect();
        });
        socket.connect();
    },
    send: (msg: string, type: string) => {
        const socket = get().socket;
        if (socket) {
            socket.emit(type, msg);
        }
    },
    receive: (type: string) => {
        const socket = get().socket;
        if (socket) {
            switch (type) {
                case 'ballUpdate':
                    socket.on(type, (data) => void ballStore.getState().updateBall(data.x, data.y));
                    break;
                case 'rightScoreUpdate':
                    socket.on(type, (data) => void scoreStore.getState().updatePaddle2Score(data));
                    break;
                case 'leftScoreUpdate':
                    socket.on(type, (data) => void scoreStore.getState().updatePaddle1Score(data));
                    break;
                case 'leftPlayerUpdate':
                    socket.on(type, (data) => void playerStore.getState().movePaddle1(data));
                    break;
                case 'rightPlayerUpdate':
                    socket.on(type, (data) => void playerStore.getState().movePaddle2(data));
                    break;
                // case 'status':
                //     console.log('received status')
                //     // socketStore.getState().setRunning(true);
                //     // socket.on(type, () => void socketStore.getState().setRunning(true));
                //     break;
                case 'GameResult':
                    socket.on(type, (data) => {
                        // console.log('HANI HNA')
                        gameResultStore.getState().GameEnds(true);
                        socketStore.getState().setRunning(false);
                        gameResultStore.getState().setResult(data);
                        socketStore.getState().disconnect();
                    });
                    break;
                case 'startGame':
                    socket.on(type, (data) => void socketStore.getState().setRunning(data));
                    break;
                case 'increaseSize':
                    socket.on(type, (data) => {
                        console.log('increasing size', data)
                        if (data == 'leftPaddle')
                            playerStore.getState().setPaddle1("assets/big_paddle.png");
                        else
                            playerStore.getState().setPaddle2("assets/big_paddle.png");
                        powerUpsStore.getState().setIncreaseSize(false);
                    });
                    break;
                case 'decreaseSize':
                    socket.on(type, (data) => {
                        console.log('decreasing size', data)
                        if (data == 'leftPaddle')
                            playerStore.getState().setPaddle1("assets/small_paddle.png");
                        else
                            playerStore.getState().setPaddle2("assets/small_paddle.png");
                        powerUpsStore.getState().setDecreaseSize(false);
                    });
                    break;
                case 'speed':
                    socket.on(type, () => {
                        console.log('speeding up')
                        powerUpsStore.getState().setSpeed(false);
                    });
                    break;
                default:
                    break;
            }
            
        }
    },
    setRunning: (type: boolean) => set(() => ({
        isRunning: type
    })),
    disconnect: () => {
        const socket = get().socket;
        if (socket) socket?.disconnect();
    },
}));
