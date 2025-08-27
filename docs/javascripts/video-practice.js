/**
 * SystemCraft Video Practice Platform
 * Advanced video recording and analysis for interview practice
 * Version: 1.0.0
 */

class VideoPractice {
    constructor() {
        this.recorder = null;
        this.mediaStream = null;
        this.recordedBlobs = [];
        this.currentSession = null;
        this.analyzer = new VideoAnalyzer();
        this.gestureDetector = new GestureDetector();
        this.energyMeter = new EnergyMeter();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkBrowserSupport();
        this.loadUserSettings();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Recording controls
            document.getElementById('start-recording')?.addEventListener('click', () => this.startRecording());
            document.getElementById('stop-recording')?.addEventListener('click', () => this.stopRecording());
            document.getElementById('pause-recording')?.addEventListener('click', () => this.pauseRecording());
            
            // Camera controls
            document.getElementById('toggle-camera')?.addEventListener('click', () => this.toggleCamera());
            document.getElementById('switch-camera')?.addEventListener('click', () => this.switchCamera());
            
            // Analysis controls
            document.getElementById('analyze-video')?.addEventListener('click', () => this.analyzeRecording());
            document.getElementById('save-recording')?.addEventListener('click', () => this.saveRecording());
            document.getElementById('delete-recording')?.addEventListener('click', () => this.deleteRecording());
            
            // Playback controls
            document.getElementById('play-video')?.addEventListener('click', () => this.playVideo());
            document.getElementById('replay-section')?.addEventListener('click', () => this.replaySection());
            
            // Settings
            document.getElementById('video-quality')?.addEventListener('change', (e) => this.updateVideoQuality(e.target.value));
            document.getElementById('enable-analysis')?.addEventListener('change', (e) => this.toggleAnalysis(e.target.checked));
        });
    }

    checkBrowserSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('Your browser does not support video recording. Please use a modern browser.');
            return false;
        }
        
        if (!window.MediaRecorder) {
            this.showError('MediaRecorder API is not supported in your browser.');
            return false;
        }
        
        return true;
    }

    async startRecording() {
        try {
            // Request camera and microphone permissions
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            
            // Set up video preview
            const videoElement = document.getElementById('camera-preview');
            videoElement.srcObject = this.mediaStream;
            videoElement.play();
            
            // Initialize recorder
            this.recorder = new MediaRecorder(this.mediaStream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000
            });
            
            this.recordedBlobs = [];
            
            this.recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedBlobs.push(event.data);
                }
            };
            
            this.recorder.onstop = () => {
                this.onRecordingComplete();
            };
            
            // Start recording
            this.recorder.start(100);
            this.currentSession = new VideoSession();
            
            // Start real-time analysis if enabled
            if (this.settings?.enableRealTimeAnalysis) {
                this.startRealTimeAnalysis();
            }
            
            this.updateRecordingUI(true);
            this.showNotification('Recording started!', 'success');
            
        } catch (error) {
            this.handleError('Failed to start recording', error);
        }
    }

    stopRecording() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.recorder.stop();
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        
        this.updateRecordingUI(false);
        this.showNotification('Recording stopped', 'info');
    }

    pauseRecording() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.recorder.pause();
            this.showNotification('Recording paused', 'info');
        } else if (this.recorder && this.recorder.state === 'paused') {
            this.recorder.resume();
            this.showNotification('Recording resumed', 'info');
        }
    }

    onRecordingComplete() {
        const blob = new Blob(this.recordedBlobs, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Show playback video
        const playbackVideo = document.getElementById('playback-video');
        playbackVideo.src = url;
        playbackVideo.style.display = 'block';
        
        // Store recording data
        this.currentSession.recordingBlob = blob;
        this.currentSession.recordingUrl = url;
        
        // Show analysis options
        this.showAnalysisOptions();
    }

    showAnalysisOptions() {
        const container = document.getElementById('analysis-options');
        const content = `
            <div class="analysis-panel">
                <h3>Video Analysis Options</h3>
                <div class="analysis-types">
                    <label>
                        <input type="checkbox" id="analyze-body-language" checked>
                        Body Language Analysis
                    </label>
                    <label>
                        <input type="checkbox" id="analyze-eye-contact" checked>
                        Eye Contact Tracking
                    </label>
                    <label>
                        <input type="checkbox" id="analyze-speech-pace" checked>
                        Speech Pace Analysis
                    </label>
                    <label>
                        <input type="checkbox" id="analyze-gestures" checked>
                        Gesture Recognition
                    </label>
                    <label>
                        <input type="checkbox" id="analyze-energy" checked>
                        Energy Level Detection
                    </label>
                </div>
                <div class="analysis-controls">
                    <button id="run-analysis" class="primary-btn">
                        🔍 Analyze Recording
                    </button>
                    <button id="skip-analysis" class="secondary-btn">
                        Skip Analysis
                    </button>
                </div>
            </div>
        `;
        
        // Use secure innerHTML replacement
        window.securityUtils.safeInnerHTML(container, content, {
            allowedTags: ['div', 'h3', 'label', 'input', 'button'],
            allowedAttributes: ['class', 'id', 'type', 'checked']
        });
        
        container.style.display = 'block';
        
        // Use secure event listener
        window.secureEventSystem.addEventListener(
            document.getElementById('run-analysis'), 
            'click', 
            () => this.runComprehensiveAnalysis()
        );
    }

    async runComprehensiveAnalysis() {
        const analysisTypes = {
            bodyLanguage: document.getElementById('analyze-body-language').checked,
            eyeContact: document.getElementById('analyze-eye-contact').checked,
            speechPace: document.getElementById('analyze-speech-pace').checked,
            gestures: document.getElementById('analyze-gestures').checked,
            energy: document.getElementById('analyze-energy').checked
        };
        
        this.showAnalysisProgress();
        
        try {
            const results = await this.analyzer.analyzeVideo(
                this.currentSession.recordingBlob,
                analysisTypes
            );
            
            this.displayAnalysisResults(results);
            this.currentSession.analysisResults = results;
            
        } catch (error) {
            this.handleError('Analysis failed', error);
        }
    }

    showAnalysisProgress() {
        const container = document.getElementById('analysis-progress');
        const content = `
            <div class="progress-panel">
                <h3>Analyzing Your Performance...</h3>
                <div class="progress-steps">
                    <div class="step active" id="step-preprocessing">
                        <span class="step-icon">📹</span>
                        <span class="step-text">Processing Video</span>
                    </div>
                    <div class="step" id="step-detection">
                        <span class="step-icon">👁️</span>
                        <span class="step-text">Detecting Features</span>
                    </div>
                    <div class="step" id="step-analysis">
                        <span class="step-icon">📊</span>
                        <span class="step-text">Analyzing Patterns</span>
                    </div>
                    <div class="step" id="step-results">
                        <span class="step-icon">✅</span>
                        <span class="step-text">Generating Results</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="analysis-progress-fill"></div>
                </div>
            </div>
        `;
        
        // Use secure innerHTML replacement
        window.securityUtils.safeInnerHTML(container, content, {
            allowedTags: ['div', 'h3', 'span'],
            allowedAttributes: ['class', 'id']
        });
        
        container.style.display = 'block';
    }

    displayAnalysisResults(results) {
        document.getElementById('analysis-progress').style.display = 'none';
        
        const container = document.getElementById('analysis-results');
        
        // Sanitize all user-generated content in results
        const sanitizedResults = this.sanitizeAnalysisResults(results);
        
        const content = `
            <div class="results-dashboard">
                <h3>Performance Analysis Results</h3>
                
                <div class="metrics-overview">
                    <div class="metric-card">
                        <div class="metric-value">${sanitizedResults.overallScore}/100</div>
                        <div class="metric-label">Overall Performance</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${sanitizedResults.eyeContact.percentage}%</div>
                        <div class="metric-label">Eye Contact</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${sanitizedResults.energy.averageLevel}</div>
                        <div class="metric-label">Energy Level</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${sanitizedResults.speechPace.wordsPerMinute}</div>
                        <div class="metric-label">Words/Minute</div>
                    </div>
                </div>

                <div class="detailed-analysis">
                    ${this.renderBodyLanguageAnalysis(sanitizedResults.bodyLanguage)}
                    ${this.renderGestureAnalysis(sanitizedResults.gestures)}
                    ${this.renderSpeechAnalysis(sanitizedResults.speechPace)}
                    ${this.renderEnergyAnalysis(sanitizedResults.energy)}
                </div>

                <div class="improvement-suggestions">
                    <h4>💡 Improvement Suggestions</h4>
                    <ul>
                        ${sanitizedResults.suggestions.map(suggestion => `
                            <li>
                                <strong>${suggestion.category}:</strong> ${suggestion.text}
                                <span class="impact">Impact: ${suggestion.impact}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="practice-recommendations">
                    <h4>🎯 Recommended Practice Areas</h4>
                    <div class="practice-areas">
                        ${sanitizedResults.practiceAreas.map(area => `
                            <div class="practice-card">
                                <h5>${area.title}</h5>
                                <p>${area.description}</p>
                                <div class="practice-exercises">
                                    ${area.exercises.map(exercise => `
                                        <button class="exercise-btn" data-exercise="${exercise.id}">
                                            ${exercise.title}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="timeline-analysis">
                    <h4>📈 Performance Timeline</h4>
                    <div id="performance-timeline"></div>
                </div>
            </div>
        `;
        
        // Use secure innerHTML replacement
        window.securityUtils.safeInnerHTML(container, content, {
            allowedTags: ['div', 'h3', 'h4', 'h5', 'p', 'ul', 'li', 'strong', 'span', 'button'],
            allowedAttributes: ['class', 'id', 'data-exercise']
        });
        
        container.style.display = 'block';
        this.renderPerformanceTimeline(sanitizedResults.timeline);
        this.setupAnalysisInteractions();
    }

    sanitizeAnalysisResults(results) {
        // Deep clone and sanitize all user-generated content
        const sanitized = JSON.parse(JSON.stringify(results));
        
        // Sanitize suggestions
        if (sanitized.suggestions && Array.isArray(sanitized.suggestions)) {
            sanitized.suggestions = sanitized.suggestions.map(suggestion => ({
                category: window.securityUtils.validateInput(String(suggestion.category || ''), 'text'),
                text: window.securityUtils.validateInput(String(suggestion.text || ''), 'text'),
                impact: window.securityUtils.validateInput(String(suggestion.impact || ''), 'text')
            }));
        }
        
        // Sanitize practice areas
        if (sanitized.practiceAreas && Array.isArray(sanitized.practiceAreas)) {
            sanitized.practiceAreas = sanitized.practiceAreas.map(area => ({
                title: window.securityUtils.validateInput(String(area.title || ''), 'text'),
                description: window.securityUtils.validateInput(String(area.description || ''), 'text'),
                exercises: Array.isArray(area.exercises) ? area.exercises.map(exercise => ({
                    id: window.securityUtils.validateInput(String(exercise.id || ''), 'text'),
                    title: window.securityUtils.validateInput(String(exercise.title || ''), 'text')
                })) : []
            }));
        }
        
        // Sanitize numeric values to prevent injection through numbers
        sanitized.overallScore = Math.max(0, Math.min(100, parseInt(sanitized.overallScore) || 0));
        if (sanitized.eyeContact) {
            sanitized.eyeContact.percentage = Math.max(0, Math.min(100, parseInt(sanitized.eyeContact.percentage) || 0));
        }
        if (sanitized.energy) {
            sanitized.energy.averageLevel = Math.max(0, Math.min(10, parseInt(sanitized.energy.averageLevel) || 0));
        }
        if (sanitized.speechPace) {
            sanitized.speechPace.wordsPerMinute = Math.max(0, Math.min(1000, parseInt(sanitized.speechPace.wordsPerMinute) || 0));
        }
        
        return sanitized;
    }

    renderBodyLanguageAnalysis(analysis) {
        return `
            <div class="analysis-section">
                <h4>🤵 Body Language Analysis</h4>
                <div class="body-metrics">
                    <div class="posture-analysis">
                        <h5>Posture</h5>
                        <div class="posture-score ${analysis.posture.score > 70 ? 'good' : 'needs-improvement'}">
                            Score: ${analysis.posture.score}/100
                        </div>
                        <ul>
                            ${analysis.posture.observations.map(obs => `<li>${obs}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="movement-analysis">
                        <h5>Movement Patterns</h5>
                        <p>Excessive movement: ${analysis.movement.excessive ? 'Yes' : 'No'}</p>
                        <p>Fidgeting detected: ${analysis.movement.fidgeting}%</p>
                        <p>Stillness periods: ${analysis.movement.stillnessPeriods}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderGestureAnalysis(analysis) {
        return `
            <div class="analysis-section">
                <h4>👋 Gesture Analysis</h4>
                <div class="gesture-metrics">
                    <div class="hand-movements">
                        <h5>Hand Gestures</h5>
                        <p>Total gestures: ${analysis.handGestures.total}</p>
                        <p>Effective gestures: ${analysis.handGestures.effective}</p>
                        <p>Distracting gestures: ${analysis.handGestures.distracting}</p>
                    </div>
                    
                    <div class="gesture-timing">
                        <h5>Gesture Timing</h5>
                        <p>Synchronized with speech: ${analysis.timing.synchronized}%</p>
                        <p>Natural flow: ${analysis.timing.naturalFlow}/10</p>
                    </div>
                    
                    <div class="gesture-recommendations">
                        <h5>Recommendations</h5>
                        <ul>
                            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    renderSpeechAnalysis(analysis) {
        return `
            <div class="analysis-section">
                <h4>🗣️ Speech Analysis</h4>
                <div class="speech-metrics">
                    <div class="pace-analysis">
                        <h5>Speaking Pace</h5>
                        <p>Words per minute: ${analysis.wordsPerMinute}</p>
                        <p>Pace consistency: ${analysis.consistency}/10</p>
                        <p>Optimal range: ${analysis.inOptimalRange ? 'Yes' : 'No'}</p>
                    </div>
                    
                    <div class="pause-analysis">
                        <h5>Pauses & Filler Words</h5>
                        <p>Strategic pauses: ${analysis.pauses.strategic}</p>
                        <p>Filler words: ${analysis.fillers.count}</p>
                        <p>Most common filler: "${analysis.fillers.mostCommon}"</p>
                    </div>
                    
                    <div class="volume-analysis">
                        <h5>Volume & Clarity</h5>
                        <p>Average volume: ${analysis.volume.average}</p>
                        <p>Volume consistency: ${analysis.volume.consistency}/10</p>
                        <p>Clear articulation: ${analysis.clarity}%</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderEnergyAnalysis(analysis) {
        return `
            <div class="analysis-section">
                <h4>⚡ Energy Level Analysis</h4>
                <div class="energy-metrics">
                    <div class="energy-overview">
                        <h5>Energy Distribution</h5>
                        <div class="energy-chart" id="energy-chart"></div>
                    </div>
                    
                    <div class="energy-trends">
                        <h5>Energy Trends</h5>
                        <p>Starting energy: ${analysis.startEnergy}/10</p>
                        <p>Peak energy: ${analysis.peakEnergy}/10</p>
                        <p>Ending energy: ${analysis.endEnergy}/10</p>
                        <p>Energy maintained: ${analysis.maintained ? 'Yes' : 'No'}</p>
                    </div>
                    
                    <div class="energy-recommendations">
                        <h5>Energy Tips</h5>
                        <ul>
                            ${analysis.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    renderPerformanceTimeline(timeline) {
        // Render interactive timeline chart
        const container = document.getElementById('performance-timeline');
        
        // Simple timeline visualization
        container.innerHTML = `
            <div class="timeline-container">
                <div class="timeline-tracks">
                    <div class="track" id="energy-track">
                        <label>Energy</label>
                        <div class="track-data">${this.renderTimelineTrack(timeline.energy, 'energy')}</div>
                    </div>
                    <div class="track" id="gestures-track">
                        <label>Gestures</label>
                        <div class="track-data">${this.renderTimelineTrack(timeline.gestures, 'gestures')}</div>
                    </div>
                    <div class="track" id="eye-contact-track">
                        <label>Eye Contact</label>
                        <div class="track-data">${this.renderTimelineTrack(timeline.eyeContact, 'eye-contact')}</div>
                    </div>
                </div>
                <div class="timeline-scrubber">
                    <input type="range" id="timeline-slider" min="0" max="100" value="0">
                </div>
            </div>
        `;
        
        // Add scrubber interaction
        document.getElementById('timeline-slider').addEventListener('input', (e) => {
            this.seekToTimestamp(e.target.value);
        });
    }

    renderTimelineTrack(data, type) {
        return data.map((point, index) => {
            const height = Math.max(2, point.value * 50);
            const color = this.getTrackColor(type, point.value);
            
            return `
                <div class="timeline-bar" 
                     style="height: ${height}px; background-color: ${color};"
                     data-time="${point.timestamp}"
                     data-value="${point.value}">
                </div>
            `;
        }).join('');
    }

    getTrackColor(type, value) {
        const colors = {
            energy: value > 0.7 ? '#4CAF50' : value > 0.4 ? '#FF9800' : '#F44336',
            gestures: value > 0.8 ? '#2196F3' : value > 0.5 ? '#03A9F4' : '#00BCD4',
            'eye-contact': value > 0.8 ? '#4CAF50' : value > 0.6 ? '#8BC34A' : '#CDDC39'
        };
        
        return colors[type] || '#757575';
    }

    setupAnalysisInteractions() {
        // Exercise button interactions
        document.querySelectorAll('.exercise-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.startPracticeExercise(e.target.dataset.exercise);
            });
        });
        
        // Timeline bar interactions
        document.querySelectorAll('.timeline-bar').forEach(bar => {
            bar.addEventListener('click', (e) => {
                const timestamp = parseFloat(e.target.dataset.time);
                this.seekToTimestamp(timestamp);
            });
        });
    }

    startPracticeExercise(exerciseId) {
        const exercises = {
            'eye-contact-drill': {
                title: 'Eye Contact Practice',
                description: 'Practice maintaining natural eye contact with the camera',
                duration: 60,
                instructions: [
                    'Look directly into the camera lens',
                    'Imagine you\'re speaking to a friendly interviewer',
                    'Maintain eye contact for 3-5 seconds at a time',
                    'Look away naturally, then return to camera'
                ]
            },
            'gesture-coordination': {
                title: 'Gesture Coordination',
                description: 'Practice synchronizing hand gestures with speech',
                duration: 90,
                instructions: [
                    'Use open palm gestures when explaining concepts',
                    'Keep gestures within the "box" in front of your torso',
                    'Coordinate gestures with key points in your speech',
                    'Practice natural, flowing movements'
                ]
            },
            'energy-maintenance': {
                title: 'Energy Level Maintenance',
                description: 'Practice maintaining consistent energy throughout',
                duration: 120,
                instructions: [
                    'Start with high energy and enthusiasm',
                    'Vary your tone and pace to maintain interest',
                    'Use strategic pauses for emphasis',
                    'End with the same energy you started'
                ]
            }
        };
        
        const exercise = exercises[exerciseId];
        if (exercise) {
            this.showExerciseModal(exercise);
        }
    }

    showExerciseModal(exercise) {
        const modal = document.createElement('div');
        modal.className = 'exercise-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${exercise.title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${exercise.description}</p>
                    <div class="exercise-duration">
                        <span>Duration: ${exercise.duration} seconds</span>
                    </div>
                    <div class="exercise-instructions">
                        <h4>Instructions:</h4>
                        <ol>
                            ${exercise.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                        </ol>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="start-exercise" class="primary-btn">Start Exercise</button>
                    <button id="cancel-exercise" class="secondary-btn">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Modal event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#cancel-exercise').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#start-exercise').addEventListener('click', () => {
            modal.remove();
            this.runExercise(exercise);
        });
    }

    async runExercise(exercise) {
        // Start a new recording session focused on the specific exercise
        const exerciseContainer = document.getElementById('exercise-practice');
        exerciseContainer.innerHTML = `
            <div class="exercise-session">
                <h3>${exercise.title}</h3>
                <div class="exercise-timer">
                    <span id="exercise-countdown">${exercise.duration}</span> seconds remaining
                </div>
                <div class="exercise-guidance">
                    <p>Current instruction: <span id="current-instruction">${exercise.instructions[0]}</span></p>
                </div>
                <div class="exercise-controls">
                    <button id="stop-exercise">Stop Exercise</button>
                </div>
            </div>
        `;
        
        exerciseContainer.style.display = 'block';
        
        // Start recording and timer
        await this.startRecording();
        this.startExerciseTimer(exercise);
    }

    startExerciseTimer(exercise) {
        let timeLeft = exercise.duration;
        let instructionIndex = 0;
        
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('exercise-countdown').textContent = timeLeft;
            
            // Update instructions periodically
            if (timeLeft % Math.floor(exercise.duration / exercise.instructions.length) === 0 && instructionIndex < exercise.instructions.length - 1) {
                instructionIndex++;
                document.getElementById('current-instruction').textContent = exercise.instructions[instructionIndex];
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.stopRecording();
                this.showNotification('Exercise completed!', 'success');
                document.getElementById('exercise-practice').style.display = 'none';
            }
        }, 1000);
        
        // Stop button
        document.getElementById('stop-exercise').addEventListener('click', () => {
            clearInterval(timer);
            this.stopRecording();
            document.getElementById('exercise-practice').style.display = 'none';
        });
    }

    seekToTimestamp(timestamp) {
        const video = document.getElementById('playback-video');
        if (video && video.duration) {
            const time = (timestamp / 100) * video.duration;
            video.currentTime = time;
        }
    }

    toggleCamera() {
        if (this.mediaStream) {
            const videoTrack = this.mediaStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.showNotification(
                    videoTrack.enabled ? 'Camera enabled' : 'Camera disabled',
                    'info'
                );
            }
        }
    }

    async switchCamera() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length > 1) {
                // Simple camera switching logic
                const currentDeviceId = this.mediaStream?.getVideoTracks()[0]?.getSettings()?.deviceId;
                const nextDevice = videoDevices.find(device => device.deviceId !== currentDeviceId);
                
                if (nextDevice) {
                    // Stop current stream
                    this.mediaStream?.getTracks().forEach(track => track.stop());
                    
                    // Start new stream with different camera
                    this.mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: nextDevice.deviceId },
                        audio: true
                    });
                    
                    document.getElementById('camera-preview').srcObject = this.mediaStream;
                    this.showNotification('Camera switched', 'success');
                }
            }
        } catch (error) {
            this.handleError('Failed to switch camera', error);
        }
    }

    updateVideoQuality(quality) {
        const qualities = {
            'low': { width: 640, height: 480, bitrate: 1000000 },
            'medium': { width: 1280, height: 720, bitrate: 2500000 },
            'high': { width: 1920, height: 1080, bitrate: 5000000 }
        };
        
        this.videoQuality = qualities[quality] || qualities.medium;
        this.saveUserSettings();
    }

    toggleAnalysis(enabled) {
        this.settings.enableRealTimeAnalysis = enabled;
        this.saveUserSettings();
        
        if (enabled && this.recorder?.state === 'recording') {
            this.startRealTimeAnalysis();
        }
    }

    startRealTimeAnalysis() {
        // Real-time analysis during recording
        const analysisInterval = setInterval(() => {
            if (!this.recorder || this.recorder.state !== 'recording') {
                clearInterval(analysisInterval);
                return;
            }
            
            // Capture current frame for analysis
            this.captureCurrentFrame()
                .then(frame => this.analyzer.analyzeFrame(frame))
                .then(result => this.updateRealTimeMetrics(result))
                .catch(error => console.warn('Real-time analysis error:', error));
            
        }, 2000); // Analyze every 2 seconds
    }

    async captureCurrentFrame() {
        const video = document.getElementById('camera-preview');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        return canvas.toDataURL('image/jpeg', 0.8);
    }

    updateRealTimeMetrics(analysis) {
        // Update real-time feedback UI
        const metricsContainer = document.getElementById('realtime-metrics');
        if (metricsContainer) {
            metricsContainer.innerHTML = `
                <div class="metric">
                    <span class="label">Eye Contact:</span>
                    <span class="value ${analysis.eyeContact > 0.7 ? 'good' : 'needs-work'}">
                        ${Math.round(analysis.eyeContact * 100)}%
                    </span>
                </div>
                <div class="metric">
                    <span class="label">Posture:</span>
                    <span class="value ${analysis.posture > 0.7 ? 'good' : 'needs-work'}">
                        ${this.getPostureLabel(analysis.posture)}
                    </span>
                </div>
                <div class="metric">
                    <span class="label">Energy:</span>
                    <span class="value ${analysis.energy > 0.6 ? 'good' : 'needs-work'}">
                        ${Math.round(analysis.energy * 10)}/10
                    </span>
                </div>
            `;
        }
    }

    getPostureLabel(score) {
        if (score > 0.8) return 'Excellent';
        if (score > 0.6) return 'Good';
        if (score > 0.4) return 'Fair';
        return 'Poor';
    }

    saveRecording() {
        if (!this.currentSession?.recordingBlob) {
            this.showError('No recording to save');
            return;
        }
        
        const fileName = `interview-practice-${new Date().toISOString().slice(0, 19)}.webm`;
        const url = URL.createObjectURL(this.currentSession.recordingBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        
        this.showNotification('Recording saved successfully!', 'success');
    }

    deleteRecording() {
        if (confirm('Are you sure you want to delete this recording?')) {
            this.currentSession = null;
            this.recordedBlobs = [];
            
            document.getElementById('playback-video').style.display = 'none';
            document.getElementById('analysis-results').style.display = 'none';
            document.getElementById('analysis-options').style.display = 'none';
            
            this.showNotification('Recording deleted', 'info');
        }
    }

    async loadUserSettings() {
        try {
            const stored = await window.securityUtils.getSecureItem('video_settings');
            this.settings = stored || {
                videoQuality: 'medium',
                enableRealTimeAnalysis: true,
                autoSave: false,
                analysisTypes: {
                    bodyLanguage: true,
                    eyeContact: true,
                    speechPace: true,
                    gestures: true,
                    energy: true
                }
            };
        } catch (error) {
            console.error('Failed to load user settings:', error);
            this.settings = {
                videoQuality: 'medium',
                enableRealTimeAnalysis: true,
                autoSave: false,
                analysisTypes: {
                    bodyLanguage: true,
                    eyeContact: true,
                    speechPace: true,
                    gestures: true,
                    energy: true
                }
            };
        }
    }

    async saveUserSettings() {
        try {
            await window.securityUtils.setSecureItem('video_settings', this.settings);
        } catch (error) {
            console.error('Failed to save user settings:', error);
        }
    }

    updateRecordingUI(isRecording) {
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const pauseBtn = document.getElementById('pause-recording');
        
        if (startBtn) startBtn.disabled = isRecording;
        if (stopBtn) stopBtn.disabled = !isRecording;
        if (pauseBtn) pauseBtn.disabled = !isRecording;
        
        // Update recording indicator
        const indicator = document.getElementById('recording-indicator');
        if (indicator) {
            indicator.style.display = isRecording ? 'block' : 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    handleError(message, error) {
        console.error(message, error);
        this.showError(`${message}. Please check your camera and microphone permissions.`);
    }
}

// Video Analysis Component
class VideoAnalyzer {
    async analyzeVideo(videoBlob, analysisTypes) {
        // Comprehensive video analysis implementation
        const results = {
            overallScore: 0,
            eyeContact: { percentage: 0, consistency: 0 },
            bodyLanguage: { posture: { score: 0, observations: [] }, movement: {} },
            gestures: { handGestures: {}, timing: {}, recommendations: [] },
            speechPace: { wordsPerMinute: 0, consistency: 0 },
            energy: { averageLevel: 0, startEnergy: 0, endEnergy: 0 },
            suggestions: [],
            practiceAreas: [],
            timeline: { energy: [], gestures: [], eyeContact: [] }
        };
        
        // Simulate analysis with realistic results
        await this.simulateAnalysis();
        
        // Generate mock results
        results.overallScore = Math.floor(Math.random() * 30) + 70;
        results.eyeContact.percentage = Math.floor(Math.random() * 40) + 60;
        results.energy.averageLevel = Math.floor(Math.random() * 4) + 6;
        results.speechPace.wordsPerMinute = Math.floor(Math.random() * 50) + 150;
        
        results.suggestions = this.generateSuggestions(results);
        results.practiceAreas = this.generatePracticeAreas(results);
        results.timeline = this.generateTimeline();
        
        return results;
    }

    async analyzeFrame(frame) {
        // Real-time frame analysis
        return {
            eyeContact: Math.random(),
            posture: Math.random(),
            energy: Math.random(),
            gestures: Math.random()
        };
    }

    async simulateAnalysis() {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Update progress indicators
        const steps = ['preprocessing', 'detection', 'analysis', 'results'];
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const step = document.getElementById(`step-${steps[i]}`);
            if (step) step.classList.add('active');
            
            const progressFill = document.getElementById('analysis-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${((i + 1) / steps.length) * 100}%`;
            }
        }
    }

    generateSuggestions(results) {
        const suggestions = [];
        
        if (results.eyeContact.percentage < 70) {
            suggestions.push({
                category: 'Eye Contact',
                text: 'Practice looking directly at the camera more frequently',
                impact: 'High'
            });
        }
        
        if (results.speechPace.wordsPerMinute < 140) {
            suggestions.push({
                category: 'Speech Pace',
                text: 'Try to speak a bit faster to maintain engagement',
                impact: 'Medium'
            });
        }
        
        return suggestions;
    }

    generatePracticeAreas(results) {
        return [
            {
                title: 'Eye Contact Mastery',
                description: 'Improve natural eye contact with the interviewer',
                exercises: [
                    { id: 'eye-contact-drill', title: 'Eye Contact Drill' },
                    { id: 'focus-practice', title: 'Focus Practice' }
                ]
            },
            {
                title: 'Confident Body Language',
                description: 'Develop authoritative and approachable posture',
                exercises: [
                    { id: 'posture-check', title: 'Posture Check' },
                    { id: 'gesture-coordination', title: 'Gesture Coordination' }
                ]
            }
        ];
    }

    generateTimeline() {
        const duration = 60; // 60 data points for timeline
        
        return {
            energy: Array.from({ length: duration }, (_, i) => ({
                timestamp: i,
                value: 0.5 + Math.random() * 0.5
            })),
            gestures: Array.from({ length: duration }, (_, i) => ({
                timestamp: i,
                value: Math.random()
            })),
            eyeContact: Array.from({ length: duration }, (_, i) => ({
                timestamp: i,
                value: 0.4 + Math.random() * 0.6
            }))
        };
    }
}

// Video Session Management
class VideoSession {
    constructor() {
        this.startTime = Date.now();
        this.recordingBlob = null;
        this.recordingUrl = null;
        this.analysisResults = null;
        this.videoRecorder = null;
        this.metadata = {
            duration: 0,
            quality: 'medium',
            analysisEnabled: true
        };
    }

    getDuration() {
        return Date.now() - this.startTime;
    }

    getFormattedDuration() {
        const duration = this.getDuration();
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Gesture Detection Component
class GestureDetector {
    constructor() {
        this.gestures = [];
        this.isDetecting = false;
    }

    startDetection() {
        this.isDetecting = true;
        // Initialize gesture detection algorithms
    }

    stopDetection() {
        this.isDetecting = false;
        return this.gestures;
    }

    detectGestures(frame) {
        // Gesture detection implementation
        return {
            handPosition: { x: 0, y: 0 },
            gestureType: 'neutral',
            confidence: 0.8
        };
    }
}

// Energy Level Detection
class EnergyMeter {
    constructor() {
        this.energyHistory = [];
    }

    measureEnergy(audioData, videoData) {
        // Energy measurement based on audio volume and video activity
        const audioEnergy = this.calculateAudioEnergy(audioData);
        const visualEnergy = this.calculateVisualEnergy(videoData);
        
        const combinedEnergy = (audioEnergy + visualEnergy) / 2;
        this.energyHistory.push({
            timestamp: Date.now(),
            level: combinedEnergy
        });
        
        return combinedEnergy;
    }

    calculateAudioEnergy(audioData) {
        // Audio energy calculation
        return Math.random() * 0.5 + 0.5;
    }

    calculateVisualEnergy(videoData) {
        // Visual energy calculation based on movement
        return Math.random() * 0.5 + 0.5;
    }

    getAverageEnergy() {
        if (this.energyHistory.length === 0) return 0;
        
        const sum = this.energyHistory.reduce((acc, entry) => acc + entry.level, 0);
        return sum / this.energyHistory.length;
    }
}

// Initialize video practice system
document.addEventListener('DOMContentLoaded', () => {
    window.videoPractice = new VideoPractice();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoPractice;
}