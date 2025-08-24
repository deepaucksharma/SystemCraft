/**
 * Visual Learning Enhancement System
 * Implements various visual learning techniques for better retention
 */

// ========================
// Progress Ring Visualizer
// ========================
class ProgressRing {
    constructor(element, progress) {
        this.element = element;
        this.progress = progress;
        this.radius = 60;
        this.circumference = 2 * Math.PI * this.radius;
        this.init();
    }

    init() {
        const svg = `
            <svg width="120" height="120">
                <circle class="progress-bg" cx="60" cy="60" r="${this.radius}" stroke-width="8" />
                <circle class="progress-fill" cx="60" cy="60" r="${this.radius}" stroke-width="8" />
            </svg>
            <div class="progress-percentage">${this.progress}%</div>
        `;
        this.element.innerHTML = svg;
        
        const progressFill = this.element.querySelector('.progress-fill');
        progressFill.style.strokeDasharray = this.circumference;
        
        setTimeout(() => {
            const offset = this.circumference - (this.progress / 100) * this.circumference;
            progressFill.style.strokeDashoffset = offset;
        }, 100);
    }
}

// ========================
// Memory Card System (Flashcards)
// ========================
class MemoryCardSystem {
    constructor() {
        this.cards = [];
        this.currentCard = 0;
        this.stats = {
            correct: 0,
            incorrect: 0,
            reviewed: 0
        };
        this.init();
    }

    init() {
        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
            this.cards.push(card);
        });

        // Add navigation controls
        this.addNavigationControls();
        
        // Initialize spaced repetition tracking
        this.initSpacedRepetition();
    }

    flipCard(card) {
        card.classList.toggle('flipped');
        this.stats.reviewed++;
        this.updateStats();
    }

    addNavigationControls() {
        const controls = document.createElement('div');
        controls.className = 'memory-card-controls';
        controls.innerHTML = `
            <button class="btn-prev">← Previous</button>
            <span class="card-counter">Card 1 of ${this.cards.length}</span>
            <button class="btn-next">Next →</button>
            <div class="card-actions">
                <button class="btn-easy" data-difficulty="easy">Easy</button>
                <button class="btn-medium" data-difficulty="medium">Medium</button>
                <button class="btn-hard" data-difficulty="hard">Hard</button>
            </div>
        `;

        if (this.cards.length > 0) {
            this.cards[0].parentElement.appendChild(controls);
            this.bindNavigationEvents(controls);
        }
    }

    bindNavigationEvents(controls) {
        controls.querySelector('.btn-prev').addEventListener('click', () => this.navigate(-1));
        controls.querySelector('.btn-next').addEventListener('click', () => this.navigate(1));
        
        controls.querySelectorAll('[data-difficulty]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.markDifficulty(e.target.dataset.difficulty);
            });
        });
    }

    navigate(direction) {
        if (this.cards.length === 0) return;
        
        this.cards[this.currentCard].style.display = 'none';
        this.currentCard = (this.currentCard + direction + this.cards.length) % this.cards.length;
        this.cards[this.currentCard].style.display = 'block';
        
        document.querySelector('.card-counter').textContent = 
            `Card ${this.currentCard + 1} of ${this.cards.length}`;
    }

    markDifficulty(level) {
        const card = this.cards[this.currentCard];
        const cardId = card.dataset.cardId || `card-${this.currentCard}`;
        
        const schedule = this.calculateNextReview(level);
        this.saveCardProgress(cardId, level, schedule);
        
        if (level === 'easy') this.stats.correct++;
        else if (level === 'hard') this.stats.incorrect++;
        
        this.navigate(1);
    }

    calculateNextReview(difficulty) {
        const intervals = {
            easy: 7,    // Review in 7 days
            medium: 3,  // Review in 3 days
            hard: 1     // Review tomorrow
        };
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + intervals[difficulty]);
        return nextDate.toISOString();
    }

    initSpacedRepetition() {
        const savedProgress = localStorage.getItem('memoryCardProgress');
        if (savedProgress) {
            this.progress = JSON.parse(savedProgress);
        } else {
            this.progress = {};
        }
    }

    saveCardProgress(cardId, difficulty, nextReview) {
        this.progress[cardId] = {
            lastReviewed: new Date().toISOString(),
            difficulty: difficulty,
            nextReview: nextReview,
            reviewCount: (this.progress[cardId]?.reviewCount || 0) + 1
        };
        
        localStorage.setItem('memoryCardProgress', JSON.stringify(this.progress));
    }

    updateStats() {
        const statsDisplay = document.querySelector('.memory-stats');
        if (statsDisplay) {
            statsDisplay.innerHTML = `
                <div>Reviewed: ${this.stats.reviewed}</div>
                <div>Correct: ${this.stats.correct}</div>
                <div>Needs Practice: ${this.stats.incorrect}</div>
            `;
        }
    }
}

// ========================
// Concept Map Builder
// ========================
class ConceptMapBuilder {
    constructor(container) {
        this.container = container;
        this.nodes = [];
        this.connections = [];
        this.init();
    }

    init() {
        // Parse concept map data
        const data = this.parseMapData();
        this.renderMap(data);
        this.addInteractivity();
    }

    parseMapData() {
        // Extract nodes and connections from data attributes
        const nodes = JSON.parse(this.container.dataset.nodes || '[]');
        const connections = JSON.parse(this.container.dataset.connections || '[]');
        
        return { nodes, connections };
    }

    renderMap(data) {
        // Create central node
        const centralNode = data.nodes.find(n => n.central) || data.nodes[0];
        if (centralNode) {
            this.createNode(centralNode, 50, 50, true);
        }

        // Create surrounding nodes in a circle
        const otherNodes = data.nodes.filter(n => !n.central);
        const angleStep = (2 * Math.PI) / otherNodes.length;
        
        otherNodes.forEach((node, index) => {
            const angle = index * angleStep;
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            this.createNode(node, x, y, false);
        });

        // Create connections
        data.connections.forEach(conn => {
            this.createConnection(conn.from, conn.to);
        });
    }

    createNode(nodeData, x, y, isCentral) {
        const node = document.createElement('div');
        node.className = `concept-node ${isCentral ? 'central' : ''}`;
        node.textContent = nodeData.label;
        node.dataset.nodeId = nodeData.id;
        node.style.left = `${x}%`;
        node.style.top = `${y}%`;
        node.style.transform = 'translate(-50%, -50%)';
        
        this.container.appendChild(node);
        this.nodes.push({ element: node, data: nodeData, x, y });
    }

    createConnection(fromId, toId) {
        const fromNode = this.nodes.find(n => n.data.id === fromId);
        const toNode = this.nodes.find(n => n.data.id === toId);
        
        if (fromNode && toNode) {
            const connection = document.createElement('div');
            connection.className = 'concept-connection';
            
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            connection.style.width = `${distance}%`;
            connection.style.left = `${fromNode.x}%`;
            connection.style.top = `${fromNode.y}%`;
            connection.style.transform = `rotate(${angle}deg)`;
            
            this.container.appendChild(connection);
            this.connections.push(connection);
        }
    }

    addInteractivity() {
        this.nodes.forEach(node => {
            node.element.addEventListener('click', () => {
                this.highlightConnections(node.data.id);
                this.showNodeDetails(node.data);
            });
        });
    }

    highlightConnections(nodeId) {
        // Reset all connections
        this.connections.forEach(conn => {
            conn.style.opacity = '0.3';
        });
        
        // Highlight connected nodes
        this.nodes.forEach(node => {
            node.element.classList.remove('highlighted');
        });
        
        const node = this.nodes.find(n => n.data.id === nodeId);
        if (node) {
            node.element.classList.add('highlighted');
        }
    }

    showNodeDetails(nodeData) {
        const details = document.querySelector('.concept-details');
        if (details && nodeData.details) {
            details.innerHTML = `
                <h4>${nodeData.label}</h4>
                <p>${nodeData.details}</p>
            `;
            details.style.display = 'block';
        }
    }
}

// ========================
// Decision Tree Navigator
// ========================
class DecisionTreeNavigator {
    constructor() {
        this.currentPath = [];
        this.decisions = {};
        this.init();
    }

    init() {
        document.querySelectorAll('.decision-tree').forEach(tree => {
            this.setupTree(tree);
        });
    }

    setupTree(tree) {
        const treeId = tree.dataset.treeId || 'tree-' + Date.now();
        const decisions = JSON.parse(tree.dataset.decisions || '{}');
        
        this.decisions[treeId] = decisions;
        this.renderDecision(tree, decisions.root, treeId);
    }

    renderDecision(container, decision, treeId) {
        container.innerHTML = '';
        
        const node = document.createElement('div');
        node.className = 'decision-node';
        node.innerHTML = `
            <h4>${decision.question}</h4>
            <p>${decision.description || ''}</p>
        `;
        
        const options = document.createElement('div');
        options.className = 'decision-options';
        
        decision.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'decision-option';
            btn.textContent = option.label;
            btn.addEventListener('click', () => {
                this.currentPath.push(option.label);
                
                if (option.next) {
                    const nextDecision = this.decisions[treeId][option.next];
                    this.renderDecision(container, nextDecision, treeId);
                } else if (option.result) {
                    this.showResult(container, option.result);
                }
            });
            options.appendChild(btn);
        });
        
        container.appendChild(node);
        container.appendChild(options);
        
        // Add back button if not at root
        if (this.currentPath.length > 0) {
            this.addBackButton(container, treeId);
        }
    }

    showResult(container, result) {
        container.innerHTML = `
            <div class="decision-result">
                <h3>Recommendation</h3>
                <p>${result}</p>
                <button class="btn-restart">Start Over</button>
            </div>
        `;
        
        container.querySelector('.btn-restart').addEventListener('click', () => {
            this.currentPath = [];
            location.reload(); // Simple restart
        });
    }

    addBackButton(container, treeId) {
        const backBtn = document.createElement('button');
        backBtn.className = 'btn-back';
        backBtn.textContent = '← Back';
        backBtn.addEventListener('click', () => {
            this.currentPath.pop();
            // Re-render from beginning (simplified)
            const tree = container;
            this.renderDecision(tree, this.decisions[treeId].root, treeId);
        });
        container.appendChild(backBtn);
    }
}

// ========================
// Visual Timeline
// ========================
class VisualTimeline {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.visual-timeline').forEach(timeline => {
            this.enhanceTimeline(timeline);
        });
    }

    enhanceTimeline(timeline) {
        const items = timeline.querySelectorAll('.timeline-item');
        
        // Add scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, { threshold: 0.1 });
        
        items.forEach(item => observer.observe(item));
        
        // Add interactive tooltips
        items.forEach(item => {
            item.addEventListener('click', () => {
                this.expandTimelineItem(item);
            });
        });
    }

    expandTimelineItem(item) {
        const content = item.querySelector('.timeline-content');
        const expanded = content.querySelector('.expanded-content');
        
        if (expanded) {
            expanded.style.display = expanded.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// ========================
// Skill Radar Chart
// ========================
class SkillRadarChart {
    constructor(canvas, data) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = data;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 40;
        this.init();
    }

    init() {
        this.drawBackground();
        this.drawAxes();
        this.drawData();
        this.drawLabels();
    }

    drawBackground() {
        // Draw concentric circles
        for (let i = 1; i <= 5; i++) {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, (this.radius / 5) * i, 0, 2 * Math.PI);
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.stroke();
        }
    }

    drawAxes() {
        const numAxes = this.data.labels.length;
        const angleStep = (2 * Math.PI) / numAxes;
        
        for (let i = 0; i < numAxes; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = this.centerX + this.radius * Math.cos(angle);
            const y = this.centerY + this.radius * Math.sin(angle);
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(x, y);
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.stroke();
        }
    }

    drawData() {
        const numPoints = this.data.values.length;
        const angleStep = (2 * Math.PI) / numPoints;
        
        this.ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const value = this.data.values[i] / 100; // Normalize to 0-1
            const x = this.centerX + this.radius * value * Math.cos(angle);
            const y = this.centerY + this.radius * value * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ff9800';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawLabels() {
        const numLabels = this.data.labels.length;
        const angleStep = (2 * Math.PI) / numLabels;
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#333';
        
        for (let i = 0; i < numLabels; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = this.centerX + (this.radius + 20) * Math.cos(angle);
            const y = this.centerY + (this.radius + 20) * Math.sin(angle);
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.data.labels[i], x, y);
        }
    }
}

// ========================
// Learning Path Tracker
// ========================
class LearningPathTracker {
    constructor() {
        this.progress = this.loadProgress();
        this.init();
    }

    loadProgress() {
        const saved = localStorage.getItem('learningPathProgress');
        return saved ? JSON.parse(saved) : {};
    }

    saveProgress() {
        localStorage.setItem('learningPathProgress', JSON.stringify(this.progress));
    }

    init() {
        document.querySelectorAll('.path-module').forEach(module => {
            this.setupModule(module);
        });
        
        this.updateOverallProgress();
    }

    setupModule(module) {
        const moduleId = module.dataset.moduleId;
        const tasks = JSON.parse(module.dataset.tasks || '[]');
        
        if (!this.progress[moduleId]) {
            this.progress[moduleId] = {
                completed: [],
                startedAt: null,
                completedAt: null
            };
        }
        
        // Calculate and display progress
        const completedCount = this.progress[moduleId].completed.length;
        const totalTasks = tasks.length;
        const percentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
        
        module.style.setProperty('--progress', percentage + '%');
        
        // Add task checklist
        if (tasks.length > 0) {
            this.addTaskChecklist(module, moduleId, tasks);
        }
        
        // Update stats display
        const stats = module.querySelector('.path-module-stats');
        if (stats) {
            stats.innerHTML = `
                <span>${completedCount}/${totalTasks} tasks</span>
                <span>${Math.round(percentage)}% complete</span>
            `;
        }
    }

    addTaskChecklist(module, moduleId, tasks) {
        const checklist = document.createElement('div');
        checklist.className = 'module-tasks';
        
        tasks.forEach((task, index) => {
            const taskId = `${moduleId}-task-${index}`;
            const isCompleted = this.progress[moduleId].completed.includes(taskId);
            
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${isCompleted ? 'completed' : ''}`;
            taskEl.innerHTML = `
                <input type="checkbox" id="${taskId}" ${isCompleted ? 'checked' : ''}>
                <label for="${taskId}">${task}</label>
            `;
            
            taskEl.querySelector('input').addEventListener('change', (e) => {
                this.toggleTask(moduleId, taskId, e.target.checked);
                this.setupModule(module); // Refresh display
            });
            
            checklist.appendChild(taskEl);
        });
        
        module.appendChild(checklist);
    }

    toggleTask(moduleId, taskId, completed) {
        if (completed) {
            if (!this.progress[moduleId].completed.includes(taskId)) {
                this.progress[moduleId].completed.push(taskId);
                
                if (!this.progress[moduleId].startedAt) {
                    this.progress[moduleId].startedAt = new Date().toISOString();
                }
            }
        } else {
            const index = this.progress[moduleId].completed.indexOf(taskId);
            if (index > -1) {
                this.progress[moduleId].completed.splice(index, 1);
            }
        }
        
        this.saveProgress();
        this.updateOverallProgress();
    }

    updateOverallProgress() {
        const totalModules = document.querySelectorAll('.path-module').length;
        let completedModules = 0;
        let totalTasks = 0;
        let completedTasks = 0;
        
        Object.keys(this.progress).forEach(moduleId => {
            const module = document.querySelector(`[data-module-id="${moduleId}"]`);
            if (module) {
                const tasks = JSON.parse(module.dataset.tasks || '[]');
                totalTasks += tasks.length;
                completedTasks += this.progress[moduleId].completed.length;
                
                if (tasks.length > 0 && this.progress[moduleId].completed.length === tasks.length) {
                    completedModules++;
                    module.classList.add('completed');
                }
            }
        });
        
        // Update overall progress display
        const overallProgress = document.querySelector('.overall-progress');
        if (overallProgress) {
            const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            overallProgress.innerHTML = `
                <h3>Overall Progress</h3>
                <div class="progress-ring" data-progress="${percentage}"></div>
                <p>${completedModules}/${totalModules} modules completed</p>
                <p>${completedTasks}/${totalTasks} total tasks completed</p>
            `;
            
            // Initialize progress ring
            const ring = overallProgress.querySelector('.progress-ring');
            if (ring) {
                new ProgressRing(ring, percentage);
            }
        }
    }
}

// ========================
// Knowledge Check System
// ========================
class KnowledgeCheckSystem {
    constructor() {
        this.checks = [];
        this.completed = this.loadCompleted();
        this.init();
    }

    loadCompleted() {
        const saved = localStorage.getItem('knowledgeChecks');
        return saved ? JSON.parse(saved) : [];
    }

    saveCompleted() {
        localStorage.setItem('knowledgeChecks', JSON.stringify(this.completed));
    }

    init() {
        document.querySelectorAll('.knowledge-check').forEach(check => {
            this.setupCheck(check);
        });
    }

    setupCheck(check) {
        const checkId = check.dataset.checkId || 'check-' + Date.now();
        const items = check.querySelectorAll('.knowledge-check-item');
        
        items.forEach((item, index) => {
            const itemId = `${checkId}-item-${index}`;
            
            if (this.completed.includes(itemId)) {
                item.classList.add('completed');
            }
            
            item.addEventListener('click', () => {
                this.toggleItem(item, itemId);
            });
        });
        
        this.updateCheckProgress(check, checkId);
    }

    toggleItem(item, itemId) {
        item.classList.toggle('completed');
        
        if (item.classList.contains('completed')) {
            if (!this.completed.includes(itemId)) {
                this.completed.push(itemId);
            }
        } else {
            const index = this.completed.indexOf(itemId);
            if (index > -1) {
                this.completed.splice(index, 1);
            }
        }
        
        this.saveCompleted();
        this.updateCheckProgress(item.closest('.knowledge-check'));
    }

    updateCheckProgress(check, checkId) {
        const items = check.querySelectorAll('.knowledge-check-item');
        const completed = check.querySelectorAll('.knowledge-check-item.completed');
        const percentage = items.length > 0 ? Math.round((completed.length / items.length) * 100) : 0;
        
        const header = check.querySelector('h3');
        if (header && !header.querySelector('.check-progress')) {
            const progress = document.createElement('span');
            progress.className = 'check-progress';
            header.appendChild(progress);
        }
        
        const progress = check.querySelector('.check-progress');
        if (progress) {
            progress.textContent = ` (${completed.length}/${items.length} - ${percentage}%)`;
        }
    }
}

// ========================
// Initialize Everything
// ========================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Memory Card System
    new MemoryCardSystem();
    
    // Initialize Concept Maps
    document.querySelectorAll('.concept-map').forEach(map => {
        new ConceptMapBuilder(map);
    });
    
    // Initialize Decision Trees
    new DecisionTreeNavigator();
    
    // Initialize Visual Timeline
    new VisualTimeline();
    
    // Initialize Progress Rings
    document.querySelectorAll('.progress-ring').forEach(ring => {
        const progress = parseInt(ring.dataset.progress || 0);
        new ProgressRing(ring, progress);
    });
    
    // Initialize Skill Radar Charts
    document.querySelectorAll('.skill-radar canvas').forEach(canvas => {
        const data = JSON.parse(canvas.dataset.skills || '{}');
        if (data.labels && data.values) {
            new SkillRadarChart(canvas, data);
        }
    });
    
    // Initialize Learning Path Tracker
    new LearningPathTracker();
    
    // Initialize Knowledge Check System
    new KnowledgeCheckSystem();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Save reading progress
    saveReadingProgress();
    
    // Initialize comparison matrix enhancements
    enhanceComparisonMatrices();
});

// ========================
// Reading Progress Tracker
// ========================
function saveReadingProgress() {
    const pageId = window.location.pathname;
    const scrollPercentage = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return Math.round((scrollTop / scrollHeight) * 100);
    };
    
    let lastSave = 0;
    window.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastSave > 1000) { // Save every second
            const progress = scrollPercentage();
            const readingProgress = JSON.parse(localStorage.getItem('readingProgress') || '{}');
            readingProgress[pageId] = {
                progress: progress,
                lastRead: new Date().toISOString()
            };
            localStorage.setItem('readingProgress', JSON.stringify(readingProgress));
            lastSave = now;
        }
    });
}

// ========================
// Comparison Matrix Enhancements
// ========================
function enhanceComparisonMatrices() {
    document.querySelectorAll('.comparison-matrix table').forEach(table => {
        // Add sorting capability
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            if (index > 0) { // Skip first column
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => sortTable(table, index));
            }
        });
        
        // Add row highlighting
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.background = 'rgba(255, 152, 0, 0.05)';
            });
            row.addEventListener('mouseleave', () => {
                row.style.background = '';
            });
        });
    });
}

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const sorted = rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        return aText.localeCompare(bText, undefined, { numeric: true });
    });
    
    tbody.innerHTML = '';
    sorted.forEach(row => tbody.appendChild(row));
}

// ========================
// Export Progress Data
// ========================
window.exportProgress = function() {
    const data = {
        memoryCards: localStorage.getItem('memoryCardProgress'),
        learningPath: localStorage.getItem('learningPathProgress'),
        knowledgeChecks: localStorage.getItem('knowledgeChecks'),
        readingProgress: localStorage.getItem('readingProgress'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `systemcraft-progress-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

// ========================
// Import Progress Data
// ========================
window.importProgress = function(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.memoryCards) localStorage.setItem('memoryCardProgress', data.memoryCards);
            if (data.learningPath) localStorage.setItem('learningPathProgress', data.learningPath);
            if (data.knowledgeChecks) localStorage.setItem('knowledgeChecks', data.knowledgeChecks);
            if (data.readingProgress) localStorage.setItem('readingProgress', data.readingProgress);
            
            alert('Progress imported successfully! Refreshing page...');
            location.reload();
        } catch (error) {
            alert('Error importing progress: ' + error.message);
        }
    };
    reader.readAsText(file);
};