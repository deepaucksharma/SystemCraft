/**
 * Smart Recommendations Engine
 * AI-driven personalized content recommendations and next-best-action suggestions
 * Implements 2025 machine learning UX patterns for adaptive learning
 */

class SmartRecommendationEngine {
    constructor() {
        this.userProfile = this.loadUserProfile();
        this.learningHistory = this.loadLearningHistory();
        this.contentDatabase = new ContentDatabase();
        this.mlEngine = new MachineLearningEngine();
        this.contextEngine = new ContextualEngine();
        this.engagementTracker = new EngagementTracker();
        
        this.recommendations = {
            immediate: [],
            daily: [],
            weekly: [],
            longTerm: []
        };
        
        this.init();
    }

    init() {
        this.loadUserContext();
        this.generateRecommendations();
        this.renderRecommendationWidget();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    async loadUserContext() {
        // Gather comprehensive user context for personalization
        this.userContext = {
            currentSession: this.getCurrentSessionContext(),
            recentActivity: await this.getRecentActivity(),
            skillLevels: await this.assessCurrentSkillLevels(),
            learningPatterns: await this.analyzeLearningPatterns(),
            timeContext: this.getTimeContext(),
            deviceContext: this.getDeviceContext(),
            preferenceSignals: await this.extractPreferenceSignals()
        };
    }

    getCurrentSessionContext() {
        return {
            sessionStart: Date.now(),
            currentPage: window.location.pathname,
            scrollDepth: 0,
            timeSpent: 0,
            interactionCount: 0,
            focusLevel: 'high', // determined by interaction patterns
            deviceType: this.getDeviceType()
        };
    }

    async getRecentActivity() {
        // Analyze recent learning activity for pattern recognition
        const recentSessions = this.learningHistory.sessions.slice(-10);
        const recentContent = this.learningHistory.contentViewed.slice(-20);
        
        return {
            sessions: recentSessions,
            content: recentContent,
            averageSessionLength: this.calculateAverageSessionLength(recentSessions),
            preferredTopics: this.extractPreferredTopics(recentContent),
            strugglingAreas: await this.identifyStrugglingAreas(recentSessions),
            momentum: this.calculateLearningMomentum(recentSessions)
        };
    }

    async assessCurrentSkillLevels() {
        // Dynamic skill assessment based on performance data
        const skillAreas = [
            'data_structures', 'algorithms', 'system_design', 'behavioral_interviews',
            'coding_patterns', 'database_design', 'scalability', 'security',
            'frontend_development', 'backend_development', 'devops', 'leadership'
        ];

        const skillAssessments = {};
        
        for (const skill of skillAreas) {
            const assessment = await this.mlEngine.assessSkillLevel(skill, {
                recentPerformance: this.getRecentPerformance(skill),
                practiceHistory: this.getPracticeHistory(skill),
                timeSpent: this.getTimeSpentOnSkill(skill),
                difficultyProgression: this.getDifficultyProgression(skill)
            });
            
            skillAssessments[skill] = {
                currentLevel: assessment.level,
                confidence: assessment.confidence,
                trajectory: assessment.trajectory,
                nextMilestone: assessment.nextMilestone,
                estimatedTimeToNext: assessment.estimatedTime
            };
        }
        
        return skillAssessments;
    }

    async analyzeLearningPatterns() {
        const patterns = await this.mlEngine.analyzeLearningPatterns({
            sessionTimes: this.learningHistory.sessionTimes,
            contentPreferences: this.learningHistory.contentPreferences,
            difficultyProgression: this.learningHistory.difficultyProgression,
            retentionRates: this.learningHistory.retentionRates
        });
        
        return {
            optimalStudyTime: patterns.optimalStudyTime,
            preferredSessionLength: patterns.preferredSessionLength,
            effectiveContentTypes: patterns.effectiveContentTypes,
            learningVelocity: patterns.learningVelocity,
            retentionPattern: patterns.retentionPattern,
            motivationTriggers: patterns.motivationTriggers
        };
    }

    getTimeContext() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        
        return {
            timeOfDay: this.categorizeTimeOfDay(hour),
            dayOfWeek: dayOfWeek,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            availableTime: this.estimateAvailableTime(hour, dayOfWeek),
            energyLevel: this.estimateEnergyLevel(hour, dayOfWeek)
        };
    }

    getDeviceContext() {
        return {
            type: this.getDeviceType(),
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            },
            orientation: window.screen.orientation?.type || 'unknown',
            connectionType: navigator.connection?.effectiveType || 'unknown',
            isOnline: navigator.onLine,
            batteryLevel: this.getBatteryLevel()
        };
    }

    async generateRecommendations() {
        // Generate multi-layered recommendations using AI
        
        // Immediate recommendations (next 15 minutes)
        this.recommendations.immediate = await this.generateImmediateRecommendations();
        
        // Daily recommendations (today's session)
        this.recommendations.daily = await this.generateDailyRecommendations();
        
        // Weekly recommendations (this week's focus)
        this.recommendations.weekly = await this.generateWeeklyRecommendations();
        
        // Long-term recommendations (1-3 months)
        this.recommendations.longTerm = await this.generateLongTermRecommendations();
        
        // Apply contextual filtering and ranking
        await this.contextualizeRecommendations();
        
        // Track recommendation generation for learning
        this.trackRecommendationGeneration();
    }

    async generateImmediateRecommendations() {
        const context = this.userContext;
        const recommendations = [];
        
        // Quick wins based on current context
        if (context.currentSession.interactionCount < 3) {
            recommendations.push({
                type: 'engagement',
                action: 'interactive_demo',
                title: 'Try the Interactive Algorithm Visualizer',
                description: 'See how sorting algorithms work in real-time',
                estimatedTime: '5 min',
                engagementScore: 0.9,
                learningValue: 0.7,
                effort: 'low',
                url: '/interactive/sorting-algorithms'
            });
        }
        
        // Content continuation
        const lastContent = context.recentActivity.content[0];
        if (lastContent && lastContent.completionRate < 0.8) {
            recommendations.push({
                type: 'continuation',
                action: 'resume_content',
                title: `Continue "${lastContent.title}"`,
                description: `You were ${Math.round(lastContent.completionRate * 100)}% through this content`,
                estimatedTime: `${Math.ceil((1 - lastContent.completionRate) * lastContent.estimatedDuration)} min`,
                engagementScore: 0.8,
                learningValue: 0.9,
                effort: 'low',
                url: lastContent.url,
                progress: lastContent.completionRate
            });
        }
        
        // Skill-specific quick practice
        const weakestSkill = this.findWeakestSkill();
        if (weakestSkill && context.timeContext.availableTime >= 10) {
            const quickPractice = await this.contentDatabase.getQuickPractice(weakestSkill);
            recommendations.push({
                type: 'skill_improvement',
                action: 'quick_practice',
                title: `Quick ${this.formatSkillName(weakestSkill)} Practice`,
                description: quickPractice.description,
                estimatedTime: '10 min',
                engagementScore: 0.6,
                learningValue: 0.8,
                effort: 'medium',
                url: quickPractice.url,
                skill: weakestSkill
            });
        }
        
        // Micro-learning for time-constrained sessions
        if (context.timeContext.availableTime < 15) {
            const microContent = await this.contentDatabase.getMicroLearningContent({
                timeLimit: context.timeContext.availableTime,
                skill: context.recentActivity.preferredTopics[0],
                difficulty: context.skillLevels[context.recentActivity.preferredTopics[0]]?.currentLevel
            });
            
            recommendations.push({
                type: 'micro_learning',
                action: 'consume_content',
                title: microContent.title,
                description: microContent.description,
                estimatedTime: `${microContent.duration} min`,
                engagementScore: 0.7,
                learningValue: 0.6,
                effort: 'low',
                url: microContent.url,
                contentType: 'micro'
            });
        }
        
        return this.rankRecommendations(recommendations, 'immediate');
    }

    async generateDailyRecommendations() {
        const context = this.userContext;
        const recommendations = [];
        
        // Personalized daily focus
        const dailyFocus = await this.mlEngine.generateDailyFocus({
            userProfile: this.userProfile,
            recentProgress: context.recentActivity,
            skillGaps: this.identifySkillGaps(),
            availableTime: context.timeContext.availableTime
        });
        
        // Main learning session
        recommendations.push({
            type: 'daily_focus',
            action: 'focused_study',
            title: `Today's Focus: ${dailyFocus.topic}`,
            description: dailyFocus.description,
            estimatedTime: `${dailyFocus.duration} min`,
            engagementScore: 0.9,
            learningValue: 0.95,
            effort: 'high',
            url: dailyFocus.url,
            modules: dailyFocus.modules,
            expectedOutcomes: dailyFocus.outcomes
        });
        
        // Spaced repetition review
        const reviewItems = await this.getItemsForSpacedRepetition();
        if (reviewItems.length > 0) {
            recommendations.push({
                type: 'review',
                action: 'spaced_repetition',
                title: `Review ${reviewItems.length} Previous Concepts`,
                description: 'Strengthen your memory with spaced repetition',
                estimatedTime: `${reviewItems.length * 3} min`,
                engagementScore: 0.6,
                learningValue: 0.8,
                effort: 'medium',
                url: '/review/spaced-repetition',
                items: reviewItems
            });
        }
        
        // Adaptive challenge
        const challenge = await this.generateAdaptiveChallenge();
        if (challenge) {
            recommendations.push({
                type: 'challenge',
                action: 'solve_problem',
                title: challenge.title,
                description: challenge.description,
                estimatedTime: `${challenge.estimatedTime} min`,
                engagementScore: 0.8,
                learningValue: 0.9,
                effort: challenge.difficulty,
                url: challenge.url,
                difficulty: challenge.difficultyLevel,
                skills: challenge.requiredSkills
            });
        }
        
        // Progress milestone check
        const milestones = this.checkProgressMilestones();
        if (milestones.achievable.length > 0) {
            const milestone = milestones.achievable[0];
            recommendations.push({
                type: 'milestone',
                action: 'complete_milestone',
                title: `Complete "${milestone.title}" Milestone`,
                description: milestone.description,
                estimatedTime: `${milestone.estimatedTime} min`,
                engagementScore: 0.85,
                learningValue: 0.7,
                effort: 'medium',
                url: milestone.url,
                progress: milestone.currentProgress,
                reward: milestone.reward
            });
        }
        
        return this.rankRecommendations(recommendations, 'daily');
    }

    async generateWeeklyRecommendations() {
        const recommendations = [];
        
        // Weekly skill development plan
        const weeklyPlan = await this.mlEngine.generateWeeklyPlan({
            userGoals: this.userProfile.goals,
            currentSkills: this.userContext.skillLevels,
            learningVelocity: this.userContext.learningPatterns.learningVelocity,
            timeAvailable: this.calculateWeeklyAvailableTime()
        });
        
        recommendations.push({
            type: 'weekly_plan',
            action: 'follow_plan',
            title: `This Week: ${weeklyPlan.theme}`,
            description: weeklyPlan.description,
            estimatedTime: `${weeklyPlan.totalTime} min/week`,
            engagementScore: 0.8,
            learningValue: 0.95,
            effort: 'high',
            url: '/weekly-plan',
            dailyTasks: weeklyPlan.dailyTasks,
            expectedProgress: weeklyPlan.expectedProgress
        });
        
        // Peer comparison and motivation
        const peerData = await this.getPeerComparisonData();
        if (peerData.opportunities.length > 0) {
            recommendations.push({
                type: 'peer_motivation',
                action: 'competitive_challenge',
                title: 'Join the Weekly Challenge',
                description: `Compete with peers in ${peerData.challenge.category}`,
                estimatedTime: '30 min',
                engagementScore: 0.9,
                learningValue: 0.7,
                effort: 'medium',
                url: peerData.challenge.url,
                participants: peerData.challenge.participants,
                leaderboard: peerData.challenge.leaderboard
            });
        }
        
        return this.rankRecommendations(recommendations, 'weekly');
    }

    async generateLongTermRecommendations() {
        const recommendations = [];
        
        // Career path recommendations
        const careerPath = await this.mlEngine.analyzeCareerTrajectory({
            currentSkills: this.userContext.skillLevels,
            goals: this.userProfile.goals,
            marketTrends: await this.getMarketTrends(),
            timeline: this.userProfile.timeline
        });
        
        recommendations.push({
            type: 'career_path',
            action: 'develop_career_skills',
            title: `Focus on ${careerPath.nextRole}`,
            description: careerPath.description,
            estimatedTime: `${careerPath.duration} months`,
            engagementScore: 0.7,
            learningValue: 1.0,
            effort: 'high',
            url: careerPath.url,
            skillsToAcquire: careerPath.skills,
            milestones: careerPath.milestones,
            marketDemand: careerPath.demand
        });
        
        // Emerging technology recommendations
        const emergingTech = await this.getEmergingTechRecommendations();
        if (emergingTech.length > 0) {
            recommendations.push({
                type: 'emerging_tech',
                action: 'explore_technology',
                title: `Explore ${emergingTech[0].name}`,
                description: emergingTech[0].description,
                estimatedTime: `${emergingTech[0].timeInvestment} weeks`,
                engagementScore: 0.8,
                learningValue: 0.9,
                effort: 'high',
                url: emergingTech[0].url,
                marketRelevance: emergingTech[0].relevance,
                difficulty: emergingTech[0].difficulty
            });
        }
        
        return this.rankRecommendations(recommendations, 'longTerm');
    }

    async contextualizeRecommendations() {
        // Apply contextual filters and personalization
        
        for (const timeframe in this.recommendations) {
            this.recommendations[timeframe] = this.recommendations[timeframe].map(rec => {
                // Add contextual scoring
                rec.contextScore = this.calculateContextualScore(rec);
                
                // Personalize based on learning style
                rec = this.personalizeRecommendation(rec);
                
                // Add urgency and priority
                rec.urgency = this.calculateUrgency(rec);
                rec.priority = this.calculatePriority(rec);
                
                return rec;
            });
            
            // Re-rank with contextual scores
            this.recommendations[timeframe].sort((a, b) => {
                const scoreA = a.contextScore * a.engagementScore * a.learningValue;
                const scoreB = b.contextScore * b.engagementScore * b.learningValue;
                return scoreB - scoreA;
            });
        }
    }

    renderRecommendationWidget() {
        // Create and inject the recommendations widget
        const widget = this.createRecommendationWidget();
        this.injectWidget(widget);
        this.bindWidgetEvents();
    }

    createRecommendationWidget() {
        return `
            <div id="smart-recommendations-widget" class="recommendations-widget">
                <div class="widget-header">
                    <div class="header-content">
                        <div class="widget-title">
                            <span class="title-icon">🎯</span>
                            <h3>Smart Recommendations</h3>
                            <div class="personalization-indicator">
                                <span class="indicator-dot"></span>
                                Personalized for you
                            </div>
                        </div>
                        <div class="widget-controls">
                            <button class="control-btn refresh-btn" title="Refresh recommendations">
                                <span class="refresh-icon">🔄</span>
                            </button>
                            <button class="control-btn expand-btn" title="View all recommendations">
                                <span class="expand-icon">📋</span>
                            </button>
                            <button class="control-btn settings-btn" title="Personalization settings">
                                <span class="settings-icon">⚙️</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="widget-content">
                    <div class="recommendation-tabs">
                        <button class="tab-btn active" data-tab="immediate">Right Now</button>
                        <button class="tab-btn" data-tab="daily">Today</button>
                        <button class="tab-btn" data-tab="weekly">This Week</button>
                    </div>
                    
                    <div class="recommendations-container">
                        ${this.renderRecommendationTabs()}
                    </div>
                </div>
                
                <div class="widget-footer">
                    <div class="learning-streak">
                        <span class="streak-icon">🔥</span>
                        <span class="streak-text">${this.calculateCurrentStreak()} day streak!</span>
                    </div>
                    <div class="next-update">
                        <span class="update-text">Updates every 15 minutes</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderRecommendationTabs() {
        const tabs = ['immediate', 'daily', 'weekly'];
        
        return tabs.map((tab, index) => `
            <div class="tab-content ${index === 0 ? 'active' : ''}" id="${tab}-recommendations">
                ${this.renderRecommendationList(tab)}
            </div>
        `).join('');
    }

    renderRecommendationList(timeframe) {
        const recs = this.recommendations[timeframe] || [];
        
        if (recs.length === 0) {
            return `
                <div class="no-recommendations">
                    <div class="no-rec-icon">✨</div>
                    <p>No recommendations available right now.</p>
                    <button class="generate-more-btn">Generate More</button>
                </div>
            `;
        }
        
        return recs.slice(0, 3).map((rec, index) => this.renderRecommendationCard(rec, index)).join('');
    }

    renderRecommendationCard(rec, index) {
        const priorityClass = rec.priority >= 0.8 ? 'high-priority' : rec.priority >= 0.6 ? 'medium-priority' : 'low-priority';
        const urgencyIndicator = rec.urgency >= 0.8 ? '🔥' : rec.urgency >= 0.6 ? '⚡' : '';
        
        return `
            <div class="recommendation-card ${priorityClass}" data-rec-id="${rec.id || index}" data-action="${rec.action}">
                <div class="card-header">
                    <div class="rec-type-indicator">
                        ${this.getRecommendationIcon(rec.type)}
                        <span class="rec-type">${this.formatRecommendationType(rec.type)}</span>
                    </div>
                    <div class="rec-meta">
                        <span class="rec-time">${rec.estimatedTime}</span>
                        <span class="urgency-indicator">${urgencyIndicator}</span>
                    </div>
                </div>
                
                <div class="card-content">
                    <h4 class="rec-title">${rec.title}</h4>
                    <p class="rec-description">${rec.description}</p>
                    
                    ${rec.expectedOutcomes ? `
                        <div class="expected-outcomes">
                            <span class="outcomes-label">You'll learn:</span>
                            <ul class="outcomes-list">
                                ${rec.expectedOutcomes.slice(0, 2).map(outcome => `<li>${outcome}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="rec-metrics">
                        <div class="metric">
                            <span class="metric-label">Learning Value</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${rec.learningValue * 100}%"></div>
                            </div>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Engagement</span>
                            <div class="metric-bar">
                                <div class="metric-fill engagement" style="width: ${rec.engagementScore * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="action-btn primary" data-action="accept" data-url="${rec.url}">
                        ${this.getActionButtonText(rec.action)}
                    </button>
                    <button class="action-btn secondary" data-action="later">
                        Save for Later
                    </button>
                    <button class="action-btn minimal" data-action="dismiss">
                        Not Interested
                    </button>
                </div>
                
                ${rec.progress !== undefined ? `
                    <div class="progress-indicator">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${rec.progress * 100}%"></div>
                        </div>
                        <span class="progress-text">${Math.round(rec.progress * 100)}% complete</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getRecommendationIcon(type) {
        const icons = {
            'engagement': '🎮',
            'continuation': '📖',
            'skill_improvement': '💪',
            'micro_learning': '⚡',
            'daily_focus': '🎯',
            'review': '🔄',
            'challenge': '🏆',
            'milestone': '🎉',
            'weekly_plan': '📅',
            'peer_motivation': '👥',
            'career_path': '🚀',
            'emerging_tech': '🔮'
        };
        return icons[type] || '✨';
    }

    formatRecommendationType(type) {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getActionButtonText(action) {
        const texts = {
            'interactive_demo': 'Try Demo',
            'resume_content': 'Continue Reading',
            'quick_practice': 'Start Practice',
            'consume_content': 'Read Now',
            'focused_study': 'Begin Session',
            'spaced_repetition': 'Review Now',
            'solve_problem': 'Solve Challenge',
            'complete_milestone': 'Complete Now',
            'follow_plan': 'View Plan',
            'competitive_challenge': 'Join Challenge',
            'develop_career_skills': 'Explore Path',
            'explore_technology': 'Learn More'
        };
        return texts[action] || 'Get Started';
    }

    injectWidget(widgetHTML) {
        // Find the best location to inject the widget
        const targetSelectors = [
            '#content .md-content__inner',
            '.md-content',
            'main',
            'body'
        ];
        
        let targetElement = null;
        for (const selector of targetSelectors) {
            targetElement = document.querySelector(selector);
            if (targetElement) break;
        }
        
        if (targetElement) {
            // Create a container for the widget
            const container = document.createElement('div');
            container.innerHTML = widgetHTML;
            
            // Insert at the beginning of the content
            targetElement.insertBefore(container.firstElementChild, targetElement.firstChild);
        }
    }

    setupEventListeners() {
        // Widget control events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.refresh-btn, .refresh-icon')) {
                this.refreshRecommendations();
            } else if (e.target.matches('.expand-btn, .expand-icon')) {
                this.showAllRecommendations();
            } else if (e.target.matches('.settings-btn, .settings-icon')) {
                this.showPersonalizationSettings();
            } else if (e.target.matches('.tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            } else if (e.target.matches('.action-btn[data-action="accept"]')) {
                this.acceptRecommendation(e.target);
            } else if (e.target.matches('.action-btn[data-action="later"]')) {
                this.saveForLater(e.target);
            } else if (e.target.matches('.action-btn[data-action="dismiss"]')) {
                this.dismissRecommendation(e.target);
            }
        });
        
        // Real-time context updates
        window.addEventListener('scroll', () => {
            this.userContext.currentSession.scrollDepth = Math.max(
                this.userContext.currentSession.scrollDepth,
                window.scrollY
            );
        });
        
        // Focus tracking for engagement
        window.addEventListener('focus', () => {
            this.userContext.currentSession.focusLevel = 'high';
        });
        
        window.addEventListener('blur', () => {
            this.userContext.currentSession.focusLevel = 'low';
        });
        
        // Page visibility for accurate time tracking
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.sessionStartTime = Date.now();
            } else {
                this.updateSessionTime();
            }
        });
    }

    startRealTimeUpdates() {
        // Update recommendations every 15 minutes
        setInterval(() => {
            this.generateRecommendations();
            this.updateWidget();
        }, 15 * 60 * 1000);
        
        // Update user context every 5 minutes
        setInterval(() => {
            this.loadUserContext();
        }, 5 * 60 * 1000);
        
        // Track engagement every minute
        setInterval(() => {
            this.engagementTracker.updateEngagement({
                timeSpent: this.userContext.currentSession.timeSpent,
                interactions: this.userContext.currentSession.interactionCount,
                scrollDepth: this.userContext.currentSession.scrollDepth,
                focusLevel: this.userContext.currentSession.focusLevel
            });
        }, 60 * 1000);
    }

    acceptRecommendation(button) {
        const card = button.closest('.recommendation-card');
        const recId = card.dataset.recId;
        const action = card.dataset.action;
        const url = button.dataset.url;
        
        // Track acceptance
        this.trackRecommendationAction('accepted', recId, action);
        
        // Update recommendation effectiveness
        this.updateRecommendationEffectiveness(recId, 'accepted');
        
        // Navigate to content or execute action
        if (url && url !== '#') {
            window.location.href = url;
        } else {
            this.executeRecommendationAction(action, card);
        }
        
        // Visual feedback
        card.classList.add('accepted');
        setTimeout(() => {
            card.style.opacity = '0.5';
            card.style.transform = 'scale(0.95)';
        }, 200);
    }

    saveForLater(button) {
        const card = button.closest('.recommendation-card');
        const recId = card.dataset.recId;
        
        // Save to user's saved recommendations
        this.saveRecommendationForLater(recId);
        
        // Track action
        this.trackRecommendationAction('saved', recId);
        
        // Visual feedback
        button.textContent = 'Saved!';
        button.classList.add('saved');
        
        setTimeout(() => {
            button.textContent = 'Save for Later';
            button.classList.remove('saved');
        }, 2000);
    }

    dismissRecommendation(button) {
        const card = button.closest('.recommendation-card');
        const recId = card.dataset.recId;
        const action = card.dataset.action;
        
        // Track dismissal
        this.trackRecommendationAction('dismissed', recId, action);
        
        // Update ML model with negative feedback
        this.updateRecommendationEffectiveness(recId, 'dismissed');
        
        // Visual feedback and removal
        card.classList.add('dismissed');
        setTimeout(() => {
            card.style.height = '0';
            card.style.margin = '0';
            card.style.padding = '0';
            card.style.overflow = 'hidden';
            
            setTimeout(() => {
                card.remove();
                this.generateReplacementRecommendation(recId);
            }, 300);
        }, 200);
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-recommendations`);
        });
        
        // Track tab usage
        this.trackRecommendationAction('tab_switched', tabName);
    }

    async refreshRecommendations() {
        const refreshBtn = document.querySelector('.refresh-btn');
        refreshBtn.classList.add('spinning');
        
        try {
            // Reload user context
            await this.loadUserContext();
            
            // Generate fresh recommendations
            await this.generateRecommendations();
            
            // Update widget
            this.updateWidget();
            
            // Show success feedback
            this.showRefreshFeedback();
            
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
            this.showErrorFeedback('Failed to refresh recommendations');
        } finally {
            refreshBtn.classList.remove('spinning');
        }
    }

    updateWidget() {
        const container = document.querySelector('.recommendations-container');
        if (container) {
            container.innerHTML = this.renderRecommendationTabs();
        }
    }

    // Utility methods for ML and analytics
    rankRecommendations(recommendations, timeframe) {
        return recommendations.sort((a, b) => {
            // Multi-factor ranking algorithm
            const scoreA = this.calculateRecommendationScore(a, timeframe);
            const scoreB = this.calculateRecommendationScore(b, timeframe);
            return scoreB - scoreA;
        });
    }

    calculateRecommendationScore(rec, timeframe) {
        // Complex scoring algorithm considering multiple factors
        const weights = {
            immediate: { learning: 0.6, engagement: 0.3, effort: 0.1 },
            daily: { learning: 0.7, engagement: 0.2, effort: 0.1 },
            weekly: { learning: 0.8, engagement: 0.1, effort: 0.1 },
            longTerm: { learning: 0.9, engagement: 0.05, effort: 0.05 }
        };
        
        const w = weights[timeframe] || weights.daily;
        
        const effortPenalty = rec.effort === 'high' ? 0.8 : rec.effort === 'medium' ? 0.9 : 1.0;
        const contextBonus = rec.contextScore || 1.0;
        
        return (
            (rec.learningValue * w.learning) +
            (rec.engagementScore * w.engagement) +
            ((1 - (rec.effort === 'high' ? 0.8 : rec.effort === 'medium' ? 0.5 : 0.2)) * w.effort)
        ) * effortPenalty * contextBonus;
    }

    calculateContextualScore(rec) {
        let score = 1.0;
        
        // Time context
        if (this.userContext.timeContext.availableTime < 15 && rec.estimatedTime > 15) {
            score *= 0.5;
        }
        
        // Device context
        if (this.userContext.deviceContext.type === 'mobile' && rec.type === 'interactive_demo') {
            score *= 0.7;
        }
        
        // Energy level
        if (this.userContext.timeContext.energyLevel === 'low' && rec.effort === 'high') {
            score *= 0.6;
        }
        
        // Learning pattern alignment
        const patternAlignment = this.calculatePatternAlignment(rec);
        score *= patternAlignment;
        
        return Math.min(score, 2.0); // Cap at 2x boost
    }

    personalizeRecommendation(rec) {
        const userPrefs = this.userProfile.learningStyle || {};
        
        // Adjust description based on learning style
        if (userPrefs.visual && rec.type === 'skill_improvement') {
            rec.description += ' Includes interactive diagrams and visual examples.';
        }
        
        // Adjust time estimates based on user velocity
        const velocityMultiplier = this.userContext.learningPatterns.learningVelocity || 1.0;
        rec.estimatedTime = Math.round(parseInt(rec.estimatedTime) * velocityMultiplier) + ' min';
        
        return rec;
    }

    trackRecommendationAction(action, recId, additionalData = {}) {
        const event = {
            type: 'recommendation_action',
            action: action,
            recommendationId: recId,
            timestamp: Date.now(),
            userContext: this.userContext,
            additionalData: additionalData
        };
        
        // Store for ML training
        this.mlEngine.recordUserFeedback(event);
        
        // Analytics
        this.engagementTracker.trackEvent(event);
    }

    // Placeholder methods that would be implemented with actual ML/AI services
    loadUserProfile() {
        const stored = localStorage.getItem('systemcraft_user_profile');
        return stored ? JSON.parse(stored) : {
            goals: ['interview_prep'],
            experience: 'intermediate',
            learningStyle: { visual: true, pace: 'moderate' }
        };
    }

    loadLearningHistory() {
        const stored = localStorage.getItem('systemcraft_learning_history');
        return stored ? JSON.parse(stored) : {
            sessions: [],
            contentViewed: [],
            sessionTimes: [],
            contentPreferences: {},
            difficultyProgression: {},
            retentionRates: {}
        };
    }

    getDeviceType() {
        if (window.innerWidth <= 768) return 'mobile';
        if (window.innerWidth <= 1024) return 'tablet';
        return 'desktop';
    }

    calculateCurrentStreak() {
        // Simple streak calculation - in production would be more sophisticated
        const sessions = this.learningHistory.sessions || [];
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            
            const hasSession = sessions.some(s => 
                new Date(s.date).toDateString() === checkDate.toDateString()
            );
            
            if (hasSession) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    }
}

// Supporting Classes for ML and Context
class ContentDatabase {
    async getQuickPractice(skill) {
        // Mock implementation - would connect to real content database
        const practices = {
            algorithms: {
                description: 'Practice binary search with visual feedback',
                url: '/practice/binary-search'
            },
            data_structures: {
                description: 'Build a hash table step by step',
                url: '/practice/hash-tables'
            }
        };
        
        return practices[skill] || practices.algorithms;
    }

    async getMicroLearningContent(criteria) {
        // Mock micro-learning content
        return {
            title: '3-Minute Algorithm Insight',
            description: 'Quick overview of time complexity fundamentals',
            duration: Math.min(criteria.timeLimit, 5),
            url: '/micro/time-complexity'
        };
    }
}

class MachineLearningEngine {
    async assessSkillLevel(skill, data) {
        // Mock ML assessment - in production would use actual ML models
        return {
            level: Math.random() * 10,
            confidence: 0.8,
            trajectory: 'improving',
            nextMilestone: 'Advanced ' + skill,
            estimatedTime: Math.floor(Math.random() * 30) + 10
        };
    }

    async analyzeLearningPatterns(data) {
        // Mock pattern analysis
        return {
            optimalStudyTime: '19:00',
            preferredSessionLength: 45,
            effectiveContentTypes: ['interactive', 'visual'],
            learningVelocity: 1.2,
            retentionPattern: 'improving',
            motivationTriggers: ['challenges', 'progress_tracking']
        };
    }

    async generateDailyFocus(criteria) {
        // Mock daily focus generation
        const topics = ['Dynamic Programming', 'Graph Algorithms', 'System Design', 'Behavioral Prep'];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        return {
            topic: randomTopic,
            description: `Deep dive into ${randomTopic} with hands-on practice`,
            duration: criteria.availableTime || 60,
            url: '/focus/' + randomTopic.toLowerCase().replace(/\s+/g, '-'),
            modules: ['Theory', 'Examples', 'Practice', 'Assessment'],
            outcomes: [`Master ${randomTopic} fundamentals`, 'Solve 3 related problems']
        };
    }

    async generateWeeklyPlan(criteria) {
        return {
            theme: 'Algorithm Mastery Week',
            description: 'Focus on core algorithmic thinking patterns',
            totalTime: 300,
            dailyTasks: [
                'Monday: Sorting algorithms',
                'Tuesday: Search algorithms',
                'Wednesday: Dynamic programming',
                'Thursday: Graph algorithms',
                'Friday: Practice problems'
            ],
            expectedProgress: 'Complete 15 coding challenges, improve algorithm speed by 20%'
        };
    }

    async analyzeCareerTrajectory(criteria) {
        return {
            nextRole: 'Senior Software Engineer',
            description: 'Focus on system design and leadership skills',
            duration: 8,
            url: '/career-path/senior-engineer',
            skills: ['System Architecture', 'Team Leadership', 'Mentoring'],
            milestones: ['Lead a project', 'Design a scalable system', 'Mentor junior developers'],
            demand: 'high'
        };
    }

    recordUserFeedback(event) {
        // Store user feedback for model improvement
        const feedback = JSON.parse(localStorage.getItem('ml_feedback') || '[]');
        feedback.push(event);
        localStorage.setItem('ml_feedback', JSON.stringify(feedback));
    }
}

class ContextualEngine {
    // Contextual analysis and recommendations
}

class EngagementTracker {
    updateEngagement(metrics) {
        // Track user engagement patterns
        const engagement = JSON.parse(localStorage.getItem('engagement_data') || '[]');
        engagement.push({
            timestamp: Date.now(),
            ...metrics
        });
        localStorage.setItem('engagement_data', JSON.stringify(engagement));
    }

    trackEvent(event) {
        // Track specific events for analytics
        const events = JSON.parse(localStorage.getItem('user_events') || '[]');
        events.push(event);
        localStorage.setItem('user_events', JSON.stringify(events));
    }
}

// Styles for the recommendation widget
const recommendationStyles = `
<style>
.recommendations-widget {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    margin: 24px 0;
    overflow: hidden;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.widget-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.widget-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.title-icon {
    font-size: 1.5rem;
}

.widget-title h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.personalization-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    opacity: 0.8;
}

.indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.widget-controls {
    display: flex;
    gap: 8px;
}

.control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.refresh-btn.spinning .refresh-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.widget-content {
    padding: 20px;
    background: white;
    color: #333;
}

.recommendation-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    background: #f1f5f9;
    border-radius: 8px;
    padding: 4px;
}

.tab-btn {
    flex: 1;
    padding: 8px 16px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-btn.active {
    background: white;
    color: #667eea;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.recommendation-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    transition: all 0.2s ease;
    position: relative;
}

.recommendation-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.recommendation-card.high-priority {
    border-color: #f59e0b;
    box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.1);
}

.recommendation-card.accepted {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
}

.recommendation-card.dismissed {
    opacity: 0.5;
    transform: scale(0.95);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.rec-type-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #64748b;
}

.rec-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: #64748b;
}

.urgency-indicator {
    font-size: 1rem;
}

.rec-title {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
}

.rec-description {
    margin: 0 0 16px 0;
    color: #64748b;
    line-height: 1.4;
}

.expected-outcomes {
    margin-bottom: 16px;
}

.outcomes-label {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
}

.outcomes-list {
    margin: 4px 0 0 0;
    padding-left: 16px;
}

.outcomes-list li {
    font-size: 0.85rem;
    color: #475569;
    margin-bottom: 2px;
}

.rec-metrics {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
}

.metric {
    flex: 1;
}

.metric-label {
    font-size: 0.75rem;
    color: #64748b;
    display: block;
    margin-bottom: 4px;
}

.metric-bar {
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
}

.metric-fill {
    height: 100%;
    background: #667eea;
    transition: width 0.3s ease;
}

.metric-fill.engagement {
    background: #f59e0b;
}

.card-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.action-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid transparent;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn.primary {
    background: #667eea;
    color: white;
}

.action-btn.primary:hover {
    background: #5a67d8;
}

.action-btn.secondary {
    background: #f1f5f9;
    color: #475569;
}

.action-btn.secondary:hover {
    background: #e2e8f0;
}

.action-btn.minimal {
    background: transparent;
    color: #64748b;
    border-color: #e2e8f0;
}

.action-btn.minimal:hover {
    color: #475569;
    border-color: #cbd5e1;
}

.action-btn.saved {
    background: #10b981;
    color: white;
}

.progress-indicator {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
}

.progress-bar {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
}

.progress-fill {
    height: 100%;
    background: #10b981;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.75rem;
    color: #64748b;
}

.widget-footer {
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
}

.learning-streak {
    display: flex;
    align-items: center;
    gap: 6px;
}

.streak-icon {
    animation: flicker 2s infinite;
}

@keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.no-recommendations {
    text-align: center;
    padding: 40px 20px;
    color: #64748b;
}

.no-rec-icon {
    font-size: 2rem;
    margin-bottom: 12px;
}

.generate-more-btn {
    margin-top: 16px;
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .recommendations-widget {
        margin: 16px -16px;
        border-radius: 0;
    }
    
    .header-content {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
    
    .widget-controls {
        justify-content: center;
    }
    
    .rec-metrics {
        flex-direction: column;
        gap: 8px;
    }
    
    .card-actions {
        flex-direction: column;
    }
    
    .action-btn {
        text-align: center;
    }
}
</style>
`;

// Inject styles
if (!document.getElementById('recommendation-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'recommendation-styles';
    styleSheet.innerHTML = recommendationStyles;
    document.head.appendChild(styleSheet);
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other systems are initialized
    setTimeout(() => {
        window.smartRecommendations = new SmartRecommendationEngine();
    }, 1000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartRecommendationEngine;
}