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
		origin: ["http://localhost:5173", "https://interview-io-live-poll.vercel.app/"],
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

// Middleware
app.use(cors({
	origin: ["http://localhost:5173", "https://interview-io-live-poll.vercel.app/"],
	credentials: true,
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

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Socket.io server ready`);
});

export { io };