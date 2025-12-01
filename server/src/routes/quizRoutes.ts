import { Router, type Request, type Response } from 'express';
import { quizService } from '../services/quizService.js';

const router = Router();

// Generate new quiz
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { topic, level, creatorSessionId, creatorName } = req.body;

        if (!topic || !level || !creatorSessionId || !creatorName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const quiz = await quizService.generateQuiz(topic, level, creatorSessionId, creatorName);
        res.json({ quiz });
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Get all quizzes
router.get('/all', async (req: Request, res: Response) => {
    try {
        const quizzes = await quizService.getAllQuizzes();
        res.json({ quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// Get quiz by ID
router.get('/:quizId', async (req: Request, res: Response) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ error: 'Quiz ID is required' });
        }
        const quiz = await quizService.getQuizById(quizId);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({ quiz });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
});

// Submit quiz attempt
router.post('/submit', async (req: Request, res: Response) => {
    try {
        const { quizId, studentSessionId, studentName, answers } = req.body;

        if (!quizId || !studentSessionId || !studentName || !answers) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const attempt = await quizService.submitQuizAttempt(
            quizId,
            studentSessionId,
            studentName,
            answers
        );

        res.json({ attempt });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get student attempts
router.get('/student/:sessionId/attempts', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }
        const attempts = await quizService.getStudentAttempts(sessionId);
        res.json({ attempts });
    } catch (error) {
        console.error('Error fetching attempts:', error);
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
});

export default router;