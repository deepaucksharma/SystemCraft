/**
 * Onboarding Wizard - Enhanced UX for New Users
 * Implements 2025 UX best practices with progressive disclosure and personalization
 * Reduces time-to-value and cognitive load for new users
 */

class OnboardingWizard {
    constructor() {
        this.currentStep = 0;
        this.userProfile = {
            experience: null,
            goals: [],
            timeCommitment: null,
            learningStyle: null,
            interests: [],
            preferredPath: null
        };
        this.steps = this.initializeSteps();
        this.totalSteps = this.steps.length;
        this.completedActions = new Set();
        this.startTime = Date.now();
        
        this.init();
    }

    initializeSteps() {
        return [
            {
                id: 'welcome',
                title: 'Welcome to SystemCraft!',
                subtitle: 'Your journey to tech mastery starts here',
                type: 'intro',
                duration: 30,
                component: this.renderWelcomeStep.bind(this)
            },
            {
                id: 'experience_assessment',
                title: 'Let\'s understand your background',
                subtitle: 'This helps us personalize your experience',
                type: 'assessment',
                duration: 45,
                component: this.renderExperienceStep.bind(this)
            },
            {
                id: 'goal_selection',
                title: 'What are you aiming for?',
                subtitle: 'Choose your primary objectives',
                type: 'goals',
                duration: 60,
                component: this.renderGoalStep.bind(this)
            },
            {
                id: 'learning_preferences',
                title: 'How do you learn best?',
                subtitle: 'We\'ll adapt content to your style',
                type: 'preferences',
                duration: 45,
                component: this.renderLearningPreferencesStep.bind(this)
            },
            {
                id: 'time_commitment',
                title: 'How much time can you dedicate?',
                subtitle: 'We\'ll create a realistic plan',
                type: 'scheduling',
                duration: 30,
                component: this.renderTimeCommitmentStep.bind(this)
            },
            {
                id: 'quick_start',
                title: 'Perfect! Let\'s get you started',
                subtitle: 'Your personalized learning path is ready',
                type: 'action',
                duration: 60,
                component: this.renderQuickStartStep.bind(this)
            }
        ];
    }

    init() {
        this.createOverlay();
        this.bindEvents();
        this.startOnboarding();
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.className = 'onboarding-overlay';
        overlay.innerHTML = `
            <div class="onboarding-container">
                <div class="onboarding-header">
                    <div class="onboarding-progress">
                        <div class="progress-track">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="progress-label">Step 1 of ${this.totalSteps}</div>
                    </div>
                    <button class="onboarding-skip" title="Skip onboarding">
                        <span class="skip-text">Skip</span>
                        <span class="skip-icon">→</span>
                    </button>
                </div>
                
                <div class="onboarding-content">
                    <div class="step-indicator">
                        <div class="step-timer">
                            <svg class="timer-circle" width="60" height="60">
                                <circle cx="30" cy="30" r="25" stroke-width="4" stroke="#e5e7eb" fill="none"/>
                                <circle cx="30" cy="30" r="25" stroke-width="4" stroke="#ff9800" fill="none" 
                                        stroke-dasharray="157" stroke-dashoffset="157" class="timer-progress"/>
                            </svg>
                            <span class="timer-text">30s</span>
                        </div>
                    </div>
                    
                    <div class="step-content" id="step-content">
                        <!-- Dynamic content will be inserted here -->
                    </div>
                </div>
                
                <div class="onboarding-footer">
                    <button class="btn-secondary" id="prev-step" style="display: none;">
                        ← Previous
                    </button>
                    <div class="step-dots">
                        ${this.steps.map((_, index) => 
                            `<div class="step-dot ${index === 0 ? 'active' : ''}" data-step="${index}"></div>`
                        ).join('')}
                    </div>
                    <button class="btn-primary" id="next-step">
                        Get Started
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    bindEvents() {
        document.getElementById('next-step').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-step').addEventListener('click', () => this.previousStep());
        document.querySelector('.onboarding-skip').addEventListener('click', () => this.skipOnboarding());
        
        // Step dot navigation
        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToStep(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('onboarding-overlay')) {
                if (e.key === 'Enter') this.nextStep();
                if (e.key === 'Escape') this.skipOnboarding();
                if (e.key === 'ArrowLeft') this.previousStep();
                if (e.key === 'ArrowRight') this.nextStep();
            }
        });

        // Analytics tracking
        this.trackUserInteraction('onboarding_started', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    }

    startOnboarding() {
        // Check if user has already completed onboarding
        const hasCompletedOnboarding = localStorage.getItem('systemcraft_onboarding_completed');
        const lastOnboardingVersion = localStorage.getItem('systemcraft_onboarding_version');
        const currentVersion = '2025.1';

        if (hasCompletedOnboarding && lastOnboardingVersion === currentVersion) {
            this.showQuickTips();
            return;
        }

        document.getElementById('onboarding-overlay').style.display = 'flex';
        this.renderCurrentStep();
        this.startStepTimer();
        
        // Animate in
        requestAnimationFrame(() => {
            document.getElementById('onboarding-overlay').classList.add('active');
        });
    }

    renderCurrentStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;

        // Update progress
        this.updateProgress();
        
        // Update timer
        this.updateStepTimer(step.duration);
        
        // Render step content
        const content = step.component();
        document.getElementById('step-content').innerHTML = content;
        
        // Update navigation
        this.updateNavigation();
        
        // Add step-specific event listeners
        this.bindStepEvents(step);
        
        // Analytics
        this.trackUserInteraction('step_viewed', {
            step: step.id,
            stepIndex: this.currentStep
        });
    }

    renderWelcomeStep() {
        return `
            <div class="welcome-step">
                <div class="welcome-animation">
                    <div class="floating-icons">
                        <div class="icon-item" style="animation-delay: 0s;">💻</div>
                        <div class="icon-item" style="animation-delay: 0.3s;">🚀</div>
                        <div class="icon-item" style="animation-delay: 0.6s;">🎯</div>
                        <div class="icon-item" style="animation-delay: 0.9s;">✨</div>
                    </div>
                </div>
                
                <div class="welcome-content">
                    <h1>Welcome to SystemCraft!</h1>
                    <p class="welcome-subtitle">Your comprehensive guide to mastering technical interviews and system design</p>
                    
                    <div class="feature-highlights">
                        <div class="highlight-item">
                            <div class="highlight-icon">📚</div>
                            <h3>Comprehensive Content</h3>
                            <p>100k+ words of curated content covering everything from basics to advanced topics</p>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-icon">🎮</div>
                            <h3>Interactive Learning</h3>
                            <p>Gamified experience with progress tracking and achievement unlocking</p>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-icon">🎯</div>
                            <h3>Personalized Path</h3>
                            <p>AI-driven recommendations based on your goals and learning style</p>
                        </div>
                    </div>
                    
                    <div class="quick-stats">
                        <div class="stat-item">
                            <span class="stat-number">5min</span>
                            <span class="stat-label">Quick Setup</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">∞</span>
                            <span class="stat-label">Practice Problems</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">24/7</span>
                            <span class="stat-label">Available</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderExperienceStep() {
        return `
            <div class="experience-step">
                <h2>What's your current experience level?</h2>
                <p class="step-description">This helps us recommend the right starting point and difficulty level.</p>
                
                <div class="experience-options">
                    <div class="experience-card" data-experience="beginner">
                        <div class="card-icon">🌱</div>
                        <h3>New to Tech</h3>
                        <p>Just starting my journey in technology and programming</p>
                        <div class="card-features">
                            <span class="feature-tag">Fundamentals</span>
                            <span class="feature-tag">Step-by-step</span>
                        </div>
                    </div>
                    
                    <div class="experience-card" data-experience="student">
                        <div class="card-icon">🎓</div>
                        <h3>Student/Recent Grad</h3>
                        <p>Have some programming knowledge, preparing for first job</p>
                        <div class="card-features">
                            <span class="feature-tag">Interview Prep</span>
                            <span class="feature-tag">Coding Practice</span>
                        </div>
                    </div>
                    
                    <div class="experience-card" data-experience="junior">
                        <div class="card-icon">💼</div>
                        <h3>Junior Developer</h3>
                        <p>1-3 years experience, looking to level up skills</p>
                        <div class="card-features">
                            <span class="feature-tag">Advanced Topics</span>
                            <span class="feature-tag">System Design</span>
                        </div>
                    </div>
                    
                    <div class="experience-card" data-experience="experienced">
                        <div class="card-icon">🚀</div>
                        <h3>Experienced Dev</h3>
                        <p>3+ years experience, aiming for senior roles</p>
                        <div class="card-features">
                            <span class="feature-tag">Leadership</span>
                            <span class="feature-tag">Architecture</span>
                        </div>
                    </div>
                </div>
                
                <div class="experience-details" id="experience-details" style="display: none;">
                    <h4>Tell us more about your background:</h4>
                    <div class="detail-options">
                        <label class="checkbox-option">
                            <input type="checkbox" name="background" value="cs_degree">
                            <span class="checkmark"></span>
                            Computer Science degree
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="background" value="bootcamp">
                            <span class="checkmark"></span>
                            Coding bootcamp graduate
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="background" value="self_taught">
                            <span class="checkmark"></span>
                            Self-taught programmer
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="background" value="career_change">
                            <span class="checkmark"></span>
                            Career changer
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    renderGoalStep() {
        return `
            <div class="goal-step">
                <h2>What are you working towards?</h2>
                <p class="step-description">Select all that apply - we'll prioritize content based on your goals.</p>
                
                <div class="goals-grid">
                    <div class="goal-card" data-goal="interview_prep">
                        <div class="card-header">
                            <div class="card-icon">📝</div>
                            <h3>Interview Preparation</h3>
                        </div>
                        <p>Get ready for technical interviews at top companies</p>
                        <div class="goal-timeline">
                            <span class="timeline-label">Typical timeline:</span>
                            <span class="timeline-value">2-6 months</span>
                        </div>
                    </div>
                    
                    <div class="goal-card" data-goal="system_design">
                        <div class="card-header">
                            <div class="card-icon">🏗️</div>
                            <h3>System Design Mastery</h3>
                        </div>
                        <p>Learn to design scalable distributed systems</p>
                        <div class="goal-timeline">
                            <span class="timeline-label">Typical timeline:</span>
                            <span class="timeline-value">3-8 months</span>
                        </div>
                    </div>
                    
                    <div class="goal-card" data-goal="algorithms">
                        <div class="card-header">
                            <div class="card-icon">🧮</div>
                            <h3>Algorithms & Data Structures</h3>
                        </div>
                        <p>Master fundamental computer science concepts</p>
                        <div class="goal-timeline">
                            <span class="timeline-label">Typical timeline:</span>
                            <span class="timeline-value">1-4 months</span>
                        </div>
                    </div>
                    
                    <div class="goal-card" data-goal="leadership">
                        <div class="card-header">
                            <div class="card-icon">👑</div>
                            <h3>Tech Leadership</h3>
                        </div>
                        <p>Develop skills for senior and principal roles</p>
                        <div class="goal-timeline">
                            <span class="timeline-label">Typical timeline:</span>
                            <span class="timeline-value">6-12 months</span>
                        </div>
                    </div>
                    
                    <div class="goal-card" data-goal="career_growth">
                        <div class="card-header">
                            <div class="card-icon">📈</div>
                            <h3>Career Advancement</h3>
                        </div>
                        <p>Level up from junior to senior developer</p>
                        <div class="goal-timeline">
                            <span class="timeline-label">Typical timeline:</span>
                            <span class="timeline-value">4-10 months</span>
                        </div>
                    </div>
                    
                    <div class="goal-card" data-goal="knowledge_refresh">
                        <div class="card-header">
                            <div class="card-icon">🔄</div>
                            <h3>Knowledge Refresh</h3>
                        </div>
                        <p>Update and expand existing technical knowledge</p>
                        <div class="goal-timeline">
                            <span class="timeline-label">Typical timeline:</span>
                            <span class="timeline-value">1-3 months</span>
                        </div>
                    </div>
                </div>
                
                <div class="selected-goals-summary" id="goals-summary" style="display: none;">
                    <h4>Your selected goals:</h4>
                    <div class="selected-goals-list"></div>
                    <div class="estimated-timeline">
                        <strong>Estimated timeline: </strong>
                        <span id="timeline-estimate">Select goals to see estimate</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderLearningPreferencesStep() {
        return `
            <div class="preferences-step">
                <h2>How do you prefer to learn?</h2>
                <p class="step-description">We'll customize the experience to match your learning style.</p>
                
                <div class="learning-styles">
                    <div class="style-section">
                        <h3>Content Format Preference</h3>
                        <div class="style-options">
                            <div class="style-option" data-preference="visual">
                                <div class="option-icon">👁️</div>
                                <h4>Visual Learner</h4>
                                <p>Diagrams, charts, and visual representations</p>
                            </div>
                            <div class="style-option" data-preference="reading">
                                <div class="option-icon">📖</div>
                                <h4>Reading/Writing</h4>
                                <p>Text-based content and written exercises</p>
                            </div>
                            <div class="style-option" data-preference="interactive">
                                <div class="option-icon">🎮</div>
                                <h4>Interactive</h4>
                                <p>Hands-on coding and practical exercises</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="style-section">
                        <h3>Learning Pace</h3>
                        <div class="pace-slider">
                            <div class="slider-container">
                                <input type="range" id="pace-slider" min="1" max="5" value="3" class="slider">
                                <div class="slider-labels">
                                    <span>Slow & Steady</span>
                                    <span>Balanced</span>
                                    <span>Fast Track</span>
                                </div>
                            </div>
                            <div class="pace-description">
                                <span id="pace-description">Balanced approach with steady progress</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="style-section">
                        <h3>Challenge Level</h3>
                        <div class="challenge-options">
                            <div class="challenge-option" data-challenge="gradual">
                                <div class="option-icon">🐌</div>
                                <h4>Gradual</h4>
                                <p>Build up difficulty slowly</p>
                            </div>
                            <div class="challenge-option" data-challenge="balanced">
                                <div class="option-icon">🎯</div>
                                <h4>Balanced</h4>
                                <p>Mix of easy and challenging content</p>
                            </div>
                            <div class="challenge-option" data-challenge="challenging">
                                <div class="option-icon">🚀</div>
                                <h4>Challenge Me</h4>
                                <p>Jump into difficult problems quickly</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="preference-preview" id="preference-preview">
                    <h4>Based on your preferences, you'll see:</h4>
                    <div class="preview-features"></div>
                </div>
            </div>
        `;
    }

    renderTimeCommitmentStep() {
        return `
            <div class="time-step">
                <h2>How much time can you dedicate?</h2>
                <p class="step-description">We'll create a realistic study schedule that fits your lifestyle.</p>
                
                <div class="time-options">
                    <div class="time-card" data-time="light">
                        <div class="card-icon">☕</div>
                        <h3>Light Commitment</h3>
                        <div class="time-amount">15-30 min/day</div>
                        <div class="time-details">
                            <p>Perfect for busy professionals</p>
                            <ul>
                                <li>Daily micro-lessons</li>
                                <li>Weekend longer sessions</li>
                                <li>Flexible schedule</li>
                            </ul>
                        </div>
                        <div class="time-estimate">
                            <strong>Goal achievement:</strong> 6-12 months
                        </div>
                    </div>
                    
                    <div class="time-card" data-time="moderate">
                        <div class="card-icon">⚖️</div>
                        <h3>Moderate Commitment</h3>
                        <div class="time-amount">1-2 hours/day</div>
                        <div class="time-details">
                            <p>Balanced approach for steady progress</p>
                            <ul>
                                <li>Daily focused study</li>
                                <li>Weekly practice sessions</li>
                                <li>Regular assessments</li>
                            </ul>
                        </div>
                        <div class="time-estimate">
                            <strong>Goal achievement:</strong> 3-6 months
                        </div>
                    </div>
                    
                    <div class="time-card" data-time="intensive">
                        <div class="card-icon">🔥</div>
                        <h3>Intensive Commitment</h3>
                        <div class="time-amount">3+ hours/day</div>
                        <div class="time-details">
                            <p>Fast-track for dedicated learners</p>
                            <ul>
                                <li>Deep daily sessions</li>
                                <li>Multiple practice rounds</li>
                                <li>Accelerated timeline</li>
                            </ul>
                        </div>
                        <div class="time-estimate">
                            <strong>Goal achievement:</strong> 1-3 months
                        </div>
                    </div>
                </div>
                
                <div class="schedule-customization" id="schedule-customization" style="display: none;">
                    <h3>Customize Your Schedule</h3>
                    <div class="schedule-options">
                        <div class="schedule-row">
                            <label>Preferred study days:</label>
                            <div class="day-selector">
                                ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `
                                    <label class="day-option">
                                        <input type="checkbox" value="${day.toLowerCase()}" checked>
                                        <span class="day-label">${day}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="schedule-row">
                            <label>Best time of day:</label>
                            <select id="preferred-time">
                                <option value="morning">Morning (6-10 AM)</option>
                                <option value="afternoon">Afternoon (12-5 PM)</option>
                                <option value="evening">Evening (6-9 PM)</option>
                                <option value="night">Night (9+ PM)</option>
                                <option value="flexible">Flexible</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickStartStep() {
        const recommendedPath = this.generateRecommendedPath();
        
        return `
            <div class="quick-start-step">
                <div class="success-animation">
                    <div class="celebration-icon">🎉</div>
                    <h2>Your Learning Path is Ready!</h2>
                    <p class="success-message">Based on your preferences, we've created a personalized experience just for you.</p>
                </div>
                
                <div class="path-preview">
                    <h3>Your Recommended Learning Path:</h3>
                    <div class="path-overview">
                        <div class="path-header">
                            <div class="path-icon">${recommendedPath.icon}</div>
                            <div class="path-info">
                                <h4>${recommendedPath.name}</h4>
                                <p>${recommendedPath.description}</p>
                            </div>
                        </div>
                        
                        <div class="path-stats">
                            <div class="stat-item">
                                <span class="stat-value">${recommendedPath.duration}</span>
                                <span class="stat-label">Estimated Time</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${recommendedPath.modules}</span>
                                <span class="stat-label">Modules</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${recommendedPath.difficulty}</span>
                                <span class="stat-label">Difficulty</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="first-steps">
                        <h4>Your First Steps:</h4>
                        <div class="steps-list">
                            ${recommendedPath.firstSteps.map((step, index) => `
                                <div class="step-item">
                                    <div class="step-number">${index + 1}</div>
                                    <div class="step-content">
                                        <h5>${step.title}</h5>
                                        <p>${step.description}</p>
                                        <span class="step-duration">${step.duration}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h4>Quick Setup Actions:</h4>
                    <div class="actions-grid">
                        <div class="action-item" data-action="enable_notifications">
                            <div class="action-icon">🔔</div>
                            <div class="action-content">
                                <h5>Enable Study Reminders</h5>
                                <p>Get gentle nudges to stay on track</p>
                            </div>
                            <div class="action-toggle">
                                <input type="checkbox" id="notifications-toggle" checked>
                                <label for="notifications-toggle" class="toggle-label"></label>
                            </div>
                        </div>
                        
                        <div class="action-item" data-action="set_goal_date">
                            <div class="action-icon">📅</div>
                            <div class="action-content">
                                <h5>Set Target Date</h5>
                                <p>When do you want to achieve your goal?</p>
                            </div>
                            <input type="date" id="target-date" min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="action-item" data-action="bookmark_mobile">
                            <div class="action-icon">📱</div>
                            <div class="action-content">
                                <h5>Add to Home Screen</h5>
                                <p>Quick access on mobile devices</p>
                            </div>
                            <button class="action-button" id="add-to-homescreen">Add</button>
                        </div>
                    </div>
                </div>
                
                <div class="onboarding-complete-actions">
                    <button class="btn-secondary" id="take-tour">Take a Quick Tour</button>
                    <button class="btn-primary" id="start-learning">Start Learning Now</button>
                </div>
            </div>
        `;
    }

    generateRecommendedPath() {
        const experience = this.userProfile.experience;
        const goals = this.userProfile.goals;
        const timeCommitment = this.userProfile.timeCommitment;
        
        // AI-like path recommendation logic
        if (goals.includes('interview_prep') && experience === 'student') {
            return {
                name: 'Interview Mastery Track',
                icon: '🎯',
                description: 'Focused preparation for technical interviews with hands-on practice',
                duration: timeCommitment === 'intensive' ? '6-8 weeks' : timeCommitment === 'moderate' ? '12-16 weeks' : '20-24 weeks',
                modules: '8',
                difficulty: 'Intermediate',
                firstSteps: [
                    {
                        title: 'Assessment Test',
                        description: 'Take a quick skills assessment to identify strengths and gaps',
                        duration: '15 min'
                    },
                    {
                        title: 'Data Structures Refresher',
                        description: 'Review fundamental data structures with interactive examples',
                        duration: '45 min'
                    },
                    {
                        title: 'First Coding Challenge',
                        description: 'Solve your first practice problem with guided hints',
                        duration: '30 min'
                    }
                ]
            };
        } else if (goals.includes('system_design') && experience === 'experienced') {
            return {
                name: 'System Design Mastery',
                icon: '🏗️',
                description: 'Advanced system design patterns for senior-level interviews',
                duration: timeCommitment === 'intensive' ? '8-10 weeks' : timeCommitment === 'moderate' ? '16-20 weeks' : '24-28 weeks',
                modules: '12',
                difficulty: 'Advanced',
                firstSteps: [
                    {
                        title: 'Design Philosophy',
                        description: 'Learn the fundamental principles of system design',
                        duration: '30 min'
                    },
                    {
                        title: 'Scalability Basics',
                        description: 'Understand horizontal vs vertical scaling concepts',
                        duration: '45 min'
                    },
                    {
                        title: 'Design Your First System',
                        description: 'Practice with a simple URL shortener design',
                        duration: '60 min'
                    }
                ]
            };
        } else {
            return {
                name: 'Comprehensive Tech Track',
                icon: '🚀',
                description: 'Well-rounded preparation covering all essential topics',
                duration: timeCommitment === 'intensive' ? '10-12 weeks' : timeCommitment === 'moderate' ? '20-24 weeks' : '30-36 weeks',
                modules: '15',
                difficulty: 'Progressive',
                firstSteps: [
                    {
                        title: 'Foundation Assessment',
                        description: 'Evaluate your current knowledge across all areas',
                        duration: '20 min'
                    },
                    {
                        title: 'Learning Path Customization',
                        description: 'Fine-tune your path based on assessment results',
                        duration: '10 min'
                    },
                    {
                        title: 'First Module Deep Dive',
                        description: 'Start with your strongest area to build confidence',
                        duration: '60 min'
                    }
                ]
            };
        }
    }

    bindStepEvents(step) {
        switch (step.id) {
            case 'experience_assessment':
                this.bindExperienceEvents();
                break;
            case 'goal_selection':
                this.bindGoalEvents();
                break;
            case 'learning_preferences':
                this.bindPreferenceEvents();
                break;
            case 'time_commitment':
                this.bindTimeEvents();
                break;
            case 'quick_start':
                this.bindQuickStartEvents();
                break;
        }
    }

    bindExperienceEvents() {
        document.querySelectorAll('.experience-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Remove previous selections
                document.querySelectorAll('.experience-card').forEach(c => c.classList.remove('selected'));
                
                // Select current card
                card.classList.add('selected');
                this.userProfile.experience = card.dataset.experience;
                
                // Show additional details
                document.getElementById('experience-details').style.display = 'block';
                
                // Enable next button
                document.getElementById('next-step').disabled = false;
                
                this.trackUserInteraction('experience_selected', {
                    experience: this.userProfile.experience
                });
            });
        });
    }

    bindGoalEvents() {
        document.querySelectorAll('.goal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const goal = card.dataset.goal;
                
                if (card.classList.contains('selected')) {
                    card.classList.remove('selected');
                    this.userProfile.goals = this.userProfile.goals.filter(g => g !== goal);
                } else {
                    card.classList.add('selected');
                    if (!this.userProfile.goals.includes(goal)) {
                        this.userProfile.goals.push(goal);
                    }
                }
                
                this.updateGoalsSummary();
                document.getElementById('next-step').disabled = this.userProfile.goals.length === 0;
            });
        });
    }

    bindPreferenceEvents() {
        // Learning style selection
        document.querySelectorAll('.style-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const section = option.closest('.style-section');
                section.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                const preferenceType = section.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '_');
                this.userProfile.learningStyle = this.userProfile.learningStyle || {};
                this.userProfile.learningStyle[preferenceType] = option.dataset.preference;
                
                this.updatePreferencePreview();
            });
        });
        
        // Challenge level selection
        document.querySelectorAll('.challenge-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.challenge-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                this.userProfile.learningStyle = this.userProfile.learningStyle || {};
                this.userProfile.learningStyle.challenge = option.dataset.challenge;
                
                this.updatePreferencePreview();
            });
        });
        
        // Pace slider
        const paceSlider = document.getElementById('pace-slider');
        paceSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const descriptions = [
                'Very slow pace with lots of reinforcement',
                'Slow and steady with regular review',
                'Balanced approach with steady progress',
                'Faster pace with focused practice',
                'Intensive fast-track approach'
            ];
            
            document.getElementById('pace-description').textContent = descriptions[value - 1];
            
            this.userProfile.learningStyle = this.userProfile.learningStyle || {};
            this.userProfile.learningStyle.pace = value;
            
            this.updatePreferencePreview();
        });
    }

    bindTimeEvents() {
        document.querySelectorAll('.time-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.time-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                this.userProfile.timeCommitment = card.dataset.time;
                
                // Show schedule customization
                document.getElementById('schedule-customization').style.display = 'block';
                
                document.getElementById('next-step').disabled = false;
                
                this.trackUserInteraction('time_commitment_selected', {
                    commitment: this.userProfile.timeCommitment
                });
            });
        });
    }

    bindQuickStartEvents() {
        document.getElementById('take-tour').addEventListener('click', () => {
            this.completeOnboarding();
            this.startProductTour();
        });
        
        document.getElementById('start-learning').addEventListener('click', () => {
            this.completeOnboarding();
            this.redirectToLearningPath();
        });
        
        // Notification setup
        document.getElementById('notifications-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.requestNotificationPermission();
            }
        });
        
        // Add to homescreen
        document.getElementById('add-to-homescreen').addEventListener('click', () => {
            this.showAddToHomescreenInstructions();
        });
        
        // Target date
        document.getElementById('target-date').addEventListener('change', (e) => {
            this.userProfile.targetDate = e.target.value;
            this.trackUserInteraction('target_date_set', {
                date: e.target.value
            });
        });
    }

    updateGoalsSummary() {
        const summaryElement = document.getElementById('goals-summary');
        const goalsList = summaryElement.querySelector('.selected-goals-list');
        
        if (this.userProfile.goals.length > 0) {
            summaryElement.style.display = 'block';
            
            goalsList.innerHTML = this.userProfile.goals.map(goal => {
                const goalNames = {
                    'interview_prep': 'Interview Preparation',
                    'system_design': 'System Design Mastery',
                    'algorithms': 'Algorithms & Data Structures',
                    'leadership': 'Tech Leadership',
                    'career_growth': 'Career Advancement',
                    'knowledge_refresh': 'Knowledge Refresh'
                };
                
                return `<span class="selected-goal-tag">${goalNames[goal]}</span>`;
            }).join('');
            
            // Calculate estimated timeline
            const timeEstimate = this.calculateTimelineEstimate();
            document.getElementById('timeline-estimate').textContent = timeEstimate;
        } else {
            summaryElement.style.display = 'none';
        }
    }

    updatePreferencePreview() {
        const preview = document.getElementById('preference-preview');
        const featuresContainer = preview.querySelector('.preview-features');
        const features = [];
        
        const style = this.userProfile.learningStyle || {};
        
        if (style.content_format_preference === 'visual') {
            features.push('Rich diagrams and visual explanations');
        } else if (style.content_format_preference === 'interactive') {
            features.push('Hands-on coding exercises and simulations');
        } else if (style.content_format_preference === 'reading') {
            features.push('Comprehensive text content and written exercises');
        }
        
        if (style.challenge === 'gradual') {
            features.push('Progressive difficulty with gentle learning curve');
        } else if (style.challenge === 'challenging') {
            features.push('Advanced problems and challenging scenarios');
        }
        
        if (style.pace >= 4) {
            features.push('Fast-paced content with accelerated timeline');
        } else if (style.pace <= 2) {
            features.push('Thorough explanations with plenty of practice time');
        }
        
        featuresContainer.innerHTML = features.map(feature => 
            `<div class="preview-feature">✨ ${feature}</div>`
        ).join('');
    }

    calculateTimelineEstimate() {
        const goalMultipliers = {
            'interview_prep': 3,
            'system_design': 4,
            'algorithms': 2,
            'leadership': 5,
            'career_growth': 4,
            'knowledge_refresh': 1
        };
        
        const totalComplexity = this.userProfile.goals.reduce((sum, goal) => 
            sum + (goalMultipliers[goal] || 2), 0
        );
        
        const timeCommitmentMultiplier = {
            'light': 2,
            'moderate': 1,
            'intensive': 0.5
        };
        
        const multiplier = timeCommitmentMultiplier[this.userProfile.timeCommitment] || 1;
        const estimatedMonths = Math.ceil(totalComplexity * multiplier);
        
        if (estimatedMonths <= 1) {
            return '2-4 weeks';
        } else if (estimatedMonths <= 3) {
            return `${estimatedMonths} months`;
        } else if (estimatedMonths <= 6) {
            return `${estimatedMonths}-${estimatedMonths + 1} months`;
        } else {
            return `${estimatedMonths}+ months`;
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.renderCurrentStep();
            this.startStepTimer();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderCurrentStep();
            this.startStepTimer();
        }
    }

    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.totalSteps) {
            this.currentStep = stepIndex;
            this.renderCurrentStep();
            this.startStepTimer();
        }
    }

    updateProgress() {
        const progressPercentage = ((this.currentStep + 1) / this.totalSteps) * 100;
        document.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
        document.querySelector('.progress-label').textContent = `Step ${this.currentStep + 1} of ${this.totalSteps}`;
        
        // Update step dots
        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentStep);
            dot.classList.toggle('completed', index < this.currentStep);
        });
    }

    updateNavigation() {
        const prevButton = document.getElementById('prev-step');
        const nextButton = document.getElementById('next-step');
        
        prevButton.style.display = this.currentStep > 0 ? 'block' : 'none';
        
        // Update next button text
        if (this.currentStep === this.totalSteps - 1) {
            nextButton.textContent = 'Complete Setup';
            nextButton.classList.add('pulse-animation');
        } else {
            nextButton.textContent = 'Continue';
            nextButton.classList.remove('pulse-animation');
        }
        
        // Enable/disable next button based on step completion
        const step = this.steps[this.currentStep];
        if (step.id === 'welcome') {
            nextButton.disabled = false;
        } else {
            nextButton.disabled = !this.isStepComplete(step);
        }
    }

    isStepComplete(step) {
        switch (step.id) {
            case 'welcome':
                return true;
            case 'experience_assessment':
                return !!this.userProfile.experience;
            case 'goal_selection':
                return this.userProfile.goals.length > 0;
            case 'learning_preferences':
                return !!(this.userProfile.learningStyle && Object.keys(this.userProfile.learningStyle).length > 0);
            case 'time_commitment':
                return !!this.userProfile.timeCommitment;
            case 'quick_start':
                return true;
            default:
                return false;
        }
    }

    startStepTimer() {
        const step = this.steps[this.currentStep];
        const timerCircle = document.querySelector('.timer-progress');
        const timerText = document.querySelector('.timer-text');
        const duration = step.duration;
        
        timerText.textContent = `${duration}s`;
        
        // Reset timer
        timerCircle.style.strokeDashoffset = '157';
        timerCircle.style.transition = 'none';
        
        // Start timer animation
        requestAnimationFrame(() => {
            timerCircle.style.transition = `stroke-dashoffset ${duration}s linear`;
            timerCircle.style.strokeDashoffset = '0';
        });
        
        // Update timer text
        let remainingTime = duration;
        const timerInterval = setInterval(() => {
            remainingTime--;
            timerText.textContent = `${remainingTime}s`;
            
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerText.textContent = '✓';
                timerCircle.style.stroke = '#4caf50';
            }
        }, 1000);
        
        // Store timer for cleanup
        if (this.stepTimer) {
            clearInterval(this.stepTimer);
        }
        this.stepTimer = timerInterval;
    }

    updateStepTimer(duration) {
        document.querySelector('.timer-text').textContent = `${duration}s`;
    }

    completeOnboarding() {
        // Save user profile
        localStorage.setItem('systemcraft_user_profile', JSON.stringify(this.userProfile));
        localStorage.setItem('systemcraft_onboarding_completed', 'true');
        localStorage.setItem('systemcraft_onboarding_version', '2025.1');
        
        // Analytics
        this.trackUserInteraction('onboarding_completed', {
            profile: this.userProfile,
            duration: Date.now() - this.startTime,
            completedSteps: this.currentStep + 1
        });
        
        // Hide overlay
        document.getElementById('onboarding-overlay').classList.add('fadeout');
        setTimeout(() => {
            document.getElementById('onboarding-overlay').remove();
        }, 300);
        
        // Show completion notification
        this.showCompletionNotification();
    }

    skipOnboarding() {
        // Show skip confirmation
        const skipConfirm = confirm('Are you sure you want to skip the setup? You can always access it later from your profile settings.');
        
        if (skipConfirm) {
            localStorage.setItem('systemcraft_onboarding_skipped', 'true');
            
            this.trackUserInteraction('onboarding_skipped', {
                step: this.currentStep,
                duration: Date.now() - this.startTime
            });
            
            document.getElementById('onboarding-overlay').remove();
            this.showQuickTips();
        }
    }

    showQuickTips() {
        // Show a minimal quick tips overlay instead of full onboarding
        const quickTips = document.createElement('div');
        quickTips.className = 'quick-tips-overlay';
        quickTips.innerHTML = `
            <div class="quick-tips-container">
                <h3>Quick Tips to Get Started</h3>
                <div class="tips-list">
                    <div class="tip-item">
                        <span class="tip-icon">💡</span>
                        <span class="tip-text">Use the search bar to find specific topics quickly</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">📱</span>
                        <span class="tip-text">Add to home screen for quick mobile access</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🎯</span>
                        <span class="tip-text">Track your progress in the analytics dashboard</span>
                    </div>
                </div>
                <button class="btn-primary" id="dismiss-tips">Got it!</button>
            </div>
        `;
        
        document.body.appendChild(quickTips);
        
        document.getElementById('dismiss-tips').addEventListener('click', () => {
            quickTips.remove();
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (document.contains(quickTips)) {
                quickTips.remove();
            }
        }, 10000);
    }

    showCompletionNotification() {
        const notification = document.createElement('div');
        notification.className = 'completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🎉</div>
                <div class="notification-text">
                    <h4>Setup Complete!</h4>
                    <p>Your personalized learning experience is ready.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('fadeout');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    startProductTour() {
        // Initialize product tour (would integrate with a tour library)
        if (typeof IntroJs !== 'undefined') {
            introJs().start();
        } else {
            // Fallback basic tour
            alert('Product tour will guide you through the key features!');
            this.redirectToLearningPath();
        }
    }

    redirectToLearningPath() {
        const path = this.generateRecommendedPath();
        // In a real app, this would navigate to the appropriate learning path
        // For now, we'll just show a message
        window.location.href = '#learning-path';
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.scheduleStudyReminders();
                }
            });
        }
    }

    scheduleStudyReminders() {
        // Schedule study reminders based on user preferences
        const timeCommitment = this.userProfile.timeCommitment;
        const schedule = {
            'light': { frequency: 'daily', times: ['09:00', '20:00'] },
            'moderate': { frequency: 'daily', times: ['09:00', '14:00', '19:00'] },
            'intensive': { frequency: 'multiple', times: ['08:00', '12:00', '16:00', '20:00'] }
        };
        
        // In a real app, this would set up actual notifications
        console.log('Study reminders scheduled:', schedule[timeCommitment]);
    }

    showAddToHomescreenInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'homescreen-instructions';
        
        const userAgent = navigator.userAgent.toLowerCase();
        let instructionText = '';
        
        if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            instructionText = 'Tap the Share button and select "Add to Home Screen"';
        } else if (userAgent.includes('chrome')) {
            instructionText = 'Tap the menu (⋮) and select "Add to Home screen"';
        } else {
            instructionText = 'Look for "Add to Home Screen" in your browser menu';
        }
        
        instructions.innerHTML = `
            <div class="instructions-content">
                <h4>Add SystemCraft to Home Screen</h4>
                <p>${instructionText}</p>
                <button class="btn-secondary" id="close-instructions">Close</button>
            </div>
        `;
        
        document.body.appendChild(instructions);
        
        document.getElementById('close-instructions').addEventListener('click', () => {
            instructions.remove();
        });
    }

    trackUserInteraction(event, data) {
        // Analytics tracking (would integrate with actual analytics service)
        const analyticsEvent = {
            event: event,
            timestamp: Date.now(),
            data: data,
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent
        };
        
        // Store locally for now (in production would send to analytics service)
        const existingEvents = JSON.parse(localStorage.getItem('onboarding_analytics') || '[]');
        existingEvents.push(analyticsEvent);
        localStorage.setItem('onboarding_analytics', JSON.stringify(existingEvents));
        
        console.log('Analytics:', analyticsEvent);
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }
}

// CSS Styles for Onboarding Wizard
const onboardingStyles = `
<style>
.onboarding-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.onboarding-overlay.active {
    opacity: 1;
}

.onboarding-overlay.fadeout {
    opacity: 0;
}

.onboarding-container {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
}

.onboarding-header {
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.onboarding-progress {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.progress-track {
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    flex: 1;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #ff9800;
    border-radius: 3px;
    transition: width 0.5s ease;
}

.progress-label {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
}

.onboarding-skip {
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.onboarding-skip:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.onboarding-content {
    flex: 1;
    padding: 32px 24px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
}

.step-indicator {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
}

.step-timer {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.timer-circle {
    transform: rotate(-90deg);
}

.timer-progress {
    stroke: #ff9800;
    stroke-linecap: round;
    stroke-dasharray: 157;
    stroke-dashoffset: 157;
}

.timer-text {
    position: absolute;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.onboarding-footer {
    padding: 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.step-dots {
    display: flex;
    gap: 8px;
}

.step-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
}

.step-dot.active {
    background: #ff9800;
    transform: scale(1.2);
}

.step-dot.completed {
    background: #10b981;
}

.btn-primary, .btn-secondary {
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: #ff9800;
    color: white;
}

.btn-primary:hover {
    background: #f57c00;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-secondary:hover {
    background: #f9fafb;
}

.pulse-animation {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* Step-specific styles */
.welcome-step {
    text-align: center;
}

.welcome-animation {
    margin-bottom: 32px;
}

.floating-icons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 24px;
}

.icon-item {
    font-size: 2rem;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

.welcome-content h1 {
    font-size: 2.5rem;
    color: #111827;
    margin-bottom: 16px;
}

.welcome-subtitle {
    font-size: 1.25rem;
    color: #6b7280;
    margin-bottom: 32px;
}

.feature-highlights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.highlight-item {
    text-align: center;
    padding: 24px;
    background: #f9fafb;
    border-radius: 12px;
}

.highlight-icon {
    font-size: 2rem;
    margin-bottom: 12px;
}

.highlight-item h3 {
    font-size: 1.25rem;
    color: #111827;
    margin-bottom: 8px;
}

.highlight-item p {
    color: #6b7280;
    line-height: 1.5;
}

.quick-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-top: 24px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #ff9800;
}

.stat-label {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Experience step styles */
.experience-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.experience-card {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
}

.experience-card:hover {
    border-color: #ff9800;
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.1);
}

.experience-card.selected {
    border-color: #ff9800;
    background: rgba(255, 152, 0, 0.05);
}

.experience-card .card-icon {
    font-size: 2.5rem;
    margin-bottom: 16px;
}

.experience-card h3 {
    font-size: 1.25rem;
    color: #111827;
    margin-bottom: 12px;
}

.experience-card p {
    color: #6b7280;
    line-height: 1.5;
    margin-bottom: 16px;
}

.card-features {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
}

.feature-tag {
    background: #f3f4f6;
    color: #374151;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
}

.experience-card.selected .feature-tag {
    background: #ff9800;
    color: white;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
    .onboarding-container {
        width: 95%;
        margin: 20px;
    }
    
    .onboarding-header,
    .onboarding-content,
    .onboarding-footer {
        padding: 16px;
    }
    
    .feature-highlights {
        grid-template-columns: 1fr;
    }
    
    .experience-options {
        grid-template-columns: 1fr;
    }
    
    .quick-stats {
        gap: 24px;
    }
    
    .onboarding-footer {
        flex-direction: column;
        gap: 16px;
    }
    
    .step-dots {
        order: -1;
    }
}

/* Additional completion styles */
.completion-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-left: 4px solid #10b981;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    z-index: 10001;
    max-width: 320px;
}

.completion-notification.show {
    opacity: 1;
    transform: translateX(0);
}

.completion-notification.fadeout {
    opacity: 0;
    transform: translateX(100%);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification-icon {
    font-size: 1.5rem;
}

.notification-text h4 {
    margin: 0 0 4px 0;
    color: #111827;
    font-size: 1rem;
}

.notification-text p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
}

.quick-tips-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.quick-tips-container {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 480px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.quick-tips-container h3 {
    margin: 0 0 20px 0;
    text-align: center;
    color: #111827;
}

.tips-list {
    margin-bottom: 24px;
}

.tip-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.tip-icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.tip-text {
    color: #374151;
    line-height: 1.4;
}
</style>
`;

// Inject styles
if (!document.getElementById('onboarding-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'onboarding-styles';
    styleSheet.innerHTML = onboardingStyles;
    document.head.appendChild(styleSheet);
}

// Auto-initialize onboarding when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if onboarding should run
    const urlParams = new URLSearchParams(window.location.search);
    const forceOnboarding = urlParams.get('onboarding') === 'true';
    const hasCompletedOnboarding = localStorage.getItem('systemcraft_onboarding_completed');
    
    if (forceOnboarding || !hasCompletedOnboarding) {
        new OnboardingWizard();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingWizard;
}