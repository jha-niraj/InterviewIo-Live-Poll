# Server Setup Instructions

## What We've Built

Complete backend server for the Live Polling System with:
- Express.js + TypeScript
- Socket.io for real-time communication
- PostgreSQL + Prisma ORM
- Proper folder structure and separation of concerns

## Next Steps

### 1. Set up your database

Add your PostgreSQL database URL to the `.env` file:

```bash
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### 2. Generate Prisma Client and Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, use: `init`

### 3. Start the development server

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # Prisma client instance
│   ├── routes/
│   │   ├── pollRoutes.ts        # REST API for polls
│   │   └── studentRoutes.ts     # REST API for students
│   ├── services/
│   │   ├── pollService.ts       # Poll business logic
│   │   └── studentService.ts    # Student business logic
│   ├── socket/
│   │   └── pollSocket.ts        # Socket.io event handlers
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── index.ts                 # Main server file
├── prisma/
│   └── schema.prisma            # Database schema
└── package.json
```

## Key Features Implemented

### Database Models
- Poll (with questions, options, status, timer)
- Option (poll choices)
- Student (with unique sessionId per tab)
- Response (student answers)

### Socket.io Events
- `teacher:connect` - Teacher connects
- `teacher:create-poll` - Create new poll
- `teacher:stop-poll` - Stop poll manually
- `teacher:remove-student` - Kick a student
- `teacher:get-history` - Get poll history
- `student:join` - Student joins with name
- `student:submit-answer` - Submit answer
- `poll:new` - New poll broadcast
- `poll:update` - Live results update
- `poll:ended` - Poll ended
- `participants:update` - Participant list update
- `student:kicked` - Student removed

### REST API Endpoints
- `GET /api/v1/polls/active` - Get active poll
- `GET /api/v1/polls/history` - Get poll history
- `GET /api/v1/polls/:pollId` - Get specific poll
- `POST /api/v1/students/register` - Register student
- `GET /api/v1/students/session/:sessionId` - Get student by session
- `GET /api/v1/students` - Get all students

## Testing the Server

Once running, you can test with:
- REST API: Use Postman or curl
- Socket.io: Use socket.io client or browser console
- Health check: `curl http://localhost:3000`

## CORS Configuration

Currently configured for `http://localhost:5173` (Vite default port).
Update in `src/index.ts` if your client runs on a different port.
