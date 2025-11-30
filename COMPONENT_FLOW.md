# Component Flow & Architecture

## 🎭 User Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│                     Landing Page                             │
│                  (RoleSelection.tsx)                         │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  I'm a Student   │         │  I'm a Teacher   │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐      ┌───────────────────────┐
│  Student Name Entry   │      │  Teacher Dashboard    │
│ (StudentNameEntry)    │      │ (TeacherDashboard)    │
└───────────┬───────────┘      └───────────┬───────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐      ┌───────────────────────┐
│   Student Waiting     │      │  Create Poll Form     │
│  (StudentWaiting)     │      │ (TeacherCreatePoll)   │
└───────────┬───────────┘      └───────────┬───────────┘
            │                              │
            │    ◄─── Socket.io ───►       │
            │      (poll:new)              │
            ▼                              ▼
┌───────────────────────┐      ┌───────────────────────┐
│   Answer Poll         │      │   View Live Results   │
│  (StudentPoll)        │      │   (PollResults)       │
│                       │      │   + Participants      │
│  - Select option      │      │   + Stop button       │
│  - Submit answer      │      │                       │
└───────────┬───────────┘      └───────────┬───────────┘
            │                              │
            │    ◄─── Socket.io ───►       │
            │    (student:submit)          │
            │    (poll:update)             │
            ▼                              ▼
┌───────────────────────┐      ┌───────────────────────┐
│   View Results        │      │   Poll Ended          │
│  (PollResults)        │      │   - Ask new question  │
│                       │      │   - View history      │
│  Wait for next poll   │      │                       │
└───────────────────────┘      └───────────────────────┘
```

## 🔄 Real-time Data Flow

```
Teacher Creates Poll
        │
        ▼
┌───────────────────┐
│  Socket.io Server │
│  (pollSocket.ts)  │
└─────────┬─────────┘
          │
          ├─► Broadcast: poll:new
          │   ├─► All Students receive new poll
          │   └─► Timer starts (60 seconds)
          │
Student Submits Answer
          │
          ▼
┌───────────────────┐
│  Database         │
│  (Prisma)         │
└─────────┬─────────┘
          │
          ├─► Calculate percentages
          │
          ▼
┌───────────────────┐
│  Socket.io Server │
└─────────┬─────────┘
          │
          ├─► Broadcast: poll:update
          │   ├─► Teacher sees live results
          │   ├─► Students see live results
          │   └─► Participant list updates
          │
Check if all answered OR timer expired
          │
          ▼
┌───────────────────┐
│  Close Poll       │
└─────────┬─────────┘
          │
          ├─► Broadcast: poll:ended
          │   ├─► Show final results
          │   └─► Enable "Ask new question"
```

## 📦 Component Breakdown

### 1. RoleSelection.tsx
**Purpose**: Landing page for role selection
**State**:
- `selectedRole`: 'student' | 'teacher' | null

**Actions**:
- Click card → Select role
- Click Continue → Navigate to appropriate flow

**Styling**: 
- Two cards side by side
- Purple border when selected
- Centered layout

---

### 2. StudentNameEntry.tsx
**Purpose**: Capture student name
**State**:
- `name`: string

**Actions**:
- Type name → Update state
- Press Enter or Click Continue → Save to sessionStorage → Navigate to poll

**Storage**:
- sessionStorage: student name
- sessionStorage: unique sessionId

---

### 3. StudentWaiting.tsx
**Purpose**: Waiting screen when no active poll
**State**: None (static)

**Display**:
- Spinning loader
- "Wait for the teacher to ask questions.."

---

### 4. StudentPoll.tsx
**Purpose**: Main student interface for answering polls
**State**:
- `poll`: Current poll data
- `selectedOption`: Selected answer
- `hasAnswered`: Boolean
- `results`: Live results
- `timeRemaining`: Countdown timer
- `isKicked`: Kicked status

**Socket Events**:
- **Listen**: poll:new, poll:update, poll:ended, student:kicked
- **Emit**: student:join, student:submit-answer

**Flow**:
1. Join with name and sessionId
2. Wait for poll (show StudentWaiting)
3. Receive poll → Show question and options
4. Select option → Enable submit
5. Submit → Show results
6. Poll ends → Wait for next

---

### 5. TeacherCreatePoll.tsx
**Purpose**: Form to create new poll
**State**:
- `question`: string
- `options`: string[]
- `correctAnswer`: string
- `timeLimit`: number (default 60)

**Actions**:
- Type question
- Add/edit options (max 6)
- Select correct answer (radio buttons)
- Click "Ask Question" → Emit to server

**Validation**:
- Question required
- Min 2 options
- Correct answer must be selected

---

### 6. TeacherDashboard.tsx
**Purpose**: Main teacher interface
**State**:
- `activePoll`: Current poll
- `results`: Live results
- `participants`: Connected students
- `showHistory`: Boolean
- `pollHistory`: Past polls

**Socket Events**:
- **Listen**: participants:update, poll:update, poll:ended, error
- **Emit**: teacher:connect, teacher:create-poll, teacher:stop-poll, teacher:remove-student, teacher:get-history

**Views**:
1. Create Poll Form (TeacherCreatePoll)
2. Live Results (PollResults)
3. Poll History

---

### 7. PollResults.tsx
**Purpose**: Display live or final poll results
**Props**:
- `results`: PollResults data
- `role`: 'teacher' | 'student'
- `participants`: Student list (teacher only)
- `onAskNewQuestion`: Callback
- `onStopPoll`: Callback
- `onViewHistory`: Callback

**Display**:
- Question in dark gray box
- Options with animated progress bars
- Percentages and counts
- Participant list (teacher)
- Action buttons based on role and status

---

### 8. ChatPopup.tsx (Bonus)
**Purpose**: Real-time chat between teacher and students
**State**:
- `isOpen`: Boolean
- `messages`: Message[]
- `newMessage`: string

**Socket Events**:
- **Listen**: chat:message
- **Emit**: chat:message

**Features**:
- Floating button (bottom right)
- Popup chat window
- Message history
- Send messages
- Auto-scroll to latest

---

## 🎨 Styling System (Tailwind)

### Color Palette
```css
Primary:    bg-purple-600 (#7c3aed)
Hover:      bg-purple-700 (#6d28d9)
Light:      bg-purple-50  (#f5f3ff)
Background: bg-gray-50    (#f9fafb)
Text:       text-gray-900 (#111827)
Border:     border-gray-200 (#e5e7eb)
```

### Common Classes
```css
Container:  max-w-4xl bg-white rounded-xl p-12 shadow-sm
Button:     bg-purple-600 text-white px-8 py-3 rounded-lg
Input:      border-2 border-gray-200 rounded-lg px-4 py-3
Badge:      bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs
Card:       border-2 rounded-xl p-8 cursor-pointer
```

### Responsive Design
- Mobile: Full width, stacked layout
- Tablet: Adjusted padding
- Desktop: Max-width containers, centered

---

## 🔌 Socket.io Integration

### Client Setup (utils/socket.ts)
```typescript
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true,
});
```

### Event Pattern
```typescript
// Emit
socket.emit('event:name', data);

// Listen
socket.on('event:name', (data) => {
  // Handle data
});

// Cleanup
useEffect(() => {
  return () => {
    socket.off('event:name');
  };
}, []);
```

---

## 💾 State Management

### Session Storage
- `polling_session_id`: Unique per tab
- `polling_student_name`: Student name
- `polling_student_id`: Database ID
- `polling_role`: 'teacher' | 'student'

### Component State
- Local state with useState
- Real-time updates via Socket.io
- No Redux needed (simple app)

---

## 🚀 Performance Optimizations

1. **Socket Connection**: Single connection per client
2. **Event Cleanup**: Remove listeners on unmount
3. **Debouncing**: Timer updates every second (not milliseconds)
4. **Conditional Rendering**: Show only relevant components
5. **Lazy Loading**: Could add for chat/history

---

## 🧪 Testing Checklist

- [ ] Role selection works
- [ ] Student name saves to sessionStorage
- [ ] Teacher can create poll
- [ ] Students receive poll instantly
- [ ] Timer counts down correctly
- [ ] Submit answer works
- [ ] Results update in real-time
- [ ] Percentages calculate correctly
- [ ] Poll auto-closes after 60s
- [ ] Poll closes when all answer
- [ ] Teacher can stop manually
- [ ] Participant list updates
- [ ] Chat messages send/receive
- [ ] Poll history displays
- [ ] Kick student works
- [ ] Multiple tabs work independently

---

**This architecture ensures clean separation of concerns, real-time updates, and matches the Figma design perfectly!** 🎉
