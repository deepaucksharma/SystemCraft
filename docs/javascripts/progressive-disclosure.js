/**
 * Progressive Disclosure & Mobile Optimization JavaScript
 * Enhances UX with collapsible sections, smooth animations, and mobile-first interactions
 */

(function() {
    'use strict';

    // ==========================================================================
    // PROGRESSIVE DISCLOSURE FUNCTIONALITY
    // ==========================================================================

    /**
     * Initialize progressive disclosure for collapsible sections
     */
    function initProgressiveDisclosure() {
        // Create collapsible sections automatically from content
        const autoCollapseSections = document.querySelectorAll('.auto-collapse');
        autoCollapseSections.forEach(section => {
            createProgressiveDisclosure(section);
        });

        // Handle manually created progressive disclosure sections
        const disclosureHeaders = document.querySelectorAll('.progressive-disclosure-header');
        disclosureHeaders.forEach(header => {
            header.addEventListener('click', toggleDisclosure);
            header.addEventListener('keydown', handleDisclosureKeydown);
            
            // Set initial state based on data attributes
            const content = header.nextElementSibling;
            if (header.dataset.initialState === 'collapsed') {
                collapseSection(header, content);
            }
        });
    }

    /**
     * Create a progressive disclosure section from existing content
     */
    function createProgressiveDisclosure(section) {
        const title = section.querySelector('h3, h4, .disclosure-title');
        if (!title) return;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'progressive-disclosure';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'progressive-disclosure-header';
        header.textContent = title.textContent;
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'true');
        
        // Create content container
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'progressive-disclosure-content';
        
        // Move content (everything except title)
        const content = Array.from(section.children).filter(child => child !== title);
        content.forEach(element => {
            contentWrapper.appendChild(element);
        });
        
        // Replace original section
        wrapper.appendChild(header);
        wrapper.appendChild(contentWrapper);
        section.parentNode.replaceChild(wrapper, section);
        
        // Add event listeners
        header.addEventListener('click', toggleDisclosure);
        header.addEventListener('keydown', handleDisclosureKeydown);
    }

    /**
     * Toggle disclosure section state
     */
    function toggleDisclosure(event) {
        const header = event.currentTarget;
        const content = header.nextElementSibling;
        const isCollapsed = header.classList.contains('collapsed');
        
        if (isCollapsed) {
            expandSection(header, content);
        } else {
            collapseSection(header, content);
        }
    }

    /**
     * Handle keyboard navigation for disclosure sections
     */
    function handleDisclosureKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleDisclosure(event);
        }
    }

    /**
     * Expand a disclosure section
     */
    function expandSection(header, content) {
        header.classList.remove('collapsed');
        content.classList.remove('collapsed');
        header.setAttribute('aria-expanded', 'true');
        
        // Smooth animation
        requestAnimationFrame(() => {
            content.style.maxHeight = content.scrollHeight + 'px';
        });
    }

    /**
     * Collapse a disclosure section
     */
    function collapseSection(header, content) {
        header.classList.add('collapsed');
        content.classList.add('collapsed');
        header.setAttribute('aria-expanded', 'false');
        
        // Smooth animation
        content.style.maxHeight = '0';
    }

    // ==========================================================================
    // MOBILE OPTIMIZATION ENHANCEMENTS
    // ==========================================================================

    /**
     * Initialize mobile-specific enhancements
     */
    function initMobileOptimizations() {
        // Touch-friendly navigation improvements
        enhanceNavigation();
        
        // Viewport-based optimizations
        handleViewportChanges();
        
        // Performance optimizations for mobile
        optimizeForMobile();
        
        // Gesture support
        addGestureSupport();
    }

    /**
     * Enhance navigation for touch devices
     */
    function enhanceNavigation() {
        const navLinks = document.querySelectorAll('.md-nav__link');
        
        navLinks.forEach(link => {
            // Ensure minimum touch target size
            if (link.offsetHeight < 44) {
                link.style.minHeight = '44px';
                link.style.display = 'flex';
                link.style.alignItems = 'center';
            }
            
            // Add touch feedback
            link.addEventListener('touchstart', addTouchFeedback);
            link.addEventListener('touchend', removeTouchFeedback);
            link.addEventListener('touchcancel', removeTouchFeedback);
        });
    }

    /**
     * Add visual feedback for touch interactions
     */
    function addTouchFeedback(event) {
        event.currentTarget.style.backgroundColor = 'rgba(255, 153, 0, 0.1)';
    }

    /**
     * Remove visual feedback for touch interactions
     */
    function removeTouchFeedback(event) {
        setTimeout(() => {
            event.currentTarget.style.backgroundColor = '';
        }, 100);
    }

    /**
     * Handle viewport changes for responsive behavior
     */
    function handleViewportChanges() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        function handleViewportChange(e) {
            if (e.matches) {
                // Mobile view
                enableMobileMode();
            } else {
                // Desktop view
                disableMobileMode();
            }
        }
        
        mediaQuery.addListener(handleViewportChange);
        handleViewportChange(mediaQuery);
    }

    /**
     * Enable mobile-specific features
     */
    function enableMobileMode() {
        document.body.classList.add('mobile-mode');
        
        // Optimize tables for mobile
        optimizeTablesForMobile();
        
        // Adjust content spacing
        adjustContentSpacing();
        
        // Enable swipe gestures for navigation
        enableSwipeNavigation();
    }

    /**
     * Disable mobile-specific features
     */
    function disableMobileMode() {
        document.body.classList.remove('mobile-mode');
        
        // Restore desktop table layout
        restoreDesktopTables();
        
        // Restore original content spacing
        restoreContentSpacing();
        
        // Disable swipe gestures
        disableSwipeNavigation();
    }

    /**
     * Optimize tables for mobile viewing
     */
    function optimizeTablesForMobile() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            if (!table.classList.contains('mobile-optimized')) {
                // Wrap table for horizontal scrolling
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper';
                wrapper.style.overflowX = 'auto';
                wrapper.style.webkitOverflowScrolling = 'touch';
                
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
                
                table.classList.add('mobile-optimized');
            }
        });
    }

    /**
     * Restore desktop table layout
     */
    function restoreDesktopTables() {
        const wrappers = document.querySelectorAll('.table-wrapper');
        wrappers.forEach(wrapper => {
            const table = wrapper.querySelector('table');
            if (table) {
                wrapper.parentNode.insertBefore(table, wrapper);
                wrapper.remove();
                table.classList.remove('mobile-optimized');
            }
        });
    }

    /**
     * Adjust content spacing for mobile
     */
    function adjustContentSpacing() {
        const content = document.querySelector('.md-content');
        if (content) {
            content.style.padding = '0.5rem';
        }
    }

    /**
     * Restore original content spacing
     */
    function restoreContentSpacing() {
        const content = document.querySelector('.md-content');
        if (content) {
            content.style.padding = '';
        }
    }

    /**
     * Add gesture support for better mobile interaction
     */
    function addGestureSupport() {
        let startX, startY, distX, distY;
        
        document.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (!startX || !startY) return;
            
            const touch = e.touches[0];
            distX = touch.clientX - startX;
            distY = touch.clientY - startY;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            if (!distX || !distY) return;
            
            // Swipe gestures
            if (Math.abs(distX) > Math.abs(distY)) {
                if (Math.abs(distX) > 50) {
                    if (distX > 0) {
                        handleSwipeRight();
                    } else {
                        handleSwipeLeft();
                    }
                }
            }
            
            // Reset values
            startX = startY = distX = distY = null;
        }, { passive: true });
    }

    /**
     * Enable swipe navigation
     */
    function enableSwipeNavigation() {
        document.body.classList.add('swipe-navigation-enabled');
    }

    /**
     * Disable swipe navigation
     */
    function disableSwipeNavigation() {
        document.body.classList.remove('swipe-navigation-enabled');
    }

    /**
     * Handle swipe right gesture
     */
    function handleSwipeRight() {
        if (!document.body.classList.contains('swipe-navigation-enabled')) return;
        
        // Open navigation drawer on mobile
        const drawer = document.querySelector('[data-md-component="navigation"]');
        const overlay = document.querySelector('[data-md-component="overlay"]');
        
        if (drawer && !drawer.getAttribute('data-md-state')) {
            drawer.setAttribute('data-md-state', 'animate');
            if (overlay) {
                overlay.setAttribute('data-md-state', 'animate');
            }
        }
    }

    /**
     * Handle swipe left gesture
     */
    function handleSwipeLeft() {
        if (!document.body.classList.contains('swipe-navigation-enabled')) return;
        
        // Close navigation drawer on mobile
        const drawer = document.querySelector('[data-md-component="navigation"]');
        const overlay = document.querySelector('[data-md-component="overlay"]');
        
        if (drawer && drawer.getAttribute('data-md-state')) {
            drawer.removeAttribute('data-md-state');
            if (overlay) {
                overlay.removeAttribute('data-md-state');
            }
        }
    }

    /**
     * Performance optimizations for mobile devices
     */
    function optimizeForMobile() {
        // Lazy load images
        lazyLoadImages();
        
        // Optimize animations for performance
        optimizeAnimations();
        
        // Reduce memory usage
        optimizeMemoryUsage();
    }

    /**
     * Implement lazy loading for images
     */
    function lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.classList.add('lazy');
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Optimize animations for better performance
     */
    function optimizeAnimations() {
        // Use CSS transforms instead of changing layout properties
        const animatedElements = document.querySelectorAll('.animated');
        animatedElements.forEach(element => {
            element.style.willChange = 'transform, opacity';
        });
        
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduce-motion');
        }
    }

    /**
     * Optimize memory usage
     */
    function optimizeMemoryUsage() {
        // Clean up event listeners on invisible elements
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    // Element is not visible, we could optimize here
                    entry.target.classList.add('offscreen');
                } else {
                    entry.target.classList.remove('offscreen');
                }
            });
        }, { rootMargin: '100px' });
        
        document.querySelectorAll('.heavy-content').forEach(element => {
            observer.observe(element);
        });
    }

    // ==========================================================================
    // ACCESSIBILITY ENHANCEMENTS
    // ==========================================================================

    /**
     * Initialize accessibility enhancements
     */
    function initAccessibilityEnhancements() {
        // Skip to content link
        addSkipToContentLink();
        
        // ARIA labels for progressive disclosure
        enhanceARIASupport();
        
        // Keyboard navigation improvements
        improveKeyboardNavigation();
        
        // Focus management
        manageFocus();
    }

    /**
     * Add skip to content link for screen readers
     */
    function addSkipToContentLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--md-primary-fg-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Ensure main content has ID
        const mainContent = document.querySelector('.md-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    /**
     * Enhance ARIA support for progressive disclosure
     */
    function enhanceARIASupport() {
        const disclosureHeaders = document.querySelectorAll('.progressive-disclosure-header');
        disclosureHeaders.forEach((header, index) => {
            const content = header.nextElementSibling;
            if (content) {
                const contentId = `disclosure-content-${index}`;
                content.id = contentId;
                header.setAttribute('aria-controls', contentId);
                header.setAttribute('aria-expanded', !header.classList.contains('collapsed'));
            }
        });
    }

    /**
     * Improve keyboard navigation
     */
    function improveKeyboardNavigation() {
        // Add visible focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .md-nav__link:focus,
            .progressive-disclosure-header:focus,
            .nav-card:focus {
                outline: 2px solid var(--md-primary-fg-color);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
        
        // Handle tab navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Manage focus for better accessibility
     */
    function manageFocus() {
        // Return focus to trigger when closing disclosure
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('progressive-disclosure-content')) {
                    const header = focusedElement.previousElementSibling;
                    if (header) {
                        collapseSection(header, focusedElement);
                        header.focus();
                    }
                }
            }
        });
    }

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    /**
     * Initialize all enhancements when DOM is ready
     */
    function initialize() {
        initProgressiveDisclosure();
        initMobileOptimizations();
        initAccessibilityEnhancements();
        
        console.log('Progressive Disclosure & Mobile Optimization initialized');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();