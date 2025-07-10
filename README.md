# Full-Stack Rule-Based Bad Posture Detection System

A comprehensive React + Flask application for real-time posture analysis using simulated pose detection. This system provides intelligent posture monitoring with support for webcam recording, video uploads, and real-time feedback for exercises like squats and sitting posture analysis.

## 🎨 Technologies Used

### Frontend
- **React 19**: Modern frontend framework
- **react-webcam**: Webcam access and recording
- **MediaPipe JavaScript**: Client-side pose detection (optional)
- **CSS3**: Responsive design with animations

### Backend
- **Flask 3.0**: Python web framework
- **Mock Analyzer**: Simulated pose detection and analysis
- **NumPy**: Numerical computations for mock data
- **Pillow**: Image processing for mock skeleton generation
- **Flask-CORS**: Cross-origin requests


## 🚀 Quick Start

### 1. Clone the Repository
```powershell
git clone https://github.com/your-username/Full-Stack-Rule-Based-Bad-Posture-Detection.git
cd Full-Stack-Rule-Based-Bad-Posture-Detection
```

### 2. Backend Setup

#### Windows (Recommended):
```powershell
cd backend
.\setup.bat
```

#### Manual Setup:
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Linux/Mac:
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

### 3. Frontend Setup
```powershell
cd frontend
npm install
```
## 🎯 Features

### ✅ Real-time Pose Detection
- **Mock Analysis**: Simulated pose estimation and posture analysis for demonstration
- **Live Analysis**: Real-time posture feedback during webcam use
- **Visual Pose Overlay**: Generated skeleton visualization on video frames
- **Auto-detection**: Automatically simulates squat vs sitting posture detection

### ✅ Comprehensive Analysis
- **Squat Analysis**: Simulated knee over toe detection, back angle measurement, hip depth analysis
- **Sitting Posture**: Mock forward head posture, neck bending, slouching detection
- **Severity Levels**: High, Moderate, Low classifications with confidence scores
- **Real-time Alerts**: Immediate "bad posture detected" notifications

### ✅ Multiple Input Methods
- **Webcam Recording**: Record yourself for real-time analysis
- **Video Upload**: Upload video files (MP4, WebM, AVI, MOV) for analysis
- **Live Streaming**: Real-time pose detection and feedback

## 🏗 System Architecture

```
Frontend (React)              Backend (Flask - Mock Analysis)
├── Video Upload              ├── Mock Pose Detection API
├── Webcam Recording          ├── Simulated Rule-based Analysis  
├── Real-time Display         ├── Mock Frame Processing
├── Pose Visualization        └── Simulated Issue Classification
└── User Interface
```

## 📋 Prerequisites

### System Requirements
- **Frontend**: Node.js 16+ and npm
- **Backend**: Python 3.8+
- **Hardware**: Webcam (for real-time analysis)
- **Browser**: Modern web browser with webcam support

### Dependencies
- **Frontend**: React 19, react-webcam, MediaPipe JavaScript (client-side only)
- **Backend**: Flask 3.0, NumPy, Pillow (no MediaPipe required)



## 🎮 How to Use

### Real-time Webcam Analysis
1. **Open Application**: Navigate to `http://localhost:3000`
2. **Choose Webcam**: Click "📹 Use Webcam"
3. **Select Analysis Type**: 
   - **Auto Detect**: Automatically detects squat vs sitting
   - **Squat Analysis**: Specialized for squat form checking
   - **Sitting Posture**: Designed for desk work posture
4. **Start Analysis**: Click "🔍 Start Real-time Analysis"
5. **View Live Feedback**: 
   - Pose skeleton overlay on video
   - Real-time issue alerts
   - Current posture issues panel

### Video Upload Analysis
1. **Upload Video**: Click "📁 Upload Video"
2. **Select File**: Choose MP4, WebM, AVI, or MOV file
3. **Analyze**: Click "🔍 Analyze Posture"
4. **View Results**: Detailed posture analysis with scores

### Recording Sessions
1. **Record**: Use "⏺️ Start Recording" during exercises
2. **Stop & Download**: Save your session locally
3. **Analyze**: Get detailed feedback on performance

## 🔍 Posture Analysis Rules

### Squat Analysis
- ✅ **Knee Over Toe**: Detects if knees extend beyond toes
- ✅ **Back Angle**: Flags forward lean (< 150°)
- ✅ **Hip Depth**: Analyzes squat depth and form
- ✅ **Weight Distribution**: Checks balance and alignment

### Sitting Posture Analysis
- ✅ **Forward Head Posture**: Detects head extending forward (> 5cm)
- ✅ **Neck Bending**: Flags excessive neck angle (> 30°)
- ✅ **Slouching**: Identifies poor back alignment (< 160°)
- ✅ **Shoulder Position**: Checks for rounded shoulders

## 📁 Project Structure

```
Full-Stack-Rule-Based-Bad-Posture-Detection/
├── README.md                          # This comprehensive guide
├── .gitignore                         # Git ignore rules
├── .env.example                       # Environment variables template
├── render.yaml                        # Render deployment configuration
├── frontend/                          # React frontend
│   ├── package.json                   # Node dependencies (includes serve)
│   ├── public/                        # Static assets
│   └── src/                          # React source code
│       ├── App.js                     # Main application (dynamic API URLs)
│       ├── App.css                    # Styling
│       └── components/               # React components
│           ├── PostureAnalyzer.js     # Analysis component
│           ├── RealTimePoseAnalyzer.js # Real-time detection
│           └── EnhancedPostureVisualizer.js # Visualization
└── backend/                          # Flask backend
    ├── app.py                        # Flask server (production ready)
    ├── requirements.txt              # Python dependencies (includes gunicorn)
    ├── setup.bat                     # Windows setup script
    └── setup.sh                      # Linux/Mac setup script
```


## 📄 Development Commands

### Frontend
```powershell
npm install          # Install dependencies
npm start           # Development server
npm run build       # Production build
npm test            # Run tests
```

### Backend
```powershell
python app.py       # Start Flask server
pip freeze > requirements.txt  # Update dependencies
```

**Backend Dependencies (Lightweight):**
```
flask==3.0.0
flask-cors==4.0.0
numpy==1.24.3
Pillow==10.1.0
gunicorn==21.2.0
```


**Happy Posture Monitoring! 🏃‍♂️💪**
