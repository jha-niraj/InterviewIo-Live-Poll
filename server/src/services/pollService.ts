import prisma from '../config/database.js';
import type { CreatePollData, PollResults, OptionResult } from '../types/index.js';

export class PollService {
    // Create a new poll
    async createPoll(data: CreatePollData) {
        const { question, options, correctAnswer, timeLimit = 60 } = data;

        const poll = await prisma.poll.create({
            data: {
                question,
                correctAnswer,
                timeLimit,
                status: 'active',
                options: {
                    create: options.map((text) => ({ text })),
                },
            },
            include: {
                options: true,
            },
        });

        return poll;
    }

    // Get active poll
    async getActivePoll() {
        const poll = await prisma.poll.findFirst({
            where: { status: 'active' },
            include: {
                options: true,
                responses: {
                    include: {
                        student: true,
                        option: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return poll;
    }

    // Get poll by ID
    async getPollById(pollId: string) {
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: true,
                responses: {
                    include: {
                        student: true,
                        option: true,
                    },
                },
            },
        });

        return poll;
    }

    // Close a poll
    async closePoll(pollId: string) {
        const poll = await prisma.poll.update({
            where: { id: pollId },
            data: {
                status: 'closed',
                endedAt: new Date(),
            },
            include: {
                options: true,
                responses: {
                    include: {
                        student: true,
                        option: true,
                    },
                },
            },
        });

        return poll;
    }

    // Submit answer
    async submitAnswer(studentId: string, pollId: string, optionId: string) {
        // Check if student already answered
        const existingResponse = await prisma.response.findUnique({
            where: {
                studentId_pollId: {
                    studentId,
                    pollId,
                },
            },
        });

        if (existingResponse) {
            throw new Error('Student has already answered this poll');
        }

        const response = await prisma.response.create({
            data: {
                studentId,
                pollId,
                optionId,
            },
            include: {
                student: true,
                option: true,
                poll: true,
            },
        });

        return response;
    }

    // Calculate poll results
    async calculateResults(pollId: string, totalStudents: number, timeRemaining: number): Promise<PollResults> {
        const poll = await this.getPollById(pollId);

        if (!poll) {
            throw new Error('Poll not found');
        }

        const totalResponses = poll.responses.length;

        const optionResults: OptionResult[] = poll.options.map((option: any) => {
            const count = poll.responses.filter((r: any) => r.optionId === option.id).length;
            const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;

            return {
                id: option.id,
                text: option.text,
                count,
                percentage: Math.round(percentage * 100) / 100,
                isCorrect: option.text === poll.correctAnswer,
            };
        });

        return {
            pollId: poll.id,
            question: poll.question,
            options: optionResults,
            totalResponses,
            totalStudents,
            timeRemaining,
            status: poll.status,
        };
    }

    // Get poll history
    async getPollHistory() {
        const polls = await prisma.poll.findMany({
            where: { status: 'closed' },
            include: {
                options: true,
                responses: {
                    include: {
                        student: true,
                        option: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return polls;
    }

    // Check if all students have answered
    async checkAllStudentsAnswered(pollId: string, totalStudents: number): Promise<boolean> {
        const poll = await this.getPollById(pollId);
        if (!poll) return false;

        return poll.responses.length >= totalStudents;
    }
}

export default new PollService();
