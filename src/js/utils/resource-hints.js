/**
 * Resource Hints Optimizer
 * Implements intelligent preload, prefetch, preconnect, and dns-prefetch strategies
 * for optimal resource loading performance
 */

class ResourceHintsOptimizer {
  constructor(options = {}) {
    this.options = {
      // Connection hints
      preconnectUrls: [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      
      // DNS prefetch for external domains
      dnsPrefetchUrls: [
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://api.github.com'
      ],
      
      // Critical resources to preload
      preloadResources: [
        { href: '/assets/css/critical.min.css', as: 'style', type: 'text/css' },
        { href: '/assets/js/core.min.js', as: 'script', type: 'text/javascript' }
      ],
      
      // Resources to prefetch based on user behavior
      prefetchStrategy: 'intelligent', // 'aggressive', 'conservative', 'intelligent'
      prefetchThreshold: 0.3, // Probability threshold for intelligent prefetch
      
      // Performance budgets
      maxPreloadSize: 500000, // 500KB
      maxPrefetchSize: 1000000, // 1MB
      connectionAwareLoading: true,
      
      ...options
    };
    
    this.addedHints = new Set();
    this.prefetchQueue = new Map();
    this.connectionInfo = this.getConnectionInfo();
    this.userBehavior = new Map();
    
    this.init();
  }

  init() {
    // Add initial resource hints
    this.addConnectionHints();
    this.addPreloadHints();
    this.addDnsPrefetchHints();
    
    // Set up intelligent prefetching
    this.setupIntelligentPrefetch();
    
    // Monitor network conditions
    this.setupNetworkMonitoring();
    
    // Track user behavior for better predictions
    this.setupBehaviorTracking();
    
    console.log('Resource hints optimizer initialized', {
      preconnects: this.options.preconnectUrls.length,
      preloads: this.options.preloadResources.length,
      strategy: this.options.prefetchStrategy
    });
  }

  /**
   * Add preconnect hints for external domains
   */
  addConnectionHints() {
    this.options.preconnectUrls.forEach(url => {
      this.addPreconnect(url);
    });
  }

  /**
   * Add DNS prefetch hints
   */
  addDnsPrefetchHints() {
    this.options.dnsPrefetchUrls.forEach(url => {
      this.addDnsPrefetch(url);
    });
  }

  /**
   * Add preload hints for critical resources
   */
  addPreloadHints() {
    this.options.preloadResources.forEach(resource => {
      this.addPreload(resource.href, resource.as, resource);
    });
  }

  /**
   * Add preconnect resource hint
   */
  addPreconnect(url, crossorigin = false) {
    const hintKey = `preconnect:${url}`;
    if (this.addedHints.has(hintKey)) return false;

    try {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      
      if (crossorigin) {
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
      this.addedHints.add(hintKey);
      
      return true;
    } catch (error) {
      console.error('Failed to add preconnect hint:', error);
      return false;
    }
  }

  /**
   * Add DNS prefetch resource hint
   */
  addDnsPrefetch(url) {
    const hintKey = `dns-prefetch:${url}`;
    if (this.addedHints.has(hintKey)) return false;

    try {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      
      document.head.appendChild(link);
      this.addedHints.add(hintKey);
      
      return true;
    } catch (error) {
      console.error('Failed to add DNS prefetch hint:', error);
      return false;
    }
  }

  /**
   * Add preload resource hint
   */
  addPreload(href, as, options = {}) {
    const hintKey = `preload:${href}`;
    if (this.addedHints.has(hintKey)) return false;

    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      
      // Add optional attributes
      if (options.type) link.type = options.type;
      if (options.crossorigin) link.crossOrigin = options.crossorigin;
      if (options.media) link.media = options.media;
      if (options.fetchpriority) link.fetchPriority = options.fetchpriority;
      
      document.head.appendChild(link);
      this.addedHints.add(hintKey);
      
      // Track preload performance
      this.trackResourceLoad(href, 'preload');
      
      return true;
    } catch (error) {
      console.error('Failed to add preload hint:', error);
      return false;
    }
  }

  /**
   * Add prefetch resource hint
   */
  addPrefetch(href, priority = 'low') {
    const hintKey = `prefetch:${href}`;
    if (this.addedHints.has(hintKey)) return false;

    // Check connection quality
    if (!this.shouldPrefetch()) {
      return false;
    }

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      
      // Set importance based on priority
      if ('importance' in link) {
        link.importance = priority;
      }
      
      document.head.appendChild(link);
      this.addedHints.add(hintKey);
      
      // Track prefetch performance
      this.trackResourceLoad(href, 'prefetch');
      
      return true;
    } catch (error) {
      console.error('Failed to add prefetch hint:', error);
      return false;
    }
  }

  /**
   * Add modulepreload for ES modules
   */
  addModulePreload(href, options = {}) {
    const hintKey = `modulepreload:${href}`;
    if (this.addedHints.has(hintKey)) return false;

    try {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = href;
      
      if (options.crossorigin) link.crossOrigin = options.crossorigin;
      
      document.head.appendChild(link);
      this.addedHints.add(hintKey);
      
      return true;
    } catch (error) {
      console.error('Failed to add modulepreload hint:', error);
      return false;
    }
  }

  /**
   * Setup intelligent prefetching based on user behavior
   */
  setupIntelligentPrefetch() {
    if (this.options.prefetchStrategy !== 'intelligent') return;

    // Prefetch on link hover with delay
    this.addLinkHoverPrefetch();
    
    // Prefetch based on viewport visibility
    this.addViewportBasedPrefetch();
    
    // Prefetch based on user patterns
    this.addPatternBasedPrefetch();
  }

  /**
   * Add link hover prefetching
   */
  addLinkHoverPrefetch() {
    let hoverTimeout;
    
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !this.isInternalLink(link.href)) return;
      
      // Delay prefetch to avoid unnecessary requests
      hoverTimeout = setTimeout(() => {
        this.addPrefetch(link.href, 'high');
        this.trackUserBehavior('hover', link.href);
      }, 200);
      
    }, { passive: true });
    
    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    }, { passive: true });
  }

  /**
   * Add viewport-based prefetching
   */
  addViewportBasedPrefetch() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target.closest('a[href]');
          if (link && this.isInternalLink(link.href)) {
            // Prefetch with lower priority for viewport visibility
            setTimeout(() => {
              this.addPrefetch(link.href, 'low');
              this.trackUserBehavior('viewport', link.href);
            }, 1000);
          }
        }
      });
    }, { rootMargin: '100px' });

    // Observe all internal links
    document.querySelectorAll('a[href]').forEach(link => {
      if (this.isInternalLink(link.href)) {
        observer.observe(link);
      }
    });
  }

  /**
   * Add pattern-based prefetching
   */
  addPatternBasedPrefetch() {
    // Analyze user patterns and prefetch likely next pages
    setTimeout(() => {
      this.analyzePatternsAndPrefetch();
    }, 5000);
  }

  /**
   * Analyze user behavior patterns and prefetch accordingly
   */
  analyzePatternsAndPrefetch() {
    const currentPath = window.location.pathname;
    const commonPatterns = this.getCommonNavigationPatterns(currentPath);
    
    commonPatterns.forEach(({ url, probability }) => {
      if (probability > this.options.prefetchThreshold) {
        this.addPrefetch(url, 'medium');
      }
    });
  }

  /**
   * Get common navigation patterns based on current page
   */
  getCommonNavigationPatterns(currentPath) {
    // Define common navigation patterns for the documentation site
    const patterns = {
      '/': [
        { url: '/getting-started/', probability: 0.8 },
        { url: '/fundamentals/l6-vs-l7/', probability: 0.6 },
        { url: '/self-assessment-quiz/', probability: 0.5 }
      ],
      '/getting-started/': [
        { url: '/fundamentals/interview-process/', probability: 0.7 },
        { url: '/practice/6-week-plan/', probability: 0.6 },
        { url: '/self-assessment-quiz/', probability: 0.8 }
      ],
      '/behavioral/': [
        { url: '/behavioral/star-framework/', probability: 0.9 },
        { url: '/behavioral/l6-behavioral-mastery/', probability: 0.7 },
        { url: '/behavioral/l7-behavioral-mastery/', probability: 0.6 }
      ],
      '/system-design/': [
        { url: '/system-design/fundamentals/', probability: 0.8 },
        { url: '/system-design/l6-problems/', probability: 0.7 },
        { url: '/system-design/aws-services/', probability: 0.5 }
      ],
      '/coding/': [
        { url: '/coding/data-structures/', probability: 0.8 },
        { url: '/coding/algorithms/', probability: 0.7 },
        { url: '/coding/patterns/', probability: 0.6 }
      ]
    };
    
    // Find patterns for current path or similar paths
    let relevantPatterns = patterns[currentPath] || [];
    
    // Check for partial matches
    if (relevantPatterns.length === 0) {
      for (const [path, pathPatterns] of Object.entries(patterns)) {
        if (currentPath.startsWith(path)) {
          relevantPatterns = pathPatterns;
          break;
        }
      }
    }
    
    return relevantPatterns;
  }

  /**
   * Setup network condition monitoring
   */
  setupNetworkMonitoring() {
    if ('connection' in navigator) {
      this.updateConnectionInfo();
      
      navigator.connection.addEventListener('change', () => {
        this.updateConnectionInfo();
        this.adjustPrefetchStrategy();
      });
    }
  }

  /**
   * Update connection information
   */
  updateConnectionInfo() {
    if ('connection' in navigator) {
      this.connectionInfo = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
  }

  /**
   * Adjust prefetch strategy based on network conditions
   */
  adjustPrefetchStrategy() {
    const { effectiveType, saveData } = this.connectionInfo;
    
    // Disable prefetch on slow connections or data saver mode
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      this.options.prefetchStrategy = 'conservative';
      console.log('Adjusted prefetch strategy to conservative due to network conditions');
    } else if (effectiveType === '4g') {
      this.options.prefetchStrategy = 'intelligent';
    }
  }

  /**
   * Check if prefetching should be performed
   */
  shouldPrefetch() {
    // Respect user's data saver preference
    if (this.connectionInfo.saveData) return false;
    
    // Respect reduced motion preference (might indicate performance concerns)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    
    // Check connection quality
    if (this.options.connectionAwareLoading) {
      const { effectiveType } = this.connectionInfo;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
    }
    
    // Check page visibility (don't prefetch in background)
    if (document.hidden) return false;
    
    return true;
  }

  /**
   * Setup user behavior tracking
   */
  setupBehaviorTracking() {
    // Track page views
    this.trackUserBehavior('pageview', window.location.pathname);
    
    // Track clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && this.isInternalLink(link.href)) {
        this.trackUserBehavior('click', link.href);
      }
    }, { passive: true });
  }

  /**
   * Track user behavior for pattern analysis
   */
  trackUserBehavior(action, url) {
    const key = `${action}:${url}`;
    const count = this.userBehavior.get(key) || 0;
    this.userBehavior.set(key, count + 1);
    
    // Limit size to prevent memory leaks
    if (this.userBehavior.size > 1000) {
      const oldestEntries = Array.from(this.userBehavior.entries())
        .slice(0, 100);
      oldestEntries.forEach(([key]) => {
        this.userBehavior.delete(key);
      });
    }
  }

  /**
   * Track resource loading performance
   */
  trackResourceLoad(href, type) {
    const startTime = performance.now();
    
    // Monitor for resource load completion
    const checkLoad = () => {
      const entries = performance.getEntriesByName(href);
      const entry = entries[entries.length - 1];
      
      if (entry && entry.responseEnd > startTime) {
        const loadTime = entry.responseEnd - entry.startTime;
        
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'resource_hint_performance', {
            hint_type: type,
            resource_url: href,
            load_time: Math.round(loadTime),
            transfer_size: entry.transferSize || 0
          });
        }
        
        console.log(`${type} performance:`, {
          url: href,
          loadTime: Math.round(loadTime),
          size: entry.transferSize
        });
        
        return;
      }
      
      // Check again after a short delay
      setTimeout(checkLoad, 100);
    };
    
    setTimeout(checkLoad, 100);
  }

  /**
   * Check if URL is internal
   */
  isInternalLink(url) {
    try {
      const link = new URL(url, window.location.origin);
      return link.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Get connection information
   */
  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType || '4g',
        downlink: navigator.connection.downlink || 10,
        rtt: navigator.connection.rtt || 50,
        saveData: navigator.connection.saveData || false
      };
    }
    
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false
    };
  }

  /**
   * Preload critical resources for a specific page
   */
  preloadPageResources(pagePath) {
    const pageResources = this.getPageSpecificResources(pagePath);
    
    pageResources.forEach(resource => {
      if (resource.critical) {
        this.addPreload(resource.href, resource.as, resource);
      } else {
        this.addPrefetch(resource.href);
      }
    });
  }

  /**
   * Get page-specific resources to preload/prefetch
   */
  getPageSpecificResources(pagePath) {
    const resourceMap = {
      '/behavioral/': [
        { href: '/assets/js/behavioral.min.js', as: 'script', critical: true },
        { href: '/assets/css/behavioral.min.css', as: 'style', critical: true }
      ],
      '/system-design/': [
        { href: '/assets/js/system-design.min.js', as: 'script', critical: true },
        { href: '/assets/js/interactive-diagrams.min.js', as: 'script', critical: false }
      ],
      '/practice/': [
        { href: '/assets/js/practice.min.js', as: 'script', critical: true },
        { href: '/assets/js/progress-tracking.min.js', as: 'script', critical: false }
      ]
    };
    
    return resourceMap[pagePath] || [];
  }

  /**
   * Remove resource hint
   */
  removeHint(type, href) {
    const hintKey = `${type}:${href}`;
    if (!this.addedHints.has(hintKey)) return false;
    
    const selector = `link[rel="${type}"][href="${href}"]`;
    const element = document.querySelector(selector);
    
    if (element) {
      element.remove();
      this.addedHints.delete(hintKey);
      return true;
    }
    
    return false;
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      hintsAdded: this.addedHints.size,
      connectionInfo: this.connectionInfo,
      userBehaviorEntries: this.userBehavior.size,
      strategy: this.options.prefetchStrategy
    };
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Clear behavior tracking
    this.userBehavior.clear();
    
    // Remove all added hints
    this.addedHints.forEach(hint => {
      const [type, href] = hint.split(':');
      this.removeHint(type, href);
    });
    
    this.addedHints.clear();
  }
}

// Initialize resource hints optimizer
const resourceHints = new ResourceHintsOptimizer();

// Export for use in other modules
export default resourceHints;