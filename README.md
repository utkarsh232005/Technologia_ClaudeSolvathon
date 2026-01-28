# 🌌 Dark Matter Classification System

An intelligent dark matter event classification and anomaly detection system powered by Claude AI.

## 🚀 Quick Start

### **Start Both Frontend & Backend (Easy Way)**

**Windows:**
```bash
start_dev.bat
```

**Mac/Linux:**
```bash
chmod +x start_dev.sh
./start_dev.sh
```

Then open: **http://localhost:5173**

---

### **Manual Start**

**Terminal 1 - Backend:**
```bash
python webapp_backend.py
```

**Terminal 2 - Frontend:**
```bash
cd webapp
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## 📚 Documentation

### Quick Access
- **[QUICK_START.md](QUICK_START.md)** - Complete usage guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - How to deploy publicly

### Comprehensive Documentation
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user manual with step-by-step instructions
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Development setup, coding standards, and contribution guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture, components, and data flow
- **[AI_FUNCTIONALITY.md](AI_FUNCTIONALITY.md)** - Claude AI integration, prompt engineering, and workflows
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - REST API reference with examples

---

## ✨ Features

- 🔬 **Event Classification** - AI-powered dark matter event analysis
- 📊 **Results Dashboard** - Real-time visualization and statistics  
- ⚠️ **Anomaly Detection** - Automatic detection of unusual events
- 📈 **Data Analytics** - Comprehensive dataset insights
- 🤖 **Claude AI Integration** - Advanced reasoning and analysis
- 📁 **Batch Processing** - Upload and analyze multiple events

---

## 📖 New! Complete Documentation

We've created comprehensive documentation to help you understand and use the system:

| Document | Description | Target Audience |
|----------|-------------|-----------------|
| **[USER_GUIDE.md](USER_GUIDE.md)** | Step-by-step instructions for using all features | End Users, Scientists |
| **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** | Setup, development workflow, and contribution guide | Developers, Contributors |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, components, and data flow | Technical Leads, Architects |
| **[AI_FUNCTIONALITY.md](AI_FUNCTIONALITY.md)** | How Claude AI powers classification and analysis | AI/ML Engineers, Researchers |
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Complete REST API reference with examples | API Users, Integrators |

**New to the system?** Start with [USER_GUIDE.md](USER_GUIDE.md)  
**Want to contribute?** Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)  
**Building integrations?** See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 🛠️ Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- Recharts
- Shadcn/ui

**Backend:**
- Python 3.11
- Flask
- Anthropic Claude API
- Pandas
- NumPy

---

## 🌐 Deploy Your Own

1. **Deploy Backend:** [Render.com](https://render.com) (Free)
2. **Deploy Frontend:** [Vercel.com](https://vercel.com) (Free)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for details.

---

## 📝 Environment Variables

Create a `.env` file:

```bash
ANTHROPIC_API_KEY=your_claude_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
```

Get your API key from: https://console.anthropic.com/

---

## 📦 Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd webapp
npm install
```

---

## 🎯 Project Structure

```
Technologia_ClaudeSolvathon/
├── webapp/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Dashboard pages
│   │   ├── components/       # Reusable components
│   │   └── lib/             # API integrations
│   └── package.json
├── anomaly_detection_system/  # Anomaly detection
│   └── mainAnomalyDetection.py
├── dataset/                   # Data files
│   └── dark_matter_synthetic_dataset.csv
├── webapp_backend.py          # Flask API server
├── mainClassify.py           # Classification logic
├── requirements.txt           # Python dependencies
├── start_dev.bat             # Windows launcher
├── start_dev.sh              # Mac/Linux launcher
└── .env                      # API keys (gitignored)
```

---

## 🧪 Testing

**Test Backend:**
```bash
curl http://localhost:5001/api/health
```

**Test Frontend:**
Open http://localhost:5173 in browser

---

## 📄 License

MIT License - Feel free to use and modify!

---


---

## 🙏 Acknowledgments

- Anthropic Claude AI
- Dark Matter Research Community
- Open Source Contributors

---

## 📞 Support

- 📖 Read the [QUICK_START.md](QUICK_START.md)
- 🐛 Report issues on GitHub
- 💬 Check browser console for errors

---

**Built with ❤️ for Dark Matter Research**
