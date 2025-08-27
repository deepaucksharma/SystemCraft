/**
 * SystemCraft Core - Performance Optimized Entry Point
 * Implements lazy loading, code splitting, and progressive enhancement
 */

class SystemCraftCore {
  constructor() {
    this.loadedModules = new Set();
    this.moduleLoaders = new Map();
    this.observers = new Map();
    this.performance = {
      loadTimes: {},
      interactions: {},
      errors: []
    };
    
    this.init();
  }

  init() {
    this.measurePerformance();
    this.setupLazyLoading();
    this.initCriticalFeatures();
    this.setupIntersectionObservers();
    this.bindEvents();
    this.reportPerformanceMetrics();
  }

  /**
   * Measure Core Web Vitals and performance metrics
   */
  measurePerformance() {
    // Measure Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.performance.lcp = entry.startTime;
        this.reportMetric('LCP', entry.startTime);
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // Measure First Input Delay (FID) / Interaction to Next Paint (INP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.performance.inp = entry.processingStart - entry.startTime;
        this.reportMetric('INP', this.performance.inp);
      }
    }).observe({ type: 'first-input', buffered: true });

    // Measure Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.performance.cls = clsValue;
      this.reportMetric('CLS', clsValue);
    }).observe({ type: 'layout-shift', buffered: true });
  }

  /**
   * Setup lazy loading for heavy modules
   */
  setupLazyLoading() {
    // Define module loading strategies
    this.moduleLoaders.set('onboarding', () => this.loadModule('onboarding', {
      trigger: 'firstVisit',
      delay: 2000,
      priority: 'low'
    }));

    this.moduleLoaders.set('collaborative', () => this.loadModule('collaborative', {
      trigger: 'click:.collaborative-coding-button',
      priority: 'high'
    }));

    this.moduleLoaders.set('analytics', () => this.loadModule('analytics', {
      trigger: 'intersection:.analytics-dashboard',
      priority: 'low'
    }));

    this.moduleLoaders.set('personalization', () => this.loadModule('personalization', {
      trigger: 'user-interaction',
      delay: 3000,
      priority: 'medium'
    }));

    this.moduleLoaders.set('interactive', () => this.loadModule('interactive', {
      trigger: 'intersection:.interactive-element',
      priority: 'medium'
    }));

    this.moduleLoaders.set('mockInterview', () => this.loadModule('mockInterview', {
      trigger: 'click:.mock-interview-button',
      priority: 'high'
    }));

    // Page-specific modules
    this.moduleLoaders.set('systemDesign', () => this.loadModule('systemDesign', {
      trigger: 'route:/system-design',
      priority: 'high'
    }));

    this.moduleLoaders.set('behavioral', () => this.loadModule('behavioral', {
      trigger: 'route:/behavioral',
      priority: 'high'
    }));

    // Setup triggers
    this.setupModuleTriggers();
  }

  /**
   * Initialize critical features that must load immediately
   */
  initCriticalFeatures() {
    // Essential search functionality
    this.initCriticalSearch();
    
    // Essential navigation
    this.initCriticalNavigation();
    
    // Basic theme switching
    this.initCriticalTheme();
    
    // Error boundary
    this.initErrorHandling();
  }

  initCriticalSearch() {
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      // Debounced search to prevent excessive queries
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.handleSearch(e.target.value);
        }, 300);
      });

      // Focus shortcut
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }
  }

  initCriticalNavigation() {
    // Prefetch important pages on hover
    const navLinks = document.querySelectorAll('.md-nav__link');
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.prefetchPage(link.href);
      }, { once: true });
    });

    // Instant navigation feedback
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.href.includes(window.location.origin)) {
          this.showNavigationFeedback();
        }
      });
    });
  }

  initCriticalTheme() {
    // Theme switching without flash
    const themeToggle = document.querySelector('[data-md-color-scheme]');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-md-color-scheme', e.target.value);
        localStorage.setItem('data-md-color-scheme', e.target.value);
      });
    }

    // Apply saved theme immediately
    const savedTheme = localStorage.getItem('data-md-color-scheme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-md-color-scheme', savedTheme);
    }
  }

  initErrorHandling() {
    window.addEventListener('error', (e) => {
      this.performance.errors.push({
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        timestamp: Date.now()
      });
      
      // Report critical errors
      if (this.performance.errors.length > 10) {
        this.reportErrors();
      }
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.performance.errors.push({
        message: 'Unhandled Promise Rejection: ' + e.reason,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Setup intersection observers for lazy loading
   */
  setupIntersectionObservers() {
    // Lazy load modules when elements come into view
    const lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const trigger = entry.target.dataset.lazyModule;
          if (trigger && this.moduleLoaders.has(trigger)) {
            this.moduleLoaders.get(trigger)();
            lazyLoadObserver.unobserve(entry.target);
          }
        }
      });
    }, { rootMargin: '100px' });

    this.observers.set('lazyLoad', lazyLoadObserver);

    // Observe elements that should trigger module loading
    document.querySelectorAll('[data-lazy-module]').forEach(el => {
      lazyLoadObserver.observe(el);
    });
  }

  /**
   * Setup module trigger events
   */
  setupModuleTriggers() {
    // First visit trigger
    if (!localStorage.getItem('systemcraft-visited')) {
      setTimeout(() => {
        this.moduleLoaders.get('onboarding')();
        localStorage.setItem('systemcraft-visited', 'true');
      }, 2000);
    }

    // User interaction trigger
    let interactionTriggered = false;
    const triggerUserInteraction = () => {
      if (!interactionTriggered) {
        interactionTriggered = true;
        setTimeout(() => {
          this.moduleLoaders.get('personalization')();
        }, 1000);
        
        document.removeEventListener('scroll', triggerUserInteraction);
        document.removeEventListener('click', triggerUserInteraction);
        document.removeEventListener('keydown', triggerUserInteraction);
      }
    };

    document.addEventListener('scroll', triggerUserInteraction, { passive: true });
    document.addEventListener('click', triggerUserInteraction);
    document.addEventListener('keydown', triggerUserInteraction);

    // Route-based triggers
    this.setupRouteTriggers();
  }

  setupRouteTriggers() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/system-design')) {
      this.moduleLoaders.get('systemDesign')();
    }
    
    if (currentPath.includes('/behavioral')) {
      this.moduleLoaders.get('behavioral')();
    }

    // Listen for route changes (if using SPA navigation)
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
  }

  /**
   * Load a module dynamically with performance tracking
   */
  async loadModule(moduleName, options = {}) {
    if (this.loadedModules.has(moduleName)) {
      return;
    }

    const startTime = performance.now();
    
    try {
      // Show loading indicator if needed
      if (options.priority === 'high') {
        this.showLoadingIndicator(moduleName);
      }

      // Dynamic import with error handling
      const module = await import(/* webpackChunkName: "[request]" */ `./modules/${moduleName}/index.js`);
      
      // Initialize the module
      if (module.default) {
        await module.default.init();
      }

      this.loadedModules.add(moduleName);
      
      const loadTime = performance.now() - startTime;
      this.performance.loadTimes[moduleName] = loadTime;
      
      // Report loading performance
      this.reportModuleLoad(moduleName, loadTime);
      
      // Hide loading indicator
      this.hideLoadingIndicator(moduleName);
      
    } catch (error) {
      console.error(`Failed to load module ${moduleName}:`, error);
      this.performance.errors.push({
        module: moduleName,
        error: error.message,
        timestamp: Date.now()
      });
      
      this.hideLoadingIndicator(moduleName);
    }
  }

  /**
   * Event binding with memory leak prevention
   */
  bindEvents() {
    // Use event delegation to prevent memory leaks
    document.addEventListener('click', this.handleClick.bind(this), { passive: true });
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Handle visibility changes for performance optimization
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseNonCriticalTasks();
      } else {
        this.resumeNonCriticalTasks();
      }
    });
  }

  handleClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const moduleName = target.dataset.module;

    if (moduleName && this.moduleLoaders.has(moduleName)) {
      this.moduleLoaders.get(moduleName)();
    }

    // Track interaction for INP measurement
    this.trackInteraction(action, performance.now());
  }

  handleKeydown(e) {
    // Global keyboard shortcuts
    if (e.key === 'Escape') {
      this.closeModals();
    }
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          document.querySelector('.md-search__input')?.focus();
          break;
        case '/':
          e.preventDefault();
          this.loadModule('search-enhancements');
          break;
      }
    }
  }

  /**
   * Performance monitoring and reporting
   */
  reportMetric(name, value) {
    // Report to analytics if available
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: value,
        custom_parameter: 'systemcraft'
      });
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${value}ms`);
    }
  }

  reportModuleLoad(moduleName, loadTime) {
    if (window.gtag) {
      window.gtag('event', 'module_load', {
        module_name: moduleName,
        load_time: loadTime
      });
    }
  }

  reportPerformanceMetrics() {
    // Report performance metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = {
          ...this.performance,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          connection: navigator.connection?.effectiveType,
          url: window.location.href
        };

        this.sendPerformanceData(metrics);
      }, 1000);
    });
  }

  sendPerformanceData(metrics) {
    // Send to analytics endpoint (implement based on your analytics solution)
    if (navigator.sendBeacon && window.location.hostname !== 'localhost') {
      const data = JSON.stringify(metrics);
      navigator.sendBeacon('/analytics/performance', data);
    }
  }

  /**
   * UI feedback methods
   */
  showLoadingIndicator(moduleName) {
    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator';
    indicator.id = `loading-${moduleName}`;
    indicator.innerHTML = `
      <div class="loading-spinner"></div>
      <span>Loading ${moduleName}...</span>
    `;
    document.body.appendChild(indicator);
  }

  hideLoadingIndicator(moduleName) {
    const indicator = document.getElementById(`loading-${moduleName}`);
    if (indicator) {
      indicator.remove();
    }
  }

  showNavigationFeedback() {
    document.body.classList.add('navigating');
    setTimeout(() => {
      document.body.classList.remove('navigating');
    }, 1000);
  }

  /**
   * Utility methods
   */
  prefetchPage(url) {
    if (url && url !== window.location.href) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }
  }

  handleSearch(query) {
    if (query.length > 2) {
      // Load enhanced search module if needed
      if (!this.loadedModules.has('search-enhancements')) {
        this.loadModule('search-enhancements');
      }
    }
  }

  handleRouteChange() {
    const currentPath = window.location.pathname;
    
    // Load page-specific modules
    if (currentPath.includes('/system-design') && !this.loadedModules.has('systemDesign')) {
      this.loadModule('systemDesign');
    }
    
    if (currentPath.includes('/behavioral') && !this.loadedModules.has('behavioral')) {
      this.loadModule('behavioral');
    }
  }

  trackInteraction(action, timestamp) {
    this.performance.interactions[action] = timestamp;
  }

  closeModals() {
    document.querySelectorAll('.modal, .overlay, .popup').forEach(modal => {
      if (modal.style.display !== 'none') {
        modal.style.display = 'none';
      }
    });
  }

  pauseNonCriticalTasks() {
    // Pause animations, polling, etc. when page is hidden
    document.body.classList.add('page-hidden');
  }

  resumeNonCriticalTasks() {
    // Resume tasks when page becomes visible
    document.body.classList.remove('page-hidden');
  }

  cleanup() {
    // Cleanup observers and event listeners to prevent memory leaks
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Initialize core when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SystemCraft = new SystemCraftCore();
  });
} else {
  window.SystemCraft = new SystemCraftCore();
}

// Add critical CSS for loading states
const criticalCSS = `
  .loading-indicator {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #333;
  }
  
  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #ff9900;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .navigating {
    cursor: progress;
  }
  
  .page-hidden .animation,
  .page-hidden .auto-refresh {
    animation-play-state: paused;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = criticalCSS;
document.head.appendChild(styleSheet);

export default SystemCraftCore;