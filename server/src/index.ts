import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pollRoutes from './routes/pollRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import { setupSocketHandlers } from './socket/pollSocket.js';

const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
	cors: {
		origin: ["http://localhost:5173", "https://poll.nirajjha.xyz"],
		methods: ['GET', 'POST'],
		credentials: true,
		allowedHeaders: ['Content-Type'],
	},
	transports: ['websocket', 'polling'],
	allowEIO3: true,
});

// Middleware
app.use(cors({
	origin: ["http://localhost:5173", "https://poll.nirajjha.xyz"],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
	res.json({ message: 'Live Polling System API' });
});

// API Routes
app.use('/api/v1/polls', pollRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/quiz', quizRoutes);

// Setup Socket.io handlers
setupSocketHandlers(io);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error('Error:', err);
	res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
	console.log(`✅ Server running on port ${PORT}`);
	console.log(`✅ Socket.io server ready`);
	console.log(`✅ CORS enabled for: http://localhost:5173, https://poll.nirajjha.xyz`);
	console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
httpServer.on('error', (error: any) => {
	console.error('❌ Server error:', error);
	if (error.code === 'EADDRINUSE') {
		console.error(`Port ${PORT} is already in use`);
	}
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

export { io };