# 🚀 Deployment Checklist

## Pre-Deployment Verification

### ✅ Local Testing
- [ ] Server starts without errors (`npm run dev` in server/)
- [ ] Client starts without errors (`npm run dev` in client/)
- [ ] Database connection works
- [ ] Prisma migrations applied successfully
- [ ] Socket.io connection established
- [ ] Teacher can create polls
- [ ] Students can answer polls
- [ ] Real-time updates work
- [ ] Timer counts down correctly
- [ ] Poll auto-closes after 60 seconds
- [ ] Poll closes when all students answer
- [ ] Chat functionality works
- [ ] Poll history displays correctly
- [ ] Student kick functionality works

### ✅ Code Quality
- [ ] No TypeScript errors (`npm run build` in client/)
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Code is clean and commented
- [ ] All files properly organized

## Database Setup

### Option 1: Supabase (Recommended - Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to provision
4. Go to Settings → Database
5. Copy connection string (URI format)
6. Replace `[YOUR-PASSWORD]` with your actual password
7. Use this as DATABASE_URL

### Option 2: Neon (Alternative - Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Use this as DATABASE_URL

### Option 3: Railway (Alternative - Free Trial)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string
5. Use this as DATABASE_URL

## Backend Deployment

### Option 1: Render (Recommended)

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `polling-system-api`
     - Root Directory: `server`
     - Build Command: `npm install && npm run prisma:generate && npm run build`
     - Start Command: `npm start`
     - Add Environment Variables:
       - `DATABASE_URL`: Your PostgreSQL connection string
       - `PORT`: 3000
       - `NODE_ENV`: production

3. **Run Migrations**
   - After first deploy, go to Shell tab
   - Run: `npm run prisma:migrate`

4. **Note Your URL**
   - Copy the URL (e.g., `https://polling-system-api.onrender.com`)

### Option 2: Railway

1. **Deploy**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Configure:
     - Root Directory: `server`
     - Build Command: `npm install && npm run prisma:generate`
     - Start Command: `npm run dev`
     - Add DATABASE_URL variable

2. **Generate Domain**
   - Go to Settings → Generate Domain
   - Note your URL

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Update Socket URL**
   ```bash
   # Edit client/src/utils/socket.ts
   const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: `client`
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Environment Variables:
       - `VITE_API_URL`: Your backend URL (from Render/Railway)

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your URL (e.g., `https://polling-system.vercel.app`)

### Option 2: Netlify

1. **Update Socket URL** (same as above)

2. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub repository
   - Configure:
     - Base directory: `client`
     - Build command: `npm run build`
     - Publish directory: `client/dist`
     - Environment Variables:
       - `VITE_API_URL`: Your backend URL

## Post-Deployment Configuration

### Update CORS in Backend

Edit `server/src/index.ts`:
```typescript
const io = new Server(httpServer, {
  cors: {
    origin: 'https://your-frontend-url.vercel.app', // Your actual frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: 'https://your-frontend-url.vercel.app', // Your actual frontend URL
  credentials: true,
}));
```

Commit and push changes to trigger redeployment.

## Testing Deployed Application

### Smoke Tests
1. [ ] Open frontend URL
2. [ ] Select "I'm a Teacher"
3. [ ] Create a poll
4. [ ] Open frontend URL in new tab
5. [ ] Select "I'm a Student"
6. [ ] Enter name
7. [ ] Verify poll appears
8. [ ] Submit answer
9. [ ] Verify results update in both tabs
10. [ ] Test chat functionality
11. [ ] Test poll history
12. [ ] Test student kick

### Performance Tests
- [ ] Page loads in < 3 seconds
- [ ] Real-time updates are instant
- [ ] No console errors
- [ ] Works on mobile devices
- [ ] Works in different browsers

## Submission Preparation

### Required Information
- [ ] Frontend URL: `https://_______________`
- [ ] Backend URL: `https://_______________`
- [ ] GitHub Repository: `https://github.com/_______________`
- [ ] LinkedIn Profile: `https://linkedin.com/in/_______________`

### Email Template

```
To: pallavi@intervue.info
Subject: SDE INTERN ASSIGNMENT SUBMISSION

Name: [Your Full Name]
Phone Number: [Your Contact Number]
Email ID: [Your Email Address]
LinkedIn URL: [Your LinkedIn Profile Link]
Assignment Link: [Your Deployed Frontend URL]

GitHub Repository: [Your GitHub Repo URL]
Backend API: [Your Backend URL]

Features Implemented:
✅ All core features (poll creation, answering, live results)
✅ Configurable time limit
✅ Student removal functionality
✅ Chat system
✅ Poll history
✅ UI matches Figma design exactly

Technology Stack:
- Frontend: React 19 + TypeScript + Tailwind CSS
- Backend: Express.js + Socket.io + TypeScript
- Database: PostgreSQL + Prisma ORM
- Real-time: Socket.io WebSocket

Testing Instructions:
1. Open the frontend URL
2. Test as Teacher: Create polls and view results
3. Test as Student: Open in new tab, answer polls
4. Test Chat: Click chat button (bottom right)
5. Test History: View past polls as teacher

Thank you for the opportunity!

Best regards,
[Your Name]
```

### Attach CV
- [ ] CV attached to email

## Troubleshooting

### Build Fails
- Check all dependencies are installed
- Verify TypeScript has no errors
- Check environment variables are set

### Database Connection Fails
- Verify DATABASE_URL is correct
- Check database is accessible from deployment platform
- Ensure SSL mode is configured if required

### Socket.io Not Connecting
- Verify CORS settings
- Check WebSocket is enabled on hosting platform
- Ensure frontend has correct backend URL

### Real-time Updates Not Working
- Check Socket.io connection in browser console
- Verify backend is receiving events
- Check for CORS errors

## Final Checklist

- [ ] All features working in production
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast loading times
- [ ] Database persisting data
- [ ] Real-time updates working
- [ ] UI matches Figma design
- [ ] Email sent with all details
- [ ] CV attached
- [ ] GitHub repository is public

## 🎉 You're Ready to Submit!

Once all checkboxes are ticked, send your submission email and celebrate! 🎊

---

**Pro Tips:**
- Test on multiple devices before submitting
- Take screenshots/video of working features
- Keep deployment URLs handy
- Monitor for any errors after deployment
- Be ready to demo if called for interview

Good luck! 🚀
