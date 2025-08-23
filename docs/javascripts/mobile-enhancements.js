/**
 * Mobile-specific enhancements for SystemCraft documentation
 * Optimizes the mobile experience with touch gestures, performance improvements, and adaptive UI
 */

(function() {
    'use strict';

    // Optimized mobile detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;

    // Performance-conscious initialization
    const initWhenReady = (fn) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    };

    if (isTouchDevice) {
        initWhenReady(() => {
            // Use requestIdleCallback for non-critical enhancements
            if ('requestIdleCallback' in window && !isLowEndDevice) {
                requestIdleCallback(() => initMobileEnhancements(), { timeout: 2000 });
            } else {
                setTimeout(initMobileEnhancements, 100);
            }
        });
    }

    function initMobileEnhancements() {
        // Add mobile class to body for CSS targeting
        document.body.classList.add('mobile-device');
        
        // Critical enhancements first
        improveTouchTargets();
        optimizeSearchForMobile();
        
        // Non-critical enhancements with delay
        setTimeout(() => {
            enhanceTableScrolling();
            improveNavigationUX();
            if (!isLowEndDevice) {
                addSwipeGestures();
                enhanceCodeBlocks();
            }
            optimizePerformance();
        }, 500);
        
        if (process?.env?.NODE_ENV !== 'production') {
            console.log('✓ Mobile enhancements initialized');
        }
    }

    /**
     * Enhance table scrolling with visual indicators
     */
    function enhanceTableScrolling() {
        const tables = document.querySelectorAll('.md-typeset table:not([data-scroll-enhanced])');
        
        tables.forEach(table => {
            table.setAttribute('data-scroll-enhanced', 'true');
            
            // Only add indicators if table actually scrolls
            if (table.scrollWidth <= table.clientWidth) return;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'table-scroll-wrapper';
            
            const scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'table-scroll-indicator';
            scrollIndicator.innerHTML = '<span>← Scroll to see more →</span>';
            scrollIndicator.setAttribute('aria-hidden', 'true');
            
            // Wrap the table
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
            wrapper.appendChild(scrollIndicator);
            
            // Throttled scroll handler
            let scrollTimeout;
            const handleScroll = () => {
                scrollIndicator.style.opacity = '0';
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const canScrollMore = table.scrollLeft < table.scrollWidth - table.clientWidth - 10;
                    scrollIndicator.style.opacity = canScrollMore ? '1' : '0';
                }, 1000);
            };
            
            table.addEventListener('scroll', handleScroll, { passive: true });
            
            // Show indicator initially
            scrollIndicator.style.opacity = '1';
        });
    }

    /**
     * Improve navigation UX for mobile
     */
    function improveNavigationUX() {
        const nav = document.querySelector('.md-nav--primary');
        const navToggle = document.querySelector('[data-md-toggle="drawer"]');
        
        if (nav && navToggle) {
            // Close navigation when clicking on a link
            nav.addEventListener('click', function(e) {
                if (e.target.matches('.md-nav__link') && !e.target.nextElementSibling) {
                    navToggle.checked = false;
                }
            });
            
            // Add smooth scrolling to active navigation item
            const activeLink = nav.querySelector('.md-nav__link[data-md-state="blur"]');
            if (activeLink) {
                setTimeout(() => {
                    activeLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }
        
        // Enhance navigation sections
        const navSections = document.querySelectorAll('.md-nav__item--nested');
        navSections.forEach(section => {
            const toggle = section.querySelector('.md-nav__link');
            if (toggle) {
                toggle.addEventListener('click', function(e) {
                    // Add haptic feedback on supported devices
                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }
                });
            }
        });
    }

    /**
     * Optimize search for mobile devices
     */
    function optimizeSearchForMobile() {
        const searchInput = document.querySelector('.md-search__input');
        
        if (searchInput) {
            // Prevent zoom on focus for iOS
            searchInput.setAttribute('font-size', '16px');
            
            // Add mobile-friendly placeholder
            if (window.innerWidth < 480) {
                searchInput.placeholder = 'Search...';
            }
            
            // Auto-focus search when opened
            const searchToggle = document.querySelector('[data-md-toggle="search"]');
            if (searchToggle) {
                searchToggle.addEventListener('change', function() {
                    if (this.checked) {
                        setTimeout(() => searchInput.focus(), 100);
                    }
                });
            }
        }
    }

    /**
     * Add swipe gestures for navigation (optimized)
     */
    function addSwipeGestures() {
        if (window.swipeGesturesInitialized) return;
        window.swipeGesturesInitialized = true;
        
        let touchState = { startX: 0, startY: 0, startTime: 0 };
        const SWIPE_THRESHOLD = 100;
        const TIME_THRESHOLD = 500;
        const EDGE_THRESHOLD = 50;
        
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            touchState.startX = touch.clientX;
            touchState.startY = touch.clientY;
            touchState.startTime = Date.now();
        };
        
        const handleTouchEnd = (e) => {
            const { startX, startY, startTime } = touchState;
            if (!startX && !startY) return;
            
            const touch = e.changedTouches[0];
            const diffX = startX - touch.clientX;
            const diffY = startY - touch.clientY;
            const timeDiff = Date.now() - startTime;
            
            // Reset
            touchState = { startX: 0, startY: 0, startTime: 0 };
            
            // Validate swipe
            if (timeDiff > TIME_THRESHOLD || 
                Math.abs(diffX) < SWIPE_THRESHOLD || 
                Math.abs(diffY) > Math.abs(diffX)) return;
            
            // Handle navigation
            const navToggle = document.querySelector('[data-md-toggle="drawer"]');
            if (!navToggle) return;
            
            if (diffX > 0) { // Swipe left - close nav
                navToggle.checked = false;
            } else if (startX < EDGE_THRESHOLD) { // Swipe right from edge - open nav
                navToggle.checked = true;
            }
        };
        
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    /**
     * Enhance code blocks for mobile (consolidated with main JS)
     */
    function enhanceCodeBlocks() {
        const codeBlocks = document.querySelectorAll('.md-typeset pre:not([data-mobile-enhanced])');
        
        codeBlocks.forEach(block => {
            block.setAttribute('data-mobile-enhanced', 'true');
            
            // Mobile copy feedback (simplified)
            const copyButton = block.querySelector('.md-clipboard');
            if (copyButton && !copyButton.hasAttribute('data-mobile-feedback')) {
                copyButton.setAttribute('data-mobile-feedback', 'true');
                
                copyButton.addEventListener('click', () => {
                    // Haptic feedback on supported devices
                    if ('vibrate' in navigator) {
                        navigator.vibrate(50);
                    }
                    
                    // Visual feedback
                    copyButton.style.opacity = '0.5';
                    setTimeout(() => {
                        copyButton.style.opacity = '';
                    }, 200);
                });
            }
            
            // Scroll indicator for long code blocks
            if (block.scrollWidth > block.clientWidth + 10) {
                const indicator = document.createElement('div');
                indicator.className = 'code-scroll-indicator';
                indicator.innerHTML = '→';
                indicator.setAttribute('aria-hidden', 'true');
                indicator.style.cssText = `
                    position:absolute;right:8px;top:50%;transform:translateY(-50%);
                    color:rgba(255,255,255,0.6);font-size:16px;pointer-events:none;
                    animation:pulse 2s infinite;
                `;
                
                block.style.position = 'relative';
                block.appendChild(indicator);
                
                block.addEventListener('scroll', () => {
                    indicator.style.display = block.scrollLeft > 20 ? 'none' : 'block';
                }, { passive: true });
            }
        });
    }

    /**
     * Improve touch targets (optimized)
     */
    function improveTouchTargets() {
        // Use CSS for touch target improvements to avoid layout thrashing
        if (!document.getElementById('touch-targets-css')) {
            const touchTargetStyles = document.createElement('style');
            touchTargetStyles.id = 'touch-targets-css';
            touchTargetStyles.textContent = `
                @media (max-width: 768px) {
                    .mobile-device a:not(.md-nav__link),
                    .mobile-device button:not(.md-button),
                    .mobile-device .md-clipboard {
                        min-height: 44px;
                        min-width: 44px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0.25rem;
                    }
                    .mobile-device .md-nav__link,
                    .mobile-device .md-tabs__link {
                        min-height: 44px;
                        padding: 0.75rem 1rem;
                    }
                }
            `;
            document.head.appendChild(touchTargetStyles);
        }
    }

    /**
     * Performance optimizations for mobile
     */
    function optimizePerformance() {
        // Throttled scroll handler
        let scrollTimeout;
        const handleScroll = () => {
            document.body.classList.add('scrolling');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
            }, 150);
        };
        
        // Only add scroll listener if not already added
        if (!window.mobileScrollOptimized) {
            window.mobileScrollOptimized = true;
            window.addEventListener('scroll', handleScroll, { passive: true });
        }
        
        // Optimize images (new images only)
        const images = document.querySelectorAll('img:not([data-optimized])');
        images.forEach(img => {
            img.setAttribute('data-optimized', 'true');
            
            if (!img.loading) {
                img.loading = 'lazy';
            }
            
            // Add mobile-optimized sizes attribute
            if (!img.sizes && (img.srcset || img.width > 400)) {
                img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
            }
        });
        
        // Smart prefetching for navigation (only on good connections)
        if ('IntersectionObserver' in window && 
            'connection' in navigator && 
            navigator.connection.effectiveType !== 'slow-2g') {
            
            const prefetchObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const link = entry.target.querySelector('a[href]:not([data-prefetched])');
                        if (link && link.href !== window.location.href) {
                            const prefetchLink = document.createElement('link');
                            prefetchLink.rel = 'prefetch';
                            prefetchLink.href = link.href;
                            document.head.appendChild(prefetchLink);
                            link.setAttribute('data-prefetched', 'true');
                        }
                    }
                });
            }, { rootMargin: '50px' });
            
            // Only observe main navigation items
            const navItems = document.querySelectorAll('.md-nav--primary .md-nav__item, .md-nav--secondary .md-nav__item');
            navItems.forEach(item => prefetchObserver.observe(item));
        }
    }

    // Inject critical mobile styles (optimized)
    if (!document.getElementById('mobile-enhancements-css')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'mobile-enhancements-css';
        styleSheet.textContent = `
            @keyframes fadeInOut{0%,100%{opacity:0;transform:translateY(-10px)}10%,90%{opacity:1;transform:translateY(0)}}
            @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
            .scrolling *{pointer-events:none}
            .table-scroll-wrapper{position:relative;margin:1rem 0}
            .table-scroll-indicator{position:absolute;bottom:-25px;left:50%;transform:translateX(-50%);font-size:12px;color:var(--md-primary-fg-color);opacity:0;transition:opacity .3s ease;pointer-events:none}
            @media(max-width:768px){
                .mobile-device .md-nav__link{transition:all .2s cubic-bezier(.4,0,.2,1)}
                .mobile-device .md-nav__link:active{transform:scale(.98);background-color:rgba(255,153,0,.1)}
                .mobile-device .md-button:active{transform:scale(.95)}
            }
        `;
        document.head.appendChild(styleSheet);
    }
})();