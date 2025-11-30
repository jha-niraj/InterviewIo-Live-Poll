# 📱 Screens Guide - Live Polling System

This guide shows all the screens in the application and when they appear.

## 🎭 Screen Flow Diagram

```
                    ┌─────────────────────┐
                    │   Landing Page      │
                    │  (Role Selection)   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌───────────────────┐         ┌───────────────────┐
    │  Student Path     │         │  Teacher Path     │
    └─────────┬─────────┘         └─────────┬─────────┘
              │                               │
              ▼                               ▼
    ┌───────────────────┐         ┌───────────────────┐
    │  Name Entry       │         │  Create Poll      │
    │  Screen           │         │  Form             │
    └─────────┬─────────┘         └─────────┬─────────┘
              │                               │
              ▼                               │
    ┌───────────────────┐                    │
    │  Waiting Screen   │◄───────────────────┘
    │  (No Active Poll) │         (Poll Created)
    └─────────┬─────────┘                    │
              │                               │
              │  ◄────── Socket.io ──────────┘
              │         (poll:new)
              ▼
    ┌───────────────────┐         ┌───────────────────┐
    │  Answer Poll      │         │  Live Results     │
    │  Screen           │         │  (Teacher View)   │
    └─────────┬─────────┘         └─────────┬─────────┘
              │                               │
              │  ◄────── Socket.io ──────────┤
              │      (poll:update)            │
              ▼                               ▼
    ┌───────────────────┐         ┌───────────────────┐
    │  Results View     │         │  Poll Ended       │
    │  (Student)        │         │  + History Option │
    └───────────────────┘         └───────────────────┘
```

## 📸 Screen Descriptions

### 1. Landing Page (Role Selection)
**Route**: `/`  
**Component**: `RoleSelection.tsx`

**What You See**:
- Purple badge: "# InterVue"
- Title: "Welcome to the Live Polling System"
- Subtitle explaining the system
- Two cards side by side:
  - "I'm a Student" (left)
  - "I'm a Teacher" (right)
- Purple "Continue" button (disabled until selection)

**User Actions**:
- Click a card to select role
- Card gets purple border and background when selected
- Click "Continue" to proceed

**Design Details**:
- Centered layout
- White card on gray background
- Purple accent color (#7c3aed)
- Rounded corners (12px)
- Subtle shadow

---

### 2. Student Name Entry
**Route**: `/student/name`  
**Component**: `StudentNameEntry.tsx`

**What You See**:
- Purple badge: "# InterVue"
- Title: "Let's Get Started"
- Subtitle about student participation
- Input field labeled "Enter your Name"
- Placeholder: "Rahul Raju"
- Purple "Continue" button

**User Actions**:
- Type name in input field
- Press Enter or click "Continue"
- Name saved to sessionStorage
- Redirects to poll screen

**Design Details**:
- Narrower container (max-width: 600px)
- Input has 2px border
- Focus state: purple border
- Button disabled until name entered

---

### 3. Student Waiting Screen
**Route**: `/student/poll` (when no active poll)  
**Component**: `StudentWaiting.tsx`

**What You See**:
- Purple badge: "# InterVue"
- Spinning loader (purple circle)
- Text: "Wait for the teacher to ask questions.."

**User Actions**:
- None - passive waiting
- Automatically updates when poll starts

**Design Details**:
- Centered content
- Animated spinner (CSS animation)
- Simple, clean design

---

### 4. Teacher Create Poll
**Route**: `/teacher/create`  
**Component**: `TeacherCreatePoll.tsx`

**What You See**:
- Purple badge: "# InterVue"
- Title: "Let's Get Started"
- Subtitle about teacher capabilities
- Question input field
  - Label: "Enter your question"
  - Timer indicator: "60 seconds ❤️"
  - Character counter: "0/140"
- Options section
  - Label: "Edit Options" | "Is it Correct?"
  - Multiple option inputs (min 2, max 6)
  - Radio buttons for correct answer (Yes/No)
  - "+ Add More option" button
- Purple "Ask Question" button

**User Actions**:
- Type question
- Add/edit options
- Select correct answer
- Click "Ask Question" to create poll

**Design Details**:
- Form layout with clear sections
- Radio buttons for correct answer
- Add option button (text link style)
- Validation: requires question, 2+ options, correct answer

---

### 5. Student Answer Poll
**Route**: `/student/poll` (when poll active)  
**Component**: `StudentPoll.tsx`

**What You See**:
- Purple badge: "# InterVue"
- Header with:
  - "Question 1"
  - Timer: "00:45" (countdown in red)
- Question in dark gray box
- Radio button options (4 options shown)
- Purple "Submit" button

**User Actions**:
- Select one option (radio button)
- Click "Submit"
- Button disabled after submission
- Shows "Submitted" text

**Design Details**:
- Options have hover effect
- Selected option: purple border and background
- Timer in red color
- Disabled state after submission

---

### 6. Live Results (Student View)
**Route**: `/student/poll` (after answering)  
**Component**: `PollResults.tsx`

**What You See**:
- Purple badge: "# InterVue"
- "Question 1" with timer (if still active)
- Question in dark gray box
- Results for each option:
  - Option text with radio icon
  - Percentage (e.g., "75%")
  - Animated progress bar (purple)
  - Vote count inside bar
- Message: "Wait for the teacher to ask a new question.."

**User Actions**:
- None - view only
- Automatically updates as others answer
- Waits for next poll

**Design Details**:
- Progress bars animate smoothly
- Percentages update in real-time
- Clean, readable layout

---

### 7. Live Results (Teacher View)
**Route**: `/teacher/create` (after creating poll)  
**Component**: `PollResults.tsx` + `TeacherDashboard.tsx`

**What You See**:
- Purple badge: "# InterVue"
- "Stop Poll Manually" button (top right)
- "Question 1" with timer
- Question in dark gray box
- Results with progress bars
- Right sidebar:
  - "Participants" header with count badge
  - List of student names
  - Checkmark (✓) for answered students
- "+ Ask a new question" button (when poll ends)
- "View Poll History →" link (bottom)

**User Actions**:
- Watch live results update
- Stop poll manually
- Create new poll when ready
- View poll history

**Design Details**:
- Two-column layout
- Participant list on right
- Progress bars with percentages
- Action buttons at bottom

---

### 8. Poll History
**Route**: `/teacher/create` (history view)  
**Component**: `TeacherDashboard.tsx`

**What You See**:
- Title: "View Poll History"
- "← Back to Dashboard" button
- List of past polls:
  - "Question 1", "Question 2", etc.
  - Question text in dark box
  - Results with progress bars
  - Final percentages
- Scrollable list

**User Actions**:
- Scroll through history
- Click "Back to Dashboard"

**Design Details**:
- Each poll separated by border
- Same result visualization as live view
- Clean, organized layout

---

### 9. Student Kicked Screen
**Route**: `/student/poll` (when kicked)  
**Component**: `StudentPoll.tsx`

**What You See**:
- Purple badge: "# InterVue"
- Title: "You've been Kicked out !"
- Message: "Looks like the teacher had removed you from the poll system. Please try again sometime"

**User Actions**:
- None - terminal state
- Must refresh to rejoin

**Design Details**:
- Centered message
- Simple, clear communication
- No action buttons

---

### 10. Chat Popup (Bonus Feature)
**Component**: `ChatPopup.tsx`  
**Trigger**: Click floating button (bottom right)

**What You See**:
- Floating purple button with chat icon
- When opened:
  - Header: "Chat" with close button
  - Message list (scrollable)
  - Messages show sender name
  - Teacher messages: purple background
  - Student messages: gray background
  - Input field at bottom
  - "Send" button

**User Actions**:
- Click floating button to open
- Type message
- Press Enter or click "Send"
- Messages appear instantly
- Click X to close

**Design Details**:
- Fixed position (bottom right)
- Popup window (400px wide, 500px tall)
- Auto-scroll to latest message
- Different colors for roles

---

## 🎨 Design System

### Colors Used
```css
Primary Purple:    #7c3aed (bg-purple-600)
Hover Purple:      #6d28d9 (bg-purple-700)
Light Purple:      #f5f3ff (bg-purple-50)
Background Gray:   #f9fafb (bg-gray-50)
Dark Gray:         #374151 (bg-gray-700)
Text Dark:         #111827 (text-gray-900)
Text Medium:       #6b7280 (text-gray-600)
Border:            #e5e7eb (border-gray-200)
White:             #ffffff (bg-white)
Red (Timer):       #ef4444 (text-red-500)
```

### Typography
```css
Headings:   font-bold text-3xl (32px)
Subheading: font-semibold text-lg (18px)
Body:       font-normal text-sm (14px)
Labels:     font-semibold text-sm (14px)
Badge:      font-semibold text-xs (12px)
```

### Spacing
```css
Container Padding:  p-12 (48px)
Card Padding:       p-8 (32px)
Button Padding:     px-8 py-3 (32px, 12px)
Input Padding:      px-4 py-3 (16px, 12px)
Gap Between:        gap-5 (20px)
Margin Bottom:      mb-8 (32px)
```

### Border Radius
```css
Cards:      rounded-xl (12px)
Buttons:    rounded-lg (8px)
Inputs:     rounded-lg (8px)
Badge:      rounded-full (9999px)
Progress:   rounded-lg (8px)
```

## 📱 Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Full width containers
- Stacked cards
- Reduced padding
- Smaller text sizes

### Tablet (768px - 1024px)
- Adjusted padding
- Flexible layouts
- Readable text sizes

### Desktop (> 1024px)
- Max-width containers
- Two-column layouts (where applicable)
- Optimal spacing
- Full feature set

## 🎯 Key UI Patterns

### Loading States
- Spinning loader (purple circle)
- Animated rotation
- Centered on screen

### Empty States
- "Wait for teacher..." message
- Clear instructions
- Centered content

### Success States
- "Submitted" button text
- Checkmarks for answered
- Green indicators

### Error States
- Alert messages
- Red text for errors
- Clear error descriptions

### Interactive States
- Hover: Lighter background
- Focus: Purple border
- Active: Purple background
- Disabled: Gray background

## 🔄 Transitions & Animations

### Progress Bars
```css
transition: width 0.5s ease
```
- Smooth width changes
- 500ms duration
- Ease timing function

### Button Hover
```css
transition: background 0.2s
```
- Quick color change
- 200ms duration

### Spinner
```css
animation: spin 1s linear infinite
```
- Continuous rotation
- 1 second per rotation

### Page Transitions
- Instant navigation
- No fade effects
- Clean switches

---

## 🎬 User Flow Examples

### Example 1: Teacher Creates First Poll
1. **Landing** → Click "I'm a Teacher" → Click "Continue"
2. **Create Poll** → Type "Which planet is red?" → Add options → Mark correct → Click "Ask Question"
3. **Live Results** → Watch as students answer → See percentages update → See participant list
4. **Poll Ends** → Click "+ Ask a new question"

### Example 2: Student Joins and Answers
1. **Landing** → Click "I'm a Student" → Click "Continue"
2. **Name Entry** → Type "John" → Click "Continue"
3. **Waiting** → See spinner → Wait for poll
4. **Answer** → Poll appears → Select "Mars" → Click "Submit"
5. **Results** → See live results → Wait for next poll

### Example 3: Multiple Students Simultaneously
1. **Tab 1** (Teacher) → Create poll
2. **Tab 2** (Student 1) → Answer immediately
3. **Tab 3** (Student 2) → Answer 10 seconds later
4. **All Tabs** → See results update in real-time
5. **Tab 1** (Teacher) → See both students in participant list

---

**This guide covers all screens in the application. Each screen is designed to match the Figma specifications exactly!** 🎨
