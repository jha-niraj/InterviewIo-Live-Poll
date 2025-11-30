# Database Setup Guide

## Current Status

✅ **Server Code**: Complete and builds successfully  
✅ **Prisma Client**: Generated  
⏳ **Database**: Needs connection verification  

## Your Database Configuration

You have a Neon PostgreSQL database configured in `.env`:
```
DATABASE_URL="postgresql://neondb_owner:npg_OmMgI4EZrP1S@ep-mute-smoke-a1bxzojy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## Next Steps

### Option 1: If Database Connection Works

If your Neon database is accessible, run:

```bash
# This will create all tables
npm run prisma:migrate

# When prompted for migration name, enter: init
```

### Option 2: If Connection Issues Persist

If you're having connection issues with Neon, you have two options:

**A. Check Neon Dashboard**
1. Go to [Neon Console](https://console.neon.tech)
2. Verify your project is active
3. Check if the database is running
4. Verify the connection string is correct
5. Check if your IP is allowed (Neon usually allows all IPs)

**B. Use Alternative Database**

If Neon isn't working, you can use:

1. **Supabase** (Recommended - Free Tier)
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get connection string from Settings → Database
   - Update `.env` with new URL

2. **Local PostgreSQL**
   ```bash
   # Install PostgreSQL locally
   # Then update .env:
   DATABASE_URL="postgresql://postgres:password@localhost:5432/polling_system"
   ```

3. **Railway** (Free Trial)
   - Go to [railway.app](https://railway.app)
   - Create PostgreSQL service
   - Copy connection string
   - Update `.env`

### After Database is Connected

Once your database connection works:

```bash
# 1. Generate Prisma Client (already done)
npm run prisma:generate

# 2. Create database tables
npm run prisma:migrate
# Name it: init

# 3. Verify tables were created
npm run prisma:studio
# This opens a GUI to view your database

# 4. Start the server
npm run dev
```

## Database Schema

The migration will create these tables:

### Poll
- id (UUID, Primary Key)
- question (String)
- correctAnswer (String)
- status (String: pending/active/closed)
- timeLimit (Integer, default: 60)
- createdAt (DateTime)
- endedAt (DateTime, nullable)

### Option
- id (UUID, Primary Key)
- text (String)
- pollId (UUID, Foreign Key → Poll)

### Student
- id (UUID, Primary Key)
- name (String)
- sessionId (String, Unique)
- joinedAt (DateTime)
- isKicked (Boolean, default: false)

### Response
- id (UUID, Primary Key)
- studentId (UUID, Foreign Key → Student)
- pollId (UUID, Foreign Key → Poll)
- optionId (UUID, Foreign Key → Option)
- answeredAt (DateTime)
- Unique constraint: (studentId, pollId)

## Troubleshooting

### Error: Can't reach database server

**Possible causes:**
1. Database is not running
2. Wrong connection string
3. Network/firewall issues
4. Database service is paused (Neon auto-pauses after inactivity)

**Solutions:**
1. Check Neon dashboard - database might be paused
2. Verify connection string is correct
3. Try accessing from Neon's SQL Editor first
4. Check if you need to activate the database

### Error: P3009 - Migrations failed

This usually means tables already exist. You can:
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or use db push for development
npx prisma db push
```

### Error: SSL/TLS issues

If you get SSL errors, try modifying the connection string:
```
# Remove channel_binding=require
DATABASE_URL="postgresql://neondb_owner:npg_OmMgI4EZrP1S@ep-mute-smoke-a1bxzojy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

## Verification Steps

After successful migration:

1. **Check tables exist:**
   ```bash
   npm run prisma:studio
   ```
   You should see: Poll, Option, Student, Response tables

2. **Test server connection:**
   ```bash
   npm run dev
   ```
   Should start without database errors

3. **Test API endpoint:**
   ```bash
   curl http://localhost:3000
   ```
   Should return: `{"message":"Live Polling System API"}`

## Current Build Status

✅ **TypeScript Compilation**: Successful  
✅ **All Type Errors**: Fixed  
✅ **Prisma Client**: Generated  
✅ **Server Code**: Ready to run  

**What's needed**: Database connection verification and migration

## Quick Test (Without Database)

You can test if the server starts (it will fail on database operations but the server will run):

```bash
npm run dev
```

You should see:
```
Server running on port 3000
Socket.io server ready
```

## When Everything Works

Once database is set up, you'll be able to:
- ✅ Create polls
- ✅ Students can join
- ✅ Submit answers
- ✅ View live results
- ✅ Store poll history
- ✅ All real-time features

## Need Help?

1. Check Neon dashboard for database status
2. Verify connection string is correct
3. Try alternative database provider
4. Check server logs for specific errors

---

**The server code is complete and ready. Just need the database connection working!** 🚀
