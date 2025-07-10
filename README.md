# Full-Stack Rule-Based Bad Posture Detection System

A comprehensive React + Flask application for real-time posture analysis using MediaPipe Pose detection. This system provides intelligent posture monitoring with support for webcam recording, video uploads, and real-time feedback for exercises like squats and sitting posture analysis.

## 🎯 Features

### ✅ Real-time Pose Detection
- **MediaPipe Integration**: Advanced pose estimation with 33 landmarks
- **Live Analysis**: Real-time posture feedback during webcam use
- **Visual Pose Overlay**: Skeleton visualization on video frames
- **Auto-detection**: Automatically determines squat vs sitting posture

### ✅ Comprehensive Analysis
- **Squat Analysis**: Knee over toe detection, back angle measurement, hip depth analysis
- **Sitting Posture**: Forward head posture, neck bending, slouching detection
- **Severity Levels**: High, Moderate, Low classifications with confidence scores
- **Real-time Alerts**: Immediate "bad posture detected" notifications

### ✅ Multiple Input Methods
- **Webcam Recording**: Record yourself for real-time analysis
- **Video Upload**: Upload video files (MP4, WebM, AVI, MOV) for analysis
- **Live Streaming**: Real-time pose detection and feedback

## 🏗 System Architecture

```
Frontend (React)              Backend (Flask + MediaPipe)
├── Video Upload              ├── Pose Detection API
├── Webcam Recording          ├── Rule-based Analysis  
├── Real-time Display         ├── Frame Processing
├── Pose Visualization        └── Issue Classification
└── User Interface
```

## 📋 Prerequisites

### System Requirements
- **Frontend**: Node.js 16+ and npm
- **Backend**: Python 3.8+
- **Hardware**: Webcam (for real-time analysis)
- **Browser**: Modern web browser with webcam support

### Dependencies
- **Frontend**: React 19, react-webcam, MediaPipe JavaScript
- **Backend**: Flask 3.0, MediaPipe 0.10.8, OpenCV 4.8, NumPy

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

## ▶️ Running the Application

### Local Development

#### 1. Start Backend Server (Terminal 1)
```powershell
cd backend
# Activate virtual environment
venv\Scripts\activate
# Start Flask server
python app.py
```
✅ Backend will run on `http://localhost:5000`

#### 2. Start Frontend (Terminal 2)
```powershell
cd frontend
npm start
```
✅ Frontend will run on `http://localhost:3000`

#### 3. Access the Application
Open your browser and navigate to `http://localhost:3000`

### 🚀 Deploy to Render

This project is configured for easy deployment to Render using the included `render.yaml` configuration.

#### Prerequisites for Deployment
- GitHub repository with your code
- Render account (free tier available)

#### Deployment Steps

1. **Push to GitHub**:
   ```powershell
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Automatic Deployment**:
   - Render will create two services:
     - `flask-backend`: Python backend on `https://flask-backend.onrender.com`
     - `react-frontend`: React frontend on `https://react-frontend.onrender.com`

4. **Update Frontend Environment Variables** (if needed):
   - In Render dashboard, go to your frontend service
   - Add environment variable: `REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com`

5. **Access Your Deployed App**:
   - Frontend: `https://react-frontend.onrender.com`
   - Backend API: `https://flask-backend.onrender.com/api/health`

#### Render Configuration Details

The `render.yaml` file automatically configures:

**Backend Service:**
- Python environment with gunicorn server
- Automatic dependency installation
- Port 10000 (Render's requirement)
- Production environment variables

**Frontend Service:**
- Node.js environment
- Build process with `npm run build`
- Static file serving with `serve`
- Dynamic API URL configuration

#### Deployment Troubleshooting

1. **Build Failures**: Check Render logs for dependency issues
2. **API Connection**: Verify `REACT_APP_API_BASE_URL` environment variable
3. **Performance**: Free tier has limitations (spin-down after inactivity)

### Local vs Deployed Environment

| Feature | Local Development | Render Deployment |
|---------|-------------------|-------------------|
| Backend URL | `http://localhost:5000` | `https://flask-backend.onrender.com` |
| Frontend URL | `http://localhost:3000` | `https://react-frontend.onrender.com` |
| Configuration | Manual setup | Automatic via `render.yaml` |
| HTTPS | Not required | Automatically enabled |
| Environment | Development | Production |

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

## 🔧 API Endpoints

### Health Check
```http
GET /api/health
```
Returns server status and MediaPipe initialization.

### Real-time Frame Analysis
```http
POST /api/analyze-frame
Content-Type: application/json

{
  "image": "base64_encoded_image",
  "analysis_type": "auto" | "squat" | "sitting"
}
```

**Response:**
```json
{
  "pose_detected": true,
  "landmarks": [...],
  "issues": [
    {
      "type": "knee_over_toe",
      "severity": "high",
      "confidence": 0.85,
      "description": "Left knee extends beyond toes"
    }
  ],
  "pose_overlay": "base64_encoded_image_with_skeleton"
}
```

## 🎨 Technologies Used

### Frontend
- **React 19**: Modern frontend framework
- **react-webcam**: Webcam access and recording
- **MediaPipe JavaScript**: Client-side pose detection
- **CSS3**: Responsive design with animations

### Backend
- **Flask 3.0**: Python web framework
- **MediaPipe 0.10.8**: Google's pose detection
- **OpenCV 4.8**: Computer vision processing
- **NumPy**: Numerical computations
- **Flask-CORS**: Cross-origin requests

## 🚧 Troubleshooting

### Common Issues

#### Backend Issues
1. **MediaPipe Installation Error**:
   ```powershell
   pip install mediapipe==0.10.8
   ```

2. **OpenCV Import Error**:
   ```powershell
   pip install opencv-python-headless
   ```

3. **Port 5000 Already in Use**:
   ```powershell
   # Kill process using port 5000
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   ```

#### Frontend Issues
1. **Camera Access Denied**: Allow camera permissions in browser
2. **Real-time Not Working**: Ensure backend is running on port 5000
3. **Performance Issues**: Reduce analysis frequency for slower devices

#### CORS Issues
- Ensure both frontend and backend servers are running
- Check Flask-CORS is installed: `pip install flask-cors`

### Debug Mode
```powershell
# Backend debug mode
set FLASK_DEBUG=1
python app.py

# Frontend debug mode
npm start
```

## 📱 Browser Compatibility

- ✅ Chrome 60+ (Recommended)
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 🔒 Privacy & Security

- **Local Processing**: All analysis happens locally
- **No Data Upload**: Videos never leave your device
- **Camera Permission**: Requires user consent
- **No Storage**: No personal data stored on servers

## 🔮 Future Enhancements

### Advanced Features
- **3D Pose Analysis**: Depth-based assessment
- **Custom Training**: User-specific posture models
- **Progress Tracking**: Long-term improvement monitoring
- **Exercise Guidance**: Real-time form correction

### Performance Optimizations
- **GPU Acceleration**: CUDA support for faster processing
- **Mobile Support**: Optimized mobile experience
- **Offline Mode**: No internet required
- **Model Optimization**: TensorFlow Lite integration

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

## 📜 License

This project demonstrates advanced posture analysis using modern web technologies and computer vision.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify both servers are running on correct ports
4. Check browser console for errors

---

**Happy Posture Monitoring! 🏃‍♂️💪**