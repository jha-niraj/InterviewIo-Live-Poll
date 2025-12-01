# 🔌 WebSocket Flow Guide - Complete Technical Deep Dive

## 📚 Table of Contents
1. [Introduction to WebSockets](#introduction)
2. [Architecture Overview](#architecture)
3. [Student Flow - Complete Journey](#student-flow)
4. [Teacher Flow - Complete Journey](#teacher-flow)
5. [Real-time Communication](#realtime)
6. [Code Examples](#code-examples)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Introduction to WebSockets {#introduction}

### What are WebSockets?

WebSockets provide **bidirectional, real-time communication** between client and server over a single, persistent connection.

**Traditional HTTP:**
```
Client → Request → Server
Client ← Response ← Server
(Connection closes)
```

**WebSocket:**
```
Client ←→ Persistent Connection ←→ Server
(Both can send messages anytime!)
```

### Why WebSockets for Polling?

1. **Real-time Updates**: Results update instantly as students answer
2. **Bidirectional**: Server can push updates without client requesting
3. **Efficient**: One connection vs multiple HTTP requests
4. **Low Latency**: No polling overhead

### Socket.io vs Raw WebSockets

We use **Socket.io** because it provides:
- Automatic reconnection
- Room/namespace support
- Event-based communication
- Fallback to HTTP long-polling
- Built-in acknowledgments

---

## 🏗️ Architecture Overview {#architecture}

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌──────────────┐              ┌──────────────┐        │
│  │   Teacher    │              │   Student    │        │
│  │  Component   │              │  Component   │        │
│  └──────┬───────┘              └──────┬───────┘        │
│         │                              │                 │
│         └──────────┬───────────────────┘                │
│                    │                                     │
│         ┌──────────▼──────────┐                        │
│         │  Socket.io Client   │                        │
│         │  (utils/socket.ts)  │                        │
│         └──────────┬──────────┘                        │
└────────────────────┼────────────────────────────────────┘
                     │
                     │ WebSocket Connection
                     │ (ws://localhost:3000)
                     │
┌────────────────────▼────────────────────────────────────┐
│                Express Server                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Socket.io Server                        │  │
│  │        (socket/pollSocket.ts)                     │  │
│  └──────────┬───────────────────────────────────────┘  │
│             │                                            │
│  ┌──────────▼──────────┐    ┌──────────────────────┐  │
│  │   Poll Service      │    │  Student Service     │  │
│  │  (Business Logic)   │    │  (Business Logic)    │  │
│  └──────────┬──────────┘    └──────────┬───────────┘  │
└─────────────┼──────────────────────────┼───────────────┘
              │                           │
              └───────────┬───────────────┘
                          │
                  ┌───────▼────────┐
                  │   PostgreSQL   │
                  │   (Database)   │
                  └────────────────┘
```


## 👨‍🎓 Student Flow - Complete Journey {#student-flow}

### Step 1: Student Opens Application

**What Happens:**
```
Browser → Loads React App → Renders RoleSelection Component
```

**Code (RoleSelection.tsx):**
```typescript
// Student clicks "I'm a Student" card
<div onClick={() => setSelectedRole('student')}>
  I'm a Student
</div>

// Then clicks Continue
const handleContinue = () => {
  setRole('student'); // Save to sessionStorage
  navigate('/student/name'); // Navigate to name entry
};
```

**SessionStorage:**
```javascript
// Stored in browser
{
  polling_role: 'student'
}
```

---

### Step 2: Student Enters Name

**Component:** `StudentNameEntry.tsx`

**What Happens:**
```
Student types name → Clicks Continue → Name saved → Navigate to poll screen
```

**Code:**
```typescript
const handleContinue = () => {
  setStudentName(name.trim()); // Save to sessionStorage
  getSessionId(); // Generate unique session ID
  navigate('/student/poll');
};
```

**SessionStorage After:**
```javascript
{
  polling_role: 'student',
  polling_student_name: 'John Doe',
  polling_session_id: 'session_1234567890_abc123'
}
```

**Why Session ID?**
- Unique per browser tab
- Allows same person to join from multiple tabs
- Tracks individual sessions

---

### Step 3: Socket Connection Established

**Component:** `StudentPoll.tsx`

**What Happens:**
```
Component mounts → Initialize Socket.io → Connect to server
```

**Code (Client Side):**
```typescript
// utils/socket.ts
export const initSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      transports: ['websocket'], // Use WebSocket transport
      autoConnect: true,          // Connect automatically
    });
  }
  return socket;
};

// StudentPoll.tsx
useEffect(() => {
  const socket = initSocket(); // Create connection
  
  // Connection established!
  socket.on('connect', () => {
    console.log('Connected to server!', socket.id);
  });
}, []);
```

**Server Side (socket/pollSocket.ts):**
```typescript
io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);
  // socket.id = unique identifier for this connection
  // Example: "abc123xyz"
});
```

**What Just Happened:**
1. Client creates WebSocket connection
2. Server accepts connection
3. Both have reference to each other via `socket.id`
4. Connection stays open for real-time communication

---

### Step 4: Student Joins the Poll System

**What Happens:**
```
Socket connected → Emit 'student:join' event → Server registers student
```

**Code (Client - StudentPoll.tsx):**
```typescript
useEffect(() => {
  const socket = initSocket();
  const studentName = getStudentName();    // "John Doe"
  const sessionId = getSessionId();        // "session_1234567890_abc123"

  // Emit event to server
  socket.emit('student:join', { 
    name: studentName, 
    sessionId: sessionId 
  });
}, []);
```

**Code (Server - socket/pollSocket.ts):**
```typescript
socket.on('student:join', async (data: StudentJoinData) => {
  const { name, sessionId } = data;
  
  // 1. Register student in database
  const student = await studentService.registerStudent(name, sessionId);
  
  // 2. Check if student is kicked
  if (student.isKicked) {
    socket.emit('student:kicked', {
      message: 'You have been removed'
    });
    return;
  }
  
  // 3. Store in memory (for quick access)
  connectedStudents.set(sessionId, {
    id: student.id,
    name: student.name,
    sessionId: student.sessionId,
    hasAnswered: false,
    socketId: socket.id  // Link socket to student
  });
  
  // 4. Store student ID in socket data
  socket.data.studentId = student.id;
  socket.data.sessionId = sessionId;
  socket.data.role = 'student';
  
  // 5. Send confirmation back to student
  socket.emit('student:joined', {
    student: {
      id: student.id,
      name: student.name,
      sessionId: student.sessionId
    }
  });
  
  // 6. Broadcast to everyone (including teacher)
  io.emit('participants:update', Array.from(connectedStudents.values()));
});
```

**Database After:**
```sql
-- Student table
INSERT INTO Student (id, name, sessionId, joinedAt, isKicked)
VALUES ('uuid-123', 'John Doe', 'session_1234567890_abc123', NOW(), false);
```

**Memory (Server):**
```javascript
connectedStudents = Map {
  'session_1234567890_abc123' => {
    id: 'uuid-123',
    name: 'John Doe',
    sessionId: 'session_1234567890_abc123',
    hasAnswered: false,
    socketId: 'abc123xyz'
  }
}
```

**Client Receives:**
```typescript
socket.on('student:joined', (data) => {
  setStudentId(data.student.id); // Save to sessionStorage
  // Student is now registered!
});
```

---

### Step 5: Student Waits for Poll

**What Happens:**
```
No active poll → Show waiting screen → Listen for 'poll:new' event
```

**Code (Client - StudentPoll.tsx):**
```typescript
const [poll, setPoll] = useState<Poll | null>(null);

useEffect(() => {
  const socket = getSocket();
  
  // Listen for new poll
  socket.on('poll:new', (data: any) => {
    setPoll(data.poll);
    setTimeRemaining(data.poll.timeRemaining);
    setHasAnswered(false);
    setSelectedOption(null);
  });
  
  return () => {
    socket.off('poll:new'); // Cleanup
  };
}, []);

// Render logic
if (!poll) {
  return <StudentWaiting />; // Shows spinner
}
```

**StudentWaiting Component:**
```typescript
const StudentWaiting = () => (
  <div className="text-center">
    <div className="spinner"></div>
    <h2>Wait for the teacher to ask questions..</h2>
  </div>
);
```


## 👨‍🏫 Teacher Flow - Complete Journey {#teacher-flow}

### Step 1: Teacher Opens Application

**What Happens:**
```
Browser → Loads React App → Selects "I'm a Teacher" → Navigate to create poll
```

**Code:**
```typescript
const handleContinue = () => {
  setRole('teacher');
  navigate('/teacher/create');
};
```

---

### Step 2: Teacher Connects to Socket

**Component:** `TeacherDashboard.tsx`

**Code:**
```typescript
useEffect(() => {
  const socket = initSocket();
  
  // Identify as teacher
  socket.emit('teacher:connect');
  
  socket.data.role = 'teacher';
}, []);
```

**Server Side:**
```typescript
socket.on('teacher:connect', () => {
  socket.data.role = 'teacher';
  console.log('Teacher connected:', socket.id);
  
  // Send current participants
  socket.emit('participants:update', 
    Array.from(connectedStudents.values())
  );
});
```

---

### Step 3: Teacher Creates Poll

**What Happens:**
```
Teacher fills form → Clicks "Ask Question" → Emit 'teacher:create-poll'
```

**Code (Client - TeacherCreatePoll.tsx):**
```typescript
const handleSubmit = () => {
  const pollData = {
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Venus", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
    timeLimit: 60
  };
  
  onCreatePoll(pollData); // Passed from TeacherDashboard
};

// TeacherDashboard.tsx
const handleCreatePoll = (data: CreatePollData) => {
  const socket = getSocket();
  socket?.emit('teacher:create-poll', data);
};
```

**Server Side (socket/pollSocket.ts):**
```typescript
socket.on('teacher:create-poll', async (data: CreatePollData) => {
  // 1. Check if poll already active
  const activePoll = await pollService.getActivePoll();
  if (activePoll) {
    socket.emit('error', { message: 'Poll already active' });
    return;
  }
  
  // 2. Create poll in database
  const poll = await pollService.createPoll(data);
  
  // Database:
  // INSERT INTO Poll (id, question, correctAnswer, status, timeLimit)
  // VALUES ('poll-uuid', 'Which planet...', 'Mars', 'active', 60);
  //
  // INSERT INTO Option (id, text, pollId)
  // VALUES ('opt-1', 'Mars', 'poll-uuid'),
  //        ('opt-2', 'Venus', 'poll-uuid'),
  //        ('opt-3', 'Jupiter', 'poll-uuid'),
  //        ('opt-4', 'Saturn', 'poll-uuid');
  
  currentPollId = poll.id;
  
  // 3. Reset all students' answered status
  connectedStudents.forEach((student) => {
    student.hasAnswered = false;
  });
  
  // 4. Broadcast to ALL clients (teacher + all students)
  io.emit('poll:new', {
    poll: {
      id: poll.id,
      question: poll.question,
      options: poll.options,
      timeLimit: poll.timeLimit,
      timeRemaining: poll.timeLimit
    }
  });
  
  // 5. Start server-side timer
  startPollTimer(io, poll.id, poll.timeLimit);
});
```

**Timer Function:**
```typescript
let pollTimer: NodeJS.Timeout | null = null;

function startPollTimer(io: Server, pollId: string, duration: number) {
  // Clear existing timer
  if (pollTimer) {
    clearTimeout(pollTimer);
  }
  
  // Set new timer
  pollTimer = setTimeout(async () => {
    await endPoll(io, pollId);
  }, duration * 1000); // 60 seconds = 60000ms
}
```

**All Clients Receive:**
```typescript
// Teacher sees this
socket.on('poll:new', (data) => {
  setActivePoll(data.poll);
  // Show live results view
});

// Students see this
socket.on('poll:new', (data) => {
  setPoll(data.poll);
  setTimeRemaining(data.poll.timeRemaining);
  // Show answer form
});
```

---

### Step 4: Student Submits Answer

**What Happens:**
```
Student selects option → Clicks Submit → Emit 'student:submit-answer'
```

**Code (Client - StudentPoll.tsx):**
```typescript
const handleSubmit = () => {
  const socket = getSocket();
  const studentId = getStudentId();
  
  socket?.emit('student:submit-answer', {
    studentId: studentId,
    pollId: poll.id,
    optionId: selectedOption
  });
  
  setHasAnswered(true);
};
```

**Server Side:**
```typescript
socket.on('student:submit-answer', async (data: SubmitAnswerData) => {
  const { studentId, pollId, optionId } = data;
  
  // 1. Verify student
  if (socket.data.studentId !== studentId) {
    socket.emit('error', { message: 'Invalid student' });
    return;
  }
  
  // 2. Check if kicked
  const isKicked = await studentService.isStudentKicked(studentId);
  if (isKicked) {
    socket.emit('student:kicked');
    return;
  }
  
  // 3. Save answer to database
  await pollService.submitAnswer(studentId, pollId, optionId);
  
  // Database:
  // INSERT INTO Response (id, studentId, pollId, optionId, answeredAt)
  // VALUES ('resp-uuid', 'student-uuid', 'poll-uuid', 'opt-1', NOW());
  
  // 4. Update student's answered status
  const studentData = connectedStudents.get(socket.data.sessionId);
  if (studentData) {
    studentData.hasAnswered = true;
  }
  
  // 5. Calculate new results
  const totalStudents = connectedStudents.size;
  const poll = await pollService.getPollById(pollId);
  const timeElapsed = Math.floor((Date.now() - poll.createdAt.getTime()) / 1000);
  const timeRemaining = Math.max(0, poll.timeLimit - timeElapsed);
  
  const results = await pollService.calculateResults(
    pollId, 
    totalStudents, 
    timeRemaining
  );
  
  // Results calculation:
  // {
  //   pollId: 'poll-uuid',
  //   question: 'Which planet...',
  //   options: [
  //     { id: 'opt-1', text: 'Mars', count: 3, percentage: 75, isCorrect: true },
  //     { id: 'opt-2', text: 'Venus', count: 1, percentage: 25, isCorrect: false },
  //     { id: 'opt-3', text: 'Jupiter', count: 0, percentage: 0, isCorrect: false },
  //     { id: 'opt-4', text: 'Saturn', count: 0, percentage: 0, isCorrect: false }
  //   ],
  //   totalResponses: 4,
  //   totalStudents: 5,
  //   timeRemaining: 45,
  //   status: 'active'
  // }
  
  // 6. Broadcast to EVERYONE (teacher + all students)
  io.emit('poll:update', results);
  
  // 7. Broadcast updated participant list
  io.emit('participants:update', Array.from(connectedStudents.values()));
  
  // 8. Check if all students answered
  const allAnswered = await pollService.checkAllStudentsAnswered(
    pollId, 
    totalStudents
  );
  
  if (allAnswered) {
    // End poll early!
    clearTimeout(pollTimer);
    await endPoll(io, pollId);
  }
});
```

**All Clients Receive Update:**
```typescript
socket.on('poll:update', (results) => {
  setResults(results);
  setTimeRemaining(results.timeRemaining);
  // Progress bars animate to new percentages!
});

socket.on('participants:update', (participants) => {
  setParticipants(participants);
  // Teacher sees who answered (checkmarks)
});
```


## ⚡ Real-time Communication Deep Dive {#realtime}

### How WebSocket Events Work

**Event Emission:**
```typescript
// Client sends to server
socket.emit('event-name', data);

// Server sends to specific client
socket.emit('event-name', data);

// Server broadcasts to ALL clients
io.emit('event-name', data);

// Server broadcasts to all EXCEPT sender
socket.broadcast.emit('event-name', data);
```

### Live Results Update Flow

**Scenario:** 5 students connected, 1 submits answer

```
┌─────────────────────────────────────────────────────────┐
│ Student 1 clicks Submit                                  │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Client: socket.emit('student:submit-answer', {...})     │
└────────────┬────────────────────────────────────────────┘
             │
             │ WebSocket
             ▼
┌─────────────────────────────────────────────────────────┐
│ Server: Receives event                                   │
│ 1. Validate student                                      │
│ 2. Save to database                                      │
│ 3. Calculate new percentages                             │
│    - Mars: 1/1 = 100%                                    │
│ 4. Prepare results object                                │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Server: io.emit('poll:update', results)                  │
│ Broadcasts to ALL connected clients                      │
└────────────┬────────────────────────────────────────────┘
             │
             ├──────────┬──────────┬──────────┬──────────┐
             ▼          ▼          ▼          ▼          ▼
         Teacher    Student1   Student2   Student3   Student4
         
         All receive the same data simultaneously!
         
         Progress bars animate:
         Mars: 0% → 100%
```

**Second Student Submits:**
```
Student 2 submits "Venus"
↓
Server calculates:
- Mars: 1/2 = 50%
- Venus: 1/2 = 50%
↓
io.emit('poll:update', newResults)
↓
All clients update:
Mars: 100% → 50%
Venus: 0% → 50%
```

### Timer Synchronization

**Problem:** How do all clients show the same countdown?

**Solution:** Server is the source of truth

```typescript
// Server creates poll at: 10:00:00
// timeLimit: 60 seconds
// Poll should end at: 10:01:00

// Student joins at 10:00:15 (15 seconds late)
socket.on('student:join', async (data) => {
  // ... registration code ...
  
  const activePoll = await pollService.getActivePoll();
  if (activePoll) {
    // Calculate time elapsed
    const timeElapsed = Math.floor(
      (Date.now() - activePoll.createdAt.getTime()) / 1000
    );
    
    // Calculate remaining time
    const timeRemaining = Math.max(0, activePoll.timeLimit - timeElapsed);
    // timeRemaining = 60 - 15 = 45 seconds
    
    socket.emit('poll:new', {
      poll: {
        ...activePoll,
        timeRemaining: timeRemaining // 45 seconds
      }
    });
  }
});
```

**Client Side:**
```typescript
// Receive poll with correct time remaining
socket.on('poll:new', (data) => {
  setTimeRemaining(data.poll.timeRemaining); // 45 seconds
});

// Client-side countdown (for display only)
useEffect(() => {
  if (timeRemaining > 0) {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }
}, [timeRemaining]);

// Server enforces the actual deadline
```

### Poll End Scenarios

**Scenario 1: Timer Expires**
```typescript
// Server (60 seconds elapsed)
setTimeout(async () => {
  await endPoll(io, pollId);
}, 60000);

async function endPoll(io: Server, pollId: string) {
  // 1. Close poll in database
  const poll = await pollService.closePoll(pollId);
  // UPDATE Poll SET status='closed', endedAt=NOW() WHERE id=pollId
  
  // 2. Calculate final results
  const results = await pollService.calculateResults(pollId, totalStudents, 0);
  
  // 3. Broadcast to everyone
  io.emit('poll:ended', results);
  
  currentPollId = null;
}
```

**Scenario 2: All Students Answered**
```typescript
// After each answer submission
const allAnswered = await pollService.checkAllStudentsAnswered(
  pollId, 
  totalStudents
);

if (allAnswered) {
  clearTimeout(pollTimer); // Cancel timer
  await endPoll(io, pollId); // End immediately
}
```

**Scenario 3: Teacher Stops Manually**
```typescript
// Client
socket.emit('teacher:stop-poll', { pollId });

// Server
socket.on('teacher:stop-poll', async (data) => {
  if (socket.data.role !== 'teacher') {
    return; // Only teacher can stop
  }
  
  clearTimeout(pollTimer);
  await endPoll(io, data.pollId);
});
```

**All Clients Receive:**
```typescript
socket.on('poll:ended', (finalResults) => {
  setResults(finalResults);
  setPoll(null);
  setTimeRemaining(0);
  // Show final results
  // Enable "Ask new question" for teacher
  // Show "Wait for next question" for students
});
```

### Connection Management

**Student Disconnects:**
```typescript
socket.on('disconnect', () => {
  console.log('Client disconnected:', socket.id);
  
  // Remove from connected students
  if (socket.data.sessionId) {
    connectedStudents.delete(socket.data.sessionId);
    
    // Broadcast updated participant list
    io.emit('participants:update', 
      Array.from(connectedStudents.values())
    );
  }
  
  // Note: Their answer is still saved in database!
});
```

**Student Reconnects:**
```typescript
// Client automatically reconnects (Socket.io feature)
socket.on('connect', () => {
  // Re-join the system
  socket.emit('student:join', { name, sessionId });
  
  // Server will:
  // 1. Find existing student in database
  // 2. Re-add to connectedStudents
  // 3. Send current poll if active
});
```

### Kick Student Feature

**Teacher Kicks Student:**
```typescript
// Client
socket.emit('teacher:remove-student', { studentId: 'uuid-123' });

// Server
socket.on('teacher:remove-student', async (data) => {
  if (socket.data.role !== 'teacher') return;
  
  const { studentId } = data;
  
  // 1. Mark as kicked in database
  await studentService.kickStudent(studentId);
  // UPDATE Student SET isKicked=true WHERE id=studentId
  
  // 2. Find student's socket
  const studentEntry = Array.from(connectedStudents.entries())
    .find(([_, student]) => student.id === studentId);
  
  if (studentEntry) {
    const [sessionId, student] = studentEntry;
    const studentSocket = io.sockets.sockets.get(student.socketId);
    
    if (studentSocket) {
      // 3. Notify student
      studentSocket.emit('student:kicked', {
        message: 'You have been removed'
      });
      
      // 4. Disconnect them
      studentSocket.disconnect();
    }
    
    // 5. Remove from memory
    connectedStudents.delete(sessionId);
  }
  
  // 6. Update participant list
  io.emit('participants:update', 
    Array.from(connectedStudents.values())
  );
});
```

**Student Receives Kick:**
```typescript
socket.on('student:kicked', () => {
  setIsKicked(true);
  // Show "You've been kicked out" screen
});
```


## 💻 Complete Code Examples {#code-examples}

### Full Client-Side Socket Setup

**utils/socket.ts:**
```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';
let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
    
    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to server:', socket.id);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Full Student Component

**StudentPoll.tsx (Simplified):**
```typescript
import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../utils/socket';
import { getStudentName, getSessionId, getStudentId, setStudentId } from '../utils/sessionStorage';

const StudentPoll = () => {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isKicked, setIsKicked] = useState(false);

  // Setup socket connection and listeners
  useEffect(() => {
    const socket = initSocket();
    const studentName = getStudentName();
    const sessionId = getSessionId();

    // Join as student
    socket.emit('student:join', { name: studentName, sessionId });

    // Listen for successful join
    socket.on('student:joined', (data) => {
      setStudentId(data.student.id);
      console.log('✅ Joined as:', data.student.name);
    });

    // Listen for new poll
    socket.on('poll:new', (data) => {
      console.log('📊 New poll received:', data.poll.question);
      setPoll(data.poll);
      setTimeRemaining(data.poll.timeRemaining);
      setHasAnswered(false);
      setSelectedOption(null);
      setResults(null);
    });

    // Listen for live updates
    socket.on('poll:update', (data) => {
      console.log('📈 Results updated:', data);
      setResults(data);
      setTimeRemaining(data.timeRemaining);
    });

    // Listen for poll end
    socket.on('poll:ended', (data) => {
      console.log('🏁 Poll ended');
      setResults(data);
      setPoll(null);
      setTimeRemaining(0);
    });

    // Listen for kick
    socket.on('student:kicked', () => {
      console.log('⛔ Kicked out');
      setIsKicked(true);
    });

    // Cleanup
    return () => {
      socket.off('student:joined');
      socket.off('poll:new');
      socket.off('poll:update');
      socket.off('poll:ended');
      socket.off('student:kicked');
    };
  }, []);

  // Client-side timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && poll && !hasAnswered) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, poll, hasAnswered]);

  // Submit answer
  const handleSubmit = () => {
    if (!selectedOption || !poll) return;

    const socket = getSocket();
    const studentId = getStudentId();

    console.log('📤 Submitting answer:', selectedOption);
    
    socket?.emit('student:submit-answer', {
      studentId,
      pollId: poll.id,
      optionId: selectedOption,
    });

    setHasAnswered(true);
  };

  // Render logic
  if (isKicked) {
    return <div>You've been kicked out!</div>;
  }

  if (results) {
    return <PollResults results={results} />;
  }

  if (!poll) {
    return <StudentWaiting />;
  }

  return (
    <div>
      <h2>{poll.question}</h2>
      <p>Time: {timeRemaining}s</p>
      
      {poll.options.map((option) => (
        <label key={option.id}>
          <input
            type="radio"
            value={option.id}
            checked={selectedOption === option.id}
            onChange={() => setSelectedOption(option.id)}
            disabled={hasAnswered}
          />
          {option.text}
        </label>
      ))}
      
      <button 
        onClick={handleSubmit} 
        disabled={!selectedOption || hasAnswered}
      >
        {hasAnswered ? 'Submitted' : 'Submit'}
      </button>
    </div>
  );
};

export default StudentPoll;
```

### Full Server-Side Socket Handler

**socket/pollSocket.ts (Key Parts):**
```typescript
import { Server, Socket } from 'socket.io';
import pollService from '../services/pollService.js';
import studentService from '../services/studentService.js';

// In-memory storage
const connectedStudents = new Map();
let pollTimer: NodeJS.Timeout | null = null;
let currentPollId: string | null = null;

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id);

    // ==================== STUDENT EVENTS ====================
    
    socket.on('student:join', async (data) => {
      try {
        const { name, sessionId } = data;
        console.log('👨‍🎓 Student joining:', name);

        // Register in database
        const student = await studentService.registerStudent(name, sessionId);

        // Check if kicked
        if (student.isKicked) {
          socket.emit('student:kicked', { message: 'Removed' });
          return;
        }

        // Store in memory
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

        // Confirm join
        socket.emit('student:joined', { student });

        // Broadcast participant list
        io.emit('participants:update', 
          Array.from(connectedStudents.values())
        );

        // Send active poll if exists
        const activePoll = await pollService.getActivePoll();
        if (activePoll) {
          const timeElapsed = Math.floor(
            (Date.now() - activePoll.createdAt.getTime()) / 1000
          );
          const timeRemaining = Math.max(0, activePoll.timeLimit - timeElapsed);

          socket.emit('poll:new', {
            poll: {
              ...activePoll,
              timeRemaining,
            },
          });
        }

        console.log('✅ Student joined:', name);
      } catch (error) {
        console.error('❌ Error in student:join:', error);
        socket.emit('error', { message: 'Failed to join' });
      }
    });

    socket.on('student:submit-answer', async (data) => {
      try {
        const { studentId, pollId, optionId } = data;
        console.log('📝 Answer submitted:', studentId, optionId);

        // Verify student
        if (socket.data.studentId !== studentId) {
          socket.emit('error', { message: 'Invalid student' });
          return;
        }

        // Save answer
        await pollService.submitAnswer(studentId, pollId, optionId);

        // Update answered status
        const studentData = connectedStudents.get(socket.data.sessionId);
        if (studentData) {
          studentData.hasAnswered = true;
        }

        // Calculate results
        const totalStudents = connectedStudents.size;
        const poll = await pollService.getPollById(pollId);
        const timeElapsed = Math.floor(
          (Date.now() - poll.createdAt.getTime()) / 1000
        );
        const timeRemaining = Math.max(0, poll.timeLimit - timeElapsed);

        const results = await pollService.calculateResults(
          pollId,
          totalStudents,
          timeRemaining
        );

        // Broadcast to everyone
        io.emit('poll:update', results);
        io.emit('participants:update', 
          Array.from(connectedStudents.values())
        );

        // Check if all answered
        const allAnswered = await pollService.checkAllStudentsAnswered(
          pollId,
          totalStudents
        );

        if (allAnswered) {
          console.log('✅ All students answered!');
          await endPoll(io, pollId);
        }

        console.log('✅ Answer processed');
      } catch (error) {
        console.error('❌ Error in submit-answer:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // ==================== TEACHER EVENTS ====================

    socket.on('teacher:connect', () => {
      socket.data.role = 'teacher';
      console.log('👨‍🏫 Teacher connected');

      // Send current participants
      socket.emit('participants:update', 
        Array.from(connectedStudents.values())
      );
    });

    socket.on('teacher:create-poll', async (data) => {
      try {
        console.log('📊 Creating poll:', data.question);

        // Check if poll exists
        const activePoll = await pollService.getActivePoll();
        if (activePoll) {
          socket.emit('error', { message: 'Poll already active' });
          return;
        }

        // Create poll
        const poll = await pollService.createPoll(data);
        currentPollId = poll.id;

        // Reset answered status
        connectedStudents.forEach((student) => {
          student.hasAnswered = false;
        });

        // Broadcast to everyone
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

        console.log('✅ Poll created and broadcasted');
      } catch (error) {
        console.error('❌ Error creating poll:', error);
        socket.emit('error', { message: 'Failed to create poll' });
      }
    });

    socket.on('teacher:stop-poll', async (data) => {
      if (socket.data.role !== 'teacher') return;
      
      console.log('⏹️ Teacher stopping poll');
      await endPoll(io, data.pollId);
    });

    // ==================== DISCONNECT ====================

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);

      if (socket.data.sessionId) {
        connectedStudents.delete(socket.data.sessionId);
        io.emit('participants:update', 
          Array.from(connectedStudents.values())
        );
      }
    });
  });
}

// Helper functions
function startPollTimer(io: Server, pollId: string, duration: number) {
  if (pollTimer) {
    clearTimeout(pollTimer);
  }

  console.log(`⏱️ Timer started: ${duration} seconds`);

  pollTimer = setTimeout(async () => {
    console.log('⏰ Timer expired!');
    await endPoll(io, pollId);
  }, duration * 1000);
}

async function endPoll(io: Server, pollId: string) {
  try {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }

    console.log('🏁 Ending poll:', pollId);

    // Close in database
    const poll = await pollService.closePoll(pollId);

    // Calculate final results
    const totalStudents = connectedStudents.size;
    const results = await pollService.calculateResults(pollId, totalStudents, 0);

    // Broadcast end
    io.emit('poll:ended', results);

    currentPollId = null;

    console.log('✅ Poll ended successfully');
  } catch (error) {
    console.error('❌ Error ending poll:', error);
  }
}
```


## 🐛 Troubleshooting & Common Issues {#troubleshooting}

### Issue 1: Connection Refused

**Error:**
```
WebSocket connection to 'ws://localhost:3000' failed
```

**Causes:**
1. Server not running
2. Wrong URL
3. CORS issues

**Solutions:**
```bash
# Check if server is running
curl http://localhost:3000
# Should return: {"message":"Live Polling System API"}

# Check server logs
# Should see: "Server running on port 3000"

# Verify CORS settings in server/src/index.ts
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Must match client URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

### Issue 2: Events Not Received

**Problem:** Client emits event but server doesn't receive it

**Debug Steps:**
```typescript
// Client side - add logging
socket.emit('student:join', data);
console.log('📤 Emitted student:join:', data);

// Server side - add logging
socket.on('student:join', (data) => {
  console.log('📥 Received student:join:', data);
  // ... rest of code
});
```

**Common Causes:**
1. Event name typo (`student:join` vs `student:joined`)
2. Socket not connected yet
3. Data format incorrect

**Solution:**
```typescript
// Wait for connection before emitting
useEffect(() => {
  const socket = initSocket();
  
  socket.on('connect', () => {
    // Now it's safe to emit
    socket.emit('student:join', data);
  });
}, []);
```

### Issue 3: Multiple Connections

**Problem:** Same student creates multiple connections

**Cause:** Socket initialized multiple times

**Solution:**
```typescript
// ❌ Bad - creates new socket each time
useEffect(() => {
  const socket = io('http://localhost:3000');
  // ...
}, []);

// ✅ Good - reuses existing socket
useEffect(() => {
  const socket = initSocket(); // Returns existing if available
  // ...
}, []);
```

### Issue 4: Memory Leaks

**Problem:** Event listeners not cleaned up

**Solution:**
```typescript
useEffect(() => {
  const socket = getSocket();
  
  const handlePollNew = (data) => {
    setPoll(data.poll);
  };
  
  socket.on('poll:new', handlePollNew);
  
  // ✅ IMPORTANT: Cleanup!
  return () => {
    socket.off('poll:new', handlePollNew);
  };
}, []);
```

### Issue 5: State Not Updating

**Problem:** Received data but UI doesn't update

**Cause:** Stale closure in event handler

**Solution:**
```typescript
// ❌ Bad - uses stale state
useEffect(() => {
  socket.on('poll:update', (data) => {
    setResults(data);
    console.log(results); // Still shows old value!
  });
}, []);

// ✅ Good - use data directly
useEffect(() => {
  socket.on('poll:update', (data) => {
    setResults(data);
    console.log(data); // Shows new value
  });
}, []);
```

### Issue 6: Timer Desync

**Problem:** Different clients show different times

**Cause:** Client-side timer drift

**Solution:**
```typescript
// Server sends time remaining with each update
io.emit('poll:update', {
  ...results,
  timeRemaining: actualTimeRemaining // From server
});

// Client syncs with server time
socket.on('poll:update', (data) => {
  setTimeRemaining(data.timeRemaining); // Reset to server time
});
```

### Debugging Tools

**1. Browser DevTools - Network Tab:**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Click on the WebSocket connection
5. See all messages sent/received
```

**2. Socket.io Debug Mode:**
```typescript
// Client
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true,
  debug: true, // Enable debug logs
});

// Or set localStorage
localStorage.debug = 'socket.io-client:*';
```

**3. Server Logging:**
```typescript
// Add detailed logging
socket.on('student:join', async (data) => {
  console.log('='.repeat(50));
  console.log('EVENT: student:join');
  console.log('Socket ID:', socket.id);
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('='.repeat(50));
  
  // ... rest of code
});
```

### Performance Tips

**1. Throttle Updates:**
```typescript
// Don't emit on every keystroke
const debouncedEmit = debounce((data) => {
  socket.emit('event', data);
}, 300);
```

**2. Batch Updates:**
```typescript
// Instead of multiple emits
socket.emit('update1', data1);
socket.emit('update2', data2);
socket.emit('update3', data3);

// Send one combined update
socket.emit('batch-update', {
  update1: data1,
  update2: data2,
  update3: data3,
});
```

**3. Use Rooms (Advanced):**
```typescript
// Group students by class
socket.join(`class-${classId}`);

// Emit only to specific class
io.to(`class-${classId}`).emit('poll:new', data);
```

---

## 🎓 Key Takeaways

### WebSocket Fundamentals

1. **Persistent Connection**: One connection stays open for bidirectional communication
2. **Event-Based**: Communication happens through named events
3. **Real-time**: Updates happen instantly without polling
4. **Efficient**: Lower overhead than HTTP requests

### Our Implementation

1. **Socket.io**: Provides reliability and ease of use
2. **Event-Driven**: Clear separation of concerns
3. **Server Authority**: Server is source of truth for timing and validation
4. **Broadcast Pattern**: One event reaches all connected clients
5. **State Sync**: Database + memory for fast access

### Best Practices

1. **Always cleanup listeners** in useEffect return
2. **Validate on server** - never trust client data
3. **Handle disconnections** gracefully
4. **Log everything** during development
5. **Test with multiple clients** to catch race conditions

### Common Patterns

**Request-Response:**
```typescript
// Client
socket.emit('get-data', { id: 123 });
socket.on('data-response', (data) => {
  // Handle response
});

// Server
socket.on('get-data', async (data) => {
  const result = await fetchData(data.id);
  socket.emit('data-response', result);
});
```

**Broadcast:**
```typescript
// Server sends to everyone
io.emit('announcement', { message: 'Hello all!' });

// All clients receive
socket.on('announcement', (data) => {
  console.log(data.message);
});
```

**Room-based:**
```typescript
// Join room
socket.join('room-name');

// Emit to room
io.to('room-name').emit('event', data);

// Leave room
socket.leave('room-name');
```

---

## 🚀 Next Steps

Now that you understand WebSockets:

1. **Experiment**: Try adding new events
2. **Debug**: Use browser DevTools to see messages
3. **Extend**: Add features like private messaging
4. **Optimize**: Implement rooms for scalability
5. **Deploy**: Test with real network latency

### Additional Resources

- [Socket.io Documentation](https://socket.io/docs/)
- [WebSocket MDN Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Real-time Best Practices](https://socket.io/docs/v4/performance-tuning/)

---

**You now have a complete understanding of how WebSockets power the Live Polling System!** 🎉

The key is: **Server broadcasts events → All connected clients receive instantly → UI updates in real-time**

Happy coding! 🚀
