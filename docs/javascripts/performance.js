/**
 * Performance optimization and monitoring for SystemCraft
 * This script implements various performance improvements and basic monitoring
 */

(function() {
    'use strict';

    // Performance configuration
    const config = {
        enableMetrics: true,
        enableResourceHints: true,
        enableImageOptimization: true,
        enableServiceWorker: false, // Disabled for GitHub Pages
        criticalResourceTimeout: 3000,
        deferredLoadDelay: 100
    };

    // Performance metrics collection
    const metrics = {
        startTime: performance.now(),
        navigationStart: 0,
        domContentLoaded: 0,
        windowLoaded: 0,
        firstPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
    };

    /**
     * Add resource hints for better loading performance
     */
    function addResourceHints() {
        if (!config.enableResourceHints || document.querySelector('[data-resource-hints]')) return;
        
        const hints = [
            // Preconnect to external domains
            { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: true },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
            { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: true },
            { rel: 'preconnect', href: 'https://polyfill.io', crossorigin: true },
            
            // DNS prefetch for likely navigation targets
            { rel: 'dns-prefetch', href: 'https://github.com' },
            { rel: 'dns-prefetch', href: 'https://linkedin.com' }
        ];

        const fragment = document.createDocumentFragment();
        hints.forEach(hint => {
            const link = document.createElement('link');
            Object.assign(link, hint);
            if (hint.crossorigin) link.crossOrigin = 'anonymous';
            fragment.appendChild(link);
        });

        document.head.appendChild(fragment);
        document.head.setAttribute('data-resource-hints', 'true');
    }

    /**
     * Optimize image loading with intersection observer
     */
    function optimizeImageLoading() {
        if (!config.enableImageOptimization || !('IntersectionObserver' in window)) return;

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load high-res image if available
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Add loaded class for CSS transitions
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    }, { once: true });
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe images with lazy loading
        document.querySelectorAll('img[loading="lazy"], img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * Implement critical CSS inlining detection
     */
    function handleCriticalCSS() {
        // This would typically be handled by the build process
        // For now, we'll add a class to indicate above-the-fold content
        const criticalElements = document.querySelectorAll('header, nav, .md-header, .md-tabs, .md-content h1');
        criticalElements.forEach(el => {
            el.classList.add('critical-content');
        });

        // Defer non-critical CSS loading
        setTimeout(() => {
            const deferredStyles = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
            deferredStyles.forEach(link => {
                link.rel = 'stylesheet';
                link.removeAttribute('data-defer');
            });
        }, config.deferredLoadDelay);
    }

    /**
     * Implement basic caching strategies
     */
    function implementCaching() {
        // Cache DOM queries for repeated use
        const cache = new Map();
        
        window.getCachedElement = function(selector) {
            if (!cache.has(selector)) {
                cache.set(selector, document.querySelector(selector));
            }
            return cache.get(selector);
        };

        // Clear cache on navigation (for Material's instant loading)
        if (typeof document$ !== 'undefined') {
            document$.subscribe(() => {
                cache.clear();
            });
        }

        // Implement localStorage caching for user preferences
        const PreferenceCache = {
            get(key) {
                try {
                    const item = localStorage.getItem(`sc_${key}`);
                    return item ? JSON.parse(item) : null;
                } catch (e) {
                    console.warn('Failed to get cached preference:', key, e);
                    return null;
                }
            },
            
            set(key, value) {
                try {
                    localStorage.setItem(`sc_${key}`, JSON.stringify(value));
                } catch (e) {
                    console.warn('Failed to cache preference:', key, e);
                }
            },
            
            remove(key) {
                try {
                    localStorage.removeItem(`sc_${key}`);
                } catch (e) {
                    console.warn('Failed to remove cached preference:', key, e);
                }
            }
        };

        window.PreferenceCache = PreferenceCache;
    }

    /**
     * Performance metrics collection
     */
    function collectMetrics() {
        if (!config.enableMetrics) return;

        // Navigation timing
        if ('performance' in window && performance.timing) {
            const timing = performance.timing;
            metrics.navigationStart = timing.navigationStart;
            metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
            metrics.windowLoaded = timing.loadEventEnd - timing.navigationStart;
        }

        // Paint timing
        if ('PerformancePaintTiming' in window) {
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    metrics.firstPaint = entry.startTime;
                } else if (entry.name === 'first-contentful-paint') {
                    metrics.firstContentfulPaint = entry.startTime;
                }
            });
        }

        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    metrics.largestContentfulPaint = lastEntry.startTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // Cumulative Layout Shift
                const clsObserver = new PerformanceObserver((list) => {
                    let clsScore = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsScore += entry.value;
                        }
                    }
                    metrics.cumulativeLayoutShift = clsScore;
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // First Input Delay
                const fidObserver = new PerformanceObserver((list) => {
                    const firstEntry = list.getEntries()[0];
                    metrics.firstInputDelay = firstEntry.processingStart - firstEntry.startTime;
                });
                fidObserver.observe({ entryTypes: ['first-input'] });

            } catch (e) {
                console.warn('Performance observers not fully supported:', e);
            }
        }
    }

    /**
     * Performance monitoring and reporting
     */
    function setupPerformanceMonitoring() {
        // Report metrics after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (config.enableMetrics && console.groupCollapsed) {
                    console.groupCollapsed('📊 Performance Metrics');
                    console.log('DOM Content Loaded:', metrics.domContentLoaded + 'ms');
                    console.log('Window Loaded:', metrics.windowLoaded + 'ms');
                    console.log('First Paint:', metrics.firstPaint + 'ms');
                    console.log('First Contentful Paint:', metrics.firstContentfulPaint + 'ms');
                    console.log('Largest Contentful Paint:', metrics.largestContentfulPaint + 'ms');
                    console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift);
                    console.log('First Input Delay:', metrics.firstInputDelay + 'ms');
                    console.groupEnd();
                }

                // Expose metrics globally for debugging
                window.performanceMetrics = metrics;
            }, 1000);
        });

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.warn('⚠️ Long task detected:', entry.duration + 'ms', entry);
                    }
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long tasks API might not be supported
            }
        }
    }

    /**
     * Initialize performance optimizations
     */
    function init() {
        // Add resource hints immediately
        addResourceHints();
        
        // Initialize other optimizations on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                optimizeImageLoading();
                handleCriticalCSS();
                implementCaching();
                collectMetrics();
                setupPerformanceMonitoring();
            });
        } else {
            optimizeImageLoading();
            handleCriticalCSS();
            implementCaching();
            collectMetrics();
            setupPerformanceMonitoring();
        }
    }

    // Initialize performance optimizations
    init();

    // Export for global access
    window.SystemCraftPerformance = {
        metrics,
        config,
        addResourceHints,
        optimizeImageLoading,
        collectMetrics
    };

})();