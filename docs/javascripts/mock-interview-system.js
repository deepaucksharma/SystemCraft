/**
 * SystemCraft Mock Interview System
 * Advanced AI-powered interview practice platform
 * Version: 1.0.0
 */

class MockInterviewSystem {
    constructor() {
        this.currentSession = null;
        this.userProfile = null;
        this.aiInterviewer = new AIInterviewer();
        this.scheduler = new InterviewScheduler();
        this.analytics = new InterviewAnalytics();
        this.peerMatcher = new PeerMatcher();
        this.feedbackGenerator = new FeedbackGenerator();
        
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupEventListeners();
        this.initializeUI();
        this.loadSavedSessions();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Main navigation
            document.querySelectorAll('.interview-type-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.startInterview(e.target.dataset.type));
            });

            // Session controls
            document.getElementById('pause-interview')?.addEventListener('click', () => this.pauseSession());
            document.getElementById('end-interview')?.addEventListener('click', () => this.endSession());
            document.getElementById('get-hint')?.addEventListener('click', () => this.getHint());
            
            // Peer matching
            document.getElementById('find-peer')?.addEventListener('click', () => this.findPeerPartner());
            document.getElementById('schedule-interview')?.addEventListener('click', () => this.scheduleInterview());
        });
    }

    async startInterview(type) {
        try {
            const config = this.getInterviewConfig(type);
            this.currentSession = new InterviewSession(config);
            
            await this.currentSession.initialize();
            this.showInterviewInterface(type);
            
            if (type === 'ai') {
                await this.aiInterviewer.startSession(this.currentSession);
            } else if (type === 'peer') {
                await this.peerMatcher.connectToPeer(this.currentSession);
            }
            
            this.analytics.trackSessionStart(type);
            
        } catch (error) {
            this.handleError('Failed to start interview', error);
        }
    }

    getInterviewConfig(type) {
        const configs = {
            behavioral: {
                duration: 45,
                questionTypes: ['leadership_principles', 'situational', 'experience'],
                difficulty: this.userProfile?.level || 'intermediate',
                focusAreas: this.userProfile?.weaknesses || []
            },
            technical: {
                duration: 60,
                questionTypes: ['coding', 'algorithms', 'system_design'],
                difficulty: this.userProfile?.technicalLevel || 'intermediate',
                languages: this.userProfile?.preferredLanguages || ['javascript', 'python']
            },
            system_design: {
                duration: 90,
                questionTypes: ['architecture', 'scalability', 'trade_offs'],
                difficulty: this.userProfile?.level || 'senior',
                whiteboard: true
            },
            phone_screen: {
                duration: 30,
                questionTypes: ['behavioral', 'technical_basic'],
                difficulty: 'entry',
                recording: false
            },
            bar_raiser: {
                duration: 60,
                questionTypes: ['deep_dive', 'leadership', 'technical_depth'],
                difficulty: 'expert',
                strictScoring: true
            }
        };
        
        return configs[type] || configs.behavioral;
    }

    showInterviewInterface(type) {
        document.getElementById('interview-setup').style.display = 'none';
        document.getElementById('interview-active').style.display = 'block';
        
        // Configure interface based on type
        if (type === 'system_design') {
            document.getElementById('whiteboard-container').style.display = 'block';
            this.initializeWhiteboard();
        }
        
        if (type === 'technical') {
            document.getElementById('code-editor-container').style.display = 'block';
            this.initializeCodeEditor();
        }
        
        this.startTimer();
        this.enableVideoRecording();
    }

    async pauseSession() {
        if (this.currentSession) {
            await this.currentSession.pause();
            this.analytics.trackSessionPause();
        }
    }

    async endSession() {
        if (this.currentSession) {
            const feedback = await this.feedbackGenerator.generateFeedback(this.currentSession);
            await this.currentSession.end();
            
            this.showFeedbackInterface(feedback);
            this.analytics.trackSessionComplete(this.currentSession);
            this.currentSession = null;
        }
    }

    showFeedbackInterface(feedback) {
        document.getElementById('interview-active').style.display = 'none';
        document.getElementById('feedback-interface').style.display = 'block';
        
        this.renderFeedback(feedback);
    }

    renderFeedback(feedback) {
        const container = document.getElementById('feedback-content');
        container.innerHTML = `
            <div class="feedback-summary">
                <h3>Interview Performance Summary</h3>
                <div class="score-breakdown">
                    <div class="score-item">
                        <span class="score-label">Overall Score</span>
                        <span class="score-value">${feedback.overallScore}/100</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Technical Skills</span>
                        <span class="score-value">${feedback.technicalScore}/100</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Communication</span>
                        <span class="score-value">${feedback.communicationScore}/100</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Leadership Principles</span>
                        <span class="score-value">${feedback.leadershipScore}/100</span>
                    </div>
                </div>
            </div>
            
            <div class="feedback-sections">
                <div class="strengths-section">
                    <h4>Strengths</h4>
                    <ul>
                        ${feedback.strengths.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="improvements-section">
                    <h4>Areas for Improvement</h4>
                    <ul>
                        ${feedback.improvements.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="action-plan-section">
                    <h4>Recommended Action Plan</h4>
                    <div class="action-items">
                        ${feedback.actionPlan.map(item => `
                            <div class="action-item">
                                <h5>${item.title}</h5>
                                <p>${item.description}</p>
                                <span class="timeline">Timeline: ${item.timeline}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="practice-recommendations">
                    <h4>Next Practice Sessions</h4>
                    <div class="recommendations">
                        ${feedback.nextSessions.map(session => `
                            <button class="recommendation-btn" data-type="${session.type}">
                                ${session.title}
                                <span class="difficulty">${session.difficulty}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    async getHint() {
        if (this.currentSession && this.currentSession.currentQuestion) {
            const hint = await this.aiInterviewer.generateHint(
                this.currentSession.currentQuestion,
                this.currentSession.userResponse
            );
            
            this.showHint(hint);
            this.analytics.trackHintUsage();
        }
    }

    showHint(hint) {
        const hintContainer = document.getElementById('hint-container');
        hintContainer.innerHTML = `
            <div class="hint-bubble">
                <p><strong>💡 Hint:</strong> ${hint.content}</p>
                ${hint.example ? `<p><strong>Example:</strong> ${hint.example}</p>` : ''}
            </div>
        `;
        hintContainer.style.display = 'block';
        
        setTimeout(() => {
            hintContainer.style.display = 'none';
        }, 10000);
    }

    initializeWhiteboard() {
        // Initialize drawing canvas for system design interviews
        const canvas = document.getElementById('whiteboard-canvas');
        const whiteboard = new SystemDesignWhiteboard(canvas);
        
        if (this.currentSession) {
            this.currentSession.whiteboard = whiteboard;
        }
    }

    initializeCodeEditor() {
        // Initialize collaborative code editor
        const editor = document.getElementById('code-editor');
        const codeEditor = new CollaborativeCodeEditor(editor);
        
        if (this.currentSession) {
            this.currentSession.codeEditor = codeEditor;
        }
    }

    startTimer() {
        if (this.currentSession) {
            this.currentSession.startTimer();
            this.updateTimerDisplay();
        }
    }

    updateTimerDisplay() {
        const timer = setInterval(() => {
            if (!this.currentSession || !this.currentSession.isActive) {
                clearInterval(timer);
                return;
            }
            
            const elapsed = this.currentSession.getElapsedTime();
            const remaining = this.currentSession.getRemainingTime();
            
            document.getElementById('timer-elapsed').textContent = this.formatTime(elapsed);
            document.getElementById('timer-remaining').textContent = this.formatTime(remaining);
            
            if (remaining <= 300) { // 5 minutes warning
                document.getElementById('timer-remaining').classList.add('warning');
            }
        }, 1000);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    enableVideoRecording() {
        if (this.userProfile?.preferences?.recordSessions) {
            const recorder = new VideoRecorder();
            recorder.startRecording();
            
            if (this.currentSession) {
                this.currentSession.videoRecorder = recorder;
            }
        }
    }

    async findPeerPartner() {
        try {
            const matches = await this.peerMatcher.findMatches({
                level: this.userProfile.level,
                timezone: this.userProfile.timezone,
                availability: this.userProfile.availability,
                practiceGoals: this.userProfile.practiceGoals
            });
            
            this.showPeerMatches(matches);
        } catch (error) {
            this.handleError('Failed to find peer partners', error);
        }
    }

    showPeerMatches(matches) {
        const container = document.getElementById('peer-matches');
        container.innerHTML = `
            <div class="peer-matches-list">
                ${matches.map(match => `
                    <div class="peer-match-card">
                        <div class="peer-info">
                            <h4>${match.displayName}</h4>
                            <p>Level: ${match.level}</p>
                            <p>Timezone: ${match.timezone}</p>
                            <p>Match Score: ${match.matchScore}%</p>
                        </div>
                        <div class="peer-actions">
                            <button class="connect-btn" data-peer-id="${match.id}">
                                Connect
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.querySelectorAll('.connect-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.connectToPeer(e.target.dataset.peeId);
            });
        });
    }

    async connectToPeer(peerId) {
        try {
            await this.peerMatcher.sendConnectionRequest(peerId);
            this.showNotification('Connection request sent!');
        } catch (error) {
            this.handleError('Failed to connect to peer', error);
        }
    }

    scheduleInterview() {
        const modal = document.getElementById('schedule-modal');
        modal.style.display = 'block';
        
        this.scheduler.renderCalendar(document.getElementById('calendar-container'));
    }

    loadUserProfile() {
        const stored = localStorage.getItem('systemcraft_user_profile');
        if (stored) {
            this.userProfile = JSON.parse(stored);
        } else {
            this.userProfile = this.createDefaultProfile();
        }
    }

    createDefaultProfile() {
        return {
            level: 'intermediate',
            technicalLevel: 'intermediate',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferences: {
                recordSessions: true,
                allowPeerMatching: true,
                difficulty: 'adaptive'
            },
            practiceGoals: ['behavioral', 'technical'],
            weaknesses: [],
            strengths: []
        };
    }

    loadSavedSessions() {
        const sessions = localStorage.getItem('systemcraft_interview_sessions');
        if (sessions) {
            this.analytics.loadHistoricalData(JSON.parse(sessions));
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

    handleError(message, error) {
        console.error(message, error);
        this.showNotification(`${message}. Please try again.`, 'error');
    }
}

// AI Interviewer Component
class AIInterviewer {
    constructor() {
        this.questionBank = new QuestionBank();
        this.responseAnalyzer = new ResponseAnalyzer();
        this.conversationHistory = [];
    }

    async startSession(session) {
        const firstQuestion = await this.questionBank.getQuestion({
            type: session.config.questionTypes[0],
            difficulty: session.config.difficulty,
            userProfile: session.userProfile
        });
        
        await this.askQuestion(firstQuestion);
    }

    async askQuestion(question) {
        this.conversationHistory.push({
            type: 'question',
            content: question,
            timestamp: Date.now()
        });
        
        this.displayQuestion(question);
        this.waitForResponse();
    }

    displayQuestion(question) {
        const container = document.getElementById('interviewer-question');
        container.innerHTML = `
            <div class="question-container">
                <div class="interviewer-avatar">
                    <img src="/assets/images/ai-interviewer.png" alt="AI Interviewer">
                </div>
                <div class="question-bubble">
                    <p>${question.text}</p>
                    ${question.context ? `<small>Context: ${question.context}</small>` : ''}
                </div>
            </div>
        `;
        
        // Text-to-speech for audio mode
        if (question.audioEnabled) {
            this.speakQuestion(question.text);
        }
    }

    waitForResponse() {
        const responseArea = document.getElementById('user-response');
        responseArea.style.display = 'block';
        responseArea.focus();
        
        // Set up speech recognition if enabled
        if ('webkitSpeechRecognition' in window) {
            this.setupSpeechRecognition();
        }
    }

    setupSpeechRecognition() {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            document.getElementById('user-response').value = finalTranscript;
            document.getElementById('interim-transcript').textContent = interimTranscript;
        };
        
        document.getElementById('voice-input-btn').addEventListener('click', () => {
            recognition.start();
        });
    }

    async processResponse(response) {
        this.conversationHistory.push({
            type: 'response',
            content: response,
            timestamp: Date.now()
        });
        
        const analysis = await this.responseAnalyzer.analyze(response);
        const followUp = await this.generateFollowUp(response, analysis);
        
        if (followUp) {
            await this.askQuestion(followUp);
        } else {
            await this.moveToNextQuestion();
        }
    }

    async generateFollowUp(response, analysis) {
        // Generate follow-up questions based on response quality
        if (analysis.needsClarification) {
            return {
                text: `Can you elaborate on ${analysis.clarificationTopic}?`,
                type: 'clarification'
            };
        }
        
        if (analysis.hasGaps) {
            return {
                text: analysis.gapQuestion,
                type: 'gap_filling'
            };
        }
        
        return null;
    }

    async generateHint(question, userResponse) {
        // Generate contextual hints based on the question and user's attempt
        return {
            content: "Try using the STAR method: Situation, Task, Action, Result",
            example: "Start by describing the specific situation you faced..."
        };
    }

    speakQuestion(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    }
}

// Question Bank Component
class QuestionBank {
    constructor() {
        this.questions = {
            behavioral: {
                leadership_principles: [
                    {
                        text: "Tell me about a time when you had to make a difficult decision with incomplete information.",
                        principle: "Bias for Action",
                        difficulty: "intermediate",
                        followUps: [
                            "What information did you wish you had?",
                            "How did you mitigate the risks?",
                            "What was the outcome?"
                        ]
                    },
                    {
                        text: "Describe a situation where you had to influence someone without direct authority.",
                        principle: "Earn Trust",
                        difficulty: "advanced",
                        followUps: [
                            "What was their initial position?",
                            "How did you build credibility?",
                            "What was the long-term impact?"
                        ]
                    }
                ],
                situational: [
                    {
                        text: "How would you handle a situation where a team member consistently misses deadlines?",
                        category: "team_management",
                        difficulty: "intermediate"
                    }
                ]
            },
            technical: {
                coding: [
                    {
                        text: "Given an array of integers, find two numbers that add up to a target sum.",
                        difficulty: "easy",
                        constraints: ["O(n) time complexity", "Cannot use same element twice"],
                        hints: ["Consider using a hash table", "Think about what you need to look up"]
                    }
                ],
                system_design: [
                    {
                        text: "Design a URL shortener like bit.ly",
                        difficulty: "intermediate",
                        requirements: ["Handle 100M URLs per day", "URL expiration", "Analytics"],
                        components: ["Load balancer", "Database", "Cache", "Analytics service"]
                    }
                ]
            }
        };
    }

    async getQuestion(criteria) {
        const category = this.questions[criteria.type];
        if (!category) return null;
        
        const subcategory = category[criteria.subtype] || Object.values(category)[0];
        const filtered = subcategory.filter(q => 
            q.difficulty === criteria.difficulty || criteria.difficulty === 'adaptive'
        );
        
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
}

// Response Analyzer Component
class ResponseAnalyzer {
    async analyze(response) {
        return {
            wordCount: response.split(' ').length,
            starFormat: this.checkStarFormat(response),
            leadershipPrinciples: this.detectLeadershipPrinciples(response),
            technicalAccuracy: this.assessTechnicalAccuracy(response),
            needsClarification: this.needsClarification(response),
            hasGaps: this.hasGaps(response),
            confidence: this.assessConfidence(response)
        };
    }

    checkStarFormat(response) {
        const starKeywords = {
            situation: ['situation', 'context', 'background', 'when', 'where'],
            task: ['task', 'goal', 'objective', 'needed to', 'responsible for'],
            action: ['action', 'did', 'implemented', 'decided', 'approached'],
            result: ['result', 'outcome', 'achieved', 'impact', 'learned']
        };
        
        const analysis = {};
        Object.keys(starKeywords).forEach(component => {
            analysis[component] = starKeywords[component].some(keyword =>
                response.toLowerCase().includes(keyword)
            );
        });
        
        return analysis;
    }

    detectLeadershipPrinciples(response) {
        const principles = {
            'Customer Obsession': ['customer', 'user', 'client', 'stakeholder'],
            'Ownership': ['ownership', 'responsible', 'accountable', 'owned'],
            'Invent and Simplify': ['innovative', 'simple', 'creative', 'invented'],
            'Are Right, A Lot': ['analysis', 'data-driven', 'evidence', 'research'],
            'Learn and Be Curious': ['learned', 'curious', 'research', 'studied'],
            'Hire and Develop the Best': ['mentored', 'coached', 'developed', 'hired'],
            'Insist on the Highest Standards': ['quality', 'standards', 'excellence', 'best practices'],
            'Think Big': ['vision', 'strategic', 'long-term', 'scale'],
            'Bias for Action': ['action', 'quickly', 'decided', 'moved fast'],
            'Frugality': ['cost', 'efficient', 'resourceful', 'budget'],
            'Earn Trust': ['trust', 'transparent', 'honest', 'reliable'],
            'Dive Deep': ['details', 'root cause', 'investigated', 'analyzed'],
            'Have Backbone; Disagree and Commit': ['disagreed', 'challenged', 'committed', 'conviction'],
            'Deliver Results': ['delivered', 'results', 'achieved', 'completed'],
            'Strive to be Earth\'s Best Employer': ['team', 'inclusive', 'diverse', 'growth'],
            'Success and Scale Bring Broad Responsibility': ['responsibility', 'impact', 'community', 'society']
        };
        
        const detected = [];
        Object.entries(principles).forEach(([principle, keywords]) => {
            const score = keywords.filter(keyword =>
                response.toLowerCase().includes(keyword)
            ).length;
            
            if (score > 0) {
                detected.push({ principle, score });
            }
        });
        
        return detected.sort((a, b) => b.score - a.score);
    }

    assessTechnicalAccuracy(response) {
        // Basic technical accuracy assessment
        const technicalTerms = ['algorithm', 'complexity', 'data structure', 'optimization'];
        const hasTerms = technicalTerms.some(term =>
            response.toLowerCase().includes(term)
        );
        
        return {
            usesTechnicalTerms: hasTerms,
            explainsConcepts: response.length > 200,
            providesExamples: response.includes('example') || response.includes('for instance')
        };
    }

    needsClarification(response) {
        return response.length < 50 || 
               response.split(' ').length < 20 ||
               !response.includes('.');
    }

    hasGaps(response) {
        const starComponents = this.checkStarFormat(response);
        const missingComponents = Object.entries(starComponents)
            .filter(([_, present]) => !present)
            .map(([component, _]) => component);
        
        return missingComponents.length > 0;
    }

    assessConfidence(response) {
        const uncertainWords = ['maybe', 'probably', 'i think', 'not sure', 'perhaps'];
        const uncertainCount = uncertainWords.filter(word =>
            response.toLowerCase().includes(word)
        ).length;
        
        return Math.max(0, 100 - (uncertainCount * 20));
    }
}

// Feedback Generator Component
class FeedbackGenerator {
    async generateFeedback(session) {
        const responses = session.responses || [];
        const analysis = await this.analyzeSession(session);
        
        return {
            overallScore: this.calculateOverallScore(analysis),
            technicalScore: this.calculateTechnicalScore(analysis),
            communicationScore: this.calculateCommunicationScore(analysis),
            leadershipScore: this.calculateLeadershipScore(analysis),
            strengths: this.identifyStrengths(analysis),
            improvements: this.identifyImprovements(analysis),
            actionPlan: this.generateActionPlan(analysis),
            nextSessions: this.recommendNextSessions(analysis)
        };
    }

    async analyzeSession(session) {
        // Comprehensive session analysis
        return {
            responseCount: session.responses?.length || 0,
            averageResponseLength: this.calculateAverageResponseLength(session.responses),
            starFormatUsage: this.analyzeStarUsage(session.responses),
            leadershipPrincipleCoverage: this.analyzeLeadershipCoverage(session.responses),
            technicalDepth: this.analyzeTechnicalDepth(session.responses),
            communicationClarity: this.analyzeCommunication(session.responses)
        };
    }

    calculateOverallScore(analysis) {
        const weights = {
            responseQuality: 0.3,
            starFormat: 0.2,
            leadershipPrinciples: 0.2,
            technicalDepth: 0.15,
            communication: 0.15
        };
        
        let score = 0;
        score += analysis.averageResponseLength > 100 ? weights.responseQuality * 100 : weights.responseQuality * 50;
        score += analysis.starFormatUsage > 0.7 ? weights.starFormat * 100 : weights.starFormat * 60;
        score += analysis.leadershipPrincipleCoverage > 3 ? weights.leadershipPrinciples * 100 : weights.leadershipPrinciples * 70;
        score += analysis.technicalDepth > 0.6 ? weights.technicalDepth * 100 : weights.technicalDepth * 60;
        score += analysis.communicationClarity > 0.8 ? weights.communication * 100 : weights.communication * 70;
        
        return Math.round(score);
    }

    generateActionPlan(analysis) {
        const plan = [];
        
        if (analysis.starFormatUsage < 0.6) {
            plan.push({
                title: "Master the STAR Method",
                description: "Practice structuring your responses using Situation, Task, Action, Result framework",
                timeline: "1-2 weeks"
            });
        }
        
        if (analysis.leadershipPrincipleCoverage < 3) {
            plan.push({
                title: "Strengthen Leadership Stories",
                description: "Develop examples that demonstrate multiple Amazon Leadership Principles",
                timeline: "2-3 weeks"
            });
        }
        
        return plan;
    }

    recommendNextSessions(analysis) {
        const recommendations = [];
        
        if (analysis.starFormatUsage < 0.7) {
            recommendations.push({
                type: 'behavioral',
                title: 'STAR Method Practice',
                difficulty: 'focused'
            });
        }
        
        if (analysis.technicalDepth < 0.6) {
            recommendations.push({
                type: 'technical',
                title: 'Deep Technical Dive',
                difficulty: 'intermediate'
            });
        }
        
        return recommendations;
    }

    calculateAverageResponseLength(responses) {
        if (!responses || responses.length === 0) return 0;
        
        const totalLength = responses.reduce((sum, response) =>
            sum + (response.content?.length || 0), 0
        );
        
        return totalLength / responses.length;
    }

    analyzeStarUsage(responses) {
        if (!responses || responses.length === 0) return 0;
        
        let starCount = 0;
        responses.forEach(response => {
            const starKeywords = ['situation', 'task', 'action', 'result'];
            const hasAllComponents = starKeywords.every(keyword =>
                response.content?.toLowerCase().includes(keyword)
            );
            if (hasAllComponents) starCount++;
        });
        
        return starCount / responses.length;
    }

    identifyStrengths(analysis) {
        const strengths = [];
        
        if (analysis.starFormatUsage > 0.8) {
            strengths.push("Excellent use of STAR method in responses");
        }
        
        if (analysis.leadershipPrincipleCoverage > 4) {
            strengths.push("Strong demonstration of multiple Leadership Principles");
        }
        
        if (analysis.communicationClarity > 0.8) {
            strengths.push("Clear and articulate communication style");
        }
        
        return strengths.length > 0 ? strengths : ["Shows strong interview preparation"];
    }

    identifyImprovements(analysis) {
        const improvements = [];
        
        if (analysis.starFormatUsage < 0.6) {
            improvements.push("Improve response structure using STAR method");
        }
        
        if (analysis.averageResponseLength < 80) {
            improvements.push("Provide more detailed and comprehensive responses");
        }
        
        if (analysis.leadershipPrincipleCoverage < 2) {
            improvements.push("Better connect examples to Amazon Leadership Principles");
        }
        
        return improvements;
    }
}

// Initialize the mock interview system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mockInterviewSystem = new MockInterviewSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockInterviewSystem;
}