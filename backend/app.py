from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import base64
import io
from PIL import Image
import math
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize MediaPipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

class PostureAnalyzer:
    def __init__(self):
        self.pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    
    def get_joint_coordinates(self, landmarks, joint_name):
        """Get pixel coordinates for a specific joint"""
        joint_map = {
            'nose': mp_pose.PoseLandmark.NOSE,
            'left_shoulder': mp_pose.PoseLandmark.LEFT_SHOULDER,
            'right_shoulder': mp_pose.PoseLandmark.RIGHT_SHOULDER,
            'left_elbow': mp_pose.PoseLandmark.LEFT_ELBOW,
            'right_elbow': mp_pose.PoseLandmark.RIGHT_ELBOW,
            'left_wrist': mp_pose.PoseLandmark.LEFT_WRIST,
            'right_wrist': mp_pose.PoseLandmark.RIGHT_WRIST,
            'left_hip': mp_pose.PoseLandmark.LEFT_HIP,
            'right_hip': mp_pose.PoseLandmark.RIGHT_HIP,
            'left_knee': mp_pose.PoseLandmark.LEFT_KNEE,
            'right_knee': mp_pose.PoseLandmark.RIGHT_KNEE,
            'left_ankle': mp_pose.PoseLandmark.LEFT_ANKLE,
            'right_ankle': mp_pose.PoseLandmark.RIGHT_ANKLE
        }
        
        if joint_name in joint_map:
            landmark = landmarks[joint_map[joint_name]]
            return [landmark.x, landmark.y, landmark.z]
        return None

    def calculate_posture_score(self, issues):
        """Calculate overall posture score based on detected issues"""
        base_score = 100
        
        for issue in issues:
            severity = issue['severity']
            if severity == 'high':
                base_score -= 25
            elif severity == 'moderate':
                base_score -= 15
            elif severity == 'low':
                base_score -= 5
        
        return max(0, base_score)
    
    def generate_recommendations(self, issues):
        """Generate specific recommendations based on detected issues"""
        recommendations = []
        
        for issue in issues:
            issue_type = issue['type']
            
            if issue_type == 'knee_over_toe':
                recommendations.append("Keep your knees aligned over your toes. Widen your stance and engage your glutes.")
            elif issue_type == 'forward_lean':
                recommendations.append("Keep your chest up and maintain a neutral spine. Engage your core muscles.")
            elif issue_type == 'forward_head':
                recommendations.append("Pull your head back and align it over your shoulders. Imagine a string pulling the top of your head up.")
            elif issue_type == 'neck_bend':
                recommendations.append("Keep your neck in a neutral position. Avoid looking down at screens for extended periods.")
            elif issue_type == 'slouching':
                recommendations.append("Sit up straight with your shoulders back. Use a lumbar support if needed.")
        
        return list(set(recommendations))  # Remove duplicates
        """Calculate angle between three points"""
        try:
            # Convert to numpy arrays
            a = np.array(point1)
            b = np.array(point2)
            c = np.array(point3)
            
            # Calculate vectors
            ba = a - b
            bc = c - b
            
            # Calculate angle
            cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
            angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
            
            return np.degrees(angle)
        except:
            return 0
    
    def analyze_squat_posture(self, landmarks):
        """Analyze squat posture and detect issues"""
        issues = []
        
        try:
            # Get relevant landmarks
            left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
            right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP].y]
            left_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
            right_knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE].x, landmarks[mp_pose.PoseLandmark.RIGHT_KNEE].y]
            left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]
            right_ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE].x, landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE].y]
            left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
            right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].y]
            
            # Check knee over toe (using left side)
            if left_knee[0] > left_ankle[0] + 0.05:  # Allow small margin
                issues.append({
                    'type': 'knee_over_toe',
                    'severity': 'high',
                    'confidence': 0.85,
                    'description': 'Left knee extends beyond toes',
                    'joint': 'left_knee'
                })
            
            if right_knee[0] > right_ankle[0] + 0.05:
                issues.append({
                    'type': 'knee_over_toe',
                    'severity': 'high',
                    'confidence': 0.85,
                    'description': 'Right knee extends beyond toes',
                    'joint': 'right_knee'
                })
            
            # Check back angle (hip-shoulder alignment)
            left_back_angle = self.calculate_angle(left_hip, left_shoulder, [left_shoulder[0], left_shoulder[1] - 0.1])
            right_back_angle = self.calculate_angle(right_hip, right_shoulder, [right_shoulder[0], right_shoulder[1] - 0.1])
            
            avg_back_angle = (left_back_angle + right_back_angle) / 2
            
            if avg_back_angle < 150:
                issues.append({
                    'type': 'forward_lean',
                    'severity': 'moderate' if avg_back_angle > 120 else 'high',
                    'confidence': 0.75,
                    'description': f'Forward lean detected (angle: {avg_back_angle:.1f}°)',
                    'joint': 'spine'
                })
            
        except Exception as e:
            print(f"Error in squat analysis: {e}")
        
        return issues
    
    def analyze_sitting_posture(self, landmarks):
        """Analyze sitting posture and detect issues"""
        issues = []
        
        try:
            # Get relevant landmarks
            nose = [landmarks[mp_pose.PoseLandmark.NOSE].x, landmarks[mp_pose.PoseLandmark.NOSE].y]
            left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
            right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].y]
            left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
            right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP].y]
            
            # Calculate average shoulder and hip positions
            avg_shoulder = [(left_shoulder[0] + right_shoulder[0])/2, (left_shoulder[1] + right_shoulder[1])/2]
            avg_hip = [(left_hip[0] + right_hip[0])/2, (left_hip[1] + right_hip[1])/2]
            
            # Check forward head posture
            head_forward = nose[0] - avg_shoulder[0]
            if head_forward > 0.05:  # Threshold for forward head
                issues.append({
                    'type': 'forward_head',
                    'severity': 'moderate' if head_forward < 0.1 else 'high',
                    'confidence': 0.8,
                    'description': 'Forward head posture detected',
                    'joint': 'neck'
                })
            
            # Check neck angle
            neck_angle = self.calculate_angle(avg_hip, avg_shoulder, nose)
            if neck_angle < 150:  # Normal neck should be more upright
                issues.append({
                    'type': 'neck_bend',
                    'severity': 'moderate' if neck_angle > 120 else 'high',
                    'confidence': 0.75,
                    'description': f'Excessive neck bending (angle: {neck_angle:.1f}°)',
                    'joint': 'neck'
                })
            
            # Check back straightness
            back_angle = self.calculate_angle(avg_hip, avg_shoulder, [avg_shoulder[0], avg_shoulder[1] - 0.1])
            if back_angle < 160:  # Should be relatively straight
                issues.append({
                    'type': 'slouching',
                    'severity': 'moderate' if back_angle > 140 else 'high',
                    'confidence': 0.7,
                    'description': f'Slouching detected (back angle: {back_angle:.1f}°)',
                    'joint': 'spine'
                })
                
        except Exception as e:
            print(f"Error in sitting analysis: {e}")
        
        return issues
    
    def process_frame(self, image, analysis_type='auto'):
        """Process a single frame and return pose data with analysis"""
        try:
            # Convert image to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.pose.process(rgb_image)
            
            response_data = {
                'pose_detected': False,
                'landmarks': [],
                'issues': [],
                'pose_overlay': None,
                'posture_score': 100,
                'recommendations': [],
                'joint_angles': {},
                'analysis_timestamp': None
            }
            
            if results.pose_landmarks:
                response_data['pose_detected'] = True
                
                # Convert landmarks to list format
                landmarks_list = []
                for landmark in results.pose_landmarks.landmark:
                    landmarks_list.append({
                        'x': landmark.x,
                        'y': landmark.y,
                        'z': landmark.z,
                        'visibility': landmark.visibility
                    })
                response_data['landmarks'] = landmarks_list
                
                # Analyze posture based on type
                if analysis_type == 'squat':
                    issues = self.analyze_squat_posture(results.pose_landmarks.landmark)
                elif analysis_type == 'sitting':
                    issues = self.analyze_sitting_posture(results.pose_landmarks.landmark)
                else:
                    # Auto-detect based on pose (simplified)
                    left_knee_y = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE].y
                    left_hip_y = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP].y
                    
                    if left_knee_y > left_hip_y + 0.1:  # Likely squatting
                        issues = self.analyze_squat_posture(results.pose_landmarks.landmark)
                    else:
                        issues = self.analyze_sitting_posture(results.pose_landmarks.landmark)
                
                response_data['issues'] = issues
                
                # Calculate posture score
                response_data['posture_score'] = self.calculate_posture_score(issues)
                
                # Generate recommendations
                response_data['recommendations'] = self.generate_recommendations(issues)
                
                # Add timestamp
                import time
                response_data['analysis_timestamp'] = time.time()
                
                # Calculate key joint angles for reference
                try:
                    landmarks = results.pose_landmarks.landmark
                    left_knee_angle = self.calculate_angle(
                        self.get_joint_coordinates(landmarks, 'left_hip'),
                        self.get_joint_coordinates(landmarks, 'left_knee'),
                        self.get_joint_coordinates(landmarks, 'left_ankle')
                    )
                    right_knee_angle = self.calculate_angle(
                        self.get_joint_coordinates(landmarks, 'right_hip'),
                        self.get_joint_coordinates(landmarks, 'right_knee'),
                        self.get_joint_coordinates(landmarks, 'right_ankle')
                    )
                    
                    response_data['joint_angles'] = {
                        'left_knee': left_knee_angle,
                        'right_knee': right_knee_angle
                    }
                except:
                    response_data['joint_angles'] = {}
                
                # Create pose overlay image with enhanced visualization
                annotated_image = image.copy()
                height, width = annotated_image.shape[:2]
                
                # Draw basic pose landmarks
                mp_drawing.draw_landmarks(
                    annotated_image,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style()
                )
                
                # Highlight problematic joints with colored circles and warnings
                for issue in issues:
                    if 'joint' in issue:
                        joint_name = issue['joint']
                        severity = issue['severity']
                        
                        # Define colors based on severity
                        color = (0, 0, 255) if severity == 'high' else (0, 165, 255) if severity == 'moderate' else (0, 255, 255)
                        
                        # Highlight specific joints
                        if joint_name == 'left_knee':
                            landmark = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
                            x, y = int(landmark.x * width), int(landmark.y * height)
                            cv2.circle(annotated_image, (x, y), 15, color, 3)
                            cv2.putText(annotated_image, 'KNEE ISSUE', (x-40, y-20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                            
                        elif joint_name == 'right_knee':
                            landmark = results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
                            x, y = int(landmark.x * width), int(landmark.y * height)
                            cv2.circle(annotated_image, (x, y), 15, color, 3)
                            cv2.putText(annotated_image, 'KNEE ISSUE', (x-40, y-20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                            
                        elif joint_name == 'neck':
                            landmark = results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE]
                            x, y = int(landmark.x * width), int(landmark.y * height)
                            cv2.circle(annotated_image, (x, y), 15, color, 3)
                            cv2.putText(annotated_image, 'NECK ISSUE', (x-40, y-20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                            
                        elif joint_name == 'spine':
                            # Highlight the spine region
                            left_shoulder = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
                            right_shoulder = results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
                            x = int((left_shoulder.x + right_shoulder.x) * width / 2)
                            y = int((left_shoulder.y + right_shoulder.y) * height / 2)
                            cv2.circle(annotated_image, (x, y), 20, color, 3)
                            cv2.putText(annotated_image, 'POSTURE', (x-30, y-25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                # Add overall posture status
                posture_status = "GOOD POSTURE" if len(issues) == 0 else f"{len(issues)} ISSUE(S) DETECTED"
                status_color = (0, 255, 0) if len(issues) == 0 else (0, 0, 255)
                cv2.putText(annotated_image, posture_status, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
                
                # Convert overlay to base64
                _, buffer = cv2.imencode('.jpg', annotated_image)
                pose_overlay_b64 = base64.b64encode(buffer).decode('utf-8')
                response_data['pose_overlay'] = pose_overlay_b64
            
            return response_data
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return {
                'pose_detected': False,
                'landmarks': [],
                'issues': [],
                'pose_overlay': None,
                'error': str(e)
            }

# Initialize analyzer
analyzer = PostureAnalyzer()

@app.route('/api/analyze-frame', methods=['POST'])
def analyze_frame():
    """Analyze a single frame from the frontend"""
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'].split(',')[1])
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Get analysis type
        analysis_type = data.get('analysis_type', 'auto')
        
        # Process frame
        result = analyzer.process_frame(opencv_image, analysis_type)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    """Analyze an entire video file"""
    try:
        data = request.get_json()
        
        if 'frames' in data:
            # Process multiple frames
            results = []
            for frame_data in data['frames']:
                # Decode base64 image
                image_data = base64.b64decode(frame_data['image'].split(',')[1])
                image = Image.open(io.BytesIO(image_data))
                
                # Convert to OpenCV format
                opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                
                # Get analysis type
                analysis_type = data.get('analysis_type', 'auto')
                
                # Process frame
                result = analyzer.process_frame(opencv_image, analysis_type)
                result['timestamp'] = frame_data.get('timestamp', 0)
                results.append(result)
            
            # Calculate summary statistics
            total_issues = sum(len(r.get('issues', [])) for r in results)
            avg_score = sum(r.get('posture_score', 100) for r in results) / len(results) if results else 100
            
            return jsonify({
                'frame_results': results,
                'total_frames': len(results),
                'total_issues': total_issues,
                'average_score': round(avg_score),
                'summary': f'Analyzed {len(results)} frames with {total_issues} total issues detected'
            })
        else:
            # Original mock response for compatibility
            return jsonify({
                'total_frames': 100,
                'issues_summary': [
                    {'frame': 15, 'issues': [{'type': 'knee_over_toe', 'severity': 'high'}]},
                    {'frame': 32, 'issues': [{'type': 'forward_lean', 'severity': 'moderate'}]}
                ],
                'overall_score': 75
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'mediapipe': 'initialized'})

if __name__ == '__main__':
    import os
    print("Starting Posture Analysis Backend...")
    print("MediaPipe Pose initialized successfully")
    
    # Get port from environment variable (for Render deployment) or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Enable debug mode only in development
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
