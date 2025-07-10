# Posture Analysis Web Application

A comprehensive React + Flask application for real-time posture analysis using MediaPipe Pose detection, with support for video uploads and live webcam recording.

## 🎯 Complete Feature Set

### ✅ Phase 1: Video Upload & Webcam (Completed)
- **Video Upload**: Upload video files for posture analysis
- **Webcam Recording**: Record yourself using webcam
- **Modern UI**: Beautiful, responsive interface with gradient backgrounds
- **Video Controls**: Record, stop, download recorded videos

### ✅ Phase 2: Real-time Pose Detection (Completed)
- **MediaPipe Integration**: Advanced pose estimation with 33 landmarks
- **Real-time Analysis**: Live posture feedback during webcam use
- **Visual Pose Overlay**: Skeleton visualization on video frames
- **Rule-based Detection**: Intelligent posture issue identification

### ✅ Phase 3: Advanced Analysis (Completed)
- **Squat Analysis**: Knee over toe, back angle, form detection
- **Sitting Posture**: Forward head, neck bending, slouching detection
- **Severity Levels**: High, Moderate, Low classifications
- **Real-time Alerts**: Immediate "bad posture detected" messages

## 🚀 Complete System Architecture

```
Frontend (React)          Backend (Flask + MediaPipe)
├── Video Upload          ├── Pose Detection API
├── Webcam Recording      ├── Rule-based Analysis  
├── Real-time Display     ├── Frame Processing
└── Pose Visualization    └── Issue Classification
```

## 📋 Prerequisites

### Frontend
- Node.js 16+ and npm
- Modern web browser with webcam support

### Backend  
- Python 3.8+
- pip package manager
- Webcam (for real-time analysis)

## 🛠 Complete Installation

### 1. Clone/Setup Project Structure
```
Assignment/
├── frontend/          # React application
└── backend/           # Flask API server
```

### 2. Backend Setup (Required for real-time analysis)

#### Windows:
```bash
cd backend
setup.bat
```

#### Linux/Mac:
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

#### Manual Backend Setup:
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## ▶️ Running the Application

### 1. Start Backend Server (Terminal 1)
```bash
cd backend
# Activate virtual environment first
# Windows: venv\Scripts\activate  
# Linux/Mac: source venv/bin/activate

python app.py
```
Backend will run on `http://localhost:5000`

### 2. Start Frontend (Terminal 2)  
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## 🎮 How to Use

### Real-time Webcam Analysis
1. **Open Application**: Navigate to `http://localhost:3000`
2. **Choose Webcam**: Click "📹 Use Webcam"
3. **Select Analysis Type**: 
   - **Auto Detect**: Automatically detects squat vs sitting
   - **Squat Analysis**: Specialized for squat form checking
   - **Sitting Posture**: Designed for desk work posture
4. **Start Real-time Analysis**: Click "🔍 Start Real-time Analysis"
5. **View Live Feedback**: 
   - Pose skeleton overlay on video
   - Real-time issue alerts in top-right corner
   - Current posture issues panel below video

### Video Upload Analysis
1. **Upload Video**: Click "📁 Upload Video"
2. **Select File**: Choose MP4, WebM, AVI, or MOV file
3. **Analyze**: Click "🔍 Analyze Posture"
4. **View Results**: Detailed posture analysis with scores and recommendations

### Recording & Analysis
1. **Record Session**: Use "⏺️ Start Recording" while performing exercises
2. **Stop & Download**: Save your session locally
3. **Analyze Recording**: Get detailed feedback on your performance

## 🔍 Posture Analysis Features

### Real-time Detection
- **Live Pose Overlay**: Visual skeleton on webcam feed
- **Instant Alerts**: Immediate posture issue warnings
- **Joint Highlighting**: Problem areas highlighted in real-time
- **Confidence Scores**: AI confidence in detection accuracy

### Squat Analysis Rules
- ✅ **Knee Over Toe**: Detects if knees extend beyond toes
- ✅ **Back Angle**: Flags forward lean (< 150°)
- ✅ **Hip Depth**: Analyzes squat depth and form
- ✅ **Weight Distribution**: Checks balance and alignment

### Sitting Posture Rules  
- ✅ **Forward Head Posture**: Detects head extending forward
- ✅ **Neck Bending**: Flags excessive neck angle (> 30°)
- ✅ **Slouching**: Identifies poor back alignment
- ✅ **Shoulder Position**: Checks for rounded shoulders

### Analysis Output
- **Posture Score**: Overall score out of 100
- **Issue Timeline**: When issues occur during video
- **Severity Levels**: High/Moderate/Low classifications  
- **Recommendations**: Actionable improvement advice
- **Visual Feedback**: Highlighted problematic joints

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── App.js                     # Main application
│   ├── App.css                    # Styling
│   ├── components/
│   │   ├── PostureAnalyzer.js     # Analysis component
│   │   └── RealTimePoseAnalyzer.js # Real-time detection
│   └── ...
└── package.json

backend/
├── app.py                         # Flask server
├── requirements.txt               # Python dependencies  
├── setup.bat / setup.sh          # Setup scripts
└── README.md                      # Backend documentation
```

## 🔧 API Endpoints

### Health Check
```http
GET http://localhost:5000/api/health
```

### Real-time Frame Analysis
```http  
POST http://localhost:5000/api/analyze-frame
Content-Type: application/json

{
  "image": "base64_encoded_image",
  "analysis_type": "auto" | "squat" | "sitting"
}
```

## 🎨 Technologies Used

### Frontend
- **React 19**: Modern frontend framework
- **react-webcam**: Webcam access and recording
- **CSS3**: Responsive design with animations
- **MediaRecorder API**: Video recording

### Backend
- **Flask 3.0**: Python web framework  
- **MediaPipe 0.10.8**: Google's pose detection
- **OpenCV 4.8**: Computer vision processing
- **NumPy**: Numerical computations
- **Flask-CORS**: Cross-origin requests

## 📱 Browser Compatibility

- ✅ Chrome 60+ (Recommended)
- ✅ Firefox 55+
- ✅ Safari 11+  
- ✅ Edge 79+

## 🔒 Privacy & Security

- **Local Processing**: All analysis happens locally
- **No Data Upload**: Videos never leave your device
- **Camera Permission**: Requires user consent for webcam access
- **No Storage**: No personal data stored on servers

## 🚧 Troubleshooting

### Backend Issues
1. **MediaPipe Installation**: 
   ```bash
   pip install mediapipe==0.10.8
   ```

2. **Port Conflicts**: Backend uses port 5000, frontend uses 3000

3. **CORS Errors**: Ensure both servers are running

### Frontend Issues  
1. **Camera Access**: Allow camera permissions in browser
2. **Real-time Not Working**: Check if backend is running on port 5000
3. **Performance**: Reduce analysis frequency for slower devices

## 🔮 Future Enhancements

### Advanced Features
- **3D Pose Analysis**: Depth-based assessment
- **Custom Training**: User-specific posture models  
- **Progress Tracking**: Long-term posture improvement
- **Exercise Guidance**: Real-time form correction

### Performance  
- **GPU Acceleration**: Faster processing with CUDA
- **Mobile Support**: Optimized mobile experience
- **Offline Mode**: No internet required

## 📄 Development Commands

### Frontend
```bash
npm start          # Development server
npm run build      # Production build  
npm test           # Run tests
```

### Backend
```bash
python app.py      # Start Flask server
```

## 📜 License

This project demonstrates advanced posture analysis using modern web technologies and computer vision.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Next Phase: Real-time Pose Detection

### Frontend Enhancements
- Visual pose overlay on video
- Real-time joint highlighting
- Frame-by-frame feedback display
- "Bad posture detected" alerts

### Backend Integration
- Flask/FastAPI server for pose processing
- MediaPipe pose detection
- Rule-based posture analysis
- Real-time feedback API

## License

This project is part of an assignment for posture analysis application development.
