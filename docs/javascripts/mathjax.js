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
  }
};

document$.subscribe(() => {
  MathJax.typesetPromise()
})

// Progress tracking functionality
document.addEventListener('DOMContentLoaded', function() {
  // Track checkbox completion
  const checkboxes = document.querySelectorAll('.task-list-item input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const progress = calculateProgress();
      updateProgressDisplay(progress);
      saveProgress();
    });
  });
  
  function calculateProgress() {
    const total = checkboxes.length;
    const checked = document.querySelectorAll('.task-list-item input[type="checkbox"]:checked').length;
    return total > 0 ? (checked / total * 100).toFixed(1) : 0;
  }
  
  function updateProgressDisplay(progress) {
    const progressElements = document.querySelectorAll('.progress-indicator');
    progressElements.forEach(el => {
      el.textContent = `${progress}% Complete`;
    });
  }
  
  function saveProgress() {
    const checkboxStates = {};
    checkboxes.forEach((checkbox, index) => {
      checkboxStates[index] = checkbox.checked;
    });
    localStorage.setItem('interview-prep-progress', JSON.stringify(checkboxStates));
  }
  
  function loadProgress() {
    const saved = localStorage.getItem('interview-prep-progress');
    if (saved) {
      const checkboxStates = JSON.parse(saved);
      checkboxes.forEach((checkbox, index) => {
        if (checkboxStates[index] !== undefined) {
          checkbox.checked = checkboxStates[index];
        }
      });
      const progress = calculateProgress();
      updateProgressDisplay(progress);
    }
  }
  
  loadProgress();
});

// Code copy button enhancement
document.addEventListener('DOMContentLoaded', function() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(block => {
    const button = document.createElement('button');
    button.className = 'md-clipboard md-icon';
    button.title = 'Copy to clipboard';
    
    button.addEventListener('click', function() {
      navigator.clipboard.writeText(block.textContent).then(() => {
        button.classList.add('copied');
        setTimeout(() => button.classList.remove('copied'), 2000);
      });
    });
    
    block.parentElement.appendChild(button);
  });
});

// Interview timer for mock practice
function startInterviewTimer(duration) {
  let timer = duration;
  const display = document.getElementById('interview-timer');
  
  if (!display) return;
  
  const interval = setInterval(function() {
    const minutes = parseInt(timer / 60, 10);
    const seconds = parseInt(timer % 60, 10);
    
    display.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    if (--timer < 0) {
      clearInterval(interval);
      alert('Time is up! Move to the next section.');
    }
  }, 1000);
}

// Study streak tracker
(function() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('last-visit');
  let streak = parseInt(localStorage.getItem('study-streak') || '0');
  
  if (lastVisit !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastVisit === yesterday) {
      streak++;
    } else if (lastVisit !== today) {
      streak = 1;
    }
    
    localStorage.setItem('study-streak', streak.toString());
    localStorage.setItem('last-visit', today);
    
    const streakElements = document.querySelectorAll('.study-streak');
    streakElements.forEach(el => {
      el.textContent = `🔥 ${streak} day streak!`;
    });
  }
})();