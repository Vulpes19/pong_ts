import {create} from 'zustand'
import {io, Socket} from 'socket.io-client';

interface Vector {
	x: number,
	y: number
};

interface PlayerPositions {
	paddle1: Vector,
	paddle2: Vector,
    movePaddle1: (newPosition: number) => void,
    movePaddle2: (newPosition: number) => void
}

export const playerStore = create<PlayerPositions>((set) => ({
    paddle1: {x: 0, y:250},
    paddle2: {x: 780, y:250},

    movePaddle1: (newPosition: number) => set({ paddle1: {x: 0, y: newPosition}}),
    movePaddle2: (newPosition: number) => set({ paddle2: {x: 780, y: newPosition}})
}));

interface BallMovement {
    ballPosition: Vector,
    updateBall: (x: number, y: number) => void
};
export const ballStore = create<BallMovement>((set) => ({
    ballPosition: {x: 400, y: 300},
    
    updateBall: (newX: number, newY: number) => set(({
        ballPosition: {x: newX, y: newY},
    }))
}));

interface Score {
    paddle1Score: number,
    paddle2Score: number,
    updatePaddle1Score: (score: number) => void,
    updatePaddle2Score: (score: number) => void
};
export const scoreStore = create<Score>((set) => ({
    paddle1Score: 0,		
    paddle2Score: 0,
    
    updatePaddle1Score: (score: number) => set((state) => ({
        paddle1Score: score,
        paddle2Score: state.paddle2Score
    })),
    updatePaddle2Score: (score: number) => set((state) => ({
        paddle2Score: score,
        paddle1Score: state.paddle1Score
    })),
}));

interface SocketStore {
    socket: Socket | null,
    connect: () => void,
    send: (socket: Socket | null, msg: string, type: string) => void,
    receive: (socket: Socket | null, callback: (data: any) => void, type: string) => void,
    disconnect: (socket: Socket | null) => void
};

export const socketStore = create<SocketStore>((set) => ({
    socket: null,
    
    connect: () => {
        const socket = io('ws://localhost:3001', {transports: ['websocket'], autoConnect: false});
        socket.on('connect', () => {
            set({socket});
        })
        socket.connect();
    },
    send: (socket: Socket | null, msg: string, type: string) => {
        if (socket) {
            socket.emit(type, msg);
        }
    },
    receive: (socket: Socket | null,callback, type: string) => {
        if (socket)
        {
            socket.on(type, (data) => {
                callback(data);
            });
        }
    },
    disconnect: (socket: Socket | null) => {
        if (socket)
            socket?.disconnect();
    },
}));