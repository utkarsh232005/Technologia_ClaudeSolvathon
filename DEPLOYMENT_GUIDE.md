# Deployment Guide - Dark Matter Classification System

## 🚀 Quick Deploy (Recommended)

### **Option 1: Vercel + Render (FREE)**

This is the easiest way to deploy your full-stack application for free.

---

## 📦 **Step 1: Deploy Backend to Render**

### 1.1 Create Render Account
- Go to https://render.com
- Sign up with GitHub (recommended)

### 1.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `Rishiraj-Pathak-27/Technologia_ClaudeSolvathon`
3. Configure:
   - **Name**: `dark-matter-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python webapp_backend.py`
   - **Plan**: Free

4. **Add Environment Variables**:
   - Click "Environment" tab
   - Add these variables:
     ```
     ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
     CLAUDE_API_KEY=your_actual_claude_api_key_here
     PORT=10000
     ```

5. Click "Create Web Service"

6. **Wait 5-10 minutes** for deployment

7. **Copy your backend URL**: `https://dark-matter-backend.onrender.com`

---

## 🌐 **Step 2: Deploy Frontend to Vercel**

### 2.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

### 2.2 Update Frontend Configuration

Before deploying, update the API URL in your frontend:

1. Open `webapp/src/lib/classificationAPI.ts`
2. Change the API_BASE_URL:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dark-matter-backend.onrender.com';
   ```

3. Same for `webapp/src/lib/anomalyAPI.ts`

### 2.3 Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://dark-matter-backend.onrender.com
   ```

5. Click "Deploy"

6. **Your app will be live at**: `https://your-project-name.vercel.app`

---

## 🎯 **Option 2: Railway (Full Stack)**

Railway can host both frontend and backend together.

### Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Python and Node.js
6. Add environment variables in the Railway dashboard
7. Your app will be live at: `https://your-app.up.railway.app`

---

## 🐳 **Option 3: Docker + Any Cloud (Advanced)**

### Create Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 5001

# Run the application
CMD ["python", "webapp_backend.py"]
```

Deploy this to:
- **Google Cloud Run** (free tier)
- **AWS ECS/Fargate**
- **Azure Container Instances**
- **DigitalOcean App Platform**

---

## 🔧 **Environment Variables Required**

Make sure to set these on your hosting platform:

```bash
ANTHROPIC_API_KEY=your_actual_api_key
CLAUDE_API_KEY=your_actual_api_key
PORT=5001  # Or whatever port your host provides
```

---

## 📱 **Mobile/Tablet Access**

Once deployed, your app will be accessible from any device:
- **Desktop**: `https://your-app.vercel.app`
- **Mobile**: Same URL works on phones/tablets
- **Share**: Anyone with the link can access it

---

## 🆓 **Free Tier Limitations**

### Render Free Tier:
- ✅ 750 hours/month
- ✅ Automatic HTTPS
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ Cold start: 30-60 seconds

### Vercel Free Tier:
- ✅ Unlimited bandwidth
- ✅ Automatic deployments
- ✅ Fast CDN
- ✅ Custom domains

### Railway Free Trial:
- ✅ $5 free credits
- ✅ No credit card required initially
- ⚠️ Credits last ~1 month with moderate usage

---

## 🚀 **Quick Start Commands**

### Test Backend Locally First:
```bash
cd D:\Technologia_ClaudeSolvathon
python webapp_backend.py
```

### Test Frontend Locally:
```bash
cd webapp
npm install
npm run dev
```

### Build for Production:
```bash
cd webapp
npm run build
```

---

## 📊 **Post-Deployment Checklist**

- [ ] Backend is running (test /api/health endpoint)
- [ ] Frontend can connect to backend
- [ ] Dataset files are accessible
- [ ] Claude API key is working
- [ ] Anomaly detection functions properly
- [ ] CORS is configured correctly
- [ ] Error logging is set up

---

## 🔐 **Security Notes**

**IMPORTANT:** Before making public:

1. **Never commit real API keys** to GitHub
2. Use environment variables on hosting platform
3. Add `.env` to `.gitignore`
4. Consider adding authentication for sensitive operations
5. Monitor API usage to avoid unexpected charges

---

## 🆘 **Troubleshooting**

### Backend not starting on Render:
- Check logs in Render dashboard
- Verify environment variables are set
- Ensure `requirements.txt` is complete

### Frontend can't connect to backend:
- Verify CORS is enabled in `webapp_backend.py`
- Check API_BASE_URL in frontend code
- Test backend health endpoint directly

### Claude API errors:
- Verify API key is valid
- Check API quota/limits
- Review error messages in logs

---

## 📞 **Support**

If you encounter issues:
1. Check Render/Vercel logs
2. Test endpoints with Postman/curl
3. Review browser console for errors
4. Check Network tab in DevTools

---

## 🎉 **Success!**

Once deployed, share your app URL:
```
https://your-dark-matter-app.vercel.app
```

Anyone can now access your Dark Matter Classification System! 🌌
