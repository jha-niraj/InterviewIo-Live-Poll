# 🎯 InterviewIO - Live Polling & Quiz System

A real-time polling and quiz application for teachers and students with live results, chat functionality, AI-powered quiz generation, and comprehensive analytics.

![Status](https://img.shields.io/badge/status-production-success)
![Frontend](https://img.shields.io/badge/frontend-React%2019-blue)
![Backend](https://img.shields.io/badge/backend-Express-green)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)
![Realtime](https://img.shields.io/badge/realtime-Socket.io-black)

🌐 **Live Demo**: [poll.nirajjha.xyz](https://poll.nirajjha.xyz)  
📦 **GitHub**: [InterviewIO-Live-Poll](https://github.com/jha-niraj/InterviewIo-Live-Poll)

---

## ✨ Features Overview

### 🎓 Polling System
- **Real-time Polls**: Teachers create polls, students answer instantly
- **Live Results**: Animated progress bars with real-time updates
- **Smart Timer**: Configurable time limits (30s to 5min)
- **Auto-close**: Closes when timer expires OR all students answer
- **Poll History**: View all past polls with complete analytics
- **Participant Tracking**: See who's online and who has answered

### 📝 Quiz System (AI-Powered)
- **AI Quiz Generation**: Create quizzes on any topic using OpenAI
- **Difficulty Levels**: Easy, Medium, Hard
- **Progress Tracking**: Visual progress bar during quiz
- **Instant Results**: Detailed score breakdown after submission
- **Leaderboard**: Top 5 scores displayed in real-time
- **Retry Option**: Take quizzes multiple times

### 💬 Communication
- **Real-time Chat**: Instant messaging between teacher and students
- **Participant List**: See all connected users with status
- **Poll Notifications**: Students get notified when teacher posts a poll (even while taking quizzes!)
- **Role-based UI**: Different styling for teacher vs student messages

### 🎨 User Experience
- **Responsive Design**: Works perfectly on all devices
- **Professional UI**: Clean, modern interface with smooth animations
- **Error Handling**: Graceful error messages with retry options
- **Session Management**: Unique session per browser tab
- **State Management**: Redux for optimal performance

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key (for quiz generation)

### Installation

```bash
# Clone repository
git clone https://github.com/jha-niraj/InterviewIo-Live-Poll.git
cd InterviewIo-Live-Poll

# Setup server (see server/README.md for details)
cd server
npm install
# Configure .env file
npm run prisma:generate
npm run dev

# Setup client (see client/README.md for details)
cd ../client
npm install
npm run dev
```

📖 **Detailed Setup**: See [server/README.md](server/README.md) and [client/README.md](client/README.md)

---

## 🎯 How It Works

### For Teachers 👨‍🏫

1. **Create Polls**
   - Select time limit (30s - 5min)
   - Add 2-6 options
   - Mark correct answer
   - View live results as students answer

2. **Manage Students**
   - See who's online
   - Track who has answered
   - Remove disruptive students

3. **Generate Quizzes**
   - Enter any topic
   - Choose difficulty
   - AI generates 10 questions instantly

4. **Chat & Communicate**
   - Send messages to all students
   - View participant list
   - Monitor engagement

### For Students 👨‍🎓

1. **Join Session**
   - Enter your name
   - Wait for teacher's poll

2. **Answer Polls**
   - Get notified when poll is posted (even while taking quizzes!)
   - Answer within time limit
   - View live results

3. **Practice with Quizzes**
   - Browse available quizzes
   - Create your own quizzes
   - Take quizzes with progress tracking
   - See leaderboard and compete
   - Get instant feedback

4. **Stay Connected**
   - Chat with teacher and classmates
   - See who's online
   - Get real-time notifications

---

## 🔔 Smart Notifications

**Students receive real-time poll notifications even while:**
- Browsing quiz list
- Creating a quiz
- Taking a quiz

The notification appears in the top-right corner with:
- Poll question preview
- "Join Poll" button (navigates to poll page)
- "Later" button (dismisses notification)
- Pulse animation for attention

---

## 🏗️ Architecture

```
Frontend (React + Redux)
    ↓ WebSocket (Socket.io)
Backend (Express + Socket.io)
    ↓ Prisma ORM
PostgreSQL Database
```

**Key Technologies:**
- **Frontend**: React 19, TypeScript, Redux Toolkit, Tailwind CSS, Axios
- **Backend**: Express, Socket.io, Prisma, TypeScript
- **Database**: PostgreSQL
- **AI**: OpenAI API for quiz generation
- **Real-time**: Socket.io for WebSocket connections

---

## 📊 Features Breakdown

### Core Polling Features ✅
- ✅ Role-based access (Teacher/Student)
- ✅ Real-time poll creation and voting
- ✅ Configurable time limits
- ✅ Live result updates
- ✅ Participant tracking
- ✅ Poll history with analytics
- ✅ Student management (kick feature)

### Quiz System Features ✅
- ✅ AI-powered quiz generation
- ✅ Multiple difficulty levels
- ✅ Progress tracking
- ✅ Instant results with breakdown
- ✅ Leaderboard system
- ✅ Retry functionality
- ✅ Quiz browsing and creation

### Communication Features ✅
- ✅ Real-time chat
- ✅ Participant list
- ✅ Poll notifications
- ✅ Role-based message styling
- ✅ Auto-scroll to latest messages

### Technical Features ✅
- ✅ Redux state management
- ✅ Axios for API calls
- ✅ Centralized URL configuration
- ✅ Professional error handling
- ✅ WebSocket reconnection
- ✅ Session management
- ✅ Responsive design

---

## 🚢 Deployment

**Live Application**: [poll.nirajjha.xyz](https://poll.nirajjha.xyz)

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: PostgreSQL on Render

---

## 📖 Documentation

- **[Server Documentation](server/README.md)** - Backend setup, API, WebSocket events
- **[Client Documentation](client/README.md)** - Frontend setup, components, state management
- **[WebSocket Guide](CHAT_WEBSOCKET_GUIDE.md)** - Complete WebSocket implementation guide
- **[Quick Reference](CHAT_QUICK_REFERENCE.md)** - Quick WebSocket reference

---

## 🎨 UI/UX Highlights

- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Slide-in notifications, progress bars
- **Color Scheme**: Purple gradient theme (#8F64E1 to #1D68BD)
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessibility**: Proper contrast, keyboard navigation
- **Loading States**: Spinners and skeletons for better UX
- **Error States**: Helpful error messages with retry options

---

## 🧪 Testing

Open two browser windows:
1. **Window 1**: Teacher creates poll/quiz
2. **Window 2**: Student answers and chats
3. Verify real-time updates, notifications, and chat

---

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome!

---

## 📄 License

MIT License - Free to use for learning purposes

---

## 🙏 Acknowledgments

Built with ❤️ by Niraj Jha for InterviewIO Assignment

**Technologies**: React, Express, Socket.io, PostgreSQL, Prisma, OpenAI, Redux, Tailwind CSS

---

**Questions?** Check the detailed documentation in [server/README.md](server/README.md) and [client/README.md](client/README.md)
