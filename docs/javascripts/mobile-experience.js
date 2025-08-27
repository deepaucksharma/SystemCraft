/**
 * Mobile Experience Enhancement System
 * Touch gestures, offline capabilities, and native app-like interactions
 * Implements 2025 mobile-first design patterns and PWA features
 */

class MobileExperienceSystem {
    constructor() {
        this.isMobile = this.detectMobileDevice();
        this.touchManager = new TouchGestureManager();
        this.offlineManager = new OfflineManager();
        this.pwaManager = new PWAManager();
        this.mobileUI = new MobileUIEnhancer();
        this.performanceOptimizer = new MobilePerformanceOptimizer();
        
        this.gestureState = {
            isScrolling: false,
            lastTouchY: 0,
            pullDistance: 0,
            swipeDirection: null,
            longPressTimer: null,
            doubleTapTimer: null,
            pinchScale: 1
        };
        
        this.offlineState = {
            isOnline: navigator.onLine,
            cachedContent: new Map(),
            pendingSync: [],
            lastSync: Date.now()
        };
        
        this.init();
    }

    init() {
        if (!this.isMobile) {
            // Still initialize some features for tablet/desktop touch support
            this.initializeLimitedFeatures();
            return;
        }
        
        this.initializeTouchGestures();
        this.initializeOfflineCapabilities();
        this.initializePWAFeatures();
        this.initializeMobileUI();
        this.initializePerformanceOptimizations();
        this.setupEventListeners();
        this.startServices();
    }

    detectMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'windows phone'];
        
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.screen.width <= 768;
        
        return isMobileUA || (isTouchDevice && isSmallScreen);
    }

    initializeTouchGestures() {
        // Swipe gestures for navigation
        this.touchManager.enableSwipeNavigation({
            threshold: 50,
            velocityThreshold: 0.3,
            onSwipeLeft: () => this.handleSwipeLeft(),
            onSwipeRight: () => this.handleSwipeRight(),
            onSwipeUp: () => this.handleSwipeUp(),
            onSwipeDown: () => this.handleSwipeDown()
        });
        
        // Pull to refresh
        this.touchManager.enablePullToRefresh({
            threshold: 80,
            onPullToRefresh: () => this.handlePullToRefresh(),
            onPullProgress: (progress) => this.updatePullToRefreshUI(progress)
        });
        
        // Pinch to zoom for content
        this.touchManager.enablePinchZoom({
            minScale: 0.8,
            maxScale: 2.0,
            onPinchStart: () => this.handlePinchStart(),
            onPinch: (scale) => this.handlePinch(scale),
            onPinchEnd: () => this.handlePinchEnd()
        });
        
        // Long press for context menus
        this.touchManager.enableLongPress({
            duration: 500,
            onLongPress: (element, coords) => this.handleLongPress(element, coords)
        });
        
        // Double tap actions
        this.touchManager.enableDoubleTap({
            delay: 300,
            onDoubleTap: (element) => this.handleDoubleTap(element)
        });
        
        // Three finger gestures for advanced users
        this.touchManager.enableMultiTouch({
            onThreeFingerTap: () => this.handleThreeFingerTap(),
            onFourFingerSwipe: (direction) => this.handleFourFingerSwipe(direction)
        });
    }

    initializeOfflineCapabilities() {
        // Register service worker
        this.offlineManager.registerServiceWorker('/sw.js');
        
        // Cache critical resources
        this.offlineManager.cacheResources([
            '/',
            '/css/main.css',
            '/js/main.js',
            '/js/mobile-experience.js',
            '/offline.html'
        ]);
        
        // Enable content caching
        this.offlineManager.enableContentCaching({
            maxSize: 50 * 1024 * 1024, // 50MB
            strategy: 'network-first',
            fallbackPage: '/offline.html'
        });
        
        // Sync when online
        this.offlineManager.enableBackgroundSync({
            onSync: () => this.handleBackgroundSync(),
            retryInterval: 30000
        });
    }

    initializePWAFeatures() {
        // Install prompt
        this.pwaManager.setupInstallPrompt({
            onInstallable: () => this.showInstallPrompt(),
            onInstalled: () => this.handlePWAInstalled()
        });
        
        // App shortcuts
        this.pwaManager.registerShortcuts([
            {
                name: 'Quick Practice',
                short_name: 'Practice',
                description: 'Start a quick practice session',
                url: '/practice',
                icons: [{ src: '/icons/practice-192.png', sizes: '192x192' }]
            },
            {
                name: 'Progress Dashboard',
                short_name: 'Progress',
                description: 'View your learning progress',
                url: '/progress',
                icons: [{ src: '/icons/progress-192.png', sizes: '192x192' }]
            }
        ]);
        
        // Share functionality
        this.pwaManager.enableWebShare({
            onShare: (data) => this.handleShare(data),
            fallback: (data) => this.showShareFallback(data)
        });
    }

    initializeMobileUI() {
        // Mobile-specific navigation
        this.mobileUI.createBottomNavigation([
            { icon: '🏠', label: 'Home', href: '/' },
            { icon: '📚', label: 'Learn', href: '/learn' },
            { icon: '🎯', label: 'Practice', href: '/practice' },
            { icon: '📊', label: 'Progress', href: '/progress' },
            { icon: '👤', label: 'Profile', href: '/profile' }
        ]);
        
        // Floating action button
        this.mobileUI.createFloatingActionButton({
            icon: '➕',
            actions: [
                { icon: '📝', label: 'Quick Note', action: () => this.openQuickNote() },
                { icon: '🎯', label: 'Practice Problem', action: () => this.openPractice() },
                { icon: '📖', label: 'Bookmark', action: () => this.addBookmark() }
            ]
        });
        
        // Mobile search enhancement
        this.mobileUI.enhanceMobileSearch({
            voiceSearch: true,
            recentSearches: true,
            suggestions: true
        });
        
        // Haptic feedback
        this.mobileUI.enableHapticFeedback({
            onTap: 'light',
            onSuccess: 'medium',
            onError: 'heavy'
        });
        
        // Mobile tooltips and hints
        this.mobileUI.replaceTapsWithTooltips();
        
        // Safe area handling for notched devices
        this.mobileUI.handleSafeAreas();
    }

    initializePerformanceOptimizations() {
        // Lazy loading for mobile
        this.performanceOptimizer.enableLazyLoading({
            images: true,
            content: true,
            threshold: '200px'
        });
        
        // Preload critical resources
        this.performanceOptimizer.preloadCriticalResources([
            '/css/mobile.css',
            '/js/touch-gestures.js'
        ]);
        
        // Optimize images for mobile
        this.performanceOptimizer.optimizeImages({
            quality: 85,
            format: 'webp',
            responsive: true
        });
        
        // Minimize battery drain
        this.performanceOptimizer.enablePowerSaving({
            reduceAnimations: false,
            throttleUpdates: true,
            optimizeRendering: true
        });
    }

    setupEventListeners() {
        // Online/offline events
        window.addEventListener('online', () => this.handleOnlineStatusChange(true));
        window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
        
        // Orientation change
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
        
        // Battery status (if supported)
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                battery.addEventListener('levelchange', () => this.handleBatteryChange(battery));
            });
        }
        
        // App lifecycle events
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Touch events for gesture detection
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Page navigation events
        window.addEventListener('beforeunload', () => this.handlePageUnload());
        
        // Network information (if supported)
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => this.handleNetworkChange());
        }
    }

    startServices() {
        // Start offline sync service
        this.offlineManager.startSyncService();
        
        // Start performance monitoring
        this.performanceOptimizer.startMonitoring();
        
        // Start gesture recognition
        this.touchManager.startGestureRecognition();
        
        // Initialize push notifications
        this.pwaManager.initializePushNotifications();
    }

    // Touch Gesture Handlers
    handleSwipeLeft() {
        const currentPath = window.location.pathname;
        const navigationMap = {
            '/': '/learn',
            '/learn': '/practice',
            '/practice': '/progress',
            '/progress': '/profile'
        };
        
        if (navigationMap[currentPath]) {
            this.navigateWithAnimation(navigationMap[currentPath], 'slide-left');
        }
        
        this.showGestureHint('Swipe left to navigate forward');
    }

    handleSwipeRight() {
        const currentPath = window.location.pathname;
        const navigationMap = {
            '/learn': '/',
            '/practice': '/learn',
            '/progress': '/practice',
            '/profile': '/progress'
        };
        
        if (navigationMap[currentPath]) {
            this.navigateWithAnimation(navigationMap[currentPath], 'slide-right');
        } else if (window.history.length > 1) {
            window.history.back();
        }
        
        this.showGestureHint('Swipe right to go back');
    }

    handleSwipeUp() {
        // Scroll to next section or show quick actions
        const sections = document.querySelectorAll('section, .content-section');
        const currentScroll = window.scrollY;
        
        let nextSection = null;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top > 100 && !nextSection) {
                nextSection = section;
            }
        });
        
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            this.mobileUI.showQuickActions();
        }
        
        this.showGestureHint('Swipe up for quick actions');
    }

    handleSwipeDown() {
        // Scroll to previous section or minimize/close
        const sections = document.querySelectorAll('section, .content-section');
        const currentScroll = window.scrollY;
        
        if (currentScroll < 100) {
            // At top of page, show pull to refresh or minimize
            this.handlePullToRefresh();
        } else {
            // Scroll to previous section
            let prevSection = null;
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.bottom < -100) {
                    prevSection = section;
                }
            });
            
            if (prevSection) {
                prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        this.showGestureHint('Swipe down to refresh or go up');
    }

    handlePullToRefresh() {
        this.showPullToRefreshAnimation();
        
        // Refresh current page content
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
        // Trigger haptic feedback
        this.mobileUI.triggerHapticFeedback('medium');
    }

    updatePullToRefreshUI(progress) {
        const indicator = document.querySelector('.pull-to-refresh-indicator');
        if (indicator) {
            indicator.style.transform = `translateY(${Math.min(progress, 80)}px) rotate(${progress * 4}deg)`;
            indicator.style.opacity = Math.min(progress / 80, 1);
        }
    }

    handlePinchStart() {
        document.body.classList.add('pinch-zooming');
    }

    handlePinch(scale) {
        const content = document.querySelector('.md-content');
        if (content && scale >= 0.8 && scale <= 2.0) {
            content.style.transform = `scale(${scale})`;
            content.style.transformOrigin = 'center top';
        }
    }

    handlePinchEnd() {
        document.body.classList.remove('pinch-zooming');
        const content = document.querySelector('.md-content');
        if (content) {
            // Snap to reasonable zoom levels
            const currentScale = parseFloat(content.style.transform.match(/scale\\(([^)]+)\\)/)?.[1] || 1);
            let targetScale = 1;
            
            if (currentScale > 1.3) targetScale = 1.5;
            else if (currentScale < 0.9) targetScale = 0.8;
            
            content.style.transition = 'transform 0.3s ease';
            content.style.transform = `scale(${targetScale})`;
            
            setTimeout(() => {
                content.style.transition = '';
            }, 300);
        }
    }

    handleLongPress(element, coords) {
        // Create context menu
        const contextMenu = this.createContextMenu(element, coords);
        document.body.appendChild(contextMenu);
        
        // Trigger haptic feedback
        this.mobileUI.triggerHapticFeedback('heavy');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (contextMenu.parentNode) {
                contextMenu.remove();
            }
        }, 5000);
    }

    handleDoubleTap(element) {
        if (element.classList.contains('bookmarkable')) {
            this.addBookmark(element);
        } else if (element.tagName === 'IMG') {
            this.toggleImageFullscreen(element);
        } else if (element.closest('.code-block')) {
            this.copyCodeBlock(element.closest('.code-block'));
        }
        
        this.mobileUI.triggerHapticFeedback('light');
    }

    handleThreeFingerTap() {
        // Power user feature: Quick screenshot or share
        this.mobileUI.showPowerUserMenu();
    }

    handleFourFingerSwipe(direction) {
        // App switching gesture
        if (direction === 'up') {
            this.mobileUI.showAppSwitcher();
        } else if (direction === 'down') {
            this.minimizeApp();
        }
    }

    // Touch Event Handlers
    handleTouchStart(e) {
        const touch = e.touches[0];
        this.gestureState.lastTouchY = touch.clientY;
        this.gestureState.isScrolling = false;
        
        // Check for pull to refresh at top of page
        if (window.scrollY === 0 && touch.clientY < 100) {
            this.gestureState.pullDistance = 0;
            e.preventDefault();
        }
        
        // Start long press timer
        this.gestureState.longPressTimer = setTimeout(() => {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            this.handleLongPress(element, { x: touch.clientX, y: touch.clientY });
        }, 500);
        
        // Handle double tap detection
        const now = Date.now();
        if (this.gestureState.doubleTapTimer && (now - this.gestureState.doubleTapTimer) < 300) {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            this.handleDoubleTap(element);
            this.gestureState.doubleTapTimer = null;
        } else {
            this.gestureState.doubleTapTimer = now;
        }
    }

    handleTouchMove(e) {
        const touch = e.touches[0];
        const deltaY = touch.clientY - this.gestureState.lastTouchY;
        
        // Clear long press timer on movement
        if (this.gestureState.longPressTimer) {
            clearTimeout(this.gestureState.longPressTimer);
            this.gestureState.longPressTimer = null;
        }
        
        // Handle pull to refresh
        if (window.scrollY === 0 && deltaY > 0 && !this.gestureState.isScrolling) {
            this.gestureState.pullDistance += deltaY * 0.5;
            this.updatePullToRefreshUI(this.gestureState.pullDistance);
            e.preventDefault();
        } else {
            this.gestureState.isScrolling = true;
        }
        
        this.gestureState.lastTouchY = touch.clientY;
    }

    handleTouchEnd(e) {
        // Clear timers
        if (this.gestureState.longPressTimer) {
            clearTimeout(this.gestureState.longPressTimer);
            this.gestureState.longPressTimer = null;
        }
        
        // Handle pull to refresh completion
        if (this.gestureState.pullDistance > 80) {
            this.handlePullToRefresh();
        } else if (this.gestureState.pullDistance > 0) {
            // Snap back
            this.updatePullToRefreshUI(0);
        }
        
        this.gestureState.pullDistance = 0;
        this.gestureState.isScrolling = false;
    }

    // Offline Handlers
    handleOnlineStatusChange(isOnline) {
        this.offlineState.isOnline = isOnline;
        
        if (isOnline) {
            this.showOnlineNotification();
            this.syncPendingData();
            this.offlineManager.updateCachedContent();
        } else {
            this.showOfflineNotification();
            this.enableOfflineMode();
        }
    }

    handleBackgroundSync() {
        // Sync progress data
        const progressData = localStorage.getItem('progress_data');
        if (progressData && this.offlineState.isOnline) {
            this.syncProgressData(JSON.parse(progressData));
        }
        
        // Sync learning history
        const learningHistory = localStorage.getItem('learning_history');
        if (learningHistory && this.offlineState.isOnline) {
            this.syncLearningHistory(JSON.parse(learningHistory));
        }
        
        // Update last sync time
        this.offlineState.lastSync = Date.now();
        localStorage.setItem('last_sync', this.offlineState.lastSync.toString());
    }

    // PWA Handlers
    showInstallPrompt() {
        const installBanner = document.createElement('div');
        installBanner.className = 'install-banner';
        installBanner.innerHTML = `
            <div class="banner-content">
                <div class="banner-icon">📱</div>
                <div class="banner-text">
                    <h4>Install SystemCraft</h4>
                    <p>Get quick access with our app!</p>
                </div>
                <div class="banner-actions">
                    <button class="install-btn">Install</button>
                    <button class="dismiss-btn">✕</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(installBanner);
        
        installBanner.querySelector('.install-btn').addEventListener('click', () => {
            this.pwaManager.promptInstall();
            installBanner.remove();
        });
        
        installBanner.querySelector('.dismiss-btn').addEventListener('click', () => {
            installBanner.remove();
            localStorage.setItem('install_prompt_dismissed', Date.now().toString());
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (installBanner.parentNode) {
                installBanner.remove();
            }
        }, 10000);
    }

    handlePWAInstalled() {
        this.showSuccessNotification('App installed successfully!');
        
        // Track installation
        this.trackEvent('pwa_installed', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    }

    handleShare(data) {
        if (navigator.share) {
            navigator.share(data).catch(console.error);
        } else {
            this.showShareFallback(data);
        }
    }

    // UI Enhancement Methods
    navigateWithAnimation(url, animationType = 'slide-left') {
        const currentPage = document.body;
        currentPage.classList.add(`exit-${animationType}`);
        
        setTimeout(() => {
            window.location.href = url;
        }, 250);
    }

    showGestureHint(message) {
        const hint = document.createElement('div');
        hint.className = 'gesture-hint';
        hint.textContent = message;
        
        document.body.appendChild(hint);
        
        setTimeout(() => {
            hint.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            hint.classList.add('hide');
            setTimeout(() => hint.remove(), 300);
        }, 2000);
    }

    createContextMenu(element, coords) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = coords.x + 'px';
        menu.style.top = coords.y + 'px';
        
        const menuItems = this.getContextMenuItems(element);
        menu.innerHTML = menuItems.map(item => `
            <div class="context-menu-item" data-action="${item.action}">
                <span class="menu-icon">${item.icon}</span>
                <span class="menu-label">${item.label}</span>
            </div>
        `).join('');
        
        // Handle menu item clicks
        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                this.handleContextMenuAction(item.dataset.action, element);
                menu.remove();
            }
        });
        
        // Remove menu on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                }
            }, { once: true });
        }, 100);
        
        return menu;
    }

    getContextMenuItems(element) {
        const baseItems = [
            { icon: '📋', label: 'Copy', action: 'copy' },
            { icon: '🔗', label: 'Share', action: 'share' }
        ];
        
        if (element.classList.contains('bookmarkable')) {
            baseItems.push({ icon: '🔖', label: 'Bookmark', action: 'bookmark' });
        }
        
        if (element.tagName === 'IMG') {
            baseItems.push({ icon: '💾', label: 'Save Image', action: 'save_image' });
        }
        
        if (element.closest('.code-block')) {
            baseItems.push({ icon: '📝', label: 'Copy Code', action: 'copy_code' });
        }
        
        return baseItems;
    }

    handleContextMenuAction(action, element) {
        switch (action) {
            case 'copy':
                this.copyText(element.textContent);
                break;
            case 'share':
                this.shareContent(element);
                break;
            case 'bookmark':
                this.addBookmark(element);
                break;
            case 'save_image':
                this.saveImage(element);
                break;
            case 'copy_code':
                this.copyCodeBlock(element.closest('.code-block'));
                break;
        }
    }

    showPullToRefreshAnimation() {
        const animation = document.createElement('div');
        animation.className = 'pull-refresh-animation';
        animation.innerHTML = `
            <div class="refresh-spinner"></div>
            <div class="refresh-text">Refreshing...</div>
        `;
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 1500);
    }

    showOnlineNotification() {
        this.showNotification('🟢 Back online!', 'success');
    }

    showOfflineNotification() {
        this.showNotification('🔴 You\'re offline. Some features may be limited.', 'warning');
    }

    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `mobile-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-hide
        const hideTimeout = setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(hideTimeout);
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Utility Methods
    copyText(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showSuccessNotification('Copied to clipboard!');
                this.mobileUI.triggerHapticFeedback('light');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccessNotification('Copied to clipboard!');
        }
    }

    addBookmark(element) {
        const bookmarkData = {
            title: element.textContent || document.title,
            url: window.location.href,
            timestamp: Date.now()
        };
        
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        bookmarks.push(bookmarkData);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        
        this.showSuccessNotification('Bookmarked!');
        this.mobileUI.triggerHapticFeedback('medium');
    }

    shareContent(element) {
        const shareData = {
            title: document.title,
            text: element.textContent.substring(0, 100) + '...',
            url: window.location.href
        };
        
        this.handleShare(shareData);
    }

    trackEvent(eventName, data) {
        const eventData = {
            event: eventName,
            data: data,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        // Store locally and sync when online
        const events = JSON.parse(localStorage.getItem('mobile_events') || '[]');
        events.push(eventData);
        localStorage.setItem('mobile_events', JSON.stringify(events));
    }

    // Limited features for non-mobile devices
    initializeLimitedFeatures() {
        // Still enable some touch features for tablets and touch laptops
        this.touchManager.enableBasicTouch();
        this.offlineManager.enableLimitedCaching();
    }

    // Lifecycle event handlers
    handleOrientationChange() {
        setTimeout(() => {
            this.mobileUI.adjustForOrientation();
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            this.performanceOptimizer.pauseNonEssentialOperations();
        } else {
            this.performanceOptimizer.resumeOperations();
        }
    }

    handleBatteryChange(battery) {
        if (battery.level < 0.2) {
            this.performanceOptimizer.enablePowerSavingMode();
            this.showNotification('Low battery: Power saving mode enabled', 'warning');
        } else if (battery.level > 0.5 && this.performanceOptimizer.isPowerSavingMode()) {
            this.performanceOptimizer.disablePowerSavingMode();
        }
    }

    handleNetworkChange() {
        const connection = navigator.connection;
        if (connection && connection.effectiveType === 'slow-2g') {
            this.performanceOptimizer.enableDataSavingMode();
        }
    }

    handlePageUnload() {
        // Save current state before unload
        const currentState = {
            scrollPosition: window.scrollY,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        localStorage.setItem('last_session_state', JSON.stringify(currentState));
    }
}

// Supporting Classes

class TouchGestureManager {
    constructor() {
        this.gestures = new Map();
        this.isEnabled = false;
    }

    enableSwipeNavigation(config) {
        this.gestures.set('swipe', config);
    }

    enablePullToRefresh(config) {
        this.gestures.set('pullToRefresh', config);
    }

    enablePinchZoom(config) {
        this.gestures.set('pinchZoom', config);
    }

    enableLongPress(config) {
        this.gestures.set('longPress', config);
    }

    enableDoubleTap(config) {
        this.gestures.set('doubleTap', config);
    }

    enableMultiTouch(config) {
        this.gestures.set('multiTouch', config);
    }

    startGestureRecognition() {
        this.isEnabled = true;
    }

    enableBasicTouch() {
        // Limited touch support for non-mobile devices
        this.enableDoubleTap({
            delay: 300,
            onDoubleTap: (element) => console.log('Double tap detected')
        });
    }
}

class OfflineManager {
    constructor() {
        this.serviceWorker = null;
        this.cache = null;
    }

    registerServiceWorker(path) {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(path)
                .then(registration => {
                    this.serviceWorker = registration;
                    console.log('Service Worker registered');
                })
                .catch(error => {
                    console.log('Service Worker registration failed');
                });
        }
    }

    cacheResources(resources) {
        if ('caches' in window) {
            caches.open('systemcraft-v1').then(cache => {
                this.cache = cache;
                cache.addAll(resources);
            });
        }
    }

    enableContentCaching(config) {
        // Implementation would depend on specific caching strategy
    }

    enableBackgroundSync(config) {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Register for background sync
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('background-sync');
            });
        }
    }

    startSyncService() {
        // Start periodic sync checks
        setInterval(() => {
            if (navigator.onLine) {
                this.triggerSync();
            }
        }, 60000);
    }

    triggerSync() {
        // Trigger sync operations
        window.dispatchEvent(new CustomEvent('background-sync'));
    }

    enableLimitedCaching() {
        // Reduced caching for non-mobile devices
        this.cacheResources(['/css/main.css', '/js/main.js']);
    }
}

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
    }

    setupInstallPrompt(config) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            config.onInstallable();
        });

        window.addEventListener('appinstalled', () => {
            config.onInstalled();
        });
    }

    promptInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                this.deferredPrompt = null;
            });
        }
    }

    registerShortcuts(shortcuts) {
        // App shortcuts would be defined in manifest.json
        console.log('Shortcuts registered:', shortcuts);
    }

    enableWebShare(config) {
        if ('share' in navigator) {
            // Web Share API is available
            return true;
        } else {
            // Use fallback
            return false;
        }
    }

    initializePushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            // Initialize push notifications
            Notification.requestPermission();
        }
    }
}

class MobileUIEnhancer {
    createBottomNavigation(items) {
        const nav = document.createElement('nav');
        nav.className = 'mobile-bottom-nav';
        nav.innerHTML = items.map(item => `
            <a href="${item.href}" class="nav-item">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
            </a>
        `).join('');
        
        document.body.appendChild(nav);
    }

    createFloatingActionButton(config) {
        const fab = document.createElement('div');
        fab.className = 'floating-action-button';
        fab.innerHTML = `
            <button class="fab-main">
                <span class="fab-icon">${config.icon}</span>
            </button>
            <div class="fab-actions">
                ${config.actions.map(action => `
                    <button class="fab-action" data-action="${action.action}">
                        <span class="action-icon">${action.icon}</span>
                        <span class="action-label">${action.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(fab);
        
        // Add event listeners
        fab.querySelector('.fab-main').addEventListener('click', () => {
            fab.classList.toggle('expanded');
        });
        
        fab.querySelectorAll('.fab-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const actionData = config.actions.find(a => a.action === button.dataset.action);
                if (actionData && actionData.action) {
                    actionData.action();
                }
                fab.classList.remove('expanded');
            });
        });
    }

    enhanceMobileSearch(config) {
        const searchInput = document.querySelector('input[type="search"], .md-search__input');
        if (!searchInput) return;
        
        // Add voice search if supported
        if (config.voiceSearch && 'webkitSpeechRecognition' in window) {
            this.addVoiceSearch(searchInput);
        }
        
        // Add recent searches
        if (config.recentSearches) {
            this.addRecentSearches(searchInput);
        }
    }

    enableHapticFeedback(config) {
        this.hapticConfig = config;
    }

    triggerHapticFeedback(type) {
        if ('vibrate' in navigator) {
            const patterns = {
                'light': 10,
                'medium': 50,
                'heavy': 100
            };
            
            navigator.vibrate(patterns[type] || 10);
        }
    }

    replaceTapsWithTooltips() {
        // Replace hover tooltips with tap-based ones on mobile
        document.querySelectorAll('[title]').forEach(element => {
            const title = element.getAttribute('title');
            element.removeAttribute('title');
            
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showMobileTooltip(element, title);
            });
        });
    }

    showMobileTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'mobile-tooltip';
        tooltip.textContent = text;
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - 10) + 'px';
        
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    }

    handleSafeAreas() {
        // Add CSS custom properties for safe areas
        const root = document.documentElement;
        if (CSS.supports('padding: env(safe-area-inset-top)')) {
            root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
            root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
        }
    }

    showQuickActions() {
        // Show quick actions overlay
        const overlay = document.createElement('div');
        overlay.className = 'quick-actions-overlay';
        overlay.innerHTML = `
            <div class="quick-actions-content">
                <h3>Quick Actions</h3>
                <div class="actions-grid">
                    <button class="quick-action" data-action="bookmark">🔖 Bookmark</button>
                    <button class="quick-action" data-action="share">🔗 Share</button>
                    <button class="quick-action" data-action="search">🔍 Search</button>
                    <button class="quick-action" data-action="progress">📊 Progress</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            overlay.remove();
        }, 5000);
    }

    adjustForOrientation() {
        const orientation = window.orientation || 0;
        document.body.setAttribute('data-orientation', Math.abs(orientation) === 90 ? 'landscape' : 'portrait');
    }
}

class MobilePerformanceOptimizer {
    constructor() {
        this.powerSavingMode = false;
        this.dataSavingMode = false;
    }

    enableLazyLoading(config) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: config.threshold });
            
            if (config.images) {
                document.querySelectorAll('img[data-src]').forEach(img => {
                    observer.observe(img);
                });
            }
        }
    }

    loadElement(element) {
        if (element.tagName === 'IMG' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
    }

    preloadCriticalResources(resources) {
        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    optimizeImages(config) {
        // Would integrate with image optimization service
        console.log('Images optimized with config:', config);
    }

    enablePowerSaving(config) {
        this.powerSavingConfig = config;
    }

    enablePowerSavingMode() {
        this.powerSavingMode = true;
        document.body.classList.add('power-saving');
        
        // Reduce animations
        document.body.style.setProperty('--animation-duration', '0.1s');
        
        // Throttle updates
        this.throttleUpdates(true);
    }

    disablePowerSavingMode() {
        this.powerSavingMode = false;
        document.body.classList.remove('power-saving');
        document.body.style.removeProperty('--animation-duration');
        this.throttleUpdates(false);
    }

    isPowerSavingMode() {
        return this.powerSavingMode;
    }

    enableDataSavingMode() {
        this.dataSavingMode = true;
        document.body.classList.add('data-saving');
    }

    throttleUpdates(enable) {
        // Implementation for throttling non-essential updates
    }

    pauseNonEssentialOperations() {
        // Pause animations, timers, etc.
        document.body.classList.add('background');
    }

    resumeOperations() {
        document.body.classList.remove('background');
    }

    startMonitoring() {
        // Monitor performance metrics
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((entries) => {
                entries.getEntries().forEach(entry => {
                    if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                        console.log('FCP:', entry.startTime);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint', 'navigation'] });
        }
    }
}

// Styles for mobile experience
const mobileExperienceStyles = `
<style>
/* Mobile Experience Styles */
.mobile-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: white;
    border-top: 1px solid #e2e8f0;
    padding: env(safe-area-inset-bottom) 0 0 0;
    z-index: 1000;
}

.nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    text-decoration: none;
    color: #64748b;
    transition: color 0.2s ease;
}

.nav-item.active,
.nav-item:hover {
    color: #667eea;
}

.nav-icon {
    font-size: 1.2rem;
    margin-bottom: 2px;
}

.nav-label {
    font-size: 0.7rem;
    font-weight: 500;
}

.floating-action-button {
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 1001;
}

.fab-main {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.fab-main:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.fab-actions {
    position: absolute;
    bottom: 70px;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    opacity: 0;
    transform: scale(0);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-action-button.expanded .fab-actions {
    opacity: 1;
    transform: scale(1);
}

.fab-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
}

.fab-action:hover {
    background: #f8fafc;
    transform: translateX(-4px);
}

.context-menu {
    position: fixed;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    padding: 8px;
    z-index: 10000;
    min-width: 160px;
}

.context-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.context-menu-item:hover {
    background: #f1f5f9;
}

.menu-icon {
    font-size: 1.1rem;
}

.menu-label {
    font-weight: 500;
}

.gesture-hint {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
}

.gesture-hint.show {
    opacity: 1;
}

.gesture-hint.hide {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
}

.pull-to-refresh-indicator {
    position: fixed;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.5rem;
    opacity: 0;
    transition: all 0.3s ease;
}

.pull-refresh-animation {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10000;
}

.refresh-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.refresh-text {
    color: #64748b;
    font-weight: 500;
}

.mobile-notification {
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    padding: 16px;
    border-radius: 12px;
    z-index: 10001;
    transform: translateY(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-notification.show {
    transform: translateY(0);
}

.mobile-notification.hide {
    transform: translateY(-100%);
}

.mobile-notification.success {
    background: #d1fae5;
    border: 1px solid #a7f3d0;
    color: #065f46;
}

.mobile-notification.warning {
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #92400e;
}

.mobile-notification.info {
    background: #dbeafe;
    border: 1px solid #bfdbfe;
    color: #1e40af;
}

.notification-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.7;
}

.install-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #e2e8f0;
    padding: 16px;
    z-index: 10002;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.banner-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.banner-icon {
    font-size: 2rem;
}

.banner-text {
    flex: 1;
}

.banner-text h4 {
    margin: 0 0 4px 0;
    font-weight: 600;
}

.banner-text p {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
}

.banner-actions {
    display: flex;
    gap: 8px;
}

.install-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
}

.dismiss-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.7;
}

.mobile-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    z-index: 10000;
    transform: translateX(-50%) translateY(-100%);
    white-space: nowrap;
    pointer-events: none;
}

.quick-actions-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.quick-actions-content {
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 320px;
}

.quick-actions-content h3 {
    margin: 0 0 20px 0;
    text-align: center;
}

.actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.quick-action {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.quick-action:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
}

/* Power saving mode */
.power-saving * {
    animation-duration: 0.1s !important;
    transition-duration: 0.1s !important;
}

/* Data saving mode */
.data-saving img {
    filter: contrast(0.8) brightness(0.9);
}

/* Page transition animations */
.exit-slide-left {
    transform: translateX(-100%);
    transition: transform 0.25s ease-in;
}

.exit-slide-right {
    transform: translateX(100%);
    transition: transform 0.25s ease-in;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    body {
        padding-bottom: 80px; /* Space for bottom nav */
    }
    
    .mobile-bottom-nav {
        display: flex;
    }
    
    .floating-action-button {
        display: block;
    }
}

@media (orientation: landscape) and (max-height: 500px) {
    .mobile-bottom-nav {
        padding: 4px 0;
    }
    
    .nav-item {
        padding: 4px;
    }
    
    .nav-label {
        display: none;
    }
    
    .floating-action-button {
        bottom: 60px;
    }
}

/* Safe area support */
@supports (padding: env(safe-area-inset-bottom)) {
    .mobile-bottom-nav {
        padding-bottom: env(safe-area-inset-bottom);
    }
    
    .mobile-notification {
        top: calc(20px + env(safe-area-inset-top));
    }
}

/* Pinch zoom prevention for UI elements */
.mobile-bottom-nav,
.floating-action-button,
.context-menu,
.mobile-notification,
.install-banner {
    touch-action: manipulation;
    user-select: none;
}

/* High contrast support */
@media (prefers-contrast: high) {
    .mobile-bottom-nav {
        border-top-width: 2px;
    }
    
    .context-menu {
        border: 2px solid #000;
    }
    
    .mobile-notification {
        border-width: 2px;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .gesture-hint,
    .mobile-notification,
    .fab-actions,
    .quick-action {
        transition: none !important;
        animation: none !important;
    }
}
</style>
`;

// Inject styles
if (!document.getElementById('mobile-experience-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'mobile-experience-styles';
    styleSheet.innerHTML = mobileExperienceStyles;
    document.head.appendChild(styleSheet);
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with a small delay to ensure all other systems are ready
    setTimeout(() => {
        window.mobileExperience = new MobileExperienceSystem();
    }, 2000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileExperienceSystem;
}