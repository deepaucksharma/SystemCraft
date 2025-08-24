/**
 * Spaced Repetition Learning System
 * Implements scientifically-proven memory retention techniques
 */

class SpacedRepetitionSystem {
    constructor() {
        this.items = this.loadItems();
        this.schedule = this.loadSchedule();
        this.settings = this.loadSettings();
        this.init();
    }

    loadItems() {
        const saved = localStorage.getItem('srsItems');
        return saved ? JSON.parse(saved) : {};
    }

    loadSchedule() {
        const saved = localStorage.getItem('srsSchedule');
        return saved ? JSON.parse(saved) : {};
    }

    loadSettings() {
        const defaults = {
            intervals: [1, 3, 7, 14, 30, 90], // Days
            dailyLimit: 20,
            newCardsPerDay: 10,
            enableNotifications: true
        };
        const saved = localStorage.getItem('srsSettings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveData() {
        localStorage.setItem('srsItems', JSON.stringify(this.items));
        localStorage.setItem('srsSchedule', JSON.stringify(this.schedule));
        localStorage.setItem('srsSettings', JSON.stringify(this.settings));
    }

    init() {
        this.createUI();
        this.loadTodaysItems();
        this.setupNotifications();
    }

    createUI() {
        const container = document.createElement('div');
        container.id = 'srs-widget';
        container.className = 'srs-widget';
        container.innerHTML = `
            <div class="srs-header">
                <h3>📚 Today's Review</h3>
                <span class="srs-stats">
                    <span class="due-count">0</span> due | 
                    <span class="new-count">0</span> new
                </span>
            </div>
            <div class="srs-content">
                <div class="srs-card-display"></div>
                <div class="srs-controls">
                    <button class="srs-btn" data-quality="again">Again (1d)</button>
                    <button class="srs-btn" data-quality="hard">Hard (3d)</button>
                    <button class="srs-btn" data-quality="good">Good (7d)</button>
                    <button class="srs-btn" data-quality="easy">Easy (14d)</button>
                </div>
            </div>
            <div class="srs-progress">
                <div class="srs-progress-bar"></div>
            </div>
        `;

        // Add to page if review section exists
        const reviewSection = document.querySelector('.spaced-repetition-section');
        if (reviewSection) {
            reviewSection.appendChild(container);
            this.bindEvents(container);
        }
    }

    bindEvents(container) {
        container.querySelectorAll('.srs-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quality = e.target.dataset.quality;
                this.processAnswer(quality);
            });
        });
    }

    loadTodaysItems() {
        const today = new Date().toDateString();
        const dueItems = [];
        
        Object.keys(this.schedule).forEach(itemId => {
            const item = this.schedule[itemId];
            const dueDate = new Date(item.nextReview).toDateString();
            
            if (dueDate <= today) {
                dueItems.push({
                    id: itemId,
                    ...item,
                    content: this.items[itemId]
                });
            }
        });

        this.todaysItems = dueItems.slice(0, this.settings.dailyLimit);
        this.currentIndex = 0;
        
        this.updateDisplay();
        this.updateStats();
    }

    updateDisplay() {
        const display = document.querySelector('.srs-card-display');
        if (!display) return;

        if (this.currentIndex < this.todaysItems.length) {
            const item = this.todaysItems[this.currentIndex];
            display.innerHTML = `
                <div class="srs-card">
                    <div class="srs-question">${item.content.question}</div>
                    <div class="srs-answer" style="display: none;">${item.content.answer}</div>
                    <button class="srs-show-answer">Show Answer</button>
                </div>
            `;

            display.querySelector('.srs-show-answer').addEventListener('click', (e) => {
                display.querySelector('.srs-answer').style.display = 'block';
                e.target.style.display = 'none';
                document.querySelector('.srs-controls').style.display = 'flex';
            });
        } else {
            display.innerHTML = `
                <div class="srs-complete">
                    <h4>🎉 Review Complete!</h4>
                    <p>You've reviewed all cards for today.</p>
                    <div class="srs-summary">
                        <p>Cards reviewed: ${this.todaysItems.length}</p>
                        <p>Average difficulty: ${this.calculateAverageDifficulty()}</p>
                        <p>Next review: Tomorrow</p>
                    </div>
                </div>
            `;
        }
    }

    updateStats() {
        const dueCount = document.querySelector('.due-count');
        const newCount = document.querySelector('.new-count');
        
        if (dueCount) dueCount.textContent = this.todaysItems.length - this.currentIndex;
        if (newCount) newCount.textContent = Math.min(this.settings.newCardsPerDay, this.getNewCardsCount());
        
        this.updateProgressBar();
    }

    updateProgressBar() {
        const bar = document.querySelector('.srs-progress-bar');
        if (bar) {
            const progress = (this.currentIndex / this.todaysItems.length) * 100;
            bar.style.width = `${progress}%`;
        }
    }

    processAnswer(quality) {
        if (this.currentIndex >= this.todaysItems.length) return;
        
        const item = this.todaysItems[this.currentIndex];
        const intervals = {
            again: 1,
            hard: 3,
            good: 7,
            easy: 14
        };
        
        // Update item schedule
        const nextInterval = intervals[quality] * (item.repetition || 1);
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + nextInterval);
        
        this.schedule[item.id] = {
            lastReview: new Date().toISOString(),
            nextReview: nextDate.toISOString(),
            repetition: (item.repetition || 0) + 1,
            quality: quality,
            interval: nextInterval
        };
        
        this.saveData();
        
        // Move to next item
        this.currentIndex++;
        document.querySelector('.srs-controls').style.display = 'none';
        this.updateDisplay();
        this.updateStats();
    }

    calculateAverageDifficulty() {
        // Simple calculation based on review history
        return 'Moderate';
    }

    getNewCardsCount() {
        // Count items not yet in schedule
        const totalItems = Object.keys(this.items).length;
        const scheduledItems = Object.keys(this.schedule).length;
        return totalItems - scheduledItems;
    }

    setupNotifications() {
        if (!this.settings.enableNotifications) return;
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Schedule daily reminder
        this.scheduleDailyReminder();
    }

    scheduleDailyReminder() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9 AM reminder
        
        const timeout = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.showReminder();
            this.scheduleDailyReminder(); // Reschedule for next day
        }, timeout);
    }

    showReminder() {
        if (Notification.permission === 'granted') {
            new Notification('SystemCraft Review Time! 📚', {
                body: `You have ${this.todaysItems.length} cards to review today.`,
                icon: '/favicon.ico'
            });
        }
    }

    // Add new items to the system
    addItem(question, answer, category = 'general') {
        const id = `item-${Date.now()}`;
        this.items[id] = {
            question: question,
            answer: answer,
            category: category,
            created: new Date().toISOString()
        };
        
        // Schedule for immediate review
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        this.schedule[id] = {
            nextReview: tomorrow.toISOString(),
            repetition: 0
        };
        
        this.saveData();
    }

    // Import items from content
    importFromContent() {
        // Automatically extract key concepts from current page
        const concepts = this.extractConcepts();
        concepts.forEach(concept => {
            this.addItem(concept.question, concept.answer, concept.category);
        });
    }

    extractConcepts() {
        const concepts = [];
        
        // Extract from memory cards
        document.querySelectorAll('.memory-card').forEach(card => {
            const front = card.querySelector('.memory-card-front')?.textContent;
            const back = card.querySelector('.memory-card-back')?.textContent;
            
            if (front && back) {
                concepts.push({
                    question: front.trim(),
                    answer: back.trim(),
                    category: 'flashcard'
                });
            }
        });
        
        // Extract from knowledge checks
        document.querySelectorAll('.knowledge-check-item').forEach(item => {
            concepts.push({
                question: `Can you: ${item.textContent}?`,
                answer: 'Self-assessment required',
                category: 'knowledge-check'
            });
        });
        
        return concepts;
    }

    // Analytics and reporting
    getStatistics() {
        const stats = {
            totalItems: Object.keys(this.items).length,
            scheduledItems: Object.keys(this.schedule).length,
            reviewsToday: 0,
            averageInterval: 0,
            streakDays: this.calculateStreak()
        };
        
        // Calculate reviews done today
        const today = new Date().toDateString();
        Object.values(this.schedule).forEach(item => {
            if (new Date(item.lastReview).toDateString() === today) {
                stats.reviewsToday++;
            }
            stats.averageInterval += item.interval || 0;
        });
        
        stats.averageInterval /= stats.scheduledItems || 1;
        
        return stats;
    }

    calculateStreak() {
        // Calculate consecutive days of reviews
        const reviews = Object.values(this.schedule)
            .map(item => new Date(item.lastReview).toDateString())
            .filter((date, index, self) => self.indexOf(date) === index)
            .sort();
        
        let streak = 0;
        let currentDate = new Date();
        
        for (let i = reviews.length - 1; i >= 0; i--) {
            const reviewDate = new Date(reviews[i]);
            const daysDiff = Math.floor((currentDate - reviewDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
}

// Heat map visualization for review history
class ReviewHeatMap {
    constructor(container) {
        this.container = container;
        this.data = this.loadReviewData();
        this.render();
    }

    loadReviewData() {
        const schedule = JSON.parse(localStorage.getItem('srsSchedule') || '{}');
        const heatmapData = {};
        
        Object.values(schedule).forEach(item => {
            const date = new Date(item.lastReview).toDateString();
            heatmapData[date] = (heatmapData[date] || 0) + 1;
        });
        
        return heatmapData;
    }

    render() {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364); // Show last year
        
        const weeks = [];
        let currentWeek = [];
        let currentDate = new Date(startDate);
        
        while (currentDate <= today) {
            const dateStr = currentDate.toDateString();
            const count = this.data[dateStr] || 0;
            
            currentWeek.push({
                date: new Date(currentDate),
                count: count,
                intensity: this.getIntensity(count)
            });
            
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }
        
        this.renderHeatmap(weeks);
    }

    getIntensity(count) {
        if (count === 0) return 0;
        if (count <= 5) return 1;
        if (count <= 10) return 2;
        if (count <= 20) return 3;
        return 4;
    }

    renderHeatmap(weeks) {
        const heatmap = document.createElement('div');
        heatmap.className = 'review-heatmap';
        
        // Add month labels
        const months = document.createElement('div');
        months.className = 'heatmap-months';
        // ... month labels logic
        
        // Add day labels
        const days = document.createElement('div');
        days.className = 'heatmap-days';
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
            const label = document.createElement('div');
            label.textContent = day;
            days.appendChild(label);
        });
        
        // Add weeks
        const weeksContainer = document.createElement('div');
        weeksContainer.className = 'heatmap-weeks';
        
        weeks.forEach(week => {
            const weekEl = document.createElement('div');
            weekEl.className = 'heatmap-week';
            
            week.forEach(day => {
                const dayEl = document.createElement('div');
                dayEl.className = `heatmap-day intensity-${day.intensity}`;
                dayEl.title = `${day.date.toLocaleDateString()}: ${day.count} reviews`;
                weekEl.appendChild(dayEl);
            });
            
            weeksContainer.appendChild(weekEl);
        });
        
        heatmap.appendChild(months);
        heatmap.appendChild(days);
        heatmap.appendChild(weeksContainer);
        
        this.container.appendChild(heatmap);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main SRS system
    window.srsSystem = new SpacedRepetitionSystem();
    
    // Add review heatmap if container exists
    const heatmapContainer = document.querySelector('.review-heatmap-container');
    if (heatmapContainer) {
        new ReviewHeatMap(heatmapContainer);
    }
    
    // Add import button functionality
    const importBtn = document.querySelector('.srs-import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            window.srsSystem.importFromContent();
            alert('Concepts imported successfully!');
        });
    }
});

// CSS for the SRS widget
const style = document.createElement('style');
style.textContent = `
.srs-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    transition: all 0.3s ease;
}

.srs-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.srs-content {
    padding: 20px;
    min-height: 200px;
}

.srs-card {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 15px;
}

.srs-question {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 15px;
}

.srs-answer {
    background: white;
    padding: 15px;
    border-radius: 4px;
    margin-top: 10px;
}

.srs-controls {
    display: none;
    gap: 10px;
    justify-content: center;
}

.srs-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.srs-btn[data-quality="again"] {
    background: #f44336;
    color: white;
}

.srs-btn[data-quality="hard"] {
    background: #ff9800;
    color: white;
}

.srs-btn[data-quality="good"] {
    background: #4caf50;
    color: white;
}

.srs-btn[data-quality="easy"] {
    background: #2196f3;
    color: white;
}

.srs-progress {
    height: 4px;
    background: #e0e0e0;
    border-radius: 0 0 12px 12px;
    overflow: hidden;
}

.srs-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
}

.review-heatmap {
    display: flex;
    gap: 10px;
    padding: 20px;
    background: white;
    border-radius: 8px;
}

.heatmap-weeks {
    display: flex;
    gap: 3px;
}

.heatmap-week {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.heatmap-day {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    background: #eee;
}

.heatmap-day.intensity-1 { background: #c6f6c6; }
.heatmap-day.intensity-2 { background: #7ec77e; }
.heatmap-day.intensity-3 { background: #4a9e4a; }
.heatmap-day.intensity-4 { background: #2d682d; }

@media (max-width: 768px) {
    .srs-widget {
        width: calc(100% - 40px);
        left: 20px;
        right: 20px;
    }
}
`;
document.head.appendChild(style);