import prisma from '../config/database.js';

export class StudentService {
    // Register or get student by sessionId
    async registerStudent(name: string, sessionId: string) {
        // Check if student already exists with this sessionId
        let student = await prisma.student.findUnique({
            where: { sessionId },
        });

        if (student) {
            // Update name if changed
            if (student.name !== name) {
                student = await prisma.student.update({
                    where: { sessionId },
                    data: { name },
                });
            }
            return student;
        }

        // Create new student
        student = await prisma.student.create({
            data: {
                name,
                sessionId,
            },
        });

        return student;
    }

    // Get student by sessionId
    async getStudentBySessionId(sessionId: string) {
        const student = await prisma.student.findUnique({
            where: { sessionId },
        });

        return student;
    }

    // Get student by ID
    async getStudentById(id: string) {
        const student = await prisma.student.findUnique({
            where: { id },
        });

        return student;
    }

    // Get all students
    async getAllStudents() {
        const students = await prisma.student.findMany({
            where: { isKicked: false },
            orderBy: { joinedAt: 'asc' },
        });

        return students;
    }

    // Kick student
    async kickStudent(studentId: string) {
        const student = await prisma.student.update({
            where: { id: studentId },
            data: { isKicked: true },
        });

        return student;
    }

    // Check if student is kicked
    async isStudentKicked(studentId: string): Promise<boolean> {
        const student = await this.getStudentById(studentId);
        return student?.isKicked || false;
    }
}

export default new StudentService();
