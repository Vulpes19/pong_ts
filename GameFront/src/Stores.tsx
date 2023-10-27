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
	ballVelocity: Vector,
    update: () => void,
    setVelX: (newVelX: number) => void,
    setVelY: (newVelY: number) => void
};
export const ballStore = create<BallMovement>((set) => ({
    ballPosition: {x: 400, y: 300},
    ballVelocity: {x: 5, y: 5},
    
    update: () => set((state) => ({
        ballPosition: {x: state.ballPosition.x + state.ballVelocity.x, y: state.ballPosition.y + state.ballVelocity.y},
        ballVelocity: {...state.ballVelocity}
    })),
    setVelX: (newVelX: number) => set((state) => ({
        ballVelocity: {x: newVelX, y: state.ballVelocity.y},
        ballPosition: {...state.ballPosition}
    })),
    setVelY: (newVelY: number) => set((state) => ({
        ballVelocity: {x: state.ballVelocity.x, y: newVelY},
        ballPosition: {...state.ballPosition}
    })),
}));

interface Score {
    paddle1Score: number,
    paddle2Score: number,
    updatePaddle1Score: () => void,
    updatePaddle2Score: () => void
};
export const scoreStore = create<Score>((set) => ({
    paddle1Score: 0,		
    paddle2Score: 0,
    
    updatePaddle1Score: () => set((state) => ({
        paddle1Score: state.paddle1Score + 1,
        paddle2Score: state.paddle2Score
    })),
    updatePaddle2Score: () => set((state) => ({
        paddle2Score: state.paddle2Score + 1,
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
        const socket = io('ws://localhost:3001', {transports: ['websocket']});
        set({socket});
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