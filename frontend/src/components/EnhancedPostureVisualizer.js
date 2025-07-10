import React, { useRef, useCallback, useState, useEffect } from 'react';

// API Configuration - Dynamic URL for deployment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const EnhancedPostureVisualizer = ({ webcamRef, isAnalyzing, analysisType = 'auto' }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [poseOverlay, setPoseOverlay] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
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
        setIsConnected(true);
        
        // Update pose overlay
        if (result.pose_overlay) {
          setPoseOverlay(`data:image/jpeg;base64,${result.pose_overlay}`);
        }

        // Update current analysis
        setCurrentAnalysis(result);

        // Add to history (keep last 10 analyses)
        setAnalysisHistory(prev => {
          const newHistory = [result, ...prev.slice(0, 9)];
          return newHistory;
        });

      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error analyzing frame:', error);
      setIsConnected(false);
    }
  }, [webcamRef, isAnalyzing, analysisType]);

  useEffect(() => {
    if (isAnalyzing) {
      // Analyze frames every 1000ms for better performance
      intervalRef.current = setInterval(captureAndAnalyze, 1000);
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

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'moderate': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="enhanced-posture-visualizer">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-indicator">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{isConnected ? 'Backend Connected' : 'Backend Disconnected'}</span>
        </div>
      </div>

      {/* Pose Overlay */}
      {poseOverlay && isAnalyzing && (
        <div className="pose-overlay-container">
          <img 
            src={poseOverlay} 
            alt="Pose Detection with Issues Highlighted"
            className="pose-overlay-image"
          />
        </div>
      )}

      {/* Real-time Analysis Dashboard */}
      {isAnalyzing && currentAnalysis && (
        <div className="analysis-dashboard">
          
          {/* Posture Score */}
          <div className="posture-score-card">
            <h3>Posture Score</h3>
            <div className={`score-display ${currentAnalysis.posture_score > 80 ? 'excellent' : currentAnalysis.posture_score > 60 ? 'good' : 'needs-improvement'}`}>
              {currentAnalysis.posture_score}/100
            </div>
          </div>

          {/* Current Issues */}
          {currentAnalysis.issues && currentAnalysis.issues.length > 0 && (
            <div className="current-issues">
              <h4>🚨 Current Issues</h4>
              <div className="issues-list">
                {currentAnalysis.issues.map((issue, index) => (
                  <div key={index} className={`issue-item ${issue.severity}`}>
                    <div className="issue-header">
                      <span className="severity-icon">{getSeverityIcon(issue.severity)}</span>
                      <span className="issue-type">{issue.type.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="confidence">({Math.round(issue.confidence * 100)}%)</span>
                    </div>
                    <div className="issue-description">{issue.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>💡 Recommendations</h4>
              <ul>
                {currentAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Joint Angles */}
          {currentAnalysis.joint_angles && Object.keys(currentAnalysis.joint_angles).length > 0 && (
            <div className="joint-angles">
              <h4>📐 Joint Angles</h4>
              <div className="angles-grid">
                {Object.entries(currentAnalysis.joint_angles).map(([joint, angle]) => (
                  <div key={joint} className="angle-item">
                    <span className="joint-name">{joint.replace(/_/g, ' ')}</span>
                    <span className="angle-value">{Math.round(angle)}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Good Posture Message */}
          {(!currentAnalysis.issues || currentAnalysis.issues.length === 0) && (
            <div className="good-posture-message">
              <div className="success-icon">✅</div>
              <h3>Great Posture!</h3>
              <p>Keep up the good work. Your posture looks excellent.</p>
            </div>
          )}
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <div className="analysis-history">
          <h4>📊 Recent Analysis</h4>
          <div className="history-timeline">
            {analysisHistory.slice(0, 5).map((analysis, index) => (
              <div key={index} className="history-item">
                <div className="history-score">{analysis.posture_score}</div>
                <div className="history-issues">{analysis.issues ? analysis.issues.length : 0} issues</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Controls */}
      {isAnalyzing && (
        <div className="analysis-controls">
          <div className="realtime-indicator">
            <div className="pulse-animation"></div>
            <span>Real-time Analysis Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPostureVisualizer;
