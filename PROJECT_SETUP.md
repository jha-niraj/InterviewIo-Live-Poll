# Live Polling System - Complete Setup Guide

A real-time polling system with Teacher and Student roles, built with React, Express, Socket.io, PostgreSQL, and Prisma.

## 🎯 Features

### Must-Have (Completed ✅)
- ✅ Teacher can create polls with multiple options
- ✅ Students can submit answers
- ✅ Live polling results with real-time updates
- ✅ 60-second timer (configurable)
- ✅ Auto-close when all students answer
- ✅ Both roles can view live results
- ✅ UI matches Figma design exactly

### Good-to-Have (Completed ✅)
- ✅ Configurable poll time limit
- ✅ Teacher can remove/kick students
- ✅ Clean, professional UI

### Bonus (Completed ✅)
- ✅ Chat popup for teacher-student interaction
- ✅ Teacher can view past poll results (stored in database)

## 📁 Project Structure

```
.
├── server/                 # Backend (Express + Socket.io + Prisma)
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── routes/        # REST API routes
│   │   ├── services/      # Business logic
│   │   ├── socket/        # Socket.io handlers
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Main server file
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
└── client/                # Frontend (React + Tailwind + Socket.io)
    ├── src/
    │   ├── components/    # React components
    │   ├── types/         # TypeScript types
    │   ├── utils/         # Utilities (socket, storage)
    │   └── App.tsx        # Main app with routing
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### 1. Server Setup

```bash
cd server

# Install dependencies (already done)
npm install

# Set up your database URL in .env
# Edit server/.env and add:
DATABASE_URL="postgresql://username:password@localhost:5432/polling_system?schema=public"
PORT=3000

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
# When prompted, name it: init

# Start the server
npm run dev
```

Server will run on `http://localhost:3000`

### 2. Client Setup

```bash
cd client

# Install dependencies (already done)
npm install

# Start the development server
npm run dev
```

Client will run on `http://localhost:5173`

## 🧪 Testing the Application

### Test as Teacher:
1. Open `http://localhost:5173`
2. Select "I'm a Teacher"
3. Create a poll with question and options
4. Mark the correct answer
5. Click "Ask Question"
6. Watch live results as students answer
7. View participant list on the right
8. Stop poll manually or wait for auto-close
9. Click "Ask a new question" to create another poll
10. View poll history

### Test as Student:
1. Open `http://localhost:5173` in a new tab/window
2. Select "I'm a Student"
3. Enter your name
4. Wait for teacher to create a poll
5. Select an answer
6. Click "Submit"
7. View live results
8. Wait for next question

### Test Chat Feature:
1. Click the purple chat button (bottom right)
2. Send messages between teacher and students
3. Messages appear in real-time

## 🎨 Design Implementation

The UI is built to match the Figma design exactly:

- **Colors**: Purple (#7c3aed) primary, gray backgrounds
- **Typography**: Clean, modern fonts with proper hierarchy
- **Components**: Rounded corners, subtle shadows, smooth transitions
- **Layout**: Centered cards with proper spacing
- **Responsive**: Works on all screen sizes

## 🔌 API Endpoints

### REST API (Base: `/api/v1`)
- `GET /polls/active` - Get current active poll
- `GET /polls/history` - Get all closed polls
- `GET /polls/:pollId` - Get specific poll
- `POST /students/register` - Register student
- `GET /students/session/:sessionId` - Get student by session
- `GET /students` - Get all students

### Socket.io Events

**Teacher Events:**
- `teacher:connect` - Connect as teacher
- `teacher:create-poll` - Create new poll
- `teacher:stop-poll` - Stop active poll
- `teacher:remove-student` - Kick a student
- `teacher:get-history` - Get poll history

**Student Events:**
- `student:join` - Join with name and sessionId
- `student:submit-answer` - Submit answer

**Broadcast Events:**
- `poll:new` - New poll created
- `poll:update` - Live results update
- `poll:ended` - Poll ended
- `participants:update` - Participant list update
- `student:kicked` - Student removed
- `chat:message` - Chat message

## 📊 Database Schema

```prisma
Poll {
  id            String
  question      String
  options       Option[]
  correctAnswer String
  status        String (pending/active/closed)
  timeLimit     Int (default: 60)
  createdAt     DateTime
  endedAt       DateTime?
  responses     Response[]
}

Option {
  id        String
  text      String
  pollId    String
  responses Response[]
}

Student {
  id        String
  name      String
  sessionId String (unique per tab)
  joinedAt  DateTime
  responses Response[]
  isKicked  Boolean
}

Response {
  id         String
  studentId  String
  pollId     String
  optionId   String
  answeredAt DateTime
}
```

## 🛠️ Tech Stack

### Backend
- Express.js - Web framework
- Socket.io - Real-time communication
- Prisma - ORM
- PostgreSQL - Database
- TypeScript - Type safety

### Frontend
- React 19 - UI library
- TypeScript - Type safety
- Tailwind CSS 3 - Styling
- Socket.io Client - Real-time updates
- React Router - Navigation
- Vite - Build tool

## 🎯 Key Features Explained

### Real-time Updates
- Socket.io provides bidirectional communication
- Results update instantly as students submit answers
- Participant list shows who has answered
- Timer syncs across all clients

### Session Management
- Each browser tab gets unique sessionId
- Student names stored in sessionStorage
- Allows same person to join from multiple tabs
- Database tracks all sessions

### Poll Lifecycle
1. **Pending** - Created but not started
2. **Active** - Currently accepting answers
3. **Closed** - Ended, showing final results

### Auto-close Logic
- Poll closes after 60 seconds (configurable)
- OR when all connected students have answered
- Whichever comes first

## 🚢 Deployment

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect to hosting platform
3. Add DATABASE_URL environment variable
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect to hosting platform
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=<your-backend-url>`
6. Deploy

### Database (Supabase/Neon/Railway)
1. Create PostgreSQL database
2. Copy connection string
3. Add to backend environment variables
4. Run migrations

## 📝 Submission Checklist

- ✅ Functional system with all core features
- ✅ Hosted backend and frontend
- ✅ Teacher can create polls
- ✅ Students can answer polls
- ✅ Both can view live results
- ✅ UI matches Figma design
- ✅ Configurable poll time limit
- ✅ Teacher can remove students
- ✅ Chat feature implemented
- ✅ Poll history stored in database
- ✅ Clean, professional code
- ✅ TypeScript throughout
- ✅ Proper error handling

## 🐛 Troubleshooting

### Server won't start
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run `npm run prisma:generate`

### Client can't connect to server
- Check server is running on port 3000
- Verify CORS settings in server/src/index.ts
- Check socket URL in client/src/utils/socket.ts

### Database errors
- Run `npm run prisma:migrate`
- Check database connection
- Verify schema is up to date

## 📧 Support

For issues or questions, check:
- Server logs: `npm run dev` output
- Browser console: F12 → Console tab
- Network tab: Check WebSocket connection

## 🎉 You're All Set!

The complete Live Polling System is ready to use. Start the server, start the client, and begin polling!
