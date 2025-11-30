# Quick Start Guide

## First Time Setup (5 minutes)

### 1. Get Your Database URL
You need a PostgreSQL database. Options:
- **Local**: Install PostgreSQL locally
- **Cloud**: Use [Supabase](https://supabase.com) (free tier)
- **Cloud**: Use [Neon](https://neon.tech) (free tier)
- **Cloud**: Use [Railway](https://railway.app) (free tier)

### 2. Configure Server

```bash
cd server
```

Edit `server/.env` and add your database URL:
```
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
# Name it: init
```

### 4. Start Everything

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```
✅ Server running on http://localhost:3000

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```
✅ Client running on http://localhost:5173

## Test It Out

### Open Two Browser Windows

**Window 1 - Teacher:**
1. Go to http://localhost:5173
2. Click "I'm a Teacher"
3. Create a poll:
   - Question: "Which planet is known as the Red Planet?"
   - Options: Mars, Venus, Jupiter, Saturn
   - Mark "Mars" as correct
4. Click "Ask Question"

**Window 2 - Student:**
1. Go to http://localhost:5173 (new tab/window)
2. Click "I'm a Student"
3. Enter name: "John Doe"
4. Select an answer
5. Click "Submit"

**Watch the Magic! ✨**
- Results update in real-time
- Timer counts down
- Participant list shows who answered
- Chat button appears (bottom right)

## Common Issues

### "Cannot connect to database"
- Check your DATABASE_URL is correct
- Ensure PostgreSQL is running
- Try: `npm run prisma:studio` to test connection

### "Port 3000 already in use"
- Change PORT in server/.env
- Update socket URL in client/src/utils/socket.ts

### "Module not found"
- Run `npm install` in both server and client folders

## What's Next?

- Deploy to production (see PROJECT_SETUP.md)
- Customize the design
- Add more features
- Submit your assignment!

## Need Help?

Check the logs:
- Server: Terminal 1 output
- Client: Browser Console (F12)
- Database: `npm run prisma:studio` (opens GUI)

---

**That's it! You're ready to go! 🚀**
