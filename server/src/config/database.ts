import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
	log: ['error', 'warn'],
});

// Test database connection
prisma.$connect()
	.then(() => {
		console.log('✅ Database connected successfully');
	})
	.catch((error) => {
		console.error('❌ Database connection failed:', error);
		console.error('Please check your DATABASE_URL environment variable');
	});

// Handle disconnection
process.on('beforeExit', async () => {
	await prisma.$disconnect();
	console.log('Database disconnected');
});

export default prisma;