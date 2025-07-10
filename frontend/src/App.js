import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import PostureAnalyzer from './components/PostureAnalyzer';
import EnhancedPostureVisualizer from './components/EnhancedPostureVisualizer';
import './App.css';

// API Configuration - Dynamic URL for deployment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [mode, setMode] = useState('select');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(false);
  const [analysisType, setAnalysisType] = useState('auto');
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStartCaptureClick = useCallback(() => {
    setIsRecording(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm"
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setIsRecording, mediaRecorderRef, handleDataAvailable]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, [mediaRecorderRef, setIsRecording]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "recorded-video.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
      setMode('upload');
    }
  };

  const analyzePosture = async () => {
    setIsAnalyzing(true);
    
    try {
      if (mode === 'upload' && uploadedVideo) {
        // Analyze uploaded video
        await analyzeVideoFile(uploadedVideo);
      } else if (mode === 'webcam') {
        // Analyze current webcam frame
        await analyzeWebcamFrame();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to mock data if backend is unavailable
      setAnalysis({
        issues: [{
          type: 'connection_error',
          confidence: 1.0,
          timestamp: '0:00',
          description: 'Unable to connect to analysis backend. Please ensure the backend server is running.',
          severity: 'high'
        }],
        overall: 'Analysis failed due to connection issues.',
        score: 0,
        recommendations: ['Check that the backend server is running on the configured API endpoint']
      });
      setIsAnalyzing(false);
    }
  };

  const analyzeVideoFile = async (videoUrl) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      
      const analysisResults = [];
      let frameCount = 0;
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 0;
      };
      
      video.onseeked = async () => {
        if (video.currentTime >= video.duration) {
          // Analysis complete, process results
          const finalAnalysis = processVideoAnalysisResults(analysisResults);
          setAnalysis(finalAnalysis);
          setIsAnalyzing(false);
          resolve(finalAnalysis);
          return;
        }
        
        // Draw current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        try {
          // Send frame to backend
          const response = await fetch(`${API_BASE_URL}/api/analyze-frame`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: imageData,
              analysis_type: analysisType
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.pose_detected && result.issues.length > 0) {
              analysisResults.push({
                timestamp: formatTime(video.currentTime),
                issues: result.issues,
                score: result.posture_score,
                frame: frameCount
              });
            }
          }
        } catch (error) {
          console.error('Frame analysis error:', error);
        }
        
        frameCount++;
        
        // Move to next frame (sample every 0.5 seconds)
        video.currentTime = Math.min(video.currentTime + 0.5, video.duration);
      };
      
      video.onerror = () => {
        reject(new Error('Video loading failed'));
      };
    });
  };

  const analyzeWebcamFrame = async () => {
    if (!webcamRef.current) {
      throw new Error('Webcam not available');
    }
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      throw new Error('Could not capture webcam frame');
    }
    
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
    
    if (!response.ok) {
      throw new Error('Backend analysis failed');
    }
    
    const result = await response.json();
    
    const analysis = {
      issues: result.issues || [],
      overall: result.issues.length > 0 ? 
        `Analysis complete! ${result.issues.length} posture issue(s) detected.` : 
        'Great posture! No issues detected.',
      score: result.posture_score || 100,
      recommendations: result.recommendations || []
    };
    
    setAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const processVideoAnalysisResults = (results) => {
    if (results.length === 0) {
      return {
        issues: [],
        overall: 'Video analysis complete! No posture issues detected.',
        score: 100,
        recommendations: ['Keep up the good work!']
      };
    }
    
    // Aggregate issues from all frames
    const allIssues = [];
    const issueTypes = new Set();
    let totalScore = 0;
    
    results.forEach(frameResult => {
      totalScore += frameResult.score;
      frameResult.issues.forEach(issue => {
        if (!issueTypes.has(issue.type)) {
          allIssues.push({
            ...issue,
            timestamp: frameResult.timestamp,
            firstOccurrence: frameResult.timestamp
          });
          issueTypes.add(issue.type);
        }
      });
    });
    
    const averageScore = Math.round(totalScore / results.length);
    
    // Generate overall recommendations
    const recommendations = new Set();
    allIssues.forEach(issue => {
      if (issue.type === 'knee_over_toe') {
        recommendations.add('Keep your knees aligned over your toes');
        recommendations.add('Widen your stance and engage your glutes');
      } else if (issue.type === 'forward_lean') {
        recommendations.add('Keep your chest up and maintain a neutral spine');
        recommendations.add('Engage your core muscles');
      } else if (issue.type === 'forward_head') {
        recommendations.add('Pull your head back and align it over your shoulders');
      } else if (issue.type === 'slouching') {
        recommendations.add('Sit up straight with your shoulders back');
      }
    });
    
    return {
      issues: allIssues,
      overall: `Video analysis complete! ${allIssues.length} unique issue(s) detected across ${results.length} analyzed frames.`,
      score: averageScore,
      recommendations: Array.from(recommendations)
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRealtimeAnalysis = () => {
    setRealTimeAnalysis(!realTimeAnalysis);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Posture Analysis App</h1>
        <p>Upload a video or use your webcam to analyze your posture during squats or desk work</p>
      </header>

      <main className="App-main">
        {mode === 'select' && (
          <div className="mode-selector">
            <h2>Choose an option:</h2>
            <div className="button-group">
              <button 
                className="mode-button webcam-button"
                onClick={() => setMode('webcam')}
              >
                📹 Use Webcam
              </button>
              <label className="mode-button upload-button">
                📁 Upload Video
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        )}

        {mode === 'webcam' && (
          <div className="webcam-section">
            <div className="analysis-controls">
              <h3>Choose Analysis Type:</h3>
              <div className="analysis-type-selector">
                <button 
                  className={`type-button ${analysisType === 'auto' ? 'active' : ''}`}
                  onClick={() => setAnalysisType('auto')}
                >
                  Auto Detect
                </button>
                <button 
                  className={`type-button ${analysisType === 'squat' ? 'active' : ''}`}
                  onClick={() => setAnalysisType('squat')}
                >
                  Squat Analysis
                </button>
                <button 
                  className={`type-button ${analysisType === 'sitting' ? 'active' : ''}`}
                  onClick={() => setAnalysisType('sitting')}
                >
                  Sitting Posture
                </button>
              </div>
            </div>
            <div className="video-container">
              <div style={{ position: 'relative' }}>
                <Webcam
                  height={720}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={1280}
                  videoConstraints={videoConstraints}
                  audio={true}
                />
                <EnhancedPostureVisualizer
                  webcamRef={webcamRef}
                  isAnalyzing={realTimeAnalysis}
                  analysisType={analysisType}
                />
              </div>
            </div>
            <div className="controls">
              <button 
                onClick={toggleRealtimeAnalysis} 
                className={`realtime-button ${realTimeAnalysis ? 'active' : ''}`}
              >
                {realTimeAnalysis ? '⏹️ Stop Real-time Analysis' : '🔍 Start Real-time Analysis'}
              </button>
              {!isRecording ? (
                <button onClick={handleStartCaptureClick} className="record-button">
                  ⏺️ Start Recording
                </button>
              ) : (
                <button onClick={handleStopCaptureClick} className="stop-button">
                  ⏹️ Stop Recording
                </button>
              )}
              {recordedChunks.length > 0 && (
                <button onClick={handleDownload} className="download-button">
                  💾 Download Video
                </button>
              )}
              <button onClick={analyzePosture} className="analyze-button" disabled={isAnalyzing}>
                {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze Posture'}
              </button>
              <button onClick={() => setMode('select')} className="back-button">
                ← Back
              </button>
            </div>
          </div>
        )}

        {mode === 'upload' && uploadedVideo && (
          <div className="upload-section">
            <div className="video-container">
              <video
                src={uploadedVideo}
                controls
                width="1280"
                height="720"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <div className="controls">
              <button onClick={analyzePosture} className="analyze-button" disabled={isAnalyzing}>
                {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze Posture'}
              </button>
              <button onClick={() => setMode('select')} className="back-button">
                ← Back
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <div className="analysis-results">
            <h3>Posture Analysis Results</h3>
            <div className="score-section">
              <div className="posture-score">
                <span className="score-label">Posture Score:</span>
                <span className={`score-value ${analysis.score >= 80 ? 'good' : analysis.score >= 60 ? 'moderate' : 'poor'}`}>
                  {analysis.score}/100
                </span>
              </div>
            </div>
            <div className="overall-result">
              <p>{analysis.overall}</p>
            </div>
            <div className="issues-section">
              <h4>Issues Detected:</h4>
              <div className="issues-list">
                {analysis.issues.map((issue, index) => (
                  <div key={index} className={`issue-item ${issue.type} ${issue.severity}`}>
                    <div className="issue-header">
                      <span className="issue-type">{issue.type.replace('_', ' ')}</span>
                      <span className={`severity-badge ${issue.severity}`}>{issue.severity}</span>
                    </div>
                    <p className="issue-description">{issue.description}</p>
                    <div className="issue-meta">
                      <span className="confidence">Confidence: {Math.round(issue.confidence * 100)}%</span>
                      <span className="timestamp">Time: {issue.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {analysis.recommendations && (
              <div className="recommendations-section">
                <h4>Recommendations:</h4>
                <ul className="recommendations-list">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
