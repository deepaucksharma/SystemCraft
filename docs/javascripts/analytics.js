/**
 * Privacy-focused analytics and performance monitoring for SystemCraft
 * Collects anonymous usage patterns and performance metrics
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        enableAnalytics: true,
        enablePerformanceMonitoring: true,
        sampleRate: 0.1, // Only track 10% of sessions for performance
        maxEvents: 50, // Limit stored events
        localStorageKey: 'sc_analytics'
    };

    // Simple session ID (not personally identifiable)
    const sessionId = Math.random().toString(36).substring(2, 15);
    let isReturningUser = false;

    // Event tracking
    const events = [];
    const performanceData = {};

    /**
     * Check if user is returning
     */
    function checkReturningUser() {
        try {
            const lastVisit = localStorage.getItem('sc_last_visit');
            const now = Date.now();
            
            if (lastVisit) {
                isReturningUser = true;
                const daysSinceLastVisit = Math.floor((now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
                trackEvent('session', 'returning_user', { daysSinceLastVisit });
            } else {
                trackEvent('session', 'new_user');
            }
            
            localStorage.setItem('sc_last_visit', now.toString());
        } catch (e) {
            console.warn('Failed to check returning user status:', e);
        }
    }

    /**
     * Track an event
     */
    function trackEvent(category, action, data = {}) {
        if (!config.enableAnalytics) return;
        
        const event = {
            timestamp: Date.now(),
            sessionId,
            category,
            action,
            data,
            url: window.location.pathname,
            userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
        };
        
        events.push(event);
        
        // Limit stored events
        if (events.length > config.maxEvents) {
            events.shift();
        }
        
        // Store events locally for potential batch upload
        try {
            localStorage.setItem(config.localStorageKey, JSON.stringify(events));
        } catch (e) {
            console.warn('Failed to store analytics event:', e);
        }
    }

    /**
     * Track page view
     */
    function trackPageView() {
        trackEvent('navigation', 'page_view', {
            title: document.title,
            referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            screenSize: `${screen.width}x${screen.height}`,
            devicePixelRatio: window.devicePixelRatio,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
        });
    }

    /**
     * Track user interactions
     */
    function trackInteractions() {
        // Track navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link) {
                const href = link.getAttribute('href');
                const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
                const isInternal = href.startsWith('/') || href.startsWith('#') || href.startsWith('.');
                
                if (isExternal) {
                    trackEvent('interaction', 'external_link_click', {
                        destination: new URL(href).hostname,
                        linkText: link.textContent.substring(0, 50)
                    });
                } else if (isInternal) {
                    trackEvent('interaction', 'internal_link_click', {
                        destination: href,
                        linkText: link.textContent.substring(0, 50),
                        section: link.closest('nav, .md-nav') ? 'navigation' : 'content'
                    });
                }
            }
        });

        // Track search usage
        const searchInput = document.querySelector('.md-search__input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (searchInput.value.length > 2) {
                        trackEvent('interaction', 'search_query', {
                            queryLength: searchInput.value.length,
                            hasResults: document.querySelectorAll('.md-search-result').length > 0
                        });
                    }
                }, 500);
            });
        }

        // Track scroll depth
        let maxScrollDepth = 0;
        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
            
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
                
                // Track milestones
                if ([25, 50, 75, 90].includes(scrollPercent)) {
                    trackEvent('engagement', 'scroll_depth', {
                        depth: scrollPercent,
                        page: window.location.pathname
                    });
                }
            }
        };
        
        window.addEventListener('scroll', trackScrollDepth, { passive: true });

        // Track time spent on page
        let startTime = Date.now();
        let isActive = true;
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (isActive) {
                    const timeSpent = Math.round((Date.now() - startTime) / 1000);
                    trackEvent('engagement', 'time_on_page', {
                        duration: timeSpent,
                        page: window.location.pathname,
                        maxScrollDepth
                    });
                }
                isActive = false;
            } else {
                startTime = Date.now();
                isActive = true;
            }
        });

        // Track session end
        window.addEventListener('beforeunload', () => {
            if (isActive) {
                const timeSpent = Math.round((Date.now() - startTime) / 1000);
                trackEvent('engagement', 'session_end', {
                    duration: timeSpent,
                    page: window.location.pathname,
                    maxScrollDepth
                });
            }
        });
    }

    /**
     * Monitor performance metrics
     */
    function monitorPerformance() {
        if (!config.enablePerformanceMonitoring || Math.random() > config.sampleRate) return;

        // Core Web Vitals monitoring
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                performanceData.lcp = Math.round(lastEntry.startTime);
                
                trackEvent('performance', 'lcp', {
                    value: performanceData.lcp,
                    rating: performanceData.lcp < 2500 ? 'good' : performanceData.lcp < 4000 ? 'needs-improvement' : 'poor'
                });
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observer not supported:', e);
            }

            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const firstEntry = list.getEntries()[0];
                const fid = Math.round(firstEntry.processingStart - firstEntry.startTime);
                performanceData.fid = fid;
                
                trackEvent('performance', 'fid', {
                    value: fid,
                    rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor'
                });
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observer not supported:', e);
            }

            // Cumulative Layout Shift
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                
                performanceData.cls = Math.round(clsValue * 1000) / 1000;
            });
            
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observer not supported:', e);
            }

            // Report CLS on page hide
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && performanceData.cls !== undefined) {
                    trackEvent('performance', 'cls', {
                        value: performanceData.cls,
                        rating: performanceData.cls < 0.1 ? 'good' : performanceData.cls < 0.25 ? 'needs-improvement' : 'poor'
                    });
                }
            });
        }

        // Navigation timing
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = performance.timing;
                const navigation = {
                    dns: timing.domainLookupEnd - timing.domainLookupStart,
                    tcp: timing.connectEnd - timing.connectStart,
                    request: timing.responseStart - timing.requestStart,
                    response: timing.responseEnd - timing.responseStart,
                    dom: timing.domContentLoadedEventEnd - timing.navigationStart,
                    load: timing.loadEventEnd - timing.navigationStart
                };
                
                trackEvent('performance', 'navigation_timing', navigation);
            }, 1000);
        });

        // Resource loading errors
        window.addEventListener('error', (e) => {
            if (e.target !== window) {
                trackEvent('error', 'resource_error', {
                    type: e.target.tagName,
                    source: e.target.src || e.target.href,
                    message: e.message
                });
            }
        });

        // JavaScript errors
        window.addEventListener('error', (e) => {
            if (e.target === window) {
                trackEvent('error', 'javascript_error', {
                    message: e.message,
                    filename: e.filename,
                    line: e.lineno,
                    column: e.colno
                });
            }
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            trackEvent('error', 'promise_rejection', {
                reason: e.reason?.toString().substring(0, 200)
            });
        });
    }

    /**
     * Feature usage tracking
     */
    function trackFeatureUsage() {
        // Track mobile vs desktop usage
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        
        trackEvent('device', 'screen_type', {
            type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
            width: window.innerWidth,
            height: window.innerHeight
        });

        // Track browser capabilities
        const capabilities = {
            serviceWorker: 'serviceWorker' in navigator,
            webp: document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
            intersectionObserver: 'IntersectionObserver' in window,
            performanceObserver: 'PerformanceObserver' in window,
            localStorage: (() => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            })()
        };
        
        trackEvent('capabilities', 'browser_features', capabilities);

        // Track connection information
        if ('connection' in navigator) {
            const conn = navigator.connection;
            trackEvent('network', 'connection_info', {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            });
        }
    }

    /**
     * Export analytics data (for debugging)
     */
    function exportAnalytics() {
        return {
            events: events.slice(),
            performance: { ...performanceData },
            session: {
                sessionId,
                isReturningUser,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Initialize analytics
     */
    function init() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Analytics disabled for localhost');
            return;
        }

        checkReturningUser();
        trackPageView();
        trackInteractions();
        monitorPerformance();
        trackFeatureUsage();

        // Track Material navigation changes
        if (typeof document$ !== 'undefined') {
            document$.subscribe(() => {
                setTimeout(() => {
                    trackPageView();
                }, 100);
            });
        }

        console.log('📊 Analytics initialized (session:', sessionId.substring(0, 8) + ')');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for debugging
    window.SystemCraftAnalytics = {
        trackEvent,
        exportAnalytics,
        config
    };

})();