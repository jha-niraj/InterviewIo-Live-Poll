import { Server, Socket } from 'socket.io';
import pollService from '../services/pollService.js';
import studentService from '../services/studentService.js';
import type { CreatePollData, SubmitAnswerData, StudentJoinData, ConnectedStudent } from '../types/index.js';

// Store connected students and their socket IDs
const connectedStudents = new Map<string, ConnectedStudent>();
let pollTimer: NodeJS.Timeout | null = null;
let currentPollId: string | null = null;

export function setupSocketHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        // Student joins
        socket.on('student:join', async (data: StudentJoinData) => {
            try {
                const { name, sessionId } = data;

                // Register student in database
                const student = await studentService.registerStudent(name, sessionId);

                // Check if student is kicked
                if (student.isKicked) {
                    socket.emit('student:kicked', {
                        message: 'You have been removed from the poll system',
                    });
                    return;
                }

                // Store connected student
                connectedStudents.set(sessionId, {
                    id: student.id,
                    name: student.name,
                    sessionId: student.sessionId,
                    hasAnswered: false,
                    socketId: socket.id,
                });

                socket.data.studentId = student.id;
                socket.data.sessionId = sessionId;
                socket.data.role = 'student';

                // Send success response
                socket.emit('student:joined', {
                    student: {
                        id: student.id,
                        name: student.name,
                        sessionId: student.sessionId,
                    },
                });

                // Broadcast updated participant list
                io.emit('participants:update', Array.from(connectedStudents.values()));

                // Send active poll if exists
                const activePoll = await pollService.getActivePoll();
                if (activePoll) {
                    const timeElapsed = Math.floor((Date.now() - activePoll.createdAt.getTime()) / 1000);
                    const timeRemaining = Math.max(0, activePoll.timeLimit - timeElapsed);

                    socket.emit('poll:new', {
                        poll: {
                            id: activePoll.id,
                            question: activePoll.question,
                            options: activePoll.options,
                            timeLimit: activePoll.timeLimit,
                            timeRemaining,
                        },
                    });
                }

                console.log(`Student joined: ${name} (${sessionId})`);
            } catch (error) {
                console.error('Error in student:join:', error);
                socket.emit('error', { message: 'Failed to join' });
            }
        });

        // Teacher connects
        socket.on('teacher:connect', () => {
            socket.data.role = 'teacher';
            console.log('Teacher connected:', socket.id);

            // Send current participants
            socket.emit('participants:update', Array.from(connectedStudents.values()));
        });

        // Teacher creates poll
        socket.on('teacher:create-poll', async (data: CreatePollData) => {
            try {
                // Check if there's already an active poll
                const activePoll = await pollService.getActivePoll();
                if (activePoll) {
                    socket.emit('error', { message: 'There is already an active poll' });
                    return;
                }

                // Create poll
                const poll = await pollService.createPoll(data);
                currentPollId = poll.id;

                // Reset answered status for all students
                connectedStudents.forEach((student) => {
                    student.hasAnswered = false;
                });

                // Broadcast new poll to all clients
                io.emit('poll:new', {
                    poll: {
                        id: poll.id,
                        question: poll.question,
                        options: poll.options,
                        timeLimit: poll.timeLimit,
                        timeRemaining: poll.timeLimit,
                    },
                });

                // Start timer
                startPollTimer(io, poll.id, poll.timeLimit);

                console.log(`Poll created: ${poll.question}`);
            } catch (error) {
                console.error('Error in teacher:create-poll:', error);
                socket.emit('error', { message: 'Failed to create poll' });
            }
        });

        // Student submits answer
        socket.on('student:submit-answer', async (data: SubmitAnswerData) => {
            try {
                const { studentId, pollId, optionId } = data;

                // Verify student
                if (socket.data.studentId !== studentId) {
                    socket.emit('error', { message: 'Invalid student' });
                    return;
                }

                // Check if student already answered
                const studentData = connectedStudents.get(socket.data.sessionId);
                if (studentData && studentData.hasAnswered) {
                    console.log(`Student ${studentId} already answered, ignoring duplicate`);
                    return;
                }

                // Check if student is kicked
                const isKicked = await studentService.isStudentKicked(studentId);
                if (isKicked) {
                    socket.emit('student:kicked', {
                        message: 'You have been removed from the poll system',
                    });
                    return;
                }

                // Submit answer
                await pollService.submitAnswer(studentId, pollId, optionId);

                // Update student's answered status
                if (studentData) {
                    studentData.hasAnswered = true;
                    console.log(`✅ Student ${studentData.name} answered. Total answered: ${Array.from(connectedStudents.values()).filter(s => s.hasAnswered).length}/${connectedStudents.size}`);
                }

                // Calculate and broadcast updated results
                const totalStudents = connectedStudents.size;
                const poll = await pollService.getPollById(pollId);
                if (poll) {
                    const timeElapsed = Math.floor((Date.now() - poll.createdAt.getTime()) / 1000);
                    const timeRemaining = Math.max(0, poll.timeLimit - timeElapsed);

                    const results = await pollService.calculateResults(pollId, totalStudents, timeRemaining);
                    io.emit('poll:update', results);

                    // Broadcast updated participant list
                    io.emit('participants:update', Array.from(connectedStudents.values()));

                    // Check if all students have answered
                    const allAnswered = await pollService.checkAllStudentsAnswered(pollId, totalStudents);
                    if (allAnswered) {
                        await endPoll(io, pollId);
                    }
                }

                console.log(`Student ${studentId} answered poll ${pollId}`);
            } catch (error: any) {
                console.error('Error in student:submit-answer:', error);
                socket.emit('error', { message: error.message || 'Failed to submit answer' });
            }
        });

        // Teacher stops poll manually
        socket.on('teacher:stop-poll', async (data: { pollId: string }) => {
            try {
                if (socket.data.role !== 'teacher') {
                    socket.emit('error', { message: 'Unauthorized' });
                    return;
                }

                await endPoll(io, data.pollId);
                console.log(`Teacher stopped poll: ${data.pollId}`);
            } catch (error) {
                console.error('Error in teacher:stop-poll:', error);
                socket.emit('error', { message: 'Failed to stop poll' });
            }
        });

        // Teacher removes student
        socket.on('teacher:remove-student', async (data: { studentId: string }) => {
            try {
                if (socket.data.role !== 'teacher') {
                    socket.emit('error', { message: 'Unauthorized' });
                    return;
                }

                const { studentId } = data;

                // Kick student in database
                await studentService.kickStudent(studentId);

                // Find student's socket and disconnect
                const studentEntry = Array.from(connectedStudents.entries()).find(
                    ([_, student]) => student.id === studentId
                );

                if (studentEntry) {
                    const [sessionId, student] = studentEntry;
                    const studentSocket = io.sockets.sockets.get(student.socketId);

                    if (studentSocket) {
                        studentSocket.emit('student:kicked', {
                            message: 'You have been removed from the poll system',
                        });
                        studentSocket.disconnect();
                    }

                    connectedStudents.delete(sessionId);
                }

                // Broadcast updated participant list
                io.emit('participants:update', Array.from(connectedStudents.values()));

                console.log(`Teacher removed student: ${studentId}`);
            } catch (error) {
                console.error('Error in teacher:remove-student:', error);
                socket.emit('error', { message: 'Failed to remove student' });
            }
        });

        // Get poll history
        socket.on('teacher:get-history', async () => {
            try {
                if (socket.data.role !== 'teacher') {
                    socket.emit('error', { message: 'Unauthorized' });
                    return;
                }

                const history = await pollService.getPollHistory();
                socket.emit('poll:history', { polls: history });
            } catch (error) {
                console.error('Error in teacher:get-history:', error);
                socket.emit('error', { message: 'Failed to get history' });
            }
        });

        // Chat message handling
        socket.on('chat:message', (message: any) => {
            try {
                console.log('💬 Chat message:', message.sender, '-', message.text);

                // Broadcast message to all connected clients
                io.emit('chat:message', {
                    ...message,
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('❌ Error in chat:message:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);

            // Remove student from connected list
            if (socket.data.sessionId) {
                connectedStudents.delete(socket.data.sessionId);
                io.emit('participants:update', Array.from(connectedStudents.values()));
            }
        });
    });
}

// Start poll timer
function startPollTimer(io: Server, pollId: string, duration: number) {
    // Clear existing timer
    if (pollTimer) {
        clearTimeout(pollTimer);
    }

    pollTimer = setTimeout(async () => {
        await endPoll(io, pollId);
    }, duration * 1000);
}

// End poll
async function endPoll(io: Server, pollId: string) {
    try {
        // Clear timer
        if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }

        // Close poll in database
        const poll = await pollService.closePoll(pollId);

        // Calculate final results
        const totalStudents = connectedStudents.size;
        const results = await pollService.calculateResults(pollId, totalStudents, 0);

        // Broadcast poll ended
        io.emit('poll:ended', results);

        currentPollId = null;

        console.log(`Poll ended: ${pollId}`);
    } catch (error) {
        console.error('Error ending poll:', error);
    }
}