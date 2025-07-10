import React, { useRef, useCallback, useState, useEffect } from 'react';

// API Configuration - Dynamic URL for deployment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const RealTimePoseAnalyzer = ({ webcamRef, isAnalyzing, onAnalysisUpdate, analysisType = 'auto' }) => {
  const [currentIssues, setCurrentIssues] = useState([]);
  const [poseOverlay, setPoseOverlay] = useState(null);
  const intervalRef = useRef(null);

  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current || !isAnalyzing) return;

    try {
      // Capture frame from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Send frame to backend for analysis
      const response = await fetch(`${API_BASE_URL}/api/analyze-frame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageSrc,
          analysis_type: analysisType
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update pose overlay
        if (result.pose_overlay) {
          setPoseOverlay(`data:image/jpeg;base64,${result.pose_overlay}`);
        }

        // Update current issues
        setCurrentIssues(result.issues || []);

        // Notify parent component
        if (onAnalysisUpdate) {
          onAnalysisUpdate(result);
        }
      }
    } catch (error) {
      console.error('Error analyzing frame:', error);
    }
  }, [webcamRef, isAnalyzing, analysisType, onAnalysisUpdate]);

  useEffect(() => {
    if (isAnalyzing) {
      // Analyze frames every 500ms for real-time feedback
      intervalRef.current = setInterval(captureAndAnalyze, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnalyzing, captureAndAnalyze]);

  return (
    <div className="real-time-analyzer">
      {/* Pose Overlay */}
      {poseOverlay && (
        <div className="pose-overlay">
          <img 
            src={poseOverlay} 
            alt="Pose Detection"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.7,
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        </div>
      )}

      {/* Real-time Issues Display */}
      {isAnalyzing && currentIssues.length > 0 && (
        <div className="real-time-issues">
          <div className="alert-banner">
            <h4>⚠️ Posture Issues Detected</h4>
            {currentIssues.map((issue, index) => (
              <div key={index} className={`real-time-issue ${issue.severity}`}>
                <span className="issue-type">{issue.type.replace('_', ' ')}</span>
                <span className="issue-description">{issue.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="analysis-status">
          <div className="status-indicator">
            <div className="pulse-dot"></div>
            <span>Real-time Analysis Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimePoseAnalyzer;
