# Posture Analysis Backend

A Flask-based backend API for real-time posture analysis using MediaPipe Pose detection.

## Features

### ✅ Real-time Pose Detection
- **MediaPipe Integration**: Advanced pose estimation and landmark detection
- **Frame Analysis**: Process individual frames from webcam or video
- **Joint Tracking**: 33 pose landmarks with visibility scores
- **Pose Overlay**: Visual pose skeleton overlay on video frames

### ✅ Rule-based Posture Analysis
- **Squat Analysis**:
  - Knee over toe detection
  - Back angle measurement (<150° flagged)
  - Hip depth and alignment
  - Weight distribution analysis

- **Sitting Posture Analysis**:
  - Forward head posture detection
  - Neck bending angle (>30° flagged)
  - Back straightness measurement
  - Shoulder alignment

### ✅ Smart Analysis
- **Auto-detection**: Automatically determines squat vs sitting posture
- **Severity Levels**: High, Moderate, Low severity classifications
- **Confidence Scores**: AI confidence in detection accuracy
- **Real-time Feedback**: Frame-by-frame analysis for live feedback

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Webcam (for real-time analysis)

### Quick Setup

#### Windows:
```bash
# Run the setup script
setup.bat

# Or manually:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Linux/Mac:
```bash
# Run the setup script
chmod +x setup.sh
./setup.sh

# Or manually:
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Manual Installation
1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate Virtual Environment**:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

```bash
# Activate virtual environment first
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Start the Flask server
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```http
GET /api/health
```
Returns server status and MediaPipe initialization status.

**Response:**
```json
{
  "status": "healthy",
  "mediapipe": "initialized"
}
```

### 2. Analyze Frame
```http
POST /api/analyze-frame
```
Analyze a single frame for posture issues.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...", 
  "analysis_type": "auto" // "auto", "squat", or "sitting"
}
```

**Response:**
```json
{
  "pose_detected": true,
  "landmarks": [
    {
      "x": 0.5,
      "y": 0.3,
      "z": 0.1,
      "visibility": 0.9
    }
  ],
  "issues": [
    {
      "type": "knee_over_toe",
      "severity": "high",
      "confidence": 0.85,
      "description": "Left knee extends beyond toes",
      "joint": "left_knee"
    }
  ],
  "pose_overlay": "base64_encoded_image_with_pose_skeleton"
}
```

### 3. Analyze Video
```http
POST /api/analyze-video
```
Analyze an entire video file (placeholder for future implementation).

## Posture Analysis Rules

### Squat Analysis
1. **Knee Over Toe**: 
   - Checks if knee x-position > ankle x-position + margin
   - Severity: High if significantly over

2. **Back Angle**: 
   - Measures hip-shoulder-vertical angle
   - Flags if < 150° (forward lean)
   - Severity based on angle deviation

3. **Hip Depth**: 
   - Analyzes squat depth and form
   - Checks for proper hip hinge movement

### Sitting Posture Analysis
1. **Forward Head Posture**:
   - Measures nose position relative to shoulders
   - Flags if head extends > 5cm forward

2. **Neck Angle**:
   - Calculates hip-shoulder-nose angle
   - Flags if < 150° (excessive neck bending)

3. **Back Straightness**:
   - Measures hip-shoulder alignment
   - Flags slouching if angle < 160°

## Technical Details

### MediaPipe Configuration
- **Model Complexity**: 1 (balanced speed/accuracy)
- **Detection Confidence**: 0.5
- **Tracking Confidence**: 0.5
- **Pose Landmarks**: 33 points including face, torso, arms, legs

### Performance
- **Frame Processing**: ~100-200ms per frame
- **Real-time Capability**: 2-5 FPS analysis
- **Memory Usage**: ~200MB with MediaPipe loaded

### Dependencies
- **Flask 3.0.0**: Web framework
- **MediaPipe 0.10.8**: Pose detection
- **OpenCV 4.8.1**: Image processing
- **NumPy 1.24.3**: Numerical computations
- **Pillow 10.1.0**: Image handling
- **Flask-CORS 4.0.0**: Cross-origin requests

## Development

### Adding New Analysis Rules
1. **Create Analysis Function**:
   ```python
   def analyze_new_posture(self, landmarks):
       issues = []
       # Add your analysis logic
       return issues
   ```

2. **Integrate in process_frame()**:
   ```python
   elif analysis_type == 'new_type':
       issues = self.analyze_new_posture(results.pose_landmarks.landmark)
   ```

### Pose Landmark Reference
MediaPipe provides 33 pose landmarks:
- 0-10: Face points
- 11-24: Upper body (shoulders, elbows, wrists, hips)
- 25-32: Lower body (knees, ankles, feet)

### Angle Calculation
```python
def calculate_angle(self, point1, point2, point3):
    # point2 is the vertex of the angle
    # Returns angle in degrees
```

## Troubleshooting

### Common Issues

1. **MediaPipe Installation Error**:
   ```bash
   # Try installing with specific version
   pip install mediapipe==0.10.8
   ```

2. **OpenCV Import Error**:
   ```bash
   # Install OpenCV with headless support
   pip install opencv-python-headless
   ```

3. **CORS Issues**:
   - Ensure Flask-CORS is installed
   - Check if frontend is running on different port

4. **Performance Issues**:
   - Reduce analysis frequency in frontend
   - Lower image resolution before sending
   - Use model_complexity=0 for faster processing

### Debug Mode
Start server with debug logging:
```bash
export FLASK_DEBUG=1  # Linux/Mac
set FLASK_DEBUG=1     # Windows
python app.py
```

## Future Enhancements

### Planned Features
- **Video File Processing**: Full video analysis with timeline
- **3D Pose Analysis**: Depth-based posture assessment
- **Machine Learning**: Custom trained models for specific activities
- **Pose Correction**: Real-time guidance for posture improvement
- **Export Features**: Analysis reports and data export

### Performance Optimizations
- **GPU Acceleration**: CUDA support for faster processing
- **Model Optimization**: TensorFlow Lite for edge deployment
- **Caching**: Intelligent caching for repeated analysis
- **Batch Processing**: Multiple frame analysis

## License

This backend is part of the Posture Analysis Web Application project.
