/**
 * Onboarding Module - Lazy Loaded
 * Optimized version of the original onboarding system with memory leak fixes
 */

class OptimizedOnboardingSystem {
  constructor() {
    this.storageKey = 'systemcraft-onboarding';
    this.onboardingState = this.loadOnboardingState();
    this.currentTour = null;
    this.tourStep = 0;
    this.eventListeners = new Map();
    this.cleanupTasks = [];
  }

  static async init() {
    const instance = new OptimizedOnboardingSystem();
    await instance.initialize();
    return instance;
  }

  async initialize() {
    // Load module only when needed
    await this.createHelpWidget();
    this.initContextualHelp();
    this.initTooltips();
    this.checkForAutoTours();
    this.bindEvents();
    
    // Register cleanup
    this.registerCleanup();
    
    // Expose to global scope
    window.onboardingSystem = this;
  }

  loadOnboardingState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load onboarding state:', e);
    }
    
    return {
      completedTours: [],
      firstVisit: true,
      lastHelpShown: null,
      dismissedTips: [],
      userPreferences: {
        showTooltips: true,
        autoStartTours: true,
        helpPosition: 'bottom-right'
      }
    };
  }

  saveOnboardingState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.onboardingState));
    } catch (e) {
      console.error('Could not save onboarding state:', e);
    }
  }

  async createHelpWidget() {
    // Check if widget already exists
    if (document.querySelector('.help-widget')) return;

    const widget = document.createElement('div');
    widget.className = 'help-widget';
    widget.innerHTML = this.getHelpWidgetHTML();
    
    document.body.appendChild(widget);
    
    // Load CSS dynamically
    await this.loadStyles();
  }

  getHelpWidgetHTML() {
    return `
      <button class="help-toggle" aria-label="Open help menu" title="Help & Tours (F1)">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"/>
        </svg>
      </button>
      <div class="help-menu" hidden>
        ${this.getHelpMenuHTML()}
      </div>
    `;
  }

  getHelpMenuHTML() {
    return `
      <div class="help-menu-header">
        <h3>Help & Tours</h3>
        <button class="help-close" aria-label="Close help menu">&times;</button>
      </div>
      <div class="help-menu-content">
        <div class="help-section">
          <h4>Quick Start</h4>
          <div class="help-actions">
            <button class="help-action" data-action="tour" data-tour="first-visit">
              <span class="help-icon">🎯</span>
              <div class="help-action-content">
                <div class="help-action-title">Site Overview Tour</div>
                <div class="help-action-description">Learn the basics in 3 minutes</div>
              </div>
            </button>
            
            <button class="help-action" data-action="tour" data-tour="study-planning">
              <span class="help-icon">📚</span>
              <div class="help-action-content">
                <div class="help-action-title">Study Planning Tour</div>
                <div class="help-action-description">Create your personalized plan</div>
              </div>
            </button>
            
            <button class="help-action" data-action="tour" data-tour="features">
              <span class="help-icon">✨</span>
              <div class="help-action-content">
                <div class="help-action-title">Advanced Features</div>
                <div class="help-action-description">Discover all the tools</div>
              </div>
            </button>
          </div>
        </div>
        
        <div class="help-section">
          <h4>Quick Help</h4>
          <div class="help-links">
            <a href="/fundamentals/faq/" class="help-link">
              <span class="help-icon">❓</span>
              <span>Frequently Asked Questions</span>
            </a>
            <a href="#" class="help-link" data-action="shortcuts">
              <span class="help-icon">⌨️</span>
              <span>Keyboard Shortcuts</span>
            </a>
            <a href="#" class="help-link" data-action="contact">
              <span class="help-icon">📧</span>
              <span>Contact Support</span>
            </a>
          </div>
        </div>
        
        <div class="help-section">
          <h4>Settings</h4>
          <div class="help-settings">
            <label class="help-setting">
              <input type="checkbox" ${this.onboardingState.userPreferences.showTooltips ? 'checked' : ''}>
              <span>Show contextual tooltips</span>
            </label>
            <label class="help-setting">
              <input type="checkbox" ${this.onboardingState.userPreferences.autoStartTours ? 'checked' : ''}>
              <span>Auto-start tours for new features</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  async loadStyles() {
    // Only load styles if not already loaded
    if (document.getElementById('onboarding-styles')) return;

    const link = document.createElement('link');
    link.id = 'onboarding-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/css/onboarding.css';
    
    return new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  initContextualHelp() {
    // Add contextual help with performance optimization
    requestIdleCallback(() => {
      const complexSections = document.querySelectorAll(
        '.assessment-container, .decision-tree, .skill-tree, .system-design-canvas'
      );
      
      complexSections.forEach(section => {
        this.addContextualHelpButton(section);
      });
    });
  }

  addContextualHelpButton(section) {
    // Prevent duplicate buttons
    if (section.querySelector('.contextual-help-button')) return;

    const helpButton = document.createElement('button');
    helpButton.className = 'contextual-help-button';
    helpButton.innerHTML = '?';
    helpButton.title = 'Get help with this section';
    helpButton.setAttribute('aria-label', 'Show contextual help');
    
    const handleClick = () => this.showContextualHelp(section);
    helpButton.addEventListener('click', handleClick);
    
    // Store reference for cleanup
    this.eventListeners.set(helpButton, { event: 'click', handler: handleClick });
    
    section.style.position = 'relative';
    section.appendChild(helpButton);
  }

  initTooltips() {
    if (!this.onboardingState.userPreferences.showTooltips) return;
    
    requestIdleCallback(() => {
      const tooltipElements = [
        { selector: '.md-search__input', text: 'Search all content (press / to focus)' },
        { selector: '.md-nav__toggle', text: 'Toggle table of contents' },
        { selector: '.md-header__button[for="__drawer"]', text: 'Open navigation menu' },
        { selector: '.personalization-toggle', text: 'Personalize your experience' },
        { selector: '.search-widget-toggle', text: 'Advanced search with filters' },
        { selector: '.mobile-toolbar-item', text: 'Quick access to key features' }
      ];
      
      tooltipElements.forEach(({ selector, text }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!element.title && !element.getAttribute('aria-label')) {
            this.addTooltip(element, text);
          }
        });
      });
    });
  }

  addTooltip(element, text) {
    let tooltip = null;
    
    const showTooltip = (e) => {
      if (tooltip) return;
      
      tooltip = document.createElement('div');
      tooltip.className = 'contextual-tooltip';
      tooltip.textContent = text;
      document.body.appendChild(tooltip);
      
      const rect = element.getBoundingClientRect();
      tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
      
      requestAnimationFrame(() => tooltip.classList.add('show'));
    };
    
    const hideTooltip = () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    };
    
    // Use passive listeners for better performance
    element.addEventListener('mouseenter', showTooltip, { passive: true });
    element.addEventListener('mouseleave', hideTooltip, { passive: true });
    element.addEventListener('focus', showTooltip, { passive: true });
    element.addEventListener('blur', hideTooltip, { passive: true });
    
    // Store for cleanup
    this.eventListeners.set(element, [
      { event: 'mouseenter', handler: showTooltip },
      { event: 'mouseleave', handler: hideTooltip },
      { event: 'focus', handler: showTooltip },
      { event: 'blur', handler: hideTooltip }
    ]);
  }

  bindEvents() {
    const handleClick = (e) => {
      if (e.target.classList.contains('help-toggle')) {
        this.toggleHelpMenu();
      }
      
      if (e.target.classList.contains('help-close')) {
        this.closeHelpMenu();
      }
      
      if (e.target.classList.contains('help-action')) {
        this.handleHelpAction(e.target);
      }
      
      if (e.target.classList.contains('help-link')) {
        this.handleHelpLink(e.target);
      }

      // Settings checkboxes
      if (e.target.type === 'checkbox' && e.target.closest('.help-settings')) {
        this.handleSettingsChange(e.target);
      }
    };

    const handleKeydown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.toggleHelpMenu();
      }
      
      if (e.key === 'Escape') {
        if (this.currentTour) {
          this.endTour();
        } else {
          this.closeHelpMenu();
        }
      }
    };

    // Use event delegation
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);

    // Store for cleanup
    this.eventListeners.set(document, [
      { event: 'click', handler: handleClick },
      { event: 'keydown', handler: handleKeydown }
    ]);
  }

  handleSettingsChange(checkbox) {
    const isTooltips = checkbox.parentElement.textContent.includes('tooltips');
    const isAutoTours = checkbox.parentElement.textContent.includes('Auto-start');
    
    if (isTooltips) {
      this.updatePreference('showTooltips', checkbox.checked);
    }
    
    if (isAutoTours) {
      this.updatePreference('autoStartTours', checkbox.checked);
    }
  }

  updatePreference(key, value) {
    this.onboardingState.userPreferences[key] = value;
    this.saveOnboardingState();
    
    if (key === 'showTooltips') {
      if (value) {
        this.initTooltips();
      } else {
        document.querySelectorAll('.contextual-tooltip').forEach(t => t.remove());
      }
    }
  }

  checkForAutoTours() {
    if (!this.onboardingState.userPreferences.autoStartTours) return;
    
    if (this.onboardingState.firstVisit) {
      setTimeout(() => {
        this.showWelcomeDialog();
      }, 2000);
    }
  }

  showWelcomeDialog() {
    // Prevent multiple welcome dialogs
    if (document.querySelector('.welcome-dialog')) return;

    const dialog = document.createElement('div');
    dialog.className = 'welcome-dialog';
    dialog.innerHTML = this.getWelcomeDialogHTML();
    
    document.body.appendChild(dialog);
    requestAnimationFrame(() => dialog.classList.add('show'));
    
    // Bind events with proper cleanup
    this.bindWelcomeEvents(dialog);
  }

  getWelcomeDialogHTML() {
    return `
      <div class="welcome-dialog-backdrop"></div>
      <div class="welcome-dialog-content">
        <div class="welcome-header">
          <h2>Welcome to SystemCraft! 👋</h2>
          <p>Your comprehensive guide to Amazon L6/L7 Engineering Manager interviews</p>
        </div>
        
        <div class="welcome-body">
          <div class="welcome-features">
            <div class="welcome-feature">
              <div class="feature-icon">🎯</div>
              <h3>Personalized Learning</h3>
              <p>Take assessments to get customized study plans</p>
            </div>
            <div class="welcome-feature">
              <div class="feature-icon">📚</div>
              <h3>Interactive Content</h3>
              <p>Practice with decision trees, skill maps, and design tools</p>
            </div>
            <div class="welcome-feature">
              <div class="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your learning journey with detailed analytics</p>
            </div>
          </div>
          
          <div class="welcome-question">
            <h3>How would you like to start?</h3>
            <div class="welcome-options">
              <button class="welcome-option" data-action="tour">
                <span class="option-icon">🎬</span>
                <div class="option-content">
                  <strong>Take the Tour</strong>
                  <p>3-minute overview of key features</p>
                </div>
              </button>
              
              <button class="welcome-option" data-action="assessment">
                <span class="option-icon">📝</span>
                <div class="option-content">
                  <strong>Start Assessment</strong>
                  <p>Find your current skill level</p>
                </div>
              </button>
              
              <button class="welcome-option" data-action="browse">
                <span class="option-icon">🔍</span>
                <div class="option-content">
                  <strong>Browse Content</strong>
                  <p>Explore at your own pace</p>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div class="welcome-footer">
          <label class="welcome-setting">
            <input type="checkbox" checked>
            <span>Show welcome dialog for new features</span>
          </label>
          
          <div class="welcome-actions">
            <button class="md-button dismiss-welcome">Skip for now</button>
          </div>
        </div>
      </div>
    `;
  }

  bindWelcomeEvents(dialog) {
    const handleWelcomeClick = (e) => {
      if (e.target.classList.contains('welcome-option')) {
        const action = e.target.dataset.action;
        this.handleWelcomeAction(action);
        dialog.remove();
      }
      
      if (e.target.classList.contains('dismiss-welcome')) {
        this.dismissWelcome();
        dialog.remove();
      }
      
      if (e.target.classList.contains('welcome-dialog-backdrop')) {
        dialog.remove();
      }
    };

    dialog.addEventListener('click', handleWelcomeClick);
    
    // Store for potential cleanup
    this.cleanupTasks.push(() => dialog.remove());
  }

  handleWelcomeAction(action) {
    switch (action) {
      case 'tour':
        this.startTour('first-visit');
        break;
      case 'assessment':
        window.location.href = '/self-assessment-quiz/';
        break;
      case 'browse':
        // Just dismiss
        break;
    }
    
    this.onboardingState.firstVisit = false;
    this.saveOnboardingState();
  }

  dismissWelcome() {
    this.onboardingState.firstVisit = false;
    this.saveOnboardingState();
  }

  toggleHelpMenu() {
    const menu = document.querySelector('.help-menu');
    if (!menu) return;
    
    const isHidden = menu.hasAttribute('hidden');
    
    if (isHidden) {
      menu.removeAttribute('hidden');
      menu.focus();
    } else {
      menu.setAttribute('hidden', '');
    }
  }

  closeHelpMenu() {
    const menu = document.querySelector('.help-menu');
    if (menu) {
      menu.setAttribute('hidden', '');
    }
  }

  handleHelpAction(button) {
    const action = button.dataset.action;
    const tour = button.dataset.tour;
    
    this.closeHelpMenu();
    
    if (action === 'tour' && tour) {
      this.startTour(tour);
    }
  }

  handleHelpLink(link) {
    const action = link.dataset.action;
    
    this.closeHelpMenu();
    
    switch (action) {
      case 'shortcuts':
        if (window.keyboardShortcuts) {
          window.keyboardShortcuts.showShortcutHelp();
        }
        break;
      case 'contact':
        this.showContactInfo();
        break;
    }
  }

  startTour(tourId) {
    // Simplified tour implementation - full implementation would be similar
    // but optimized for performance and memory usage
    console.log(`Starting tour: ${tourId}`);
    
    // Mark tour as completed
    if (!this.onboardingState.completedTours.includes(tourId)) {
      this.onboardingState.completedTours.push(tourId);
      this.saveOnboardingState();
    }
  }

  // Memory leak prevention
  registerCleanup() {
    this.cleanupTasks.push(() => {
      // Remove event listeners
      this.eventListeners.forEach((listeners, element) => {
        if (Array.isArray(listeners)) {
          listeners.forEach(({ event, handler }) => {
            element.removeEventListener(event, handler);
          });
        } else {
          element.removeEventListener(listeners.event, listeners.handler);
        }
      });
      
      // Clear references
      this.eventListeners.clear();
      
      // Remove DOM elements
      document.querySelectorAll('.help-widget, .tour-overlay, .welcome-dialog').forEach(el => {
        el.remove();
      });
    });
    
    // Register cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  cleanup() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (e) {
        console.warn('Cleanup task failed:', e);
      }
    });
    this.cleanupTasks = [];
  }
}

export default OptimizedOnboardingSystem;