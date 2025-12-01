import { Router } from 'express';
import studentService from '../services/studentService.js';

const router = Router();

// Register student
router.post('/register', async (req, res) => {
    try {
        const { name, sessionId } = req.body;

        if (!name || !sessionId) {
            return res.status(400).json({ error: 'Name and sessionId are required' });
        }

        const student = await studentService.registerStudent(name, sessionId);
        res.json({ student });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Failed to register student' });
    }
});

// Get student by sessionId
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const student = await studentService.getStudentBySessionId(sessionId);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ student });
    } catch (error) {
        console.error('Error getting student:', error);
        res.status(500).json({ error: 'Failed to get student' });
    }
});

// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await studentService.getAllStudents();
        res.json({ students });
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({ error: 'Failed to get students' });
    }
});

export default router;