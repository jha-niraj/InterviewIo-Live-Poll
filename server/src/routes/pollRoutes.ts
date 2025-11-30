import { Router } from 'express';
import pollService from '../services/pollService.js';

const router = Router();

// Get active poll
router.get('/active', async (req, res) => {
    try {
        const poll = await pollService.getActivePoll();
        res.json({ poll });
    } catch (error) {
        console.error('Error getting active poll:', error);
        res.status(500).json({ error: 'Failed to get active poll' });
    }
});

// Get poll history
router.get('/history', async (req, res) => {
    try {
        const polls = await pollService.getPollHistory();
        res.json({ polls });
    } catch (error) {
        console.error('Error getting poll history:', error);
        res.status(500).json({ error: 'Failed to get poll history' });
    }
});

// Get poll by ID
router.get('/:pollId', async (req, res) => {
    try {
        const { pollId } = req.params;
        const poll = await pollService.getPollById(pollId);

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        res.json({ poll });
    } catch (error) {
        console.error('Error getting poll:', error);
        res.status(500).json({ error: 'Failed to get poll' });
    }
});

export default router;
