// Lazy load MathJax only when math content is detected
const initMathJax = () => {
  window.MathJax = {
    tex: {
      inlineMath: [["\\(", "\\)"]],
      displayMath: [["\\[", "\\]"]],
      processEscapes: true,
      processEnvironments: true
    },
    options: {
      ignoreHtmlClass: ".*|",
      processHtmlClass: "arithmatex"
    },
    startup: {
      ready: () => {
        MathJax.startup.defaultReady();
        document.dispatchEvent(new CustomEvent('mathjax-loaded'));
      }
    }
  };
};

// Only load MathJax if math content exists
const checkForMath = () => {
  const mathElements = document.querySelectorAll('.arithmatex, [class*="math"]');
  if (mathElements.length > 0) {
    initMathJax();
    return true;
  }
  return false;
};

// Check on DOM ready and navigation changes
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkForMath);
} else {
  checkForMath();
}

// Re-check on Material navigation changes
if (typeof document$ !== 'undefined') {
  document$.subscribe(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => MathJax.typesetPromise(), 100);
    } else {
      checkForMath();
    }
  });
}

// Enhanced code copy functionality (consolidated)
const initCodeCopyButtons = () => {
  const codeBlocks = document.querySelectorAll('pre:not([data-copy-enhanced]) code');
  
  codeBlocks.forEach(block => {
    const pre = block.parentElement;
    pre.setAttribute('data-copy-enhanced', 'true');
    
    // Use existing Material Design clipboard button if available
    const existingButton = pre.querySelector('.md-clipboard');
    if (existingButton) return;
    
    const button = document.createElement('button');
    button.className = 'md-clipboard md-icon';
    button.title = 'Copy to clipboard';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(block.textContent);
        button.classList.add('md-clipboard--copied');
        setTimeout(() => button.classList.remove('md-clipboard--copied'), 2000);
      } catch (err) {
        console.warn('Copy failed, falling back to selection:', err);
        // Fallback for older browsers
        const range = document.createRange();
        range.selectNodeContents(block);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
    
    pre.appendChild(button);
  });
};

// Initialize on DOM ready and navigation changes
const runOnReady = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
};

runOnReady(initCodeCopyButtons);
if (typeof document$ !== 'undefined') {
  document$.subscribe(() => setTimeout(initCodeCopyButtons, 50));
}

// Consolidated progress and study tracking
const StudyTracker = {
  // Progress tracking functionality
  initProgressTracking() {
    const checkboxes = document.querySelectorAll('.task-list-item input[type="checkbox"]:not([data-tracked])');
    
    checkboxes.forEach(checkbox => {
      checkbox.setAttribute('data-tracked', 'true');
      checkbox.addEventListener('change', this.handleProgressChange);
    });
    
    this.loadProgress();
  },
  
  handleProgressChange() {
    StudyTracker.updateProgress();
    StudyTracker.saveProgress();
  },
  
  calculateProgress() {
    const checkboxes = document.querySelectorAll('.task-list-item input[type="checkbox"]');
    const total = checkboxes.length;
    const checked = document.querySelectorAll('.task-list-item input[type="checkbox"]:checked').length;
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  },
  
  updateProgress() {
    const progress = this.calculateProgress();
    const progressElements = document.querySelectorAll('.progress-indicator');
    progressElements.forEach(el => {
      el.textContent = `${progress}% Complete`;
    });
  },
  
  saveProgress() {
    const checkboxes = document.querySelectorAll('.task-list-item input[type="checkbox"]');
    const checkboxStates = {};
    checkboxes.forEach((checkbox, index) => {
      checkboxStates[index] = checkbox.checked;
    });
    try {
      localStorage.setItem('interview-prep-progress', JSON.stringify(checkboxStates));
    } catch (e) {
      console.warn('Failed to save progress:', e);
    }
  },
  
  loadProgress() {
    try {
      const saved = localStorage.getItem('interview-prep-progress');
      if (saved) {
        const checkboxStates = JSON.parse(saved);
        const checkboxes = document.querySelectorAll('.task-list-item input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
          if (checkboxStates[index] !== undefined) {
            checkbox.checked = checkboxStates[index];
          }
        });
        this.updateProgress();
      }
    } catch (e) {
      console.warn('Failed to load progress:', e);
    }
  },
  
  // Study streak tracker
  updateStudyStreak() {
    try {
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem('last-visit');
      let streak = parseInt(localStorage.getItem('study-streak') || '0');
      
      if (lastVisit !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        streak = (lastVisit === yesterday) ? streak + 1 : 1;
        
        localStorage.setItem('study-streak', streak.toString());
        localStorage.setItem('last-visit', today);
        
        const streakElements = document.querySelectorAll('.study-streak');
        streakElements.forEach(el => {
          el.textContent = `🔥 ${streak} day streak!`;
        });
      }
    } catch (e) {
      console.warn('Failed to update study streak:', e);
    }
  },
  
  // Interview timer for mock practice
  startTimer(duration, elementId = 'interview-timer') {
    const display = document.getElementById(elementId);
    if (!display) return null;
    
    let timer = duration;
    const interval = setInterval(() => {
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      
      display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (--timer < 0) {
        clearInterval(interval);
        display.textContent = 'Time\'s up!';
        display.style.color = 'var(--md-accent-fg-color)';
        if (typeof window.interviewTimerComplete === 'function') {
          window.interviewTimerComplete();
        }
      }
    }, 1000);
    
    return interval;
  },
  
  init() {
    this.initProgressTracking();
    this.updateStudyStreak();
  }
};

// Initialize StudyTracker
runOnReady(() => StudyTracker.init());
if (typeof document$ !== 'undefined') {
  document$.subscribe(() => setTimeout(() => StudyTracker.initProgressTracking(), 50));
}

// Global timer function for backwards compatibility
window.startInterviewTimer = (duration) => StudyTracker.startTimer(duration);