# 🔧 Deployment Troubleshooting Guide

## ❌ **Your Current Issue: WebSocket Connection Failed**

**Error:** `WebSocket connection to 'wss://intervue-live-poll.onrender.com/socket.io/?EIO=4&transport=websocket' failed`

---

## 🔍 **Root Causes & Fixes**

### 1. **CORS Configuration Issue** ✅ FIXED

**Problem:** Trailing slash in origin URL  
**Was:** `"https://poll.nirajjha.xyz/"`  
**Fixed:** `"https://poll.nirajjha.xyz"` (removed trailing slash)

**Also Added:**
- `transports: ['websocket', 'polling']` - Fallback to polling if WebSocket fails
- `allowEIO3: true` - Better compatibility
- `allowedHeaders` - Proper header configuration

### 2. **Server Might Be Sleeping (Render Free Tier)**

**Problem:** Render free tier spins down after 15 minutes of inactivity

**Solution:**
- First request takes 30-60 seconds to wake up
- Try accessing: `https://intervue-live-poll.onrender.com/`
- Wait for response, then try your app again

### 3. **Database Connection**

**Problem:** If DATABASE_URL is wrong, server crashes silently

**Check:**
1. Go to Render Dashboard → Your Service
2. Check Environment Variables
3. Verify `DATABASE_URL` is set correctly
4. Format: `postgresql://user:password@host:5432/database`

**Fixed:** Added connection logging and error handling

---

## 🚀 **Deployment Steps (Do This Now)**

### Step 1: Update Server Code

```bash
# Commit the fixes
git add server/src/index.ts server/src/config/database.ts
git commit -m "fix: CORS and WebSocket configuration for production"
git push origin main
```

### Step 2: Verify Render Environment Variables

Go to Render Dashboard → Your Service → Environment

**Required Variables:**
```
DATABASE_URL=postgresql://...  (from Render PostgreSQL)
NODE_ENV=production
OPENAI_API_KEY=sk-...
PORT=10000  (Render sets this automatically)
```

### Step 3: Trigger Redeploy

1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for build to complete (3-5 minutes)

### Step 4: Check Logs

Even on free tier, you can see recent logs:
1. Go to your service
2. Click "Logs" tab
3. Look for:
   - ✅ "Server running on port 10000"
   - ✅ "Database connected successfully"
   - ✅ "Socket.io server ready"
   - ❌ Any error messages

### Step 5: Test Connection

```bash
# Test server is alive
curl https://intervue-live-poll.onrender.com/

# Should return: {"message":"Live Polling System API"}
```

### Step 6: Update Client (if needed)

Verify `client/src/config/urls.ts`:
```typescript
const PROD_SERVER_URL = 'https://intervue-live-poll.onrender.com';
```

**No trailing slash!**

---

## 🔍 **Debugging Checklist**

### Server Issues

- [ ] Server responds to `https://intervue-live-poll.onrender.com/`
- [ ] Logs show "Server running on port X"
- [ ] Logs show "Database connected successfully"
- [ ] Logs show "Socket.io server ready"
- [ ] No error messages in logs
- [ ] DATABASE_URL is set correctly
- [ ] OPENAI_API_KEY is set (for quiz feature)

### CORS Issues

- [ ] No trailing slash in origin URLs
- [ ] Client URL matches exactly: `https://poll.nirajjha.xyz`
- [ ] Both Socket.io and Express CORS configured
- [ ] Methods include GET, POST
- [ ] Credentials enabled

### WebSocket Issues

- [ ] Transports include both 'websocket' and 'polling'
- [ ] allowEIO3 is true
- [ ] Server is not behind a proxy blocking WebSockets
- [ ] No firewall blocking WebSocket connections

### Database Issues

- [ ] DATABASE_URL format is correct
- [ ] Database is running (check Render PostgreSQL service)
- [ ] Prisma migrations ran successfully
- [ ] Tables exist in database

---

## 🧪 **Testing After Deploy**

### 1. Test Server Health

```bash
curl https://intervue-live-poll.onrender.com/
```

**Expected:** `{"message":"Live Polling System API"}`

### 2. Test WebSocket Connection

Open browser console on `https://poll.nirajjha.xyz`:

```javascript
// Should see in console:
"✅ Connected to server: [socket-id]"

// Should NOT see:
"❌ Connection error"
```

### 3. Test Full Flow

1. Open as Teacher
2. Create a poll
3. Open as Student (different browser/incognito)
4. Student should see poll
5. Answer poll
6. Both should see live results

---

## 🐛 **Common Render Issues**

### Issue 1: Server Keeps Crashing

**Cause:** Database connection failed

**Fix:**
1. Check DATABASE_URL is correct
2. Ensure PostgreSQL service is running
3. Check if database allows connections

### Issue 2: Build Succeeds But Server Won't Start

**Cause:** Missing environment variables

**Fix:**
1. Add all required env vars
2. Redeploy

### Issue 3: WebSocket Works Locally But Not in Production

**Cause:** CORS or transport configuration

**Fix:**
1. Remove trailing slashes from URLs
2. Add both transports: `['websocket', 'polling']`
3. Enable allowEIO3

### Issue 4: First Request Takes Forever

**Cause:** Render free tier cold start

**Fix:**
- This is normal (15-60 seconds)
- Consider upgrading to paid tier
- Or use a service like UptimeRobot to ping every 14 minutes

---

## 📊 **Verify Deployment Success**

### Server Logs Should Show:

```
✅ Server running on port 10000
✅ Socket.io server ready
✅ CORS enabled for: http://localhost:5173, https://poll.nirajjha.xyz
✅ Environment: production
✅ Database connected successfully
```

### Browser Console Should Show:

```
🔌 Initializing socket in ChatPopup
✅ Connected to server: abc123xyz
📡 Setting up chat listeners
```

### No Errors Should Appear:

```
❌ WebSocket connection failed
❌ Database connection failed
❌ CORS error
```

---

## 🚨 **Emergency Fixes**

### If Nothing Works:

1. **Check Render Status**
   - Visit status.render.com
   - Check if there's an outage

2. **Restart Service**
   - Render Dashboard → Your Service
   - Settings → "Suspend Service"
   - Wait 30 seconds
   - "Resume Service"

3. **Clear Build Cache**
   - Manual Deploy → "Clear build cache & deploy"

4. **Check Database**
   - Go to PostgreSQL service
   - Verify it's running
   - Check connection string

5. **Verify Build**
   - Check build logs for errors
   - Ensure `npm run build` succeeded
   - Verify `dist` folder was created

---

## 📞 **Still Not Working?**

### Check These:

1. **Server URL in Client**
   ```typescript
   // client/src/config/urls.ts
   const PROD_SERVER_URL = 'https://intervue-live-poll.onrender.com';
   // NO trailing slash!
   ```

2. **Rebuild Client**
   ```bash
   cd client
   npm run build
   # Redeploy to Vercel
   ```

3. **Check Vercel Environment Variables**
   ```
   VITE_SOCKET_URL=https://intervue-live-poll.onrender.com
   ```

4. **Test with cURL**
   ```bash
   # Test server
   curl https://intervue-live-poll.onrender.com/
   
   # Test CORS
   curl -H "Origin: https://poll.nirajjha.xyz" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://intervue-live-poll.onrender.com/
   ```

---

## ✅ **Success Indicators**

When everything works:

1. ✅ Server responds immediately
2. ✅ WebSocket connects in <2 seconds
3. ✅ No errors in browser console
4. ✅ Polls create and update in real-time
5. ✅ Chat messages send/receive instantly
6. ✅ Database stores data correctly

---

## 🎯 **Next Steps**

1. Push the fixes to GitHub
2. Wait for Render to redeploy (auto-deploy enabled)
3. Check logs for success messages
4. Test the application
5. If still failing, check each item in debugging checklist

**The fixes I made should resolve your WebSocket connection issue! 🚀**
