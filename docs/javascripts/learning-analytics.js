/**
 * Learning Analytics Dashboard
 * Advanced analytics system for tracking learning progress and performance
 */

class LearningAnalytics {
    constructor() {
        this.charts = {};
        this.userData = this.loadUserData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.loadDashboard();
    }

    loadUserData() {
        // In a real implementation, this would load from a server
        const defaultData = {
            currentLevel: 3,
            totalXP: 2450,
            weeklyGoalXP: 500,
            studyStreak: 12,
            skillLevels: {
                systemDesign: 3.2,
                behavioral: 2.8,
                coding: 3.7,
                awsServices: 2.9,
                leadership: 3.1
            },
            weeklyProgress: [85, 92, 78, 94, 87, 91, 88],
            learningVelocity: 1.2,
            retentionRate: 0.82,
            interviewReadiness: 0.67,
            recentActivities: [
                { type: 'system-design', topic: 'Load Balancing', score: 4.2, timestamp: Date.now() - 3600000 },
                { type: 'behavioral', topic: 'Leadership Scenario', score: 3.8, timestamp: Date.now() - 7200000 },
                { type: 'coding', topic: 'Binary Trees', score: 4.5, timestamp: Date.now() - 10800000 }
            ]
        };

        const stored = localStorage.getItem('learningAnalytics');
        return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
    }

    saveUserData() {
        localStorage.setItem('learningAnalytics', JSON.stringify(this.userData));
    }

    setupEventListeners() {
        // Chart type selectors
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-selector')) {
                this.switchChart(e.target.dataset.chart);
            }
        });

        // Time range selectors
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('time-range-selector')) {
                this.updateTimeRange(e.target.value);
            }
        });
    }

    initializeCharts() {
        this.createSkillRadarChart();
        this.createProgressChart();
        this.createRetentionChart();
        this.createPerformanceChart();
    }

    createSkillRadarChart() {
        const canvas = document.getElementById('skillRadarChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const skills = Object.keys(this.userData.skillLevels);
        const values = Object.values(this.userData.skillLevels);
        const targets = skills.map(() => 4.0); // Target level for L6/L7

        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: skills.map(skill => this.formatSkillName(skill)),
                datasets: [{
                    label: 'Current Level',
                    data: values,
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(79, 70, 229, 1)'
                }, {
                    label: 'L6/L7 Target',
                    data: targets,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    borderDash: [5, 5],
                    pointBackgroundColor: 'rgba(16, 185, 129, 0.5)',
                    pointBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Skill Level Analysis'
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 3
                    }
                }
            }
        });
    }

    createProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weekly Progress (%)',
                    data: this.userData.weeklyProgress,
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Study Progress'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    createRetentionChart() {
        const canvas = document.getElementById('retentionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Simulated retention data over time
        const retentionData = [
            { day: 1, retention: 1.0 },
            { day: 3, retention: 0.85 },
            { day: 7, retention: 0.72 },
            { day: 14, retention: 0.68 },
            { day: 30, retention: 0.58 },
            { day: 60, retention: 0.52 },
            { day: 90, retention: 0.48 }
        ];

        this.charts.retention = new Chart(ctx, {
            type: 'line',
            data: {
                labels: retentionData.map(d => d.day + ' days'),
                datasets: [{
                    label: 'Knowledge Retention',
                    data: retentionData.map(d => d.retention * 100),
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Target Retention',
                    data: retentionData.map(() => 75),
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Knowledge Retention Curve'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Performance across different difficulty levels
        const performanceData = {
            easy: [4.5, 4.3, 4.6, 4.4, 4.7],
            medium: [3.8, 3.6, 3.9, 3.7, 4.0],
            hard: [2.9, 3.1, 3.0, 3.2, 3.3]
        };

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                datasets: [{
                    label: 'Easy',
                    data: performanceData.easy,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }, {
                    label: 'Medium',
                    data: performanceData.medium,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1
                }, {
                    label: 'Hard',
                    data: performanceData.hard,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance by Difficulty Level'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 0.5
                        }
                    }
                }
            }
        });
    }

    loadDashboard() {
        this.updateMetricsCards();
        this.updateProgressBars();
        this.updateRecentActivity();
        this.generateRecommendations();
    }

    updateMetricsCards() {
        const metrics = [
            { id: 'current-level', value: this.userData.currentLevel, suffix: '', change: '+1 this month', type: 'positive' },
            { id: 'total-xp', value: this.userData.totalXP.toLocaleString(), suffix: ' XP', change: '+340 this week', type: 'positive' },
            { id: 'study-streak', value: this.userData.studyStreak, suffix: ' days', change: 'Personal best!', type: 'positive' },
            { id: 'interview-readiness', value: Math.round(this.userData.interviewReadiness * 100), suffix: '%', change: '+8% this week', type: 'positive' }
        ];

        metrics.forEach(metric => {
            const element = document.getElementById(metric.id);
            if (element) {
                element.querySelector('.metric-value').textContent = metric.value + metric.suffix;
                const changeElement = element.querySelector('.metric-change');
                if (changeElement) {
                    changeElement.textContent = metric.change;
                    changeElement.className = `metric-change ${metric.type}`;
                }
            }
        });
    }

    updateProgressBars() {
        Object.entries(this.userData.skillLevels).forEach(([skill, level]) => {
            const progressBar = document.getElementById(`progress-${skill}`);
            if (progressBar) {
                const percentage = (level / 5) * 100;
                progressBar.querySelector('.progress-bar').style.width = percentage + '%';
                progressBar.querySelector('.progress-label span:last-child').textContent = level.toFixed(1) + '/5.0';
            }
        });
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activities');
        if (!activityContainer) return;

        const activityHTML = this.userData.recentActivities.map(activity => {
            const timeAgo = this.formatTimeAgo(activity.timestamp);
            const scoreColor = this.getScoreColor(activity.score);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon ${activity.type}">
                        ${this.getActivityIcon(activity.type)}
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.topic}</div>
                        <div class="activity-meta">${timeAgo} • ${activity.type.replace('-', ' ')}</div>
                    </div>
                    <div class="activity-score" style="color: ${scoreColor}">
                        ${activity.score.toFixed(1)}
                    </div>
                </div>
            `;
        }).join('');

        activityContainer.innerHTML = activityHTML;
    }

    generateRecommendations() {
        const recommendations = this.analyzePerformanceAndRecommend();
        const container = document.getElementById('recommendations');
        
        if (!container) return;

        const recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-card ${rec.priority}">
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-content">
                    <h4 class="recommendation-title">${rec.title}</h4>
                    <p class="recommendation-description">${rec.description}</p>
                    <div class="recommendation-actions">
                        <button class="btn-primary" onclick="learningAnalytics.applyRecommendation('${rec.id}')">
                            ${rec.actionText}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = recommendationsHTML;
    }

    analyzePerformanceAndRecommend() {
        const recommendations = [];
        const skills = this.userData.skillLevels;

        // Find weakest skill
        const weakestSkill = Object.entries(skills).reduce((min, [skill, level]) => 
            level < min.level ? { skill, level } : min, 
            { skill: null, level: 5 }
        );

        if (weakestSkill.level < 3.0) {
            recommendations.push({
                id: 'focus-weak-skill',
                priority: 'high',
                icon: '🎯',
                title: `Focus on ${this.formatSkillName(weakestSkill.skill)}`,
                description: `Your ${this.formatSkillName(weakestSkill.skill)} score is ${weakestSkill.level.toFixed(1)}/5.0. Dedicating extra time here could significantly improve your interview readiness.`,
                actionText: 'Create Study Plan'
            });
        }

        // Check interview readiness
        if (this.userData.interviewReadiness < 0.75) {
            recommendations.push({
                id: 'interview-prep',
                priority: 'high',
                icon: '📈',
                title: 'Accelerate Interview Preparation',
                description: 'Your current readiness score suggests you need more focused preparation. Consider intensive practice sessions.',
                actionText: 'Start Intensive Prep'
            });
        }

        // Check study consistency
        if (this.userData.studyStreak < 7) {
            recommendations.push({
                id: 'build-consistency',
                priority: 'medium',
                icon: '⚡',
                title: 'Build Study Consistency',
                description: 'Regular daily practice will help improve retention and build momentum.',
                actionText: 'Set Daily Goals'
            });
        }

        return recommendations;
    }

    applyRecommendation(recommendationId) {
        switch (recommendationId) {
            case 'focus-weak-skill':
                this.showWeakSkillPlan();
                break;
            case 'interview-prep':
                this.startIntensivePrep();
                break;
            case 'build-consistency':
                this.setupDailyGoals();
                break;
        }
    }

    showWeakSkillPlan() {
        // Implementation for showing detailed skill improvement plan
        alert('Creating personalized study plan for your weakest areas...');
    }

    startIntensivePrep() {
        // Implementation for intensive preparation mode
        alert('Starting intensive interview preparation mode...');
    }

    setupDailyGoals() {
        // Implementation for daily goal setting
        alert('Setting up daily study goals...');
    }

    formatSkillName(skill) {
        return skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    getScoreColor(score) {
        if (score >= 4.0) return '#10b981';
        if (score >= 3.5) return '#f59e0b';
        if (score >= 3.0) return '#ef4444';
        return '#6b7280';
    }

    getActivityIcon(type) {
        const icons = {
            'system-design': '🏗️',
            'behavioral': '👥',
            'coding': '💻',
            'aws-services': '☁️'
        };
        return icons[type] || '📚';
    }

    switchChart(chartType) {
        // Implementation for switching between different chart views
        console.log(`Switching to ${chartType} chart`);
    }

    updateTimeRange(range) {
        // Implementation for updating chart time ranges
        console.log(`Updating time range to ${range}`);
    }

    // Public API for updating user data
    updateUserProgress(activity) {
        this.userData.recentActivities.unshift(activity);
        if (this.userData.recentActivities.length > 10) {
            this.userData.recentActivities.pop();
        }
        this.saveUserData();
        this.loadDashboard();
    }

    updateSkillLevel(skill, newLevel) {
        this.userData.skillLevels[skill] = newLevel;
        this.saveUserData();
        this.loadDashboard();
    }
}

// Initialize the learning analytics system
let learningAnalytics;

document.addEventListener('DOMContentLoaded', function() {
    learningAnalytics = new LearningAnalytics();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningAnalytics;
}