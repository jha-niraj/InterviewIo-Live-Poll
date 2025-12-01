import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const quizService = {
    async generateQuiz(topic: string, level: string, creatorSessionId: string, creatorName: string) {
        try {
            const prompt = `Generate 10 multiple choice questions about ${topic} at ${level} difficulty level. 
            Format the response as a JSON array with this structure:
            [
                {
                    "question": "question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correctAnswer": "correct option text"
                }
            ]
            Make sure the questions are educational and appropriate.`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an educational quiz generator. Generate only valid JSON without any markdown formatting or code blocks.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No content generated');
            }

            // Parse the JSON response
            const questions = JSON.parse(content);

            // Create quiz in database
            const quiz = await prisma.quiz.create({
                data: {
                    title: `${topic} - ${level}`,
                    topic,
                    level,
                    createdBy: creatorSessionId,
                    creatorName,
                    questions: {
                        create: questions.map((q: any, index: number) => ({
                            question: q.question,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            order: index + 1,
                        })),
                    },
                },
                include: {
                    questions: {
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
            });

            return quiz;
        } catch (error) {
            console.error('Error generating quiz:', error);
            throw error;
        }
    },

    async getAllQuizzes() {
        return await prisma.quiz.findMany({
            include: {
                questions: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                attempts: {
                    select: {
                        id: true,
                        studentName: true,
                        score: true,
                        totalQuestions: true,
                        completedAt: true,
                    },
                    orderBy: {
                        score: 'desc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    async getQuizById(quizId: string) {
        return await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                attempts: {
                    select: {
                        id: true,
                        studentName: true,
                        score: true,
                        totalQuestions: true,
                        completedAt: true,
                    },
                    orderBy: {
                        score: 'desc',
                    },
                },
            },
        });
    },

    async submitQuizAttempt(
        quizId: string,
        studentSessionId: string,
        studentName: string,
        answers: Array<{ questionId: string; selectedAnswer: string }>
    ) {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true,
            },
        });

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Calculate score
        let correctCount = 0;
        const answerData = answers.map((answer) => {
            const question = quiz.questions.find((q) => q.id === answer.questionId);
            const isCorrect = question?.correctAnswer === answer.selectedAnswer;
            if (isCorrect) correctCount++;

            return {
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect,
            };
        });

        // Create attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId,
                studentId: studentSessionId,
                studentName,
                score: correctCount,
                totalQuestions: quiz.questions.length,
                answers: {
                    create: answerData,
                },
            },
            include: {
                answers: {
                    include: {
                        question: true,
                    },
                },
            },
        });

        return attempt;
    },

    async getStudentAttempts(studentSessionId: string) {
        return await prisma.quizAttempt.findMany({
            where: {
                studentId: studentSessionId,
            },
            include: {
                quiz: {
                    select: {
                        title: true,
                        topic: true,
                        level: true,
                    },
                },
            },
            orderBy: {
                completedAt: 'desc',
            },
        });
    },
};
