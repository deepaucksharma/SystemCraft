/**
 * Security enhancements for static site
 * Since GitHub Pages doesn't support custom HTTP headers,
 * we implement client-side security measures where possible.
 */

(function() {
    'use strict';
    
    // Security: Disable eval and Function constructor
    if (typeof window !== 'undefined') {
        // Override eval to prevent code injection
        window.eval = function() {
            throw new Error('eval() is disabled for security reasons');
        };
        
        // Override Function constructor to prevent code injection
        const OriginalFunction = window.Function;
        window.Function = function() {
            throw new Error('Function constructor is disabled for security reasons');
        };
        
        // Preserve legitimate uses by MkDocs/Material theme
        window.Function.prototype = OriginalFunction.prototype;
    }
    
    // Security: Content Security Policy enforcement via JavaScript
    function enforceCSP() {
        // Remove any inline event handlers that weren't explicitly allowed
        const elements = document.querySelectorAll('*[onclick], *[onmouseover], *[onload]');
        elements.forEach(function(element) {
            // Only remove handlers that don't come from trusted sources
            if (!element.hasAttribute('data-trusted')) {
                element.removeAttribute('onclick');
                element.removeAttribute('onmouseover');
                element.removeAttribute('onload');
                element.removeAttribute('onerror');
            }
        });
        
        // Ensure all external links open in new tab with security attributes
        const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
        externalLinks.forEach(function(link) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    }
    
    // Security: Clear sensitive data on page unload
    function clearSensitiveData() {
        // Clear any temporary authentication data
        if (window.sessionStorage) {
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && (key.includes('auth') || key.includes('token') || key.includes('session'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => sessionStorage.removeItem(key));
        }
    }
    
    // Security: Detect and prevent clickjacking attempts
    function preventClickjacking() {
        if (window.top !== window.self) {
            // If we're in a frame, try to break out
            try {
                window.top.location = window.self.location;
            } catch (e) {
                // If we can't break out, hide the page
                document.body.style.display = 'none';
                document.body.innerHTML = '<h1>This page cannot be displayed in a frame for security reasons.</h1>';
            }
        }
    }
    
    // Security: Add integrity checks for external resources
    function validateExternalResources() {
        const scripts = document.querySelectorAll('script[src]');
        const links = document.querySelectorAll('link[href]');
        
        // Check for known CDN sources and ensure they use HTTPS
        [...scripts, ...links].forEach(function(element) {
            const src = element.src || element.href;
            if (src && src.startsWith('http://') && !src.includes('localhost')) {
                console.warn('Insecure resource detected:', src);
                // Convert HTTP to HTTPS for known safe CDNs
                if (src.includes('cdn.jsdelivr.net') || 
                    src.includes('cdnjs.cloudflare.com') ||
                    src.includes('fonts.googleapis.com') ||
                    src.includes('fonts.gstatic.com')) {
                    element.src = src.replace('http://', 'https://');
                }
            }
        });
    }
    
    // Apply security measures when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            enforceCSP();
            preventClickjacking();
            validateExternalResources();
        });
    } else {
        enforceCSP();
        preventClickjacking();
        validateExternalResources();
    }
    
    // Clear sensitive data on page unload
    window.addEventListener('beforeunload', clearSensitiveData);
    
    // Security: Monitor for potential XSS attempts
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check for suspicious script injections
                        const scripts = node.querySelectorAll ? node.querySelectorAll('script') : [];
                        scripts.forEach(function(script) {
                            if (!script.src && script.textContent.includes('eval(')) {
                                console.warn('Suspicious script detected and removed');
                                script.remove();
                            }
                        });
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();