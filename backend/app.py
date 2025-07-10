from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import base64
import io
from PIL import Image, ImageDraw
import json
import random
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

class MockPostureAnalyzer:
    """
    Mock Posture Analyzer that simulates pose detection and analysis
    without requiring MediaPipe or heavy computer vision libraries
    """
    
    def __init__(self):
        self.analysis_count = 0
        print("Mock Posture Analyzer initialized")
    
    def simulate_pose_landmarks(self):
        """Generate mock pose landmarks for demonstration"""
        landmarks = []
        
        # Generate 33 mock landmarks (MediaPipe standard)
        for i in range(33):
            landmarks.append({
                'x': random.uniform(0.2, 0.8),  # Normalized coordinates
                'y': random.uniform(0.2, 0.8),
                'z': random.uniform(-0.1, 0.1),
                'visibility': random.uniform(0.7, 1.0)
            })
        
        return landmarks
    
    def analyze_squat_posture(self):
        """Simulate squat posture analysis"""
        issues = []
        
        # Randomly generate some posture issues for demonstration
        if random.random() > 0.7:  # 30% chance of knee over toe issue
            issues.append({
                'type': 'knee_over_toe',
                'severity': random.choice(['high', 'moderate', 'low']),
                'confidence': round(random.uniform(0.7, 0.95), 2),
                'description': 'Left knee extends beyond toes during squat',
                'joint': 'left_knee',
                'recommendation': 'Focus on sitting back into the squat and keeping knees aligned over ankles'
            })
        
        if random.random() > 0.6:  # 40% chance of back angle issue
            issues.append({
                'type': 'back_angle',
                'severity': random.choice(['moderate', 'low']),
                'confidence': round(random.uniform(0.6, 0.9), 2),
                'description': 'Forward lean detected in squat position',
                'joint': 'spine',
                'recommendation': 'Keep chest up and maintain neutral spine throughout the movement'
            })
        
        return issues
    
    def analyze_sitting_posture(self):
        """Simulate sitting posture analysis"""
        issues = []
        
        if random.random() > 0.5:  # 50% chance of forward head posture
            issues.append({
                'type': 'forward_head_posture',
                'severity': random.choice(['high', 'moderate']),
                'confidence': round(random.uniform(0.8, 0.95), 2),
                'description': 'Head positioned too far forward',
                'joint': 'neck',
                'recommendation': 'Pull head back and align ears over shoulders'
            })
        
        if random.random() > 0.6:  # 40% chance of slouching
            issues.append({
                'type': 'slouching',
                'severity': random.choice(['moderate', 'low']),
                'confidence': round(random.uniform(0.7, 0.9), 2),
                'description': 'Rounded shoulders and curved spine detected',
                'joint': 'spine',
                'recommendation': 'Sit up straight with shoulders back and down'
            })
        
        return issues
    
    def auto_detect_posture_type(self):
        """Simulate automatic posture type detection"""
        return random.choice(['squat', 'sitting'])
    
    def process_frame(self, analysis_type='auto'):
        """
        Simulate frame processing and posture analysis
        Returns mock analysis results similar to MediaPipe implementation
        """
        self.analysis_count += 1
        
        # Simulate processing time
        time.sleep(0.1)
        
        # Generate mock landmarks
        landmarks = self.simulate_pose_landmarks()
        
        # Determine analysis type
        if analysis_type == 'auto':
            detected_type = self.auto_detect_posture_type()
        else:
            detected_type = analysis_type
        
        # Analyze based on type
        if detected_type == 'squat':
            issues = self.analyze_squat_posture()
        elif detected_type == 'sitting':
            issues = self.analyze_sitting_posture()
        else:
            issues = []
        
        # Calculate posture score (higher is better)
        base_score = 100
        score_deduction = sum(
            {'high': 20, 'moderate': 10, 'low': 5}.get(issue['severity'], 0) 
            for issue in issues
        )
        posture_score = max(0, base_score - score_deduction)
        
        # Generate mock pose overlay (base64 encoded placeholder)
        pose_overlay = self.generate_mock_pose_overlay()
        
        return {
            'pose_detected': True,
            'landmarks': landmarks,
            'issues': issues,
            'posture_score': posture_score,
            'detected_posture_type': detected_type,
            'analysis_type': analysis_type,
            'pose_overlay': pose_overlay,
            'frame_number': self.analysis_count,
            'timestamp': time.time()
        }
    
    def generate_mock_pose_overlay(self):
        """Generate a simple mock pose overlay image"""
        # Create a simple image with pose skeleton representation
        img = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw simple stick figure
        # Head
        draw.ellipse([90, 20, 110, 40], outline='green', width=2)
        # Body
        draw.line([100, 40, 100, 120], fill='green', width=3)
        # Arms
        draw.line([100, 60, 80, 100], fill='green', width=2)
        draw.line([100, 60, 120, 100], fill='green', width=2)
        # Legs
        draw.line([100, 120, 85, 180], fill='green', width=2)
        draw.line([100, 120, 115, 180], fill='green', width=2)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"

# Initialize the mock analyzer
analyzer = MockPostureAnalyzer()

@app.route('/api/analyze-frame', methods=['POST'])
def analyze_frame():
    """
    Analyze a single frame for posture issues using mock analysis
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Get analysis type
        analysis_type = data.get('analysis_type', 'auto')
        
        # Validate image data (basic check)
        image_data = data['image']
        if not image_data.startswith('data:image'):
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Process frame with mock analysis
        result = analyzer.process_frame(analysis_type)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': f'Analysis failed: {str(e)}',
            'pose_detected': False,
            'landmarks': [],
            'issues': []
        }), 500

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    """
    Analyze multiple frames from a video (mock implementation)
    """
    try:
        data = request.get_json()
        
        if 'frames' in data:
            # Process multiple frames
            results = []
            for i, frame_data in enumerate(data['frames'][:10]):  # Limit to 10 frames for demo
                # Simulate analysis for each frame
                result = analyzer.process_frame(data.get('analysis_type', 'auto'))
                result['timestamp'] = frame_data.get('timestamp', i)
                results.append(result)
            
            # Calculate summary statistics
            total_issues = sum(len(r.get('issues', [])) for r in results)
            avg_score = sum(r.get('posture_score', 100) for r in results) / len(results) if results else 100
            
            return jsonify({
                'frame_results': results,
                'total_frames': len(results),
                'total_issues': total_issues,
                'average_score': round(avg_score),
                'summary': f'Analyzed {len(results)} frames with {total_issues} total issues detected',
                'analysis_type': 'mock_simulation'
            })
        else:
            # Return mock video analysis summary
            return jsonify({
                'total_frames': 100,
                'issues_summary': [
                    {
                        'frame': 15, 
                        'issues': [{'type': 'knee_over_toe', 'severity': 'high'}]
                    },
                    {
                        'frame': 32, 
                        'issues': [{'type': 'forward_lean', 'severity': 'moderate'}]
                    },
                    {
                        'frame': 67, 
                        'issues': [{'type': 'slouching', 'severity': 'low'}]
                    }
                ],
                'overall_score': random.randint(70, 90),
                'analysis_type': 'mock_simulation'
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'analyzer': 'mock_posture_analyzer',
        'version': '1.0.0',
        'features': [
            'Mock pose detection',
            'Simulated posture analysis',
            'Squat form analysis',
            'Sitting posture analysis'
        ],
        'analysis_count': analyzer.analysis_count
    })

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current analyzer status and capabilities"""
    return jsonify({
        'analyzer_type': 'mock',
        'capabilities': {
            'real_time_analysis': True,
            'video_analysis': True,
            'squat_analysis': True,
            'sitting_analysis': True,
            'auto_detection': True
        },
        'mock_features': {
            'pose_landmarks': '33 simulated points',
            'issue_detection': 'Rule-based simulation',
            'confidence_scores': 'Randomized realistic values',
            'pose_overlay': 'Generated stick figure'
        },
        'performance': {
            'avg_processing_time': '100ms',
            'frames_analyzed': analyzer.analysis_count
        }
    })

if __name__ == '__main__':
    import os
    print("🚀 Starting Mock Posture Analysis Backend...")
    print("📊 Mock Analyzer initialized successfully")
    print("🎯 Features: Simulated pose detection and posture analysis")
    print("💡 Note: This is a demonstration version without MediaPipe")
    
    # Get port from environment variable (for Render deployment) or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Enable debug mode only in development
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
