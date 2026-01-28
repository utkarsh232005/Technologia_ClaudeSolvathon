# Developer Guide

## Overview

This guide is for developers who want to set up, modify, or contribute to the Dark Matter Classification System. It covers environment setup, development workflows, code structure, testing, and deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Style](#code-style)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Contributing](#contributing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

**Python Development**:
- Python 3.11 or higher
- pip (Python package manager)
- virtualenv or venv (recommended)

**JavaScript/Node.js Development**:
- Node.js 18.x or higher
- npm 9.x or higher (comes with Node.js)

**Version Control**:
- Git 2.x or higher

**Optional Tools**:
- VS Code or PyCharm (recommended IDEs)
- Postman or cURL (for API testing)
- Docker (for containerized deployment)

### API Keys

**Required**:
- Anthropic Claude API key from https://console.anthropic.com/

**How to Get Claude API Key**:
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and save securely

---

## Environment Setup

### Quick Start (Automated)

**Windows**:
```bash
start_dev.bat
```

**Mac/Linux**:
```bash
chmod +x start_dev.sh
./start_dev.sh
```

This will:
1. Check for required dependencies
2. Install Python packages
3. Install Node.js packages
4. Start both backend and frontend servers

### Manual Setup

#### 1. Clone Repository

```bash
git clone https://github.com/utkarsh232005/Technologia_ClaudeSolvathon.git
cd Technologia_ClaudeSolvathon
```

#### 2. Set Up Python Environment

**Create Virtual Environment** (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

**Install Dependencies**:
```bash
pip install -r requirements.txt
```

**Verify Installation**:
```bash
pip list
# Should show: pandas, numpy, flask, anthropic, etc.
```

#### 3. Set Up Node.js Environment

```bash
cd webapp
npm install
```

**Verify Installation**:
```bash
npm list --depth=0
# Should show: react, vite, typescript, etc.
```

#### 4. Configure Environment Variables

**Create .env file in project root**:
```bash
cp .env.example .env
```

**Edit .env file**:
```bash
# Required
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_API_KEY=your_api_key_here

# Optional
FLASK_ENV=development
PORT=5001
```

**Important**:
- Never commit `.env` file to Git
- Use `.env.example` as template
- Keep API keys secure

#### 5. Generate Dataset (Optional)

```bash
python main.py
```

This generates synthetic dark matter detection data:
- `dataset/dark_matter_synthetic_dataset.csv`
- `dataset/dark_matter_synthetic_dataset.json`
- `dataset/dataset_metadata.json`

**Note**: The repository includes pre-generated data, so this step is optional.

---

## Project Structure

```
Technologia_ClaudeSolvathon/
│
├── webapp/                          # Frontend React application
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── Index.tsx           # Landing page
│   │   │   ├── EventClassifier.tsx # Classification interface
│   │   │   ├── ResultsDashboard.tsx # Results visualization
│   │   │   ├── AnomalyDetection.tsx # Anomaly detection page
│   │   │   ├── DataGenerator.tsx   # Dataset management
│   │   │   ├── ReportGenerator.tsx # Export functionality
│   │   │   └── Settings.tsx        # Configuration
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── Navigation.tsx
│   │   │   ├── PageLayout.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   └── ui/                 # Shadcn/ui components
│   │   │
│   │   ├── lib/                     # Utilities and API clients
│   │   │   ├── classificationAPI.ts
│   │   │   ├── anomalyAPI.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── use-toast.ts
│   │   │   └── useKeyboardShortcuts.ts
│   │   │
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # Entry point
│   │
│   ├── public/                      # Static assets
│   │   └── dataset/                # Dataset files for frontend
│   │
│   ├── package.json                 # Node.js dependencies
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── tailwind.config.ts          # Tailwind CSS configuration
│
├── anomaly_detection_system/        # Anomaly detection module
│   ├── mainAnomalyDetection.py     # Main detection logic
│   ├── find_anomalies.py           # Statistical analysis
│   └── results/                    # Detection results
│
├── classification_system/           # Classification module
│   └── results/                    # Classification outputs
│
├── dataset/                         # Data storage
│   ├── dark_matter_synthetic_dataset.csv
│   ├── dark_matter_synthetic_dataset.json
│   └── dataset_metadata.json
│
├── visualization_system/            # Visualization utilities
│   └── charts_output/              # Generated charts
│
├── main.py                          # Dataset generation script
├── mainClassify.py                  # Classification logic
├── webapp_backend.py                # Flask API server
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
├── .gitignore                      # Git ignore rules
├── README.md                        # Project overview
├── ARCHITECTURE.md                  # System architecture docs
├── AI_FUNCTIONALITY.md              # AI integration docs
├── API_DOCUMENTATION.md             # API reference
├── DEVELOPER_GUIDE.md              # This file
└── USER_GUIDE.md                   # End-user documentation
```

---

## Development Workflow

### Starting Development Servers

#### Backend (Flask)

**Terminal 1**:
```bash
# Activate virtual environment (if using)
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Start Flask server
python webapp_backend.py
```

Server runs on: `http://localhost:5001`

**Features**:
- Auto-reload on code changes
- Debug mode enabled
- Detailed error messages in console

#### Frontend (React + Vite)

**Terminal 2**:
```bash
cd webapp
npm run dev
```

Server runs on: `http://localhost:5173`

**Features**:
- Hot module replacement (HMR)
- Fast refresh for React components
- TypeScript type checking

### Making Changes

#### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

#### 2. Make Your Changes

**Backend Changes** (Python):
- Edit files in root directory or `anomaly_detection_system/`
- Server auto-reloads on save
- Check console for errors

**Frontend Changes** (React):
- Edit files in `webapp/src/`
- Changes appear instantly in browser
- Check browser console for errors

#### 3. Test Your Changes

```bash
# Backend: Test API endpoints
curl http://localhost:5001/api/health

# Frontend: Test in browser
# Open http://localhost:5173
```

#### 4. Commit Changes

```bash
git add .
git commit -m "Add feature: description"
git push origin feature/your-feature-name
```

### Code Hot Reloading

**Backend (Flask)**:
- Flask's debug mode auto-reloads on Python file changes
- No need to restart server
- Exceptions shown in browser

**Frontend (Vite)**:
- Instant hot module replacement
- State preserved across updates
- Fast builds (< 1 second)

---

## Code Style

### Python Style Guide

**Follow PEP 8**: Standard Python style guide

**Key Points**:
```python
# Imports
import os
import sys
from typing import Dict, List, Any

# Constants
API_KEY = os.getenv("ANTHROPIC_API_KEY")
MAX_EVENTS = 100

# Functions
def classify_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classify a single event using Claude AI.
    
    Args:
        event_data: Dictionary containing event features
        
    Returns:
        Dictionary with classification and confidence
    """
    # Implementation
    pass

# Classes
class EventClassifier:
    """Dark matter event classifier using AI."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def classify(self, event: Dict) -> Dict:
        """Classify an event."""
        pass
```

**Tools**:
```bash
# Format code
pip install black
black *.py

# Lint code
pip install flake8
flake8 *.py

# Type checking
pip install mypy
mypy *.py
```

### TypeScript/React Style Guide

**Follow Airbnb JavaScript Style Guide**

**Key Points**:
```typescript
// Imports
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Interfaces
interface Event {
  eventId: string;
  energy: number;
  s2s1Ratio: number;
}

interface ClassificationResult {
  type: string;
  confidence: number;
}

// Components
export const EventClassifier: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  const handleClassify = async () => {
    // Handler
  };
  
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};

// Hooks
export const useClassification = (event: Event) => {
  const [loading, setLoading] = useState(false);
  // Hook logic
  return { loading };
};
```

**Tools**:
```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

### File Naming Conventions

**Python**:
- `snake_case.py` for modules
- `ClassName` for classes
- `function_name()` for functions

**TypeScript/React**:
- `PascalCase.tsx` for components
- `camelCase.ts` for utilities
- `kebab-case.css` for styles

### Documentation

**Python Docstrings**:
```python
def classify_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classify a dark matter detection event.
    
    This function takes event data, constructs a prompt for Claude AI,
    and returns a structured classification result.
    
    Args:
        event_data: Dictionary containing:
            - recoil_energy_keV: Energy in keV (float)
            - s2_over_s1_ratio: S2/S1 signal ratio (float)
            - position_x_mm: X position in mm (float)
            [... other fields ...]
    
    Returns:
        Dictionary containing:
            - classification: Event type string
            - confidence: Confidence score 0.0-1.0
            - reasoning: Detailed analysis
    
    Raises:
        ValueError: If required fields are missing
        APIError: If Claude API call fails
    
    Example:
        >>> event = {
        ...     'recoil_energy_keV': 12.5,
        ...     's2_over_s1_ratio': 3.4
        ... }
        >>> result = classify_event(event)
        >>> print(result['classification'])
        'WIMP-like (NR)'
    """
    pass
```

**TypeScript JSDoc**:
```typescript
/**
 * Classify an event using the backend API
 * 
 * @param event - Event data object
 * @returns Promise resolving to classification result
 * @throws Error if API call fails
 * 
 * @example
 * ```typescript
 * const event = { eventId: '001', energy: 12.5 };
 * const result = await classifyEvent(event);
 * console.log(result.type); // 'WIMP'
 * ```
 */
export const classifyEvent = async (
  event: Event
): Promise<ClassificationResult> => {
  // Implementation
};
```

---

## Testing

### Backend Testing

#### Unit Tests

```python
# tests/test_classification.py
import unittest
from mainClassify import classify_event_api

class TestClassification(unittest.TestCase):
    def test_wimp_classification(self):
        """Test WIMP event classification"""
        event = {
            'recoil_energy_keV': 12.5,
            's1_area_PE': 25.3,
            's2_area_PE': 85.7,
            's2_over_s1_ratio': 3.39
        }
        
        result = classify_event_api(event)
        
        self.assertEqual(result['classification'], 'WIMP-like (NR)')
        self.assertGreater(result['confidence'], 0.7)
    
    def test_background_classification(self):
        """Test background event classification"""
        event = {
            'recoil_energy_keV': 8.3,
            's1_area_PE': 18.2,
            's2_area_PE': 145.6,
            's2_over_s1_ratio': 8.0
        }
        
        result = classify_event_api(event)
        
        self.assertEqual(result['classification'], 'Background (ER)')

if __name__ == '__main__':
    unittest.main()
```

**Run Tests**:
```bash
python -m unittest discover tests
```

#### API Testing

```bash
# Health check
curl http://localhost:5001/api/health

# Classify event
curl -X POST http://localhost:5001/api/classify \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "recoil_energy_keV": 12.5,
      "s1_area_PE": 25.3,
      "s2_area_PE": 85.7,
      "s2_over_s1_ratio": 3.39
    }
  }'
```

### Frontend Testing

#### Component Tests (Future)

```typescript
// webapp/src/__tests__/EventClassifier.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EventClassifier } from '@/pages/EventClassifier';

describe('EventClassifier', () => {
  it('renders classification form', () => {
    render(<EventClassifier />);
    expect(screen.getByText('Event Classifier')).toBeInTheDocument();
  });
  
  it('submits classification request', async () => {
    render(<EventClassifier />);
    const button = screen.getByText('Classify');
    fireEvent.click(button);
    // Assert API call made
  });
});
```

**Run Tests** (when implemented):
```bash
cd webapp
npm test
```

### Manual Testing Checklist

**Backend**:
- [ ] Health check endpoint responds
- [ ] Single event classification works
- [ ] Batch classification works
- [ ] Anomaly detection works
- [ ] Error handling works correctly
- [ ] NaN/Infinity values handled

**Frontend**:
- [ ] All pages load without errors
- [ ] Navigation works
- [ ] Classification form submits
- [ ] Results display correctly
- [ ] Charts render properly
- [ ] Responsive design works

---

## Debugging

### Backend Debugging

#### Enable Debug Mode

```python
# webapp_backend.py
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True  # Enable debug mode
    )
```

**Features**:
- Detailed error pages
- Interactive debugger in browser
- Auto-reload on code changes

#### Logging

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Use in code
logger.debug("Processing event: %s", event_id)
logger.info("Classification complete: %s", result)
logger.warning("Low confidence: %f", confidence)
logger.error("API error: %s", str(e))
```

#### Python Debugger (pdb)

```python
# Insert breakpoint
import pdb; pdb.set_trace()

# Or use built-in breakpoint() in Python 3.7+
breakpoint()
```

**Commands**:
- `n` - Next line
- `s` - Step into function
- `c` - Continue execution
- `p variable` - Print variable
- `l` - List code around current line

### Frontend Debugging

#### Browser DevTools

**Console**:
- View logs: `console.log()`, `console.error()`
- Inspect variables
- Execute JavaScript

**Network Tab**:
- Monitor API requests
- Check request/response data
- Identify failed requests

**React DevTools**:
- Inspect component tree
- View props and state
- Track renders

#### Source Maps

Vite automatically generates source maps:
- Set breakpoints in TypeScript source
- Step through original code
- Inspect TypeScript variables

#### Debug Logging

```typescript
// lib/classificationAPI.ts
export const classifyEvent = async (event: Event) => {
  console.log('Classifying event:', event);
  
  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      body: JSON.stringify({ event })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
};
```

### Common Issues

**Issue**: "Module not found"
```
Solution: Check imports, run `npm install` or `pip install`
```

**Issue**: "API key not found"
```
Solution: Check .env file exists and contains ANTHROPIC_API_KEY
```

**Issue**: "CORS error"
```
Solution: Ensure Flask-CORS is enabled and frontend URL is allowed
```

**Issue**: "Port already in use"
```
Solution: Kill process on port 5001/5173 or use different port
# Find process: lsof -i :5001
# Kill process: kill -9 <PID>
```

---

## Contributing

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a feature branch
4. Make your changes
5. Test thoroughly
6. Submit a pull request

### Pull Request Process

1. **Update Documentation**: If adding features
2. **Add Tests**: For new functionality
3. **Follow Code Style**: Run linters
4. **Write Good Commits**:
   ```
   Add: New feature for X
   Fix: Bug in Y component
   Update: Documentation for Z
   Refactor: Improve performance of W
   ```
5. **Update CHANGELOG**: Document your changes
6. **Request Review**: From maintainers

### Code Review Guidelines

**For Reviewers**:
- Check code quality and style
- Verify tests pass
- Test functionality locally
- Provide constructive feedback

**For Contributors**:
- Respond to feedback
- Make requested changes
- Update PR description if scope changes

---

## Deployment

### Local Development

Already covered in [Environment Setup](#environment-setup)

### Production Deployment

#### Backend Deployment (Render.com)

**Steps**:
1. Create account on Render.com
2. Connect GitHub repository
3. Create new Web Service
4. Configure:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn webapp_backend:app
   Environment: Python 3.11
   ```
5. Set environment variables:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```
6. Deploy

**Requirements for Render**:
```txt
# requirements.txt
pandas>=2.0.0
numpy>=1.24.0
flask>=2.3.0
flask-cors>=4.0.0
anthropic>=0.69.0
gunicorn>=21.2.0  # Add for production
```

#### Frontend Deployment (Vercel.com)

**Steps**:
1. Create account on Vercel.com
2. Connect GitHub repository
3. Import project
4. Configure:
   ```
   Framework: Vite
   Root Directory: webapp
   Build Command: npm run build
   Output Directory: dist
   ```
5. Set environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
6. Deploy

**Vite Config for Production**:
```typescript
// webapp/vite.config.ts
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:5001'
    )
  }
});
```

### Docker Deployment (Optional)

**Dockerfile (Backend)**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "webapp_backend:app"]
```

**Build and Run**:
```bash
docker build -t dark-matter-backend .
docker run -p 5001:5001 -e ANTHROPIC_API_KEY=your_key dark-matter-backend
```

---

## Troubleshooting

### Installation Issues

**Python Version Mismatch**:
```bash
# Check Python version
python --version  # Should be 3.11+

# Use specific version
python3.11 -m venv venv
```

**Dependency Conflicts**:
```bash
# Clear cache and reinstall
pip cache purge
pip install --no-cache-dir -r requirements.txt
```

**Node.js Issues**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Runtime Issues

**Flask Not Starting**:
```bash
# Check if port is in use
lsof -i :5001

# Use different port
export PORT=5002
python webapp_backend.py
```

**React Dev Server Issues**:
```bash
# Clear Vite cache
rm -rf webapp/node_modules/.vite

# Restart with fresh cache
npm run dev
```

**API Connection Issues**:
```bash
# Check backend is running
curl http://localhost:5001/api/health

# Check CORS configuration in webapp_backend.py
```

### Performance Issues

**Slow Classification**:
- Check internet connection to Claude API
- Verify API key is valid
- Consider caching results
- Use batch processing for multiple events

**Frontend Lag**:
- Check browser console for errors
- Verify network requests complete
- Optimize chart rendering
- Reduce data points displayed

### Getting Help

1. **Documentation**: Check this guide and other docs
2. **Logs**: Review server and browser console logs
3. **GitHub Issues**: Search existing issues
4. **Create Issue**: Provide:
   - Steps to reproduce
   - Error messages
   - Environment details
   - Screenshots if applicable

---

## Development Tools

### Recommended VS Code Extensions

**Python**:
- Python
- Pylance
- Python Debugger

**JavaScript/TypeScript**:
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)

**React**:
- ES7+ React/Redux/React-Native snippets
- Auto Import

**General**:
- GitLens
- Thunder Client (API testing)
- Error Lens

### Recommended PyCharm Plugins

- Flask support
- TypeScript
- React
- Database Tools
- CSV Editor

### Useful Commands

**Project Management**:
```bash
# Check Python dependencies
pip list

# Check outdated packages
pip list --outdated

# Update package
pip install --upgrade package-name

# Check npm packages
npm list --depth=0

# Update npm packages
npm update

# Check for security issues
npm audit
```

**Git Workflows**:
```bash
# Update fork from upstream
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git merge upstream/main

# Rebase feature branch
git checkout feature-branch
git rebase main

# Squash commits
git rebase -i HEAD~3  # Last 3 commits
```

---

## Best Practices

### Code Organization

1. **Keep functions focused**: One responsibility per function
2. **Use meaningful names**: `classify_event()` not `do_thing()`
3. **Add docstrings**: Document all public functions
4. **Handle errors**: Always use try-except
5. **Validate inputs**: Check parameters before use

### Security

1. **Never commit secrets**: Use .env files
2. **Validate user input**: Sanitize and validate
3. **Use HTTPS**: In production
4. **Keep dependencies updated**: Security patches
5. **Follow OWASP guidelines**: For web security

### Performance

1. **Cache results**: Avoid repeated API calls
2. **Use batch processing**: For multiple events
3. **Optimize queries**: Efficient data access
4. **Minimize bundle size**: Frontend optimization
5. **Use CDN**: For static assets in production

### Testing

1. **Write tests first**: TDD approach
2. **Test edge cases**: Not just happy path
3. **Use meaningful assertions**: Clear test intent
4. **Mock external APIs**: Reliable tests
5. **Maintain test coverage**: Aim for >80%

---

## Resources

### Documentation

- [Python Docs](https://docs.python.org/3/)
- [Flask Docs](https://flask.palletsprojects.com/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/)
- [Anthropic Claude Docs](https://docs.anthropic.com/)

### Learning Resources

- [Python Tutorial](https://docs.python.org/3/tutorial/)
- [React Tutorial](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Flask Mega-Tutorial](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world)

### Community

- GitHub Issues: Bug reports and feature requests
- Stack Overflow: Technical questions
- Python Discord: Python help
- Reactiflux Discord: React help

---

## License

MIT License - See LICENSE file for details

---

## Changelog

See CHANGELOG.md for version history and release notes.

---

This guide is maintained by the development team. For updates or corrections, please submit a pull request.
