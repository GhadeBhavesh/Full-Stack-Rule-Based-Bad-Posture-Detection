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
  const [realTimeData, setRealTimeData] = useState([]);
  const [sessionReport, setSessionReport] = useState(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const videoConstraints = {
    width: 640,
    height: 480,
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
    if (realTimeAnalysis) {
      // Stopping analysis - generate session report only if we have meaningful data
      if (realTimeData.length > 3) { // Require at least 3 frames of data
        generateSessionReport();
      } else {
        // Show a brief message instead of empty report
        alert('Not enough data collected. Please run the analysis for at least 2-3 seconds to generate a meaningful report.');
        setRealTimeData([]);
        setSessionReport(null);
      }
    } else {
      // Starting analysis - clear previous data
      setRealTimeData([]);
      setSessionReport(null);
    }
    setRealTimeAnalysis(!realTimeAnalysis);
  };

  const generateSessionReport = () => {
    if (realTimeData.length === 0) {
      // Don't show report for completely empty data
      setSessionReport(null);
      return;
    }

    if (realTimeData.length < 3) {
      // Show minimal report for insufficient data
      setSessionReport({
        duration: realTimeData.length * 0.5,
        totalFrames: realTimeData.length,
        issuesDetected: 0,
        averageScore: 100,
        uniqueIssueTypes: 0,
        detailedIssues: [],
        issueBreakdown: [],
        summary: 'Insufficient data collected. Please run the analysis for at least 2-3 seconds for meaningful results.',
        recommendations: ['Run the analysis for a longer duration to get detailed insights'],
        isMinimalReport: true
      });
      return;
    }

    const totalFrames = realTimeData.length;
    const allIssues = realTimeData.flatMap(frame => frame.issues || []);
    const uniqueIssueTypes = [...new Set(allIssues.map(issue => issue.type))];
    
    // Calculate issue frequency and get detailed issue info
    const issueStats = {};
    const detailedIssues = [];
    
    allIssues.forEach((issue, index) => {
      issueStats[issue.type] = issueStats[issue.type] || { 
        count: 0, 
        severities: [], 
        recommendations: new Set(),
        descriptions: new Set(),
        avgConfidence: []
      };
      issueStats[issue.type].count++;
      issueStats[issue.type].severities.push(issue.severity);
      issueStats[issue.type].avgConfidence.push(issue.confidence || 0.8);
      
      if (issue.recommendation) {
        issueStats[issue.type].recommendations.add(issue.recommendation);
      }
      if (issue.description) {
        issueStats[issue.type].descriptions.add(issue.description);
      }

      // Add to detailed issues (limit to most recent occurrences)
      if (detailedIssues.length < 10) {
        detailedIssues.push({
          ...issue,
          frameIndex: index,
          timeOccurred: new Date(Date.now() - (totalFrames - index) * 500).toLocaleTimeString()
        });
      }
    });

    // Calculate average posture score
    const avgScore = realTimeData.reduce((sum, frame) => sum + (frame.posture_score || 100), 0) / totalFrames;

    const report = {
      duration: totalFrames * 0.5, // Assuming ~2 FPS analysis
      totalFrames,
      issuesDetected: allIssues.length,
      averageScore: Math.round(avgScore),
      uniqueIssueTypes: uniqueIssueTypes.length,
      detailedIssues: detailedIssues,
      issueBreakdown: Object.entries(issueStats).map(([type, stats]) => ({
        type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        originalType: type,
        count: stats.count,
        frequency: Math.round((stats.count / totalFrames) * 100),
        avgConfidence: Math.round((stats.avgConfidence.reduce((a, b) => a + b, 0) / stats.avgConfidence.length) * 100),
        mostCommonSeverity: stats.severities.sort((a,b) => 
          stats.severities.filter(v => v===a).length - stats.severities.filter(v => v===b).length
        ).pop(),
        recommendations: Array.from(stats.recommendations),
        descriptions: Array.from(stats.descriptions)
      })),
      summary: generateSummaryText(avgScore, allIssues.length, totalFrames),
      recommendations: generateRecommendations(issueStats),
      isMinimalReport: false
    };

    setSessionReport(report);
  };

  const generateSummaryText = (avgScore, totalIssues, totalFrames) => {
    if (avgScore >= 85) {
      return `Excellent session! You maintained good posture throughout most of the analysis.`;
    } else if (avgScore >= 70) {
      return `Good session with room for improvement. ${totalIssues} issues detected across ${totalFrames} frames.`;
    } else if (avgScore >= 50) {
      return `Several posture issues detected. Focus on the recommendations to improve your form.`;
    } else {
      return `Multiple posture concerns identified. Consider taking breaks and reviewing your posture frequently.`;
    }
  };

  const generateRecommendations = (issueStats) => {
    const recommendations = [];
    
    if (issueStats.knee_over_toe) {
      recommendations.push("Focus on keeping knees aligned over your ankles during squats");
    }
    if (issueStats.forward_head_posture) {
      recommendations.push("Pull your head back and align ears over shoulders");
    }
    if (issueStats.slouching) {
      recommendations.push("Sit up straight with shoulders back and engage your core");
    }
    if (issueStats.back_angle) {
      recommendations.push("Maintain a neutral spine and keep your chest up");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Continue maintaining good posture awareness");
    }
    
    return recommendations;
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
            {!sessionReport && (
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
            )}
            <div className="video-container">
              <div className="webcam-wrapper">
                <Webcam
                  height={480}
                  width={640}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  audio={false}
                  className="webcam-video"
                  style={{
                    width: '640px',
                    height: '480px',
                    maxWidth: '640px',
                    maxHeight: '480px'
                  }}
                />
                <EnhancedPostureVisualizer
                  webcamRef={webcamRef}
                  isAnalyzing={realTimeAnalysis}
                  analysisType={analysisType}
                  onAnalysisUpdate={(data) => {
                    setRealTimeData(prev => [...prev, { ...data, timestamp: Date.now() }]);
                  }}
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

            {/* Session Report Display */}
            {sessionReport && (
              <div className="session-report">
                <div className="report-header">
                  <h3>📊 Real-Time Analysis Report</h3>
                  <button 
                    onClick={() => setSessionReport(null)} 
                    className="close-report-btn"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="report-stats">
                  <div className="stat-card">
                    <div className="stat-number">{Math.round(sessionReport.duration)}s</div>
                    <div className="stat-label">Duration</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{sessionReport.totalFrames}</div>
                    <div className="stat-label">Frames Analyzed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{sessionReport.issuesDetected}</div>
                    <div className="stat-label">Issues Detected</div>
                  </div>
                  <div className="stat-card">
                    <div className={`stat-number ${sessionReport.averageScore >= 80 ? 'good' : sessionReport.averageScore >= 60 ? 'moderate' : 'poor'}`}>
                      {sessionReport.averageScore}
                    </div>
                    <div className="stat-label">Average Score</div>
                  </div>
                </div>

                <div className="report-summary">
                  <h4>Summary</h4>
                  <p>{sessionReport.summary}</p>
                  {sessionReport.isMinimalReport && (
                    <div className="minimal-report-notice">
                      <p>💡 <strong>Tip:</strong> For more detailed analysis, run the real-time analysis for at least 3-5 seconds to collect sufficient data.</p>
                    </div>
                  )}
                </div>

                {!sessionReport.isMinimalReport && sessionReport.issueBreakdown.length > 0 && (
                  <div className="issue-breakdown">
                    <h4>Issue Breakdown</h4>
                    <div className="breakdown-list">
                      {sessionReport.issueBreakdown.map((issue, index) => (
                        <div key={index} className={`breakdown-item ${issue.mostCommonSeverity}`}>
                          <div className="breakdown-header">
                            <span className="issue-name">{issue.type}</span>
                            <span className="issue-frequency">{issue.frequency}% of frames</span>
                          </div>
                          <div className="breakdown-details">
                            <span className="issue-count">{issue.count} occurrences</span>
                            <span className={`severity-tag ${issue.mostCommonSeverity}`}>
                              {issue.mostCommonSeverity}
                            </span>
                            <span className="confidence-tag">
                              {issue.avgConfidence}% avg confidence
                            </span>
                          </div>
                          {issue.descriptions && issue.descriptions.length > 0 && (
                            <div className="issue-description-list">
                              {issue.descriptions.map((desc, i) => (
                                <p key={i} className="issue-desc">{desc}</p>
                              ))}
                            </div>
                          )}
                          {issue.recommendations && issue.recommendations.length > 0 && (
                            <div className="breakdown-recommendations">
                              {issue.recommendations.map((rec, i) => (
                                <div key={i} className="breakdown-rec">
                                  <span className="rec-icon">💡</span>
                                  <span className="rec-text">{rec}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!sessionReport.isMinimalReport && sessionReport.detailedIssues && sessionReport.detailedIssues.length > 0 && (
                  <div className="detailed-issues-section">
                    <h4>Recent Issue Detections</h4>
                    <div className="detailed-issues-list">
                      {sessionReport.detailedIssues.slice(0, 5).map((issue, index) => (
                        <div key={index} className={`detailed-issue ${issue.severity}`}>
                          <div className="detailed-issue-header">
                            <span className={`severity-dot ${issue.severity}`}></span>
                            <span className="detailed-issue-type">
                              {issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="issue-time">{issue.timeOccurred}</span>
                          </div>
                          <p className="detailed-issue-desc">{issue.description}</p>
                          {issue.recommendation && (
                            <div className="detailed-issue-rec">
                              <span className="rec-icon">💡</span>
                              <span>{issue.recommendation}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="report-recommendations">
                  <h4>Recommendations</h4>
                  <ul>
                    {sessionReport.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
            <div className="analysis-header">
              <h3>Posture Analysis Results</h3>
              <button 
                onClick={() => setAnalysis(null)} 
                className="close-analysis-btn"
                title="Close Analysis Results"
              >
                ✕
              </button>
            </div>
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
              <div className="issues-header">
                <h4>📋 Analysis Report</h4>
                <span className="issues-count">{analysis.issues.length} Issue{analysis.issues.length !== 1 ? 's' : ''} Detected</span>
              </div>
              <div className="issues-list">
                {analysis.issues.map((issue, index) => (
                  <div key={index} className={`issue-card ${issue.severity}`}>
                    <div className="issue-main">
                      <div className="issue-left">
                        <div className="severity-indicator">
                          <span className={`severity-dot ${issue.severity}`}></span>
                          <span className={`severity-label ${issue.severity}`}>{issue.severity}</span>
                        </div>
                        <div className="issue-content">
                          <h5 className="issue-title">{issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
                          <p className="issue-description">{issue.description}</p>
                        </div>
                      </div>
                      <div className="issue-right">
                        <div className="confidence-meter">
                          <div className="confidence-label">Confidence</div>
                          <div className="confidence-value">{Math.round(issue.confidence * 100)}%</div>
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill" 
                              style={{width: `${issue.confidence * 100}%`}}
                            ></div>
                          </div>
                        </div>
                        <div className="timestamp-badge">
                          <span className="timestamp-icon">⏱️</span>
                          <span className="timestamp-text">{issue.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    {issue.recommendation && (
                      <div className="issue-recommendation">
                        <span className="recommendation-icon">💡</span>
                        <span className="recommendation-text">{issue.recommendation}</span>
                      </div>
                    )}
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
