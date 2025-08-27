/**
 * SystemCraft Security Utilities
 * Comprehensive security module implementing defense-in-depth principles
 * Version: 1.0.0
 * 
 * Features:
 * - XSS Prevention with DOMPurify integration
 * - Encrypted localStorage with AES-GCM
 * - Input validation and sanitization
 * - CSP reporting and enforcement
 * - Security headers validation
 * - Rate limiting and throttling
 */

class SecurityUtils {
    constructor() {
        this.encryptionKey = null;
        this.rateLimiters = new Map();
        this.cspViolations = [];
        this.securityConfig = {
            maxInputLength: 10000,
            allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            allowedAttributes: ['class', 'id', 'href', 'title', 'alt'],
            rateLimit: {
                windowMs: 60000, // 1 minute
                maxRequests: 100
            }
        };
        
        this.init();
    }

    async init() {
        await this.loadDOMPurify();
        await this.initializeEncryption();
        this.setupCSPReporting();
        this.setupSecurityHeaders();
        this.setupRateLimiting();
    }

    // =================
    // DOMPurify Integration
    // =================
    
    async loadDOMPurify() {
        if (typeof DOMPurify === 'undefined') {
            try {
                // Load DOMPurify from CDN with fallback
                await this.loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js');
                
                if (typeof DOMPurify === 'undefined') {
                    // Fallback to local version if CDN fails
                    console.warn('CDN DOMPurify failed, using basic sanitization');
                    this.setupBasicSanitizer();
                }
            } catch (error) {
                console.error('Failed to load DOMPurify:', error);
                this.setupBasicSanitizer();
            }
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupBasicSanitizer() {
        // Basic sanitizer fallback when DOMPurify is unavailable
        window.DOMPurify = {
            sanitize: (input) => {
                return this.basicSanitize(input);
            }
        };
    }

    basicSanitize(input) {
        if (typeof input !== 'string') return '';
        
        // Remove script tags and javascript: URLs
        return input
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .replace(/<object[^>]*>.*?<\/object>/gi, '')
            .replace(/<embed[^>]*>/gi, '')
            .replace(/style\s*=\s*["'][^"']*["']/gi, '');
    }

    // =================
    // XSS Prevention
    // =================

    /**
     * Safely sanitize HTML content to prevent XSS
     * @param {string} content - Raw HTML content
     * @param {Object} options - Sanitization options
     * @returns {string} - Sanitized HTML
     */
    sanitizeHTML(content, options = {}) {
        if (!content || typeof content !== 'string') {
            return '';
        }

        // Check input length
        if (content.length > this.securityConfig.maxInputLength) {
            throw new Error('Input exceeds maximum allowed length');
        }

        const config = {
            ALLOWED_TAGS: options.allowedTags || this.securityConfig.allowedTags,
            ALLOWED_ATTR: options.allowedAttributes || this.securityConfig.allowedAttributes,
            ALLOW_DATA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
            RETURN_DOM: false,
            RETURN_DOM_FRAGMENT: false,
            SANITIZE_DOM: true,
            KEEP_CONTENT: true,
            ADD_TAGS: options.addTags || [],
            ADD_ATTR: options.addAttributes || [],
            FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'textarea', 'button'],
            FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
        };

        try {
            if (typeof DOMPurify !== 'undefined') {
                return DOMPurify.sanitize(content, config);
            } else {
                return this.basicSanitize(content);
            }
        } catch (error) {
            console.error('Sanitization failed:', error);
            return this.basicSanitize(content);
        }
    }

    /**
     * Safe innerHTML replacement
     * @param {Element} element - Target DOM element
     * @param {string} content - HTML content to set
     * @param {Object} options - Sanitization options
     */
    safeInnerHTML(element, content, options = {}) {
        if (!element || !element.nodeType === 1) {
            throw new Error('Invalid DOM element provided');
        }

        const sanitizedContent = this.sanitizeHTML(content, options);
        element.innerHTML = sanitizedContent;
        
        // Log potential security events
        if (content !== sanitizedContent) {
            this.logSecurityEvent('XSS_ATTEMPT_BLOCKED', {
                original: content.substring(0, 100),
                sanitized: sanitizedContent.substring(0, 100),
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Validate and sanitize user input
     * @param {string} input - Raw user input
     * @param {string} type - Input type (text, email, url, etc.)
     * @returns {string} - Validated and sanitized input
     */
    validateInput(input, type = 'text') {
        if (typeof input !== 'string') {
            throw new Error('Input must be a string');
        }

        // Length validation
        if (input.length > this.securityConfig.maxInputLength) {
            throw new Error('Input exceeds maximum allowed length');
        }

        const validators = {
            text: (val) => val.replace(/[<>\"'&]/g, (match) => {
                const htmlEntities = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;'
                };
                return htmlEntities[match];
            }),
            email: (val) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    throw new Error('Invalid email format');
                }
                return this.validateInput(val, 'text');
            },
            url: (val) => {
                try {
                    const url = new URL(val);
                    if (!['http:', 'https:'].includes(url.protocol)) {
                        throw new Error('Only HTTP and HTTPS URLs are allowed');
                    }
                    return url.toString();
                } catch (error) {
                    throw new Error('Invalid URL format');
                }
            },
            number: (val) => {
                const num = parseFloat(val);
                if (isNaN(num)) {
                    throw new Error('Invalid number format');
                }
                return num.toString();
            }
        };

        const validator = validators[type] || validators.text;
        return validator(input);
    }

    // =================
    // Encrypted Storage
    // =================

    async initializeEncryption() {
        try {
            // Generate or retrieve encryption key
            const storedKey = localStorage.getItem('systemcraft_enc_key');
            if (storedKey) {
                this.encryptionKey = await this.importKey(storedKey);
            } else {
                this.encryptionKey = await this.generateKey();
                const exportedKey = await this.exportKey(this.encryptionKey);
                localStorage.setItem('systemcraft_enc_key', exportedKey);
            }
        } catch (error) {
            console.error('Failed to initialize encryption:', error);
            // Fallback to basic obfuscation
            this.setupBasicObfuscation();
        }
    }

    async generateKey() {
        return await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    async exportKey(key) {
        const exportedKey = await crypto.subtle.exportKey('raw', key);
        return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    }

    async importKey(keyString) {
        const keyBuffer = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
        return await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            'AES-GCM',
            true,
            ['encrypt', 'decrypt']
        );
    }

    async encrypt(data) {
        if (!this.encryptionKey) {
            return this.basicObfuscate(data);
        }

        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                this.encryptionKey,
                dataBuffer
            );

            const result = {
                iv: btoa(String.fromCharCode(...iv)),
                data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
            };

            return btoa(JSON.stringify(result));
        } catch (error) {
            console.error('Encryption failed:', error);
            return this.basicObfuscate(data);
        }
    }

    async decrypt(encryptedData) {
        if (!this.encryptionKey) {
            return this.basicDeobfuscate(encryptedData);
        }

        try {
            const parsed = JSON.parse(atob(encryptedData));
            const iv = Uint8Array.from(atob(parsed.iv), c => c.charCodeAt(0));
            const data = Uint8Array.from(atob(parsed.data), c => c.charCodeAt(0));

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                this.encryptionKey,
                data
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch (error) {
            console.error('Decryption failed:', error);
            return this.basicDeobfuscate(encryptedData);
        }
    }

    setupBasicObfuscation() {
        console.warn('Using basic obfuscation fallback - not cryptographically secure');
    }

    basicObfuscate(data) {
        return btoa(JSON.stringify(data)).split('').reverse().join('');
    }

    basicDeobfuscate(data) {
        try {
            return JSON.parse(atob(data.split('').reverse().join('')));
        } catch (error) {
            console.error('Deobfuscation failed:', error);
            return null;
        }
    }

    /**
     * Secure localStorage wrapper
     */
    async setSecureItem(key, value) {
        try {
            const encrypted = await this.encrypt(value);
            localStorage.setItem(`secure_${key}`, encrypted);
        } catch (error) {
            console.error('Failed to store encrypted data:', error);
            throw new Error('Storage encryption failed');
        }
    }

    async getSecureItem(key) {
        try {
            const encryptedData = localStorage.getItem(`secure_${key}`);
            if (!encryptedData) return null;
            
            return await this.decrypt(encryptedData);
        } catch (error) {
            console.error('Failed to decrypt stored data:', error);
            return null;
        }
    }

    removeSecureItem(key) {
        localStorage.removeItem(`secure_${key}`);
    }

    // =================
    // Rate Limiting
    // =================

    setupRateLimiting() {
        // Clean up old rate limit entries every minute
        setInterval(() => {
            const now = Date.now();
            for (const [key, limiter] of this.rateLimiters.entries()) {
                limiter.requests = limiter.requests.filter(
                    timestamp => now - timestamp < this.securityConfig.rateLimit.windowMs
                );
                
                if (limiter.requests.length === 0) {
                    this.rateLimiters.delete(key);
                }
            }
        }, 60000);
    }

    checkRateLimit(identifier) {
        const now = Date.now();
        const limiter = this.rateLimiters.get(identifier) || { requests: [] };
        
        // Remove old requests outside the time window
        limiter.requests = limiter.requests.filter(
            timestamp => now - timestamp < this.securityConfig.rateLimit.windowMs
        );
        
        if (limiter.requests.length >= this.securityConfig.rateLimit.maxRequests) {
            this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                identifier,
                timestamp: new Date().toISOString(),
                requestCount: limiter.requests.length
            });
            return false;
        }
        
        limiter.requests.push(now);
        this.rateLimiters.set(identifier, limiter);
        return true;
    }

    // =================
    // CSP and Security Headers
    // =================

    setupCSPReporting() {
        // Listen for CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            this.handleCSPViolation(event);
        });
    }

    handleCSPViolation(event) {
        const violation = {
            blockedURI: event.blockedURI,
            documentURI: event.documentURI,
            effectiveDirective: event.effectiveDirective,
            originalPolicy: event.originalPolicy,
            referrer: event.referrer,
            statusCode: event.statusCode,
            timestamp: new Date().toISOString()
        };

        this.cspViolations.push(violation);
        
        // Log critical violations
        console.warn('CSP Violation:', violation);
        
        // Report to security monitoring
        this.reportSecurityViolation('CSP_VIOLATION', violation);
    }

    setupSecurityHeaders() {
        // Check for security headers (for debugging purposes)
        fetch(window.location.href, { method: 'HEAD' })
            .then(response => {
                const headers = {
                    'Content-Security-Policy': response.headers.get('Content-Security-Policy'),
                    'X-Frame-Options': response.headers.get('X-Frame-Options'),
                    'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
                    'Strict-Transport-Security': response.headers.get('Strict-Transport-Security'),
                    'Referrer-Policy': response.headers.get('Referrer-Policy')
                };

                this.validateSecurityHeaders(headers);
            })
            .catch(error => {
                console.warn('Could not check security headers:', error);
            });
    }

    validateSecurityHeaders(headers) {
        const recommendations = [];

        if (!headers['Content-Security-Policy']) {
            recommendations.push('Missing Content-Security-Policy header');
        }

        if (!headers['X-Frame-Options']) {
            recommendations.push('Missing X-Frame-Options header');
        }

        if (!headers['X-Content-Type-Options']) {
            recommendations.push('Missing X-Content-Type-Options header');
        }

        if (recommendations.length > 0) {
            console.warn('Security Header Recommendations:', recommendations);
        }
    }

    // =================
    // Security Monitoring
    // =================

    logSecurityEvent(eventType, details) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            details: details
        };

        // Store locally for debugging
        const events = JSON.parse(localStorage.getItem('systemcraft_security_events') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.shift();
        }
        
        localStorage.setItem('systemcraft_security_events', JSON.stringify(events));

        // In production, this would send to a security monitoring service
        console.warn('Security Event:', event);
    }

    reportSecurityViolation(violationType, details) {
        // In production, this would report to a security incident response system
        console.error(`Security Violation: ${violationType}`, details);
    }

    // =================
    // Utility Functions
    // =================

    /**
     * Generate secure random string
     * @param {number} length - Length of the string
     * @returns {string} - Cryptographically secure random string
     */
    generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Safely parse JSON with error handling
     * @param {string} jsonString - JSON string to parse
     * @param {any} defaultValue - Default value if parsing fails
     * @returns {any} - Parsed object or default value
     */
    safeJSONParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('JSON parsing failed:', error);
            return defaultValue;
        }
    }

    /**
     * Escape string for use in regular expressions
     * @param {string} string - String to escape
     * @returns {string} - Escaped string
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Clean up resources and event listeners
     */
    cleanup() {
        this.rateLimiters.clear();
        this.cspViolations.length = 0;
        
        // Remove event listeners
        document.removeEventListener('securitypolicyviolation', this.handleCSPViolation);
    }
}

// =================
// Trusted Types Policy (where supported)
// =================

if (window.trustedTypes && window.trustedTypes.createPolicy) {
    try {
        const policy = window.trustedTypes.createPolicy('systemcraft-policy', {
            createHTML: (input) => {
                // Use our security utils for sanitization
                return window.securityUtils ? window.securityUtils.sanitizeHTML(input) : input;
            },
            createScript: (input) => {
                // Only allow known safe scripts
                if (this.isKnownSafeScript(input)) {
                    return input;
                }
                throw new Error('Untrusted script blocked by policy');
            }
        });
        
        window.systemCraftTrustedTypes = policy;
    } catch (error) {
        console.warn('Could not create Trusted Types policy:', error);
    }
}

// =================
// Global Security Utilities Instance
// =================

// Initialize global security utils
window.securityUtils = new SecurityUtils();

// =================
// Security-aware Event System
// =================

class SecureEventSystem {
    constructor() {
        this.eventHandlers = new Map();
        this.trustedOrigins = new Set(['https://systemcraft.github.io', window.location.origin]);
    }

    addEventListener(element, event, handler, options = {}) {
        const wrappedHandler = (e) => {
            // Rate limit events
            const identifier = `${event}_${element.id || 'anonymous'}`;
            if (!window.securityUtils.checkRateLimit(identifier)) {
                console.warn('Event rate limit exceeded');
                return;
            }

            // Validate event origin for sensitive events
            if (options.requireTrustedOrigin && !this.isOriginTrusted(e.origin)) {
                console.warn('Untrusted event origin:', e.origin);
                return;
            }

            // Execute the actual handler
            try {
                return handler(e);
            } catch (error) {
                console.error('Event handler error:', error);
                window.securityUtils.logSecurityEvent('EVENT_HANDLER_ERROR', {
                    event: event,
                    error: error.message
                });
            }
        };

        element.addEventListener(event, wrappedHandler, options);
        
        // Keep track for cleanup
        if (!this.eventHandlers.has(element)) {
            this.eventHandlers.set(element, new Map());
        }
        this.eventHandlers.get(element).set(event, wrappedHandler);
    }

    removeEventListener(element, event) {
        if (this.eventHandlers.has(element) && this.eventHandlers.get(element).has(event)) {
            const handler = this.eventHandlers.get(element).get(event);
            element.removeEventListener(event, handler);
            this.eventHandlers.get(element).delete(event);
        }
    }

    isOriginTrusted(origin) {
        return this.trustedOrigins.has(origin);
    }

    cleanup() {
        for (const [element, events] of this.eventHandlers) {
            for (const [event, handler] of events) {
                element.removeEventListener(event, handler);
            }
        }
        this.eventHandlers.clear();
    }
}

// Initialize secure event system
window.secureEventSystem = new SecureEventSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityUtils, SecureEventSystem };
}