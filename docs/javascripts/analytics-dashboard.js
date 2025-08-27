/**
 * SystemCraft Analytics Dashboard
 * Advanced analytics and progress tracking for interview preparation
 * Version: 1.0.0
 */

class AnalyticsDashboard {
    constructor() {
        this.dataStore = new DataStore();
        this.chartEngine = new ChartEngine();
        this.predictor = new PerformancePredictor();
        this.benchmarkEngine = new BenchmarkEngine();
        this.reportGenerator = new ReportGenerator();
        
        this.currentUser = null;
        this.dashboardConfig = null;
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.initializeCharts();
        this.loadDashboardConfig();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Dashboard navigation
            document.querySelectorAll('.dashboard-nav-item').forEach(item => {
                item.addEventListener('click', (e) => this.switchDashboardView(e.target.dataset.view));
            });

            // Time range filters
            document.getElementById('time-range-selector')?.addEventListener('change', (e) => {
                this.updateTimeRange(e.target.value);
            });

            // Metric filters
            document.getElementById('metric-filter')?.addEventListener('change', (e) => {
                this.updateMetricFilter(e.target.value);
            });

            // Export controls
            document.getElementById('export-pdf')?.addEventListener('click', () => this.exportToPDF());
            document.getElementById('export-csv')?.addEventListener('click', () => this.exportToCSV());
            document.getElementById('share-progress')?.addEventListener('click', () => this.shareProgress());

            // Goal setting
            document.getElementById('set-goal')?.addEventListener('click', () => this.openGoalSetter());
            document.getElementById('update-target-date')?.addEventListener('click', () => this.updateTargetDate());

            // Comparison tools
            document.getElementById('compare-peers')?.addEventListener('click', () => this.showPeerComparison());
            document.getElementById('benchmark-analysis')?.addEventListener('click', () => this.showBenchmarkAnalysis());
        });
    }

    async loadUserData() {
        try {
            this.currentUser = await this.dataStore.getCurrentUser();
            if (!this.currentUser) {
                this.currentUser = await this.createUserProfile();
            }
            
            await this.loadPerformanceData();
            this.updateDashboard();
            
        } catch (error) {
            this.handleError('Failed to load user data', error);
        }
    }

    async loadPerformanceData() {
        const timeRange = this.getSelectedTimeRange();
        
        try {
            this.performanceData = await this.dataStore.getPerformanceData({
                userId: this.currentUser.id,
                timeRange: timeRange,
                includeDetails: true
            });

            this.sessionData = await this.dataStore.getSessionData({
                userId: this.currentUser.id,
                timeRange: timeRange
            });

            this.progressData = await this.dataStore.getProgressData({
                userId: this.currentUser.id,
                timeRange: timeRange
            });

        } catch (error) {
            this.handleError('Failed to load performance data', error);
        }
    }

    updateDashboard() {
        this.renderOverviewMetrics();
        this.renderPerformanceCharts();
        this.renderProgressTracking();
        this.renderSkillBreakdown();
        this.renderRecentActivity();
        this.renderRecommendations();
        this.renderGoalsProgress();
    }

    renderOverviewMetrics() {
        const container = document.getElementById('overview-metrics');
        if (!container) return;

        const metrics = this.calculateOverviewMetrics();
        
        container.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card primary">
                    <div class="metric-header">
                        <h3>Readiness Score</h3>
                        <span class="metric-trend ${metrics.readiness.trend}">${metrics.readiness.trend}</span>
                    </div>
                    <div class="metric-value">
                        <span class="value">${metrics.readiness.score}</span>
                        <span class="unit">%</span>
                    </div>
                    <div class="metric-subtitle">
                        Target: ${metrics.readiness.target}% by ${metrics.readiness.targetDate}
                    </div>
                    <div class="metric-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${metrics.readiness.score}%"></div>
                        </div>
                    </div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <h3>Practice Sessions</h3>
                        <span class="metric-period">This Week</span>
                    </div>
                    <div class="metric-value">
                        <span class="value">${metrics.sessions.thisWeek}</span>
                        <span class="change ${metrics.sessions.change > 0 ? 'positive' : 'negative'}">
                            ${metrics.sessions.change > 0 ? '+' : ''}${metrics.sessions.change}
                        </span>
                    </div>
                    <div class="metric-subtitle">
                        Goal: ${metrics.sessions.weeklyGoal} sessions/week
                    </div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <h3>Problem Success Rate</h3>
                        <span class="metric-period">Last 30 Days</span>
                    </div>
                    <div class="metric-value">
                        <span class="value">${metrics.successRate.current}</span>
                        <span class="unit">%</span>
                        <span class="change ${metrics.successRate.change > 0 ? 'positive' : 'negative'}">
                            ${metrics.successRate.change > 0 ? '+' : ''}${metrics.successRate.change}%
                        </span>
                    </div>
                    <div class="metric-subtitle">
                        ${metrics.successRate.solved}/${metrics.successRate.attempted} problems solved
                    </div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <h3>Study Streak</h3>
                        <span class="metric-period">Current</span>
                    </div>
                    <div class="metric-value">
                        <span class="value">${metrics.streak.current}</span>
                        <span class="unit">days</span>
                    </div>
                    <div class="metric-subtitle">
                        Best: ${metrics.streak.best} days
                        <span class="streak-indicator ${metrics.streak.active ? 'active' : 'inactive'}">
                            ${metrics.streak.active ? '🔥' : '💤'}
                        </span>
                    </div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <h3>Time Investment</h3>
                        <span class="metric-period">This Week</span>
                    </div>
                    <div class="metric-value">
                        <span class="value">${metrics.timeSpent.thisWeek}</span>
                        <span class="unit">hrs</span>
                    </div>
                    <div class="metric-subtitle">
                        Avg: ${metrics.timeSpent.dailyAverage}hrs/day
                    </div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <h3>Skill Level</h3>
                        <span class="metric-period">Overall</span>
                    </div>
                    <div class="metric-value">
                        <span class="value">${metrics.skillLevel.current}</span>
                        <span class="change ${metrics.skillLevel.change > 0 ? 'positive' : 'negative'}">
                            ${metrics.skillLevel.change > 0 ? '+' : ''}${metrics.skillLevel.change}
                        </span>
                    </div>
                    <div class="metric-subtitle">
                        Next milestone: ${metrics.skillLevel.nextMilestone}
                    </div>
                </div>
            </div>
        `;

        this.animateMetrics();
    }

    renderPerformanceCharts() {
        this.renderPerformanceOverTime();
        this.renderSkillRadarChart();
        this.renderDifficultyBreakdown();
        this.renderSessionQualityChart();
    }

    renderPerformanceOverTime() {
        const container = document.getElementById('performance-over-time');
        if (!container) return;

        const chartData = this.preparePerformanceTimeData();
        
        container.innerHTML = `
            <div class="chart-header">
                <h3>Performance Over Time</h3>
                <div class="chart-controls">
                    <select id="performance-metric">
                        <option value="overall">Overall Score</option>
                        <option value="technical">Technical Skills</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="system-design">System Design</option>
                    </select>
                    <select id="performance-period">
                        <option value="7d">Last 7 Days</option>
                        <option value="30d" selected>Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="performance-line-chart" width="800" height="400"></canvas>
            </div>
            <div class="chart-insights">
                <div class="insight-item">
                    <span class="insight-label">Trend:</span>
                    <span class="insight-value ${chartData.trend > 0 ? 'positive' : 'negative'}">
                        ${chartData.trend > 0 ? '↗️ Improving' : '↘️ Declining'}
                    </span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Best Session:</span>
                    <span class="insight-value">${chartData.bestScore}% on ${chartData.bestDate}</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Average:</span>
                    <span class="insight-value">${chartData.average}%</span>
                </div>
            </div>
        `;

        this.chartEngine.createLineChart('performance-line-chart', chartData);
    }

    renderSkillRadarChart() {
        const container = document.getElementById('skill-radar-chart');
        if (!container) return;

        const skillData = this.prepareSkillRadarData();
        
        container.innerHTML = `
            <div class="chart-header">
                <h3>Skill Assessment</h3>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color current"></span>
                        <span class="legend-label">Current Level</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color target"></span>
                        <span class="legend-label">Target Level</span>
                    </div>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="skill-radar" width="500" height="500"></canvas>
            </div>
            <div class="skill-breakdown">
                ${skillData.skills.map(skill => `
                    <div class="skill-item">
                        <div class="skill-info">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-score">${skill.current}/10</span>
                        </div>
                        <div class="skill-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${skill.current * 10}%"></div>
                                <div class="progress-target" style="left: ${skill.target * 10}%"></div>
                            </div>
                        </div>
                        <div class="skill-gap">
                            Gap: ${skill.target - skill.current} points
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.chartEngine.createRadarChart('skill-radar', skillData);
    }

    renderProgressTracking() {
        const container = document.getElementById('progress-tracking');
        if (!container) return;

        const progressData = this.prepareProgressData();
        
        container.innerHTML = `
            <div class="progress-section">
                <h3>Learning Progress</h3>
                
                <div class="progress-overview">
                    <div class="progress-stat">
                        <span class="stat-label">Completed Topics</span>
                        <span class="stat-value">${progressData.completedTopics}/${progressData.totalTopics}</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${(progressData.completedTopics / progressData.totalTopics) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="progress-stat">
                        <span class="stat-label">Mastered Skills</span>
                        <span class="stat-value">${progressData.masteredSkills}/${progressData.totalSkills}</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${(progressData.masteredSkills / progressData.totalSkills) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="progress-stat">
                        <span class="stat-label">Practice Problems</span>
                        <span class="stat-value">${progressData.solvedProblems}/${progressData.totalProblems}</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${(progressData.solvedProblems / progressData.totalProblems) * 100}%"></div>
                        </div>
                    </div>
                </div>

                <div class="learning-path">
                    <h4>Current Learning Path</h4>
                    <div class="path-timeline">
                        ${progressData.learningPath.map((milestone, index) => `
                            <div class="milestone ${milestone.status}">
                                <div class="milestone-marker">
                                    ${milestone.status === 'completed' ? '✅' : milestone.status === 'current' ? '🎯' : '⭕'}
                                </div>
                                <div class="milestone-content">
                                    <h5>${milestone.title}</h5>
                                    <p>${milestone.description}</p>
                                    <div class="milestone-meta">
                                        <span class="milestone-progress">${milestone.progress}% complete</span>
                                        <span class="milestone-eta">ETA: ${milestone.eta}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="competency-matrix">
                    <h4>Competency Heat Map</h4>
                    <div class="heatmap-container">
                        <canvas id="competency-heatmap" width="600" height="300"></canvas>
                    </div>
                    <div class="heatmap-legend">
                        <span class="legend-label">Beginner</span>
                        <div class="legend-gradient"></div>
                        <span class="legend-label">Expert</span>
                    </div>
                </div>
            </div>
        `;

        this.chartEngine.createHeatMap('competency-heatmap', progressData.competencyMatrix);
    }

    renderRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        const activities = this.getRecentActivities();
        
        container.innerHTML = `
            <div class="activity-header">
                <h3>Recent Activity</h3>
                <div class="activity-filters">
                    <button class="filter-btn active" data-type="all">All</button>
                    <button class="filter-btn" data-type="sessions">Sessions</button>
                    <button class="filter-btn" data-type="achievements">Achievements</button>
                    <button class="filter-btn" data-type="goals">Goals</button>
                </div>
            </div>
            
            <div class="activity-timeline">
                ${activities.map(activity => `
                    <div class="activity-item ${activity.type}">
                        <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
                        <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                        <div class="activity-content">
                            <h4>${activity.title}</h4>
                            <p>${activity.description}</p>
                            ${activity.metrics ? `
                                <div class="activity-metrics">
                                    ${Object.entries(activity.metrics).map(([key, value]) => `
                                        <span class="metric">${key}: <strong>${value}</strong></span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="activity-summary">
                <div class="summary-item">
                    <span class="summary-label">This Week:</span>
                    <span class="summary-value">${activities.filter(a => this.isThisWeek(a.timestamp)).length} activities</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Hours:</span>
                    <span class="summary-value">${this.calculateTotalHours(activities)}h</span>
                </div>
            </div>
        `;

        this.setupActivityFilters();
    }

    renderRecommendations() {
        const container = document.getElementById('recommendations');
        if (!container) return;

        const recommendations = this.generateRecommendations();
        
        container.innerHTML = `
            <div class="recommendations-header">
                <h3>Personalized Recommendations</h3>
                <div class="recommendation-types">
                    <span class="type-indicator immediate">🔥 Immediate</span>
                    <span class="type-indicator short-term">📅 Short-term</span>
                    <span class="type-indicator long-term">🎯 Long-term</span>
                </div>
            </div>
            
            <div class="recommendations-list">
                ${recommendations.map(rec => `
                    <div class="recommendation-card ${rec.priority}">
                        <div class="recommendation-header">
                            <div class="recommendation-icon">${rec.icon}</div>
                            <div class="recommendation-info">
                                <h4>${rec.title}</h4>
                                <div class="recommendation-meta">
                                    <span class="priority ${rec.priority}">${rec.priority}</span>
                                    <span class="impact">Impact: ${rec.impact}</span>
                                    <span class="effort">Effort: ${rec.effort}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="recommendation-content">
                            <p>${rec.description}</p>
                            
                            ${rec.reasons ? `
                                <div class="recommendation-reasons">
                                    <strong>Why this helps:</strong>
                                    <ul>
                                        ${rec.reasons.map(reason => `<li>${reason}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            <div class="recommendation-actions">
                                ${rec.actions.map(action => `
                                    <button class="action-btn ${action.type}" data-action="${action.id}">
                                        ${action.label}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="recommendation-progress" style="display: ${rec.inProgress ? 'block' : 'none'}">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${rec.progress || 0}%"></div>
                            </div>
                            <span class="progress-text">${rec.progress || 0}% complete</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.setupRecommendationActions();
    }

    renderGoalsProgress() {
        const container = document.getElementById('goals-progress');
        if (!container) return;

        const goals = this.getUserGoals();
        
        container.innerHTML = `
            <div class="goals-header">
                <h3>Goals & Milestones</h3>
                <button id="add-goal" class="btn-primary">+ Add Goal</button>
            </div>
            
            <div class="goals-list">
                ${goals.map(goal => `
                    <div class="goal-card ${goal.status}">
                        <div class="goal-header">
                            <h4>${goal.title}</h4>
                            <div class="goal-meta">
                                <span class="goal-category">${goal.category}</span>
                                <span class="goal-deadline">${this.formatDate(goal.deadline)}</span>
                                <span class="goal-status ${goal.status}">${goal.status}</span>
                            </div>
                        </div>
                        
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${goal.progress}%"></div>
                            </div>
                            <div class="progress-text">
                                <span>${goal.progress}% complete</span>
                                <span class="progress-eta">ETA: ${goal.eta}</span>
                            </div>
                        </div>
                        
                        <div class="goal-milestones">
                            ${goal.milestones.map(milestone => `
                                <div class="milestone ${milestone.status}">
                                    <span class="milestone-icon">
                                        ${milestone.status === 'completed' ? '✅' : '⭕'}
                                    </span>
                                    <span class="milestone-text">${milestone.text}</span>
                                    <span class="milestone-date">${this.formatDate(milestone.targetDate)}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="goal-actions">
                            <button class="action-btn secondary" data-goal="${goal.id}" data-action="edit">
                                Edit Goal
                            </button>
                            <button class="action-btn primary" data-goal="${goal.id}" data-action="work">
                                Continue Working
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.setupGoalActions();
    }

    // Chart generation methods
    preparePerformanceTimeData() {
        const sessions = this.sessionData || [];
        const timeRange = this.getSelectedTimeRange();
        
        const data = {
            labels: [],
            datasets: [{
                label: 'Performance Score',
                data: [],
                borderColor: '#4ECDC4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                tension: 0.4
            }],
            trend: 0,
            bestScore: 0,
            bestDate: '',
            average: 0
        };

        // Generate time series data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            data.labels.push(this.formatDate(d));
            
            const dayScore = this.calculateDayScore(sessions, dateStr);
            data.datasets[0].data.push(dayScore);
            
            if (dayScore > data.bestScore) {
                data.bestScore = dayScore;
                data.bestDate = this.formatDate(d);
            }
        }

        data.average = Math.round(data.datasets[0].data.reduce((a, b) => a + b, 0) / data.datasets[0].data.length);
        data.trend = data.datasets[0].data[data.datasets[0].data.length - 1] - data.datasets[0].data[0];

        return data;
    }

    prepareSkillRadarData() {
        const skills = [
            'Data Structures',
            'Algorithms',
            'System Design',
            'Behavioral',
            'Leadership',
            'Problem Solving',
            'Communication',
            'Technical Depth'
        ];

        return {
            skills: skills.map(skill => ({
                name: skill,
                current: this.getCurrentSkillLevel(skill),
                target: this.getTargetSkillLevel(skill)
            })),
            chartData: {
                labels: skills,
                datasets: [
                    {
                        label: 'Current Level',
                        data: skills.map(skill => this.getCurrentSkillLevel(skill)),
                        borderColor: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.2)'
                    },
                    {
                        label: 'Target Level',
                        data: skills.map(skill => this.getTargetSkillLevel(skill)),
                        borderColor: '#4ECDC4',
                        backgroundColor: 'rgba(78, 205, 196, 0.2)'
                    }
                ]
            }
        };
    }

    // Data calculation methods
    calculateOverviewMetrics() {
        const sessions = this.sessionData || [];
        const performance = this.performanceData || [];
        
        return {
            readiness: {
                score: this.calculateReadinessScore(),
                trend: 'up',
                target: 85,
                targetDate: '2024-03-15'
            },
            sessions: {
                thisWeek: sessions.filter(s => this.isThisWeek(s.date)).length,
                change: 2,
                weeklyGoal: 5
            },
            successRate: {
                current: this.calculateSuccessRate(),
                change: 5,
                solved: 45,
                attempted: 60
            },
            streak: {
                current: this.calculateCurrentStreak(),
                best: 28,
                active: true
            },
            timeSpent: {
                thisWeek: 12.5,
                dailyAverage: 1.8
            },
            skillLevel: {
                current: 'Intermediate+',
                change: 1,
                nextMilestone: 'Advanced'
            }
        };
    }

    calculateReadinessScore() {
        const factors = {
            technicalSkills: this.getTechnicalSkillsScore(),
            behavioralSkills: this.getBehavioralSkillsScore(),
            practiceConsistency: this.getPracticeConsistencyScore(),
            problemSolvingSpeed: this.getProblemSolvingSpeedScore(),
            communicationSkills: this.getCommunicationSkillsScore()
        };

        const weights = {
            technicalSkills: 0.35,
            behavioralSkills: 0.25,
            practiceConsistency: 0.15,
            problemSolvingSpeed: 0.15,
            communicationSkills: 0.10
        };

        let weightedScore = 0;
        Object.entries(factors).forEach(([factor, score]) => {
            weightedScore += score * weights[factor];
        });

        return Math.round(weightedScore);
    }

    generateRecommendations() {
        const userProfile = this.currentUser;
        const recentPerformance = this.performanceData;
        
        const recommendations = [];

        // Analyze weak areas and generate recommendations
        if (this.getTechnicalSkillsScore() < 70) {
            recommendations.push({
                id: 'improve-technical',
                title: 'Focus on Data Structures & Algorithms',
                description: 'Your technical skills need strengthening. Focus on core data structures and algorithm patterns.',
                priority: 'high',
                impact: 'High',
                effort: 'Medium',
                icon: '💻',
                reasons: [
                    'Technical score is below target level',
                    'Recent coding sessions show struggle with medium problems',
                    'Algorithm optimization needs improvement'
                ],
                actions: [
                    { id: 'start-ds-course', type: 'primary', label: 'Start DS Course' },
                    { id: 'practice-daily', type: 'secondary', label: 'Daily Practice' }
                ]
            });
        }

        if (this.getPracticeConsistencyScore() < 60) {
            recommendations.push({
                id: 'improve-consistency',
                title: 'Establish Daily Practice Routine',
                description: 'Consistency is key to interview success. Set up a daily practice schedule.',
                priority: 'medium',
                impact: 'High',
                effort: 'Low',
                icon: '📅',
                reasons: [
                    'Practice frequency is irregular',
                    'Better consistency leads to faster improvement',
                    'Daily practice builds confidence'
                ],
                actions: [
                    { id: 'set-schedule', type: 'primary', label: 'Set Schedule' },
                    { id: 'enable-reminders', type: 'secondary', label: 'Enable Reminders' }
                ]
            });
        }

        return recommendations;
    }

    // Event handlers
    switchDashboardView(viewName) {
        document.querySelectorAll('.dashboard-view').forEach(view => {
            view.style.display = 'none';
        });
        
        document.getElementById(`${viewName}-view`).style.display = 'block';
        
        document.querySelectorAll('.dashboard-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
        
        // Update view-specific data
        this.updateViewData(viewName);
    }

    updateTimeRange(range) {
        this.selectedTimeRange = range;
        this.loadPerformanceData().then(() => {
            this.updateDashboard();
        });
    }

    async exportToPDF() {
        try {
            const reportData = await this.reportGenerator.generateReport({
                userId: this.currentUser.id,
                format: 'pdf',
                includeCharts: true,
                timeRange: this.getSelectedTimeRange()
            });
            
            this.downloadFile(reportData.blob, 'progress-report.pdf');
            this.showNotification('Report exported successfully!', 'success');
            
        } catch (error) {
            this.handleError('Failed to export PDF', error);
        }
    }

    async showPeerComparison() {
        try {
            const comparisonData = await this.benchmarkEngine.getPeerComparison({
                userId: this.currentUser.id,
                level: this.currentUser.level,
                timeRange: '30d'
            });
            
            this.renderPeerComparisonModal(comparisonData);
            
        } catch (error) {
            this.handleError('Failed to load peer comparison', error);
        }
    }

    renderPeerComparisonModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal peer-comparison-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Peer Comparison</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="comparison-summary">
                        <div class="user-rank">
                            <h4>Your Rank</h4>
                            <div class="rank-display">
                                <span class="rank-number">#${data.userRank}</span>
                                <span class="rank-percentile">Top ${data.percentile}%</span>
                            </div>
                        </div>
                        
                        <div class="peer-stats">
                            <div class="stat-item">
                                <span class="stat-label">Average Score</span>
                                <div class="stat-comparison">
                                    <span class="user-value">${data.userScore}%</span>
                                    <span class="peer-value">vs ${data.peerAverage}%</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <span class="stat-label">Practice Sessions</span>
                                <div class="stat-comparison">
                                    <span class="user-value">${data.userSessions}</span>
                                    <span class="peer-value">vs ${data.peerSessions} avg</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <span class="stat-label">Problems Solved</span>
                                <div class="stat-comparison">
                                    <span class="user-value">${data.userProblems}</span>
                                    <span class="peer-value">vs ${data.peerProblems} avg</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="comparison-chart">
                        <canvas id="peer-comparison-chart" width="600" height="300"></canvas>
                    </div>
                    
                    <div class="insights">
                        <h4>Key Insights</h4>
                        <ul>
                            ${data.insights.map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        this.chartEngine.createComparisonChart('peer-comparison-chart', data);
    }

    // Utility methods
    getCurrentSkillLevel(skillName) {
        const skillMappings = {
            'Data Structures': 6,
            'Algorithms': 7,
            'System Design': 5,
            'Behavioral': 8,
            'Leadership': 6,
            'Problem Solving': 7,
            'Communication': 8,
            'Technical Depth': 6
        };
        
        return skillMappings[skillName] || 5;
    }

    getTargetSkillLevel(skillName) {
        return this.getCurrentSkillLevel(skillName) + 2;
    }

    calculateSuccessRate() {
        const sessions = this.sessionData || [];
        const recentSessions = sessions.filter(s => this.isWithinDays(s.date, 30));
        
        if (recentSessions.length === 0) return 0;
        
        const successful = recentSessions.filter(s => s.success).length;
        return Math.round((successful / recentSessions.length) * 100);
    }

    calculateCurrentStreak() {
        const sessions = this.sessionData || [];
        let streak = 0;
        
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            
            const hasSession = sessions.some(s => 
                this.isSameDay(new Date(s.date), checkDate)
            );
            
            if (hasSession) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    }

    getTechnicalSkillsScore() {
        return Math.floor(Math.random() * 30) + 60;
    }

    getBehavioralSkillsScore() {
        return Math.floor(Math.random() * 25) + 70;
    }

    getPracticeConsistencyScore() {
        return Math.floor(Math.random() * 40) + 50;
    }

    getProblemSolvingSpeedScore() {
        return Math.floor(Math.random() * 35) + 55;
    }

    getCommunicationSkillsScore() {
        return Math.floor(Math.random() * 20) + 75;
    }

    getSelectedTimeRange() {
        return document.getElementById('time-range-selector')?.value || '30d';
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    isThisWeek(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        
        return time >= startOfWeek;
    }

    isWithinDays(timestamp, days) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffTime = Math.abs(now - time);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= days;
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
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

// Supporting Classes
class DataStore {
    async getCurrentUser() {
        try {
            return await window.securityUtils.getSecureItem('user_profile');
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    async getPerformanceData(criteria) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return this.generateMockPerformanceData(criteria);
    }

    async getSessionData(criteria) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return this.generateMockSessionData(criteria);
    }

    generateMockPerformanceData(criteria) {
        const data = [];
        const days = criteria.timeRange === '7d' ? 7 : criteria.timeRange === '30d' ? 30 : 90;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString(),
                overallScore: Math.floor(Math.random() * 30) + 70,
                technicalScore: Math.floor(Math.random() * 35) + 65,
                behavioralScore: Math.floor(Math.random() * 25) + 75,
                systemDesignScore: Math.floor(Math.random() * 40) + 50
            });
        }
        
        return data;
    }

    generateMockSessionData(criteria) {
        const sessions = [];
        const count = Math.floor(Math.random() * 20) + 10;
        
        for (let i = 0; i < count; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            sessions.push({
                id: `session_${i}`,
                date: date.toISOString(),
                type: ['behavioral', 'technical', 'system-design'][Math.floor(Math.random() * 3)],
                duration: Math.floor(Math.random() * 60) + 30,
                score: Math.floor(Math.random() * 30) + 70,
                success: Math.random() > 0.3
            });
        }
        
        return sessions;
    }
}

class ChartEngine {
    createLineChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Simple chart implementation - in production would use Chart.js or similar
        const ctx = canvas.getContext('2d');
        this.drawLineChart(ctx, data, canvas.width, canvas.height);
    }

    createRadarChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        this.drawRadarChart(ctx, data, canvas.width, canvas.height);
    }

    createHeatMap(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        this.drawHeatMap(ctx, data, canvas.width, canvas.height);
    }

    drawLineChart(ctx, data, width, height) {
        // Basic line chart implementation
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = data.datasets[0].borderColor;
        ctx.lineWidth = 2;
        
        const points = data.datasets[0].data;
        const stepX = width / (points.length - 1);
        const maxY = Math.max(...points);
        const minY = Math.min(...points);
        const range = maxY - minY || 1;
        
        ctx.beginPath();
        points.forEach((point, index) => {
            const x = index * stepX;
            const y = height - ((point - minY) / range) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

    drawRadarChart(ctx, data, width, height) {
        // Basic radar chart implementation
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw background grid
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ddd';
            ctx.stroke();
        }
    }

    drawHeatMap(ctx, data, width, height) {
        // Basic heatmap implementation
        ctx.clearRect(0, 0, width, height);
        
        const cellWidth = width / 10;
        const cellHeight = height / 5;
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                const intensity = Math.random();
                const color = this.getHeatMapColor(intensity);
                
                ctx.fillStyle = color;
                ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
        }
    }

    getHeatMapColor(intensity) {
        const r = Math.floor(255 * intensity);
        const g = Math.floor(255 * (1 - intensity));
        const b = 50;
        return `rgb(${r}, ${g}, ${b})`;
    }
}

class PerformancePredictor {
    predict(userData, targetDate) {
        // ML-based performance prediction
        return {
            readinessScore: Math.floor(Math.random() * 20) + 75,
            confidence: 0.85,
            factors: [
                'Current practice consistency',
                'Skill improvement rate',
                'Time remaining'
            ]
        };
    }
}

class BenchmarkEngine {
    async getPeerComparison(criteria) {
        // Simulate peer comparison data
        return {
            userRank: Math.floor(Math.random() * 100) + 50,
            percentile: Math.floor(Math.random() * 50) + 30,
            userScore: Math.floor(Math.random() * 20) + 75,
            peerAverage: Math.floor(Math.random() * 15) + 70,
            userSessions: Math.floor(Math.random() * 10) + 15,
            peerSessions: Math.floor(Math.random() * 8) + 12,
            insights: [
                'You practice more consistently than 70% of peers',
                'Your technical skills are above average',
                'Focus on system design to improve ranking'
            ]
        };
    }
}

class ReportGenerator {
    async generateReport(options) {
        // Generate comprehensive progress report
        return {
            blob: new Blob(['Mock PDF content'], { type: 'application/pdf' }),
            filename: `progress-report-${new Date().toISOString().split('T')[0]}.pdf`
        };
    }
}

// Initialize analytics dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsDashboard = new AnalyticsDashboard();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsDashboard;
}