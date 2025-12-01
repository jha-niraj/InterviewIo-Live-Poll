import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/urls';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });
    }
    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};