# 🎯 Live Polling System

A real-time polling application for teachers and students with live results, chat functionality, and poll history. Built with React, Express, Socket.io, PostgreSQL, and Prisma.

![Status](https://img.shields.io/badge/status-complete-success)
![Frontend](https://img.shields.io/badge/frontend-React%2019-blue)
![Backend](https://img.shields.io/badge/backend-Express-green)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)
![Realtime](https://img.shields.io/badge/realtime-Socket.io-black)

## ✨ Features

### Core Features ✅
- **Role-based Access**: Separate interfaces for teachers and students
- **Real-time Polling**: Live updates as students submit answers
- **Timer System**: 60-second countdown (configurable)
- **Auto-close Logic**: Closes when timer expires OR all students answer
- **Live Results**: Animated progress bars with percentages
- **Participant Tracking**: See who has answered in real-time

### Advanced Features ✅
- **Poll History**: Teachers can view all past polls with results
- **Student Management**: Teachers can remove/kick students
- **Chat System**: Real-time messaging between teacher and students
- **Session Management**: Unique session per browser tab
- **Responsive Design**: Works on all devices
- **UI/UX**: Matches Figma design specifications exactly

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### 1. Clone & Install
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Database
```bash
# Edit server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/polling_system"
```

### 3. Setup Database
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Application
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

🎉 **Done!** Open http://localhost:5173

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Complete Setup](PROJECT_SETUP.md)** - Detailed setup and deployment guide
- **[Component Flow](COMPONENT_FLOW.md)** - Architecture and data flow
- **[Server README](server/README.md)** - Backend documentation
- **[Client README](client/README.md)** - Frontend documentation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Teacher    │  │   Student    │  │     Chat     │ │
│  │  Dashboard   │  │     Poll     │  │    Popup     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    Socket.io (WebSocket)
                             │
┌─────────────────────────────┼─────────────────────────┐
│                    Server (Express)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Socket.io  │  │  REST API    │  │   Prisma    │ │
│  │   Handlers   │  │   Routes     │  │   Client    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼──────────────────┼──────────────────┼────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │    Database     │
                    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3** - Styling
- **Socket.io Client** - Real-time updates
- **React Router** - Navigation
- **Vite** - Build tool

### Backend
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **Prisma** - ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety

## 📱 User Flows

### Teacher Flow
1. Select "I'm a Teacher"
2. Create poll with question and options
3. Mark correct answer
4. View live results as students answer
5. See participant list with answered status
6. Stop poll manually or wait for auto-close
7. Create new poll or view history

### Student Flow
1. Select "I'm a Student"
2. Enter name (unique per tab)
3. Wait for teacher to create poll
4. Answer within 60 seconds
5. View live results
6. Wait for next question

## 🎨 Design

The UI is built to match the provided Figma design exactly:

- **Colors**: Purple primary (#7c3aed), clean grays
- **Typography**: Modern, readable fonts
- **Components**: Rounded corners, subtle shadows
- **Layout**: Centered cards, proper spacing
- **Animations**: Smooth transitions, animated progress bars

## 🔌 API Reference

### Socket.io Events

**Teacher Events:**
- `teacher:connect` - Connect as teacher
- `teacher:create-poll` - Create new poll
- `teacher:stop-poll` - Stop active poll
- `teacher:remove-student` - Kick student
- `teacher:get-history` - Get poll history

**Student Events:**
- `student:join` - Join with name
- `student:submit-answer` - Submit answer

**Broadcast Events:**
- `poll:new` - New poll created
- `poll:update` - Live results update
- `poll:ended` - Poll ended
- `participants:update` - Participant list update
- `student:kicked` - Student removed
- `chat:message` - Chat message

### REST API
- `GET /api/v1/polls/active` - Get active poll
- `GET /api/v1/polls/history` - Get poll history
- `POST /api/v1/students/register` - Register student

## 📊 Database Schema

```
Poll
├── id (UUID)
├── question (String)
├── correctAnswer (String)
├── status (pending/active/closed)
├── timeLimit (Int, default: 60)
├── createdAt (DateTime)
├── endedAt (DateTime?)
├── options (Option[])
└── responses (Response[])

Student
├── id (UUID)
├── name (String)
├── sessionId (String, unique)
├── joinedAt (DateTime)
├── isKicked (Boolean)
└── responses (Response[])

Option
├── id (UUID)
├── text (String)
├── pollId (UUID)
└── responses (Response[])

Response
├── id (UUID)
├── studentId (UUID)
├── pollId (UUID)
├── optionId (UUID)
└── answeredAt (DateTime)
```

## 🧪 Testing

### Manual Testing
1. Open two browser windows
2. Window 1: Teacher creates poll
3. Window 2: Student answers poll
4. Verify real-time updates
5. Test chat functionality
6. Check poll history

### Test Scenarios
- ✅ Multiple students answering simultaneously
- ✅ Timer expiration
- ✅ All students answered (early close)
- ✅ Manual stop by teacher
- ✅ Student kicked during active poll
- ✅ Multiple tabs as different students
- ✅ Chat messages between roles

## 🚢 Deployment

### Backend (Render/Railway)
1. Push to GitHub
2. Connect repository
3. Add DATABASE_URL environment variable
4. Deploy

### Frontend (Vercel/Netlify)
1. Push to GitHub
2. Connect repository
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add VITE_API_URL environment variable
6. Deploy

### Database (Supabase/Neon)
1. Create PostgreSQL database
2. Copy connection string
3. Add to backend environment

## 📝 Assignment Submission

This project fulfills all requirements:

**Must-Have:**
- ✅ Functional system with all core features
- ✅ Hosted frontend and backend
- ✅ Teacher can create polls
- ✅ Students can answer polls
- ✅ Both can view live results
- ✅ UI matches Figma design

**Good-to-Have:**
- ✅ Configurable poll time limit
- ✅ Teacher can remove students
- ✅ Well-designed user interface

**Bonus:**
- ✅ Chat popup for interaction
- ✅ Poll history (stored in database)

## 🤝 Contributing

This is an assignment project, but feel free to:
- Report bugs
- Suggest improvements
- Fork and enhance

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 🙏 Acknowledgments

- Design provided by InterVue
- Built as part of SDE Intern assignment
- Socket.io for real-time capabilities
- Prisma for excellent ORM

---

**Built with ❤️ for InterVue Assignment**

For questions or issues, check the documentation files or open an issue.
