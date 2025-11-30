# Live Polling System - Client

React + TypeScript + Tailwind CSS + Socket.io client for the Live Polling System.

## Features Implemented

### Core Features
- ✅ Role selection (Teacher/Student)
- ✅ Student name entry with unique session per tab
- ✅ Teacher can create polls with multiple options
- ✅ Students can submit answers
- ✅ Live polling results with real-time updates
- ✅ 60-second timer with countdown
- ✅ Auto-close poll when all students answer
- ✅ Teacher can manually stop polls
- ✅ Participant list with answered status
- ✅ Poll history view for teachers

### Bonus Features
- ✅ Chat popup for teacher-student interaction
- ✅ Student kick functionality
- ✅ Responsive design matching Figma specs
- ✅ Real-time percentage calculations
- ✅ Animated progress bars

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── RoleSelection.tsx       # Landing page - role selection
│   │   ├── StudentNameEntry.tsx    # Student name input
│   │   ├── StudentWaiting.tsx      # Waiting for poll screen
│   │   ├── StudentPoll.tsx         # Student poll answering
│   │   ├── TeacherCreatePoll.tsx   # Teacher poll creation form
│   │   ├── TeacherDashboard.tsx    # Teacher main dashboard
│   │   ├── PollResults.tsx         # Live results view
│   │   └── ChatPopup.tsx           # Chat feature (bonus)
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── utils/
│   │   ├── socket.ts               # Socket.io client setup
│   │   └── sessionStorage.ts       # Session management
│   ├── App.tsx                     # Main app with routing
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Tailwind CSS
└── package.json
```

## User Flows

### Student Flow
1. Select "I'm a Student"
2. Enter name
3. Wait for teacher to create poll
4. Answer poll within 60 seconds
5. View live results
6. Wait for next question

### Teacher Flow
1. Select "I'm a Teacher"
2. Create poll with question and options
3. Mark correct answer
4. View live results as students answer
5. See participant list
6. Stop poll manually or wait for auto-close
7. Create new poll or view history

## Socket.io Events

### Emitted by Client
- `student:join` - Student joins with name and sessionId
- `student:submit-answer` - Student submits answer
- `teacher:connect` - Teacher connects
- `teacher:create-poll` - Teacher creates new poll
- `teacher:stop-poll` - Teacher stops active poll
- `teacher:remove-student` - Teacher kicks student
- `teacher:get-history` - Teacher requests poll history
- `chat:message` - Send chat message

### Received by Client
- `student:joined` - Confirmation of student join
- `poll:new` - New poll created
- `poll:update` - Live results update
- `poll:ended` - Poll has ended
- `participants:update` - Participant list updated
- `student:kicked` - Student was removed
- `poll:history` - Poll history data
- `chat:message` - New chat message
- `error` - Error occurred

## Design System

### Colors
- Primary: Purple (#7c3aed / purple-600)
- Background: Gray (#f5f5f5 / gray-50)
- Text: Dark Gray (#1a1a1a / gray-900)
- Border: Light Gray (#e5e7eb / gray-200)

### Typography
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Labels: Semibold, 12-14px

### Components
- Buttons: Rounded (8px), Purple background
- Cards: White background, subtle shadow
- Inputs: 2px border, rounded (8px)
- Badge: Purple, rounded-full

## Environment Variables

Create a `.env` file if you need to change the backend URL:

```
VITE_API_URL=http://localhost:3000
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## Technologies Used

- React 19
- TypeScript
- Tailwind CSS 3
- Socket.io Client
- React Router DOM
- Vite

## Notes

- Each browser tab gets a unique session ID
- Student names are stored in sessionStorage
- Real-time updates use Socket.io WebSocket connection
- UI matches Figma design specifications exactly
