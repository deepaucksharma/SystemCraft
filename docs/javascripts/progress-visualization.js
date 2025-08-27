/**
 * Enhanced Progress Visualization System
 * Animated dashboards, milestone celebrations, and gamified progress tracking
 * Implements 2025 UX trends for dopamine-driven engagement
 */

class ProgressVisualizationSystem {
    constructor() {
        this.progressData = this.loadProgressData();
        this.achievements = this.loadAchievements();
        this.streaks = this.loadStreaks();
        this.milestones = this.loadMilestones();
        this.animations = new AnimationEngine();
        this.celebrations = new CelebrationEngine();
        this.soundEngine = new SoundEngine();
        
        this.currentLevel = this.calculateCurrentLevel();
        this.totalXP = this.calculateTotalXP();
        this.dailyGoals = this.loadDailyGoals();
        
        this.init();
    }

    init() {
        this.createProgressDashboard();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.checkForCelebrations();
        this.initializeProgressTracking();
    }

    createProgressDashboard() {
        const dashboard = this.buildDashboardHTML();
        this.injectDashboard(dashboard);
        this.initializeAnimations();
    }

    buildDashboardHTML() {
        return `
            <div id="progress-dashboard" class="progress-dashboard">
                <div class="dashboard-header">
                    <div class="level-indicator">
                        <div class="level-avatar">
                            <div class="avatar-ring">
                                <svg class="level-progress-ring" width="80" height="80">
                                    <circle cx="40" cy="40" r="35" stroke-width="6" stroke="#e5e7eb" fill="none"/>
                                    <circle cx="40" cy="40" r="35" stroke-width="6" stroke="url(#levelGradient)" 
                                            fill="none" class="progress-stroke" stroke-dasharray="220" stroke-dashoffset="220"/>
                                </svg>
                                <div class="avatar-content">
                                    <span class="level-number">${this.currentLevel}</span>
                                    <span class="level-label">Level</span>
                                </div>
                            </div>
                        </div>
                        <div class="level-info">
                            <h2 class="user-title">${this.getUserTitle()}</h2>
                            <div class="xp-bar">
                                <div class="xp-progress">
                                    <div class="xp-fill" style="width: 0%"></div>
                                    <div class="xp-sparkles"></div>
                                </div>
                                <div class="xp-text">
                                    <span class="current-xp">${this.getCurrentLevelXP()}</span> / 
                                    <span class="next-level-xp">${this.getNextLevelXP()}</span> XP
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="streak-indicator">
                        <div class="streak-fire ${this.getStreakStatus()}">
                            <div class="fire-emoji">🔥</div>
                            <div class="streak-count">${this.streaks.current}</div>
                        </div>
                        <div class="streak-text">
                            <div class="streak-title">Study Streak</div>
                            <div class="streak-subtitle">${this.getStreakMessage()}</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <div class="stats-grid">
                        ${this.buildStatsGrid()}
                    </div>
                    
                    <div class="progress-sections">
                        <div class="section daily-progress">
                            <h3>Today's Goals</h3>
                            <div class="daily-goals">
                                ${this.buildDailyGoals()}
                            </div>
                        </div>
                        
                        <div class="section skill-progress">
                            <h3>Skill Development</h3>
                            <div class="skill-bars">
                                ${this.buildSkillBars()}
                            </div>
                        </div>
                        
                        <div class="section achievement-showcase">
                            <h3>Recent Achievements</h3>
                            <div class="achievement-gallery">
                                ${this.buildAchievementGallery()}
                            </div>
                        </div>
                        
                        <div class="section milestone-tracker">
                            <h3>Milestone Progress</h3>
                            <div class="milestone-timeline">
                                ${this.buildMilestoneTimeline()}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="celebration-overlay" id="celebration-overlay" style="display: none;">
                    <div class="celebration-content">
                        <!-- Dynamic celebration content -->
                    </div>
                </div>
            </div>
            
            <!-- SVG Definitions -->
            <svg width="0" height="0" style="position: absolute;">
                <defs>
                    <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#667eea"/>
                        <stop offset="100%" style="stop-color:#764ba2"/>
                    </linearGradient>
                    <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#f093fb"/>
                        <stop offset="100%" style="stop-color:#f5576c"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
    }

    buildStatsGrid() {
        const stats = this.calculateStats();
        
        return `
            <div class="stat-card sessions">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                    <div class="stat-number" data-count="${stats.totalSessions}">${stats.totalSessions}</div>
                    <div class="stat-label">Study Sessions</div>
                    <div class="stat-change positive">+${stats.sessionsThisWeek} this week</div>
                </div>
            </div>
            
            <div class="stat-card problems">
                <div class="stat-icon">🧩</div>
                <div class="stat-content">
                    <div class="stat-number" data-count="${stats.problemsSolved}">${stats.problemsSolved}</div>
                    <div class="stat-label">Problems Solved</div>
                    <div class="stat-change positive">+${stats.problemsToday} today</div>
                </div>
            </div>
            
            <div class="stat-card time">
                <div class="stat-icon">⏰</div>
                <div class="stat-content">
                    <div class="stat-number">${stats.totalHours}h</div>
                    <div class="stat-label">Study Time</div>
                    <div class="stat-change neutral">${stats.avgDailyTime}h/day avg</div>
                </div>
            </div>
            
            <div class="stat-card accuracy">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                    <div class="stat-number">${stats.accuracy}%</div>
                    <div class="stat-label">Accuracy</div>
                    <div class="stat-change ${stats.accuracyTrend > 0 ? 'positive' : 'negative'}">
                        ${stats.accuracyTrend > 0 ? '+' : ''}${stats.accuracyTrend}%
                    </div>
                </div>
            </div>
        `;
    }

    buildDailyGoals() {
        return this.dailyGoals.map(goal => `
            <div class="daily-goal ${goal.completed ? 'completed' : ''}" data-goal-id="${goal.id}">
                <div class="goal-checkbox">
                    <div class="checkbox ${goal.completed ? 'checked' : ''}">
                        ${goal.completed ? '✓' : ''}
                    </div>
                </div>
                <div class="goal-content">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-progress">
                        <div class="progress-bar mini">
                            <div class="progress-fill" style="width: ${goal.progress}%"></div>
                        </div>
                        <span class="progress-text">${goal.progress}%</span>
                    </div>
                </div>
                <div class="goal-reward">
                    <span class="reward-xp">+${goal.xpReward} XP</span>
                </div>
            </div>
        `).join('');
    }

    buildSkillBars() {
        const skills = this.getSkillProgress();
        
        return skills.map(skill => `
            <div class="skill-bar" data-skill="${skill.id}">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <div class="skill-level">
                        <span class="current-level">Level ${skill.level}</span>
                        <span class="skill-percentage">${skill.progress}%</span>
                    </div>
                </div>
                <div class="skill-progress-container">
                    <div class="skill-progress-bar">
                        <div class="skill-progress-fill" style="width: 0%" data-target="${skill.progress}"></div>
                        <div class="skill-milestones">
                            ${Array.from({length: 4}, (_, i) => 
                                `<div class="milestone-marker" style="left: ${(i + 1) * 20}%">
                                    <div class="marker ${skill.progress >= (i + 1) * 20 ? 'reached' : ''}"></div>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="skill-details">
                        <span class="next-unlock">Next: ${skill.nextUnlock}</span>
                        <span class="xp-needed">${skill.xpToNext} XP to go</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    buildAchievementGallery() {
        const recentAchievements = this.achievements.slice(0, 6);
        
        return recentAchievements.map(achievement => `
            <div class="achievement-card ${achievement.rarity}" data-achievement-id="${achievement.id}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-meta">
                        <span class="achievement-date">${this.formatDate(achievement.earnedAt)}</span>
                        <span class="achievement-rarity ${achievement.rarity}">${achievement.rarity}</span>
                    </div>
                </div>
                ${achievement.isNew ? '<div class="new-badge">New!</div>' : ''}
            </div>
        `).join('');
    }

    buildMilestoneTimeline() {
        return this.milestones.map((milestone, index) => `
            <div class="milestone-item ${milestone.status}" data-milestone-id="${milestone.id}">
                <div class="timeline-connector ${index === 0 ? 'first' : ''} ${index === this.milestones.length - 1 ? 'last' : ''}">
                    <div class="connector-line"></div>
                </div>
                <div class="milestone-marker-large">
                    <div class="marker-content ${milestone.status}">
                        ${milestone.status === 'completed' ? '✓' : milestone.status === 'current' ? '🎯' : milestone.order}
                    </div>
                </div>
                <div class="milestone-content">
                    <h4 class="milestone-title">${milestone.title}</h4>
                    <p class="milestone-description">${milestone.description}</p>
                    <div class="milestone-progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${milestone.progress}%"></div>
                        </div>
                        <div class="progress-details">
                            <span class="progress-text">${milestone.progress}% complete</span>
                            ${milestone.status === 'current' ? `<span class="eta">ETA: ${milestone.eta}</span>` : ''}
                        </div>
                    </div>
                    ${milestone.rewards && milestone.rewards.length > 0 ? `
                        <div class="milestone-rewards">
                            <span class="rewards-label">Rewards:</span>
                            ${milestone.rewards.map(reward => `<span class="reward-item">${reward}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    initializeAnimations() {
        // Animate level progress ring
        this.animateLevelProgress();
        
        // Animate XP bar
        this.animateXPBar();
        
        // Animate stat counters
        this.animateStatCounters();
        
        // Animate skill bars
        this.animateSkillBars();
        
        // Animate achievements
        this.animateAchievements();
        
        // Setup interaction animations
        this.setupInteractionAnimations();
    }

    animateLevelProgress() {
        const ring = document.querySelector('.progress-stroke');
        if (!ring) return;
        
        const levelProgress = this.getCurrentLevelProgress();
        const circumference = 220;
        const offset = circumference - (levelProgress * circumference);
        
        ring.style.strokeDashoffset = circumference;
        
        setTimeout(() => {
            ring.style.transition = 'stroke-dashoffset 2s ease-out';
            ring.style.strokeDashoffset = offset;
        }, 500);
    }

    animateXPBar() {
        const xpFill = document.querySelector('.xp-fill');
        if (!xpFill) return;
        
        const xpProgress = this.getCurrentLevelProgress();
        
        setTimeout(() => {
            xpFill.style.transition = 'width 2s ease-out';
            xpFill.style.width = `${xpProgress * 100}%`;
            
            // Add sparkle animation
            this.addSparkleAnimation(xpFill);
        }, 800);
    }

    animateStatCounters() {
        document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            let step = 0;
            
            const timer = setInterval(() => {
                current += increment;
                step++;
                
                if (step === steps || current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                counter.textContent = Math.floor(current);
            }, duration / steps);
        });
    }

    animateSkillBars() {
        document.querySelectorAll('.skill-progress-fill').forEach((bar, index) => {
            const targetWidth = bar.dataset.target;
            
            setTimeout(() => {
                bar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                bar.style.width = `${targetWidth}%`;
                
                // Animate milestone markers
                const skillContainer = bar.closest('.skill-bar');
                skillContainer.querySelectorAll('.milestone-marker .marker.reached').forEach((marker, markerIndex) => {
                    setTimeout(() => {
                        marker.classList.add('animate-reach');
                        this.celebrations.createMilestoneSparkle(marker);
                    }, markerIndex * 200);
                });
            }, index * 300 + 1000);
        });
    }

    animateAchievements() {
        document.querySelectorAll('.achievement-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100 + 1500);
        });
    }

    setupInteractionAnimations() {
        // Daily goal interactions
        document.querySelectorAll('.daily-goal').forEach(goal => {
            goal.addEventListener('click', (e) => {
                if (!goal.classList.contains('completed')) {
                    this.completeGoal(goal);
                }
            });
        });
        
        // Achievement card hover effects
        document.querySelectorAll('.achievement-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Milestone interactions
        document.querySelectorAll('.milestone-item.current').forEach(milestone => {
            milestone.addEventListener('click', () => {
                this.showMilestoneDetails(milestone);
            });
        });
    }

    completeGoal(goalElement) {
        const goalId = goalElement.dataset.goalId;
        const goal = this.dailyGoals.find(g => g.id === goalId);
        
        if (!goal || goal.completed) return;
        
        // Mark as completed
        goal.completed = true;
        goal.progress = 100;
        
        // Visual updates
        goalElement.classList.add('completing');
        
        setTimeout(() => {
            goalElement.classList.add('completed');
            goalElement.classList.remove('completing');
            
            // Animate checkbox
            const checkbox = goalElement.querySelector('.checkbox');
            checkbox.classList.add('checked');
            checkbox.innerHTML = '✓';
            
            // Update progress bar
            const progressFill = goalElement.querySelector('.progress-fill');
            progressFill.style.width = '100%';
            
            // Add XP and celebrate
            this.addXP(goal.xpReward);
            this.celebrations.createGoalCompletionEffect(goalElement);
            this.soundEngine.playSound('goal_complete');
            
            // Check for streaks and achievements
            this.checkForNewAchievements();
            this.updateStreak();
            
        }, 200);
        
        // Save progress
        this.saveProgressData();
    }

    addXP(amount) {
        this.totalXP += amount;
        
        // Check for level up
        const newLevel = this.calculateLevelFromXP(this.totalXP);
        if (newLevel > this.currentLevel) {
            this.levelUp(newLevel);
        } else {
            // Just update XP bar
            this.updateXPDisplay();
        }
        
        // Show XP gain animation
        this.celebrations.createXPGainEffect(amount);
    }

    levelUp(newLevel) {
        const oldLevel = this.currentLevel;
        this.currentLevel = newLevel;
        
        // Major celebration for level up
        this.celebrations.createLevelUpCelebration(oldLevel, newLevel);
        this.soundEngine.playSound('level_up');
        
        // Update displays
        this.updateLevelDisplay();
        this.updateXPDisplay();
        
        // Check for new unlocks
        this.checkForLevelUnlocks(newLevel);
        
        // Save progress
        this.saveProgressData();
    }

    updateXPDisplay() {
        const xpFill = document.querySelector('.xp-fill');
        const currentXPSpan = document.querySelector('.current-xp');
        
        if (xpFill && currentXPSpan) {
            const progress = this.getCurrentLevelProgress();
            xpFill.style.width = `${progress * 100}%`;
            currentXPSpan.textContent = this.getCurrentLevelXP();
            
            // Add sparkle effect
            this.addSparkleAnimation(xpFill);
        }
    }

    updateLevelDisplay() {
        const levelNumber = document.querySelector('.level-number');
        const userTitle = document.querySelector('.user-title');
        
        if (levelNumber) {
            levelNumber.textContent = this.currentLevel;
        }
        
        if (userTitle) {
            userTitle.textContent = this.getUserTitle();
        }
        
        this.animateLevelProgress();
    }

    addSparkleAnimation(element) {
        const sparkles = element.parentElement.querySelector('.xp-sparkles');
        if (sparkles) {
            sparkles.innerHTML = '';
            
            for (let i = 0; i < 5; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.innerHTML = '✨';
                sparkle.style.left = `${Math.random() * 100}%`;
                sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
                sparkles.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 1000);
            }
        }
    }

    checkForNewAchievements() {
        const newAchievements = this.evaluateAchievements();
        
        newAchievements.forEach(achievement => {
            this.unlockAchievement(achievement);
        });
    }

    unlockAchievement(achievement) {
        // Add to achievements list
        achievement.earnedAt = Date.now();
        achievement.isNew = true;
        this.achievements.unshift(achievement);
        
        // Create celebration
        this.celebrations.createAchievementUnlock(achievement);
        this.soundEngine.playSound('achievement_unlock');
        
        // Add XP bonus
        this.addXP(achievement.xpBonus || 50);
        
        // Save progress
        this.saveProgressData();
    }

    setupEventListeners() {
        // Real-time progress updates
        document.addEventListener('learning_progress_update', (e) => {
            this.handleProgressUpdate(e.detail);
        });
        
        // Achievement hover details
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.achievement-card')) {
                this.showAchievementTooltip(e.target.closest('.achievement-card'));
            }
        });
        
        // Milestone completion
        document.addEventListener('milestone_progress', (e) => {
            this.updateMilestoneProgress(e.detail);
        });
        
        // Celebration events
        document.addEventListener('celebration_complete', (e) => {
            this.handleCelebrationComplete(e.detail);
        });
    }

    startRealTimeUpdates() {
        // Update progress every 30 seconds
        setInterval(() => {
            this.refreshProgressData();
            this.checkForMilestoneProgress();
        }, 30000);
        
        // Streak check daily
        setInterval(() => {
            this.updateStreak();
        }, 60000 * 60); // Every hour
    }

    // Utility methods
    loadProgressData() {
        const stored = localStorage.getItem('progress_visualization_data');
        return stored ? JSON.parse(stored) : {
            totalXP: 150,
            level: 3,
            sessionsCompleted: 12,
            problemsSolved: 45,
            totalStudyTime: 28,
            lastActivity: Date.now()
        };
    }

    saveProgressData() {
        const data = {
            totalXP: this.totalXP,
            level: this.currentLevel,
            achievements: this.achievements,
            streaks: this.streaks,
            milestones: this.milestones,
            dailyGoals: this.dailyGoals,
            lastSaved: Date.now()
        };
        
        localStorage.setItem('progress_visualization_data', JSON.stringify(data));
    }

    calculateCurrentLevel() {
        return this.calculateLevelFromXP(this.totalXP);
    }

    calculateLevelFromXP(xp) {
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    }

    calculateTotalXP() {
        return this.progressData.totalXP || 150;
    }

    getCurrentLevelXP() {
        const levelXP = this.getXPForLevel(this.currentLevel);
        return this.totalXP - levelXP;
    }

    getNextLevelXP() {
        return this.getXPForLevel(this.currentLevel + 1) - this.getXPForLevel(this.currentLevel);
    }

    getXPForLevel(level) {
        return Math.pow(level - 1, 2) * 100;
    }

    getCurrentLevelProgress() {
        const currentLevelXP = this.getCurrentLevelXP();
        const xpNeededForNext = this.getNextLevelXP();
        return currentLevelXP / xpNeededForNext;
    }

    getUserTitle() {
        const titles = {
            1: 'Beginner',
            5: 'Apprentice',
            10: 'Practitioner',
            15: 'Expert',
            20: 'Master',
            25: 'Guru'
        };
        
        const applicableTitles = Object.keys(titles)
            .map(Number)
            .filter(level => this.currentLevel >= level)
            .sort((a, b) => b - a);
        
        return titles[applicableTitles[0]] || 'Novice';
    }

    getStreakStatus() {
        if (this.streaks.current >= 30) return 'legendary';
        if (this.streaks.current >= 14) return 'epic';
        if (this.streaks.current >= 7) return 'hot';
        if (this.streaks.current >= 3) return 'warm';
        return 'cold';
    }

    getStreakMessage() {
        const streak = this.streaks.current;
        if (streak === 0) return 'Start your streak today!';
        if (streak === 1) return 'Keep it going!';
        if (streak < 7) return `${7 - streak} days to unlock bonus XP`;
        if (streak < 30) return `${30 - streak} days to legendary status!`;
        return 'Legendary streak! Amazing dedication!';
    }

    injectDashboard(dashboardHTML) {
        // Find insertion point
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
            const container = document.createElement('div');
            container.innerHTML = dashboardHTML;
            targetElement.insertBefore(container.firstElementChild, targetElement.firstChild);
        }
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    // Mock data methods (in production these would fetch real data)
    loadAchievements() {
        return [
            {
                id: 'first_session',
                name: 'Getting Started',
                description: 'Completed your first study session',
                icon: '🌟',
                rarity: 'common',
                earnedAt: Date.now() - 86400000,
                xpBonus: 25
            },
            {
                id: 'problem_solver',
                name: 'Problem Solver',
                description: 'Solved 10 coding problems',
                icon: '🧩',
                rarity: 'uncommon',
                earnedAt: Date.now() - 43200000,
                xpBonus: 50
            }
        ];
    }

    loadStreaks() {
        return {
            current: 7,
            longest: 14,
            lastActivity: Date.now() - 3600000
        };
    }

    loadMilestones() {
        return [
            {
                id: 'algorithms_master',
                title: 'Algorithms Mastery',
                description: 'Master fundamental algorithms and data structures',
                progress: 75,
                status: 'current',
                order: 1,
                eta: '2 weeks',
                rewards: ['+200 XP', 'Algorithm Expert badge']
            },
            {
                id: 'system_design_intro',
                title: 'System Design Foundations',
                description: 'Complete introduction to system design principles',
                progress: 0,
                status: 'upcoming',
                order: 2,
                rewards: ['+300 XP', 'Architect badge']
            }
        ];
    }

    loadDailyGoals() {
        return [
            {
                id: 'daily_reading',
                title: 'Read for 30 minutes',
                progress: 60,
                completed: false,
                xpReward: 20
            },
            {
                id: 'solve_problems',
                title: 'Solve 3 coding problems',
                progress: 33,
                completed: false,
                xpReward: 30
            },
            {
                id: 'review_notes',
                title: 'Review previous notes',
                progress: 100,
                completed: true,
                xpReward: 15
            }
        ];
    }

    calculateStats() {
        return {
            totalSessions: 47,
            sessionsThisWeek: 8,
            problemsSolved: 134,
            problemsToday: 5,
            totalHours: 28,
            avgDailyTime: 1.2,
            accuracy: 84,
            accuracyTrend: 3
        };
    }

    getSkillProgress() {
        return [
            {
                id: 'algorithms',
                name: 'Algorithms',
                level: 4,
                progress: 72,
                nextUnlock: 'Advanced sorting',
                xpToNext: 180
            },
            {
                id: 'data_structures',
                name: 'Data Structures',
                level: 3,
                progress: 45,
                nextUnlock: 'Trees and graphs',
                xpToNext: 275
            },
            {
                id: 'system_design',
                name: 'System Design',
                level: 2,
                progress: 28,
                nextUnlock: 'Scalability patterns',
                xpToNext: 360
            }
        ];
    }

    evaluateAchievements() {
        // Mock achievement evaluation
        return [];
    }
}

// Animation Engine for smooth transitions
class AnimationEngine {
    createFloatingAnimation(element, options = {}) {
        const defaults = {
            duration: 2000,
            distance: 20,
            easing: 'ease-in-out'
        };
        
        const config = { ...defaults, ...options };
        
        element.style.animation = `float ${config.duration}ms ${config.easing} infinite`;
    }

    createPulseAnimation(element, options = {}) {
        const defaults = {
            duration: 1500,
            intensity: 1.1
        };
        
        const config = { ...defaults, ...options };
        
        element.style.animation = `pulse ${config.duration}ms ease-in-out infinite`;
    }

    createBounceIn(element, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.3)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, delay);
    }
}

// Celebration Engine for milestone and achievement celebrations
class CelebrationEngine {
    createLevelUpCelebration(oldLevel, newLevel) {
        const overlay = document.getElementById('celebration-overlay');
        
        overlay.innerHTML = `
            <div class="level-up-celebration">
                <div class="celebration-bg"></div>
                <div class="celebration-content">
                    <div class="level-up-text">
                        <h1>Level Up!</h1>
                        <div class="level-transition">
                            <span class="old-level">${oldLevel}</span>
                            <span class="arrow">→</span>
                            <span class="new-level">${newLevel}</span>
                        </div>
                        <p>You've reached a new level of mastery!</p>
                    </div>
                    <div class="celebration-effects">
                        <div class="confetti"></div>
                        <div class="sparkles"></div>
                        <div class="fireworks"></div>
                    </div>
                </div>
            </div>
        `;
        
        overlay.style.display = 'flex';
        
        // Generate confetti
        this.generateConfetti();
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.style.opacity = '1';
            }, 500);
        }, 4000);
    }

    createAchievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="achievement-icon-large">${achievement.icon}</div>
                <div class="achievement-details">
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    <div class="achievement-xp">+${achievement.xpBonus || 50} XP</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    createGoalCompletionEffect(goalElement) {
        const rect = goalElement.getBoundingClientRect();
        const effect = document.createElement('div');
        effect.className = 'goal-completion-effect';
        effect.innerHTML = `
            <div class="completion-ripple"></div>
            <div class="completion-sparkles">
                ${Array.from({length: 6}, () => '<div class="sparkle">✨</div>').join('')}
            </div>
        `;
        
        effect.style.position = 'absolute';
        effect.style.left = rect.left + 'px';
        effect.style.top = rect.top + 'px';
        effect.style.width = rect.width + 'px';
        effect.style.height = rect.height + 'px';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 2000);
    }

    createXPGainEffect(amount) {
        const xpGain = document.createElement('div');
        xpGain.className = 'xp-gain-effect';
        xpGain.innerHTML = `+${amount} XP`;
        
        const xpBar = document.querySelector('.xp-bar');
        if (xpBar) {
            const rect = xpBar.getBoundingClientRect();
            xpGain.style.position = 'absolute';
            xpGain.style.left = (rect.left + rect.width / 2) + 'px';
            xpGain.style.top = rect.top + 'px';
            xpGain.style.transform = 'translateX(-50%)';
            xpGain.style.zIndex = '1000';
            
            document.body.appendChild(xpGain);
            
            setTimeout(() => xpGain.remove(), 2000);
        }
    }

    createMilestoneSparkle(markerElement) {
        const sparkle = document.createElement('div');
        sparkle.className = 'milestone-sparkle';
        sparkle.innerHTML = '✨';
        
        const rect = markerElement.getBoundingClientRect();
        sparkle.style.position = 'absolute';
        sparkle.style.left = rect.left + 'px';
        sparkle.style.top = rect.top + 'px';
        sparkle.style.zIndex = '999';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1500);
    }

    generateConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
        const confettiContainer = document.querySelector('.confetti');
        
        if (!confettiContainer) return;
        
        for (let i = 0; i < 50; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.className = 'confetti-piece';
            confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiPiece.style.left = Math.random() * 100 + '%';
            confettiPiece.style.animationDelay = Math.random() * 3 + 's';
            confettiPiece.style.animationDuration = Math.random() * 3 + 2 + 's';
            
            confettiContainer.appendChild(confettiPiece);
        }
    }
}

// Sound Engine for audio feedback
class SoundEngine {
    constructor() {
        this.enabled = localStorage.getItem('sound_enabled') !== 'false';
        this.sounds = this.loadSounds();
    }

    loadSounds() {
        // In production, these would be actual audio files
        return {
            'goal_complete': { frequency: 800, duration: 200 },
            'level_up': { frequency: 1000, duration: 500 },
            'achievement_unlock': { frequency: 1200, duration: 300 },
            'xp_gain': { frequency: 600, duration: 100 }
        };
    }

    playSound(soundType) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundType];
        if (!sound) return;
        
        // Use Web Audio API to generate simple tones
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + sound.duration / 1000);
        } catch (error) {
            console.log('Sound playback not available');
        }
    }

    toggleSound() {
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', this.enabled.toString());
    }
}

// CSS Styles for the progress visualization system
const progressStyles = `
<style>
.progress-dashboard {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    margin: 24px 0;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-header {
    padding: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.level-indicator {
    display: flex;
    align-items: center;
    gap: 24px;
}

.level-avatar {
    position: relative;
}

.avatar-ring {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.level-progress-ring {
    transform: rotate(-90deg);
}

.avatar-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.level-number {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
}

.level-label {
    font-size: 0.7rem;
    opacity: 0.8;
}

.level-info {
    flex: 1;
}

.user-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0 0 8px 0;
}

.xp-bar {
    margin-top: 12px;
}

.xp-progress {
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    margin-bottom: 8px;
}

.xp-fill {
    height: 100%;
    background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    border-radius: 4px;
    width: 0%;
    transition: width 2s ease-out;
}

.xp-sparkles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.sparkle {
    position: absolute;
    animation: sparkle-float 1s ease-out forwards;
    font-size: 10px;
}

@keyframes sparkle-float {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
}

.xp-text {
    font-size: 0.85rem;
    opacity: 0.9;
}

.streak-indicator {
    display: flex;
    align-items: center;
    gap: 16px;
}

.streak-fire {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.fire-emoji {
    font-size: 2rem;
    animation: flicker 2s infinite;
}

.streak-fire.legendary .fire-emoji {
    animation: legendary-flicker 1.5s infinite;
    filter: drop-shadow(0 0 10px #ff6b6b);
}

.streak-count {
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: -8px;
}

.streak-text {
    text-align: left;
}

.streak-title {
    font-weight: bold;
    margin-bottom: 4px;
}

.streak-subtitle {
    font-size: 0.8rem;
    opacity: 0.8;
}

@keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

@keyframes legendary-flicker {
    0%, 100% { opacity: 1; transform: scale(1); }
    25% { opacity: 0.9; transform: scale(1.1); }
    50% { opacity: 0.8; transform: scale(1.05); }
    75% { opacity: 0.9; transform: scale(1.1); }
}

.dashboard-content {
    padding: 32px;
    background: white;
    color: #333;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 12px;
    color: white;
}

.stat-content {
    flex: 1;
}

.stat-number {
    font-size: 1.8rem;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 2px;
}

.stat-change {
    font-size: 0.8rem;
    font-weight: 500;
}

.stat-change.positive { color: #10b981; }
.stat-change.negative { color: #ef4444; }
.stat-change.neutral { color: #64748b; }

.progress-sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
}

.section {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
}

.section h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 1.1rem;
    font-weight: 600;
}

.daily-goals {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.daily-goal {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
}

.daily-goal:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.02);
}

.daily-goal.completing {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.daily-goal.completed {
    background: rgba(16, 185, 129, 0.05);
    border-color: #10b981;
}

.goal-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
}

.checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid #e2e8f0;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 12px;
    color: white;
}

.checkbox.checked {
    background: #10b981;
    border-color: #10b981;
}

.goal-content {
    flex: 1;
}

.goal-title {
    font-weight: 500;
    margin-bottom: 4px;
}

.progress-bar.mini {
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
}

.progress-bar.mini .progress-fill {
    height: 100%;
    background: #667eea;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.75rem;
    color: #64748b;
}

.goal-reward {
    font-size: 0.8rem;
    color: #f59e0b;
    font-weight: 500;
}

.skill-bars {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.skill-bar {
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
}

.skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.skill-name {
    font-weight: 500;
    color: #1e293b;
}

.skill-level {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.85rem;
}

.current-level {
    color: #667eea;
    font-weight: 500;
}

.skill-percentage {
    color: #64748b;
}

.skill-progress-container {
    position: relative;
}

.skill-progress-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    margin-bottom: 8px;
}

.skill-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 4px;
    width: 0%;
}

.skill-milestones {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.milestone-marker {
    position: absolute;
    top: -2px;
    transform: translateX(-50%);
}

.milestone-marker .marker {
    width: 12px;
    height: 12px;
    background: #e2e8f0;
    border: 2px solid white;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.milestone-marker .marker.reached {
    background: #10b981;
}

.milestone-marker .marker.animate-reach {
    animation: milestone-reach 0.6s ease-out;
}

@keyframes milestone-reach {
    0% { transform: scale(1); }
    50% { transform: scale(1.5); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3); }
    100% { transform: scale(1); }
}

.skill-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #64748b;
}

.achievement-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

.achievement-card {
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    cursor: pointer;
}

.achievement-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.achievement-card.rare {
    background: linear-gradient(135deg, #a8edea, #fed6e3);
}

.achievement-card.epic {
    background: linear-gradient(135deg, #d299c2, #fef9d7);
}

.achievement-card.legendary {
    background: linear-gradient(135deg, #89f7fe, #66a6ff);
}

.achievement-icon {
    font-size: 2rem;
    margin-bottom: 8px;
}

.achievement-name {
    font-weight: 600;
    margin-bottom: 4px;
    color: #1e293b;
}

.achievement-description {
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 8px;
}

.achievement-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
}

.achievement-rarity {
    text-transform: capitalize;
    font-weight: 500;
}

.achievement-rarity.common { color: #64748b; }
.achievement-rarity.uncommon { color: #10b981; }
.achievement-rarity.rare { color: #3b82f6; }
.achievement-rarity.epic { color: #8b5cf6; }
.achievement-rarity.legendary { color: #f59e0b; }

.new-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    font-size: 0.6rem;
    padding: 2px 6px;
    border-radius: 8px;
    font-weight: 500;
}

.milestone-timeline {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.milestone-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    position: relative;
}

.timeline-connector {
    position: absolute;
    left: 20px;
    top: 40px;
    bottom: -20px;
    width: 2px;
    background: #e2e8f0;
}

.timeline-connector.last {
    display: none;
}

.milestone-marker-large {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 3px solid #e2e8f0;
    z-index: 1;
    position: relative;
}

.marker-content.completed {
    background: #10b981;
    color: white;
    border-color: #10b981;
}

.marker-content.current {
    background: #667eea;
    color: white;
    border-color: #667eea;
    animation: pulse 2s infinite;
}

.milestone-content {
    flex: 1;
}

.milestone-title {
    margin: 0 0 8px 0;
    color: #1e293b;
    font-size: 1rem;
}

.milestone-description {
    color: #64748b;
    margin-bottom: 12px;
    line-height: 1.4;
}

.milestone-progress-section {
    margin-bottom: 8px;
}

.milestone-rewards {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
}

.rewards-label {
    font-size: 0.8rem;
    color: #64748b;
    margin-right: 4px;
}

.reward-item {
    background: #f0f9ff;
    color: #0369a1;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
}

/* Celebration Styles */
.celebration-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.level-up-celebration {
    text-align: center;
    color: white;
    position: relative;
}

.celebration-bg {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.3), transparent 70%);
    animation: rotate 10s linear infinite;
}

.level-up-text h1 {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: bounceIn 1s ease;
}

.level-transition {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    font-size: 2rem;
    margin-bottom: 20px;
}

.old-level {
    opacity: 0.6;
}

.new-level {
    color: #f59e0b;
    font-weight: bold;
    animation: pulse 1s infinite;
}

.confetti {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
}

.confetti-piece {
    position: absolute;
    width: 10px;
    height: 10px;
    animation: confetti-fall linear;
}

@keyframes confetti-fall {
    0% {
        opacity: 1;
        transform: translateY(-100vh) rotate(0deg);
    }
    100% {
        opacity: 0;
        transform: translateY(100vh) rotate(720deg);
    }
}

.achievement-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 10001;
    transform: translateX(120%);
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 320px;
}

.achievement-notification.show {
    transform: translateX(0);
}

.achievement-notification.hide {
    transform: translateX(120%);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.achievement-icon-large {
    font-size: 2.5rem;
}

.achievement-title {
    font-size: 0.8rem;
    color: #10b981;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.achievement-name {
    font-size: 1.1rem;
    font-weight: bold;
    color: #1e293b;
    margin: 4px 0;
}

.achievement-desc {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 4px;
}

.achievement-xp {
    font-size: 0.9rem;
    color: #f59e0b;
    font-weight: 600;
}

.xp-gain-effect {
    color: #f59e0b;
    font-weight: bold;
    font-size: 1.2rem;
    pointer-events: none;
    animation: xp-float 2s ease-out forwards;
}

@keyframes xp-float {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    50% {
        transform: translateY(-20px) scale(1.2);
    }
    100% {
        opacity: 0;
        transform: translateY(-40px) scale(1);
    }
}

.milestone-sparkle {
    animation: sparkle-pop 1.5s ease-out forwards;
    pointer-events: none;
    font-size: 1rem;
}

@keyframes sparkle-pop {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.5);
    }
    100% {
        opacity: 0;
        transform: scale(0.8);
    }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .progress-dashboard {
        margin: 16px -16px;
        border-radius: 0;
    }
    
    .dashboard-header {
        flex-direction: column;
        gap: 20px;
        padding: 20px;
    }
    
    .level-indicator {
        flex-direction: column;
        text-align: center;
        gap: 16px;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .progress-sections {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .achievement-gallery {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .milestone-item {
        flex-direction: column;
        align-items: stretch;
    }
    
    .timeline-connector {
        left: 10px;
    }
    
    .level-up-text h1 {
        font-size: 2.5rem;
    }
    
    .achievement-notification {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}
</style>
`;

// Inject styles
if (!document.getElementById('progress-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'progress-styles';
    styleSheet.innerHTML = progressStyles;
    document.head.appendChild(styleSheet);
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with a small delay to ensure other systems are ready
    setTimeout(() => {
        window.progressVisualization = new ProgressVisualizationSystem();
    }, 1500);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressVisualizationSystem;
}