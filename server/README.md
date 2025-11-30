# Live Polling System - Server

Backend server for the Live Polling System built with Express.js, Socket.io, TypeScript, and PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your database URL in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/polling_system?schema=public"
PORT=3000
```

3. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Endpoints

### REST API (Base: `/api/v1`)

#### Polls
- `GET /polls/active` - Get current active poll
- `GET /polls/history` - Get all closed polls
- `GET /polls/:pollId` - Get specific poll by ID

#### Students
- `POST /students/register` - Register a new student
- `GET /students/session/:sessionId` - Get student by session ID
- `GET /students` - Get all students

### Socket.io Events

#### Teacher Events
- `teacher:connect` - Teacher connects to the system
- `teacher:create-poll` - Create a new poll
- `teacher:stop-poll` - Manually stop active poll
- `teacher:remove-student` - Remove/kick a student
- `teacher:get-history` - Get poll history

#### Student Events
- `student:join` - Student joins with name and sessionId
- `student:submit-answer` - Submit answer to active poll

#### Broadcast Events (Server → Clients)
- `poll:new` - New poll created
- `poll:update` - Live results update
- `poll:ended` - Poll has ended
- `participants:update` - Participant list updated
- `student:kicked` - Student was removed
- `error` - Error occurred

## Database Schema

- **Poll** - Stores poll questions and metadata
- **Option** - Poll answer options
- **Student** - Registered students
- **Response** - Student answers to polls
