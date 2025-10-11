# 🚀 Quick Start Guide - Dark Matter Classification System

## 📋 Table of Contents
1. [Local Development (Your Computer)](#local-development)
2. [Using Both Frontend & Backend Together](#using-together)
3. [Deployment (Make it Public)](#deployment)
4. [Troubleshooting](#troubleshooting)

---

## 🖥️ Local Development (Your Computer)

### **Method 1: One-Click Startup (Easiest)**

#### **Windows:**
```bash
# Just double-click this file:
start_dev.bat
```

#### **Mac/Linux:**
```bash
# Make it executable first (only once):
chmod +x start_dev.sh

# Then run:
./start_dev.sh
```

This will automatically start:
- ✅ Backend Server → http://localhost:5001
- ✅ Frontend App → http://localhost:5173

---

### **Method 2: Manual Startup**

#### **Step 1: Start Backend** (Terminal 1)
```bash
cd D:\Technologia_ClaudeSolvathon
python webapp_backend.py
```

✅ Backend running at: **http://localhost:5001**

#### **Step 2: Start Frontend** (Terminal 2)
```bash
cd D:\Technologia_ClaudeSolvathon\webapp
npm install  # Only needed first time
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

#### **Step 3: Open Your Browser**
```
http://localhost:5173
```

---

## 🔗 Using Both Frontend & Backend Together

### **How They Connect:**

```
┌─────────────────┐         ┌──────────────────┐
│  Your Browser   │ ──────> │  Frontend (Vite) │
│  localhost:5173 │         │  localhost:5173  │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     │ API Calls
                                     ↓
                            ┌──────────────────┐
                            │  Backend (Flask) │
                            │  localhost:5001  │
                            └────────┬─────────┘
                                     │
                                     ↓
                            ┌──────────────────┐
                            │  Claude API      │
                            │  Dataset Files   │
                            └──────────────────┘
```

### **Data Flow Example:**

1. **User clicks "Classify Event"** on frontend (localhost:5173)
2. **Frontend sends request** to `http://localhost:5001/api/classify/single`
3. **Backend processes** using Claude API
4. **Backend returns** classification result
5. **Frontend displays** the result to user

### **Test the Connection:**

```bash
# Test backend is running:
curl http://localhost:5001/api/health

# Should return:
# {"status":"healthy","service":"Dark Matter Classification API"}
```

---

## 🌐 Deployment (Make it Public)

### **Option A: Deploy to Render + Vercel (FREE & EASY)**

#### **1. Deploy Backend to Render:**

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Create New Web Service:**
   - Repository: `Rishiraj-Pathak-27/Technologia_ClaudeSolvathon`
   - Name: `dark-matter-backend`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python webapp_backend.py`

4. **Add Environment Variables:**
   ```
   ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
   CLAUDE_API_KEY=your_actual_claude_api_key_here
   ```

5. **Click Deploy** → Wait 5-10 minutes

6. **Copy URL:** `https://dark-matter-backend.onrender.com`

#### **2. Deploy Frontend to Vercel:**

1. **Update Frontend Configuration:**
   ```bash
   cd webapp
   
   # Create production env file:
   echo "VITE_API_URL=https://dark-matter-backend.onrender.com" > .env.production
   ```

2. **Go to:** https://vercel.com
3. **Sign up** with GitHub
4. **Import Project:**
   - Select: `Rishiraj-Pathak-27/Technologia_ClaudeSolvathon`
   - Framework: Vite
   - Root Directory: `webapp`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variable:**
   ```
   VITE_API_URL=https://dark-matter-backend.onrender.com
   ```

6. **Deploy!**

7. **Your App is Live:** `https://your-project.vercel.app` 🎉

---

### **Option B: Deploy Everything to Railway (Simpler)**

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **New Project** → Deploy from GitHub repo
4. **Select:** `Rishiraj-Pathak-27/Technologia_ClaudeSolvathon`
5. **Add Environment Variables** in Railway dashboard:
   ```
   ANTHROPIC_API_KEY=your_key_here
   CLAUDE_API_KEY=your_key_here
   ```
6. **Railway auto-deploys both frontend & backend!**
7. **Your App:** `https://your-app.up.railway.app` 🎉

---

## 🔧 Configuration Files Explained

### **For Local Development:**

```
webapp/.env.development        → Frontend uses localhost:5001
webapp/src/lib/classificationAPI.ts → Auto-detects local backend
webapp/src/lib/anomalyAPI.ts   → Auto-detects local backend
```

### **For Production Deployment:**

```
webapp/.env.production         → Frontend uses deployed backend URL
Procfile                       → Tells hosting service how to start backend
runtime.txt                    → Specifies Python version
requirements.txt               → Lists Python dependencies
webapp/package.json            → Lists JavaScript dependencies
```

---

## 📱 Access Your App

### **Local (Your Computer Only):**
```
Frontend: http://localhost:5173
Backend:  http://localhost:5001
```

### **Deployed (Anyone Can Access):**
```
Your App: https://your-app.vercel.app
Backend API: https://dark-matter-backend.onrender.com
```

Share the Vercel URL with anyone - they can use your app from anywhere! 🌍

---

## 🐛 Troubleshooting

### **Problem: "Failed to fetch" error**

**Solution:**
```bash
# 1. Make sure backend is running:
curl http://localhost:5001/api/health

# 2. Check frontend API URL:
# Open: webapp/src/lib/classificationAPI.ts
# Should see: const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

# 3. Restart both servers
```

### **Problem: Backend crashes immediately**

**Solution:**
```bash
# 1. Check Python version (need 3.11):
python --version

# 2. Reinstall dependencies:
pip install -r requirements.txt

# 3. Check .env file has API keys:
type .env   # Windows
cat .env    # Mac/Linux

# 4. Run with verbose output:
python webapp_backend.py
```

### **Problem: Frontend can't find backend**

**Solution:**
```bash
# Check if backend is running:
# Windows:
netstat -ano | findstr :5001

# Mac/Linux:
lsof -i :5001

# If nothing shows up, backend isn't running
```

### **Problem: "Port already in use"**

**Solution:**
```bash
# Windows - Kill process on port 5001:
netstat -ano | findstr :5001
taskkill /PID <number> /F

# Mac/Linux - Kill process on port 5001:
lsof -ti:5001 | xargs kill -9
```

---

## 📊 Feature Checklist

When both servers are running, you should be able to:

- [ ] ✅ View Results Dashboard
- [ ] ✅ Classify single events
- [ ] ✅ Upload batch files
- [ ] ✅ Detect anomalies
- [ ] ✅ View dataset statistics
- [ ] ✅ See scatter plots and charts
- [ ] ✅ Generate reports

---

## 🎯 Quick Commands Cheat Sheet

### **Start Everything:**
```bash
# Windows:
start_dev.bat

# Mac/Linux:
./start_dev.sh
```

### **Stop Everything:**
```bash
# Press CTRL+C in each terminal window
# Or close the terminal windows
```

### **Build for Production:**
```bash
cd webapp
npm run build
# Creates webapp/dist/ folder ready for deployment
```

### **Test Production Build Locally:**
```bash
cd webapp
npm run preview
# Serves the built files at http://localhost:4173
```

---

## 🚀 Deployment Checklist

Before deploying:

- [ ] ✅ Test locally (both frontend & backend work)
- [ ] ✅ Update API URLs for production
- [ ] ✅ Set environment variables on hosting platform
- [ ] ✅ Never commit `.env` file to GitHub
- [ ] ✅ Test all features work in production
- [ ] ✅ Set up error monitoring (optional)

---

## 📞 Support

If something doesn't work:

1. **Check both terminals** for error messages
2. **Open browser console** (F12) → Check for errors
3. **Test backend directly:** http://localhost:5001/api/health
4. **Check API keys** are in `.env` file
5. **Verify file paths** are correct

---

## 🎉 Success!

Once everything is running:
- **Local:** Open http://localhost:5173 in your browser
- **Deployed:** Share your Vercel URL with anyone!

Your Dark Matter Classification System is ready to use! 🌌

