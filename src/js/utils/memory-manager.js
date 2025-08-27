/**
 * Memory Manager - Prevent Memory Leaks in Event Handlers
 * Provides utilities for managing event listeners, timers, and observers
 * to prevent memory leaks in single-page applications
 */

class MemoryManager {
  constructor() {
    this.listeners = new Map();
    this.timers = new Set();
    this.observers = new Set();
    this.instances = new WeakMap();
    this.cleanupTasks = new Set();
    
    // Auto-cleanup on page visibility changes
    this.setupAutoCleanup();
  }

  /**
   * Add event listener with automatic cleanup tracking
   */
  addEventListener(element, event, handler, options = {}) {
    if (!element || !event || !handler) {
      console.warn('Invalid addEventListener parameters');
      return null;
    }

    // Create a wrapper that includes cleanup logic
    const wrappedHandler = this.wrapHandler(handler, options);
    
    // Store reference for cleanup
    const listenerId = this.generateId();
    const listenerData = {
      element,
      event,
      handler: wrappedHandler,
      originalHandler: handler,
      options,
      id: listenerId
    };

    this.listeners.set(listenerId, listenerData);
    
    // Add the actual event listener
    element.addEventListener(event, wrappedHandler, options);
    
    return listenerId;
  }

  /**
   * Remove event listener by ID
   */
  removeEventListener(listenerId) {
    const listenerData = this.listeners.get(listenerId);
    if (!listenerData) return false;

    const { element, event, handler, options } = listenerData;
    element.removeEventListener(event, handler, options);
    this.listeners.delete(listenerId);
    
    return true;
  }

  /**
   * Add event listener with automatic cleanup on element removal
   */
  addElementListener(element, event, handler, options = {}) {
    const listenerId = this.addEventListener(element, event, handler, options);
    
    // Set up cleanup when element is removed from DOM
    if ('MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (node === element || (node.contains && node.contains(element))) {
              this.removeEventListener(listenerId);
              observer.disconnect();
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      this.observers.add(observer);
    }
    
    return listenerId;
  }

  /**
   * Delegate event listener for dynamic elements
   */
  addDelegatedListener(container, selector, event, handler, options = {}) {
    const delegatedHandler = (e) => {
      const target = e.target.closest(selector);
      if (target && container.contains(target)) {
        // Call original handler with correct context
        handler.call(target, e);
      }
    };

    return this.addEventListener(container, event, delegatedHandler, options);
  }

  /**
   * Add debounced event listener
   */
  addDebouncedListener(element, event, handler, delay = 250, options = {}) {
    let timeout;
    
    const debouncedHandler = (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handler.call(element, e);
      }, delay);
    };

    const listenerId = this.addEventListener(element, event, debouncedHandler, options);
    
    // Store timeout for cleanup
    this.addCleanupTask(() => {
      clearTimeout(timeout);
    });
    
    return listenerId;
  }

  /**
   * Add throttled event listener
   */
  addThrottledListener(element, event, handler, delay = 100, options = {}) {
    let lastExecution = 0;
    let timeout;
    
    const throttledHandler = (e) => {
      const now = Date.now();
      
      if (now - lastExecution >= delay) {
        lastExecution = now;
        handler.call(element, e);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          lastExecution = Date.now();
          handler.call(element, e);
        }, delay - (now - lastExecution));
      }
    };

    const listenerId = this.addEventListener(element, event, throttledHandler, options);
    
    // Store timeout for cleanup
    this.addCleanupTask(() => {
      clearTimeout(timeout);
    });
    
    return listenerId;
  }

  /**
   * Managed setTimeout with automatic cleanup
   */
  setTimeout(callback, delay, ...args) {
    const timeoutId = window.setTimeout(() => {
      this.timers.delete(timeoutId);
      callback(...args);
    }, delay);
    
    this.timers.add(timeoutId);
    return timeoutId;
  }

  /**
   * Managed setInterval with automatic cleanup
   */
  setInterval(callback, interval, ...args) {
    const intervalId = window.setInterval(callback, interval, ...args);
    this.timers.add(intervalId);
    return intervalId;
  }

  /**
   * Clear managed timer
   */
  clearTimer(timerId) {
    if (this.timers.has(timerId)) {
      clearTimeout(timerId); // Works for both timeout and interval
      clearInterval(timerId);
      this.timers.delete(timerId);
      return true;
    }
    return false;
  }

  /**
   * Managed requestAnimationFrame with cleanup
   */
  requestAnimationFrame(callback) {
    const frameId = requestAnimationFrame(() => {
      this.timers.delete(frameId);
      callback();
    });
    
    this.timers.add(frameId);
    return frameId;
  }

  /**
   * Cancel managed animation frame
   */
  cancelAnimationFrame(frameId) {
    if (this.timers.has(frameId)) {
      cancelAnimationFrame(frameId);
      this.timers.delete(frameId);
      return true;
    }
    return false;
  }

  /**
   * Managed IntersectionObserver
   */
  createIntersectionObserver(callback, options = {}) {
    const observer = new IntersectionObserver(callback, options);
    this.observers.add(observer);
    return observer;
  }

  /**
   * Managed MutationObserver
   */
  createMutationObserver(callback) {
    const observer = new MutationObserver(callback);
    this.observers.add(observer);
    return observer;
  }

  /**
   * Managed ResizeObserver
   */
  createResizeObserver(callback) {
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(callback);
      this.observers.add(observer);
      return observer;
    }
    return null;
  }

  /**
   * Disconnect and remove observer
   */
  disconnectObserver(observer) {
    if (this.observers.has(observer)) {
      observer.disconnect();
      this.observers.delete(observer);
      return true;
    }
    return false;
  }

  /**
   * Add cleanup task to be executed on cleanup
   */
  addCleanupTask(task) {
    if (typeof task === 'function') {
      this.cleanupTasks.add(task);
    }
  }

  /**
   * Remove cleanup task
   */
  removeCleanupTask(task) {
    return this.cleanupTasks.delete(task);
  }

  /**
   * Create a managed instance of a class with automatic cleanup
   */
  createManagedInstance(ClassConstructor, ...args) {
    const instance = new ClassConstructor(...args);
    
    // Store cleanup method if available
    if (typeof instance.cleanup === 'function') {
      this.instances.set(instance, instance.cleanup.bind(instance));
    } else if (typeof instance.destroy === 'function') {
      this.instances.set(instance, instance.destroy.bind(instance));
    }
    
    return instance;
  }

  /**
   * Manually clean up a managed instance
   */
  cleanupInstance(instance) {
    const cleanup = this.instances.get(instance);
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during instance cleanup:', error);
      }
      this.instances.delete(instance);
      return true;
    }
    return false;
  }

  /**
   * Wrap handler with performance monitoring and error handling
   */
  wrapHandler(handler, options = {}) {
    return (event) => {
      const startTime = performance.now();
      
      try {
        // Call original handler
        const result = handler.call(this, event);
        
        // Handle promises
        if (result instanceof Promise) {
          result.catch(error => {
            console.error('Async event handler error:', error);
            this.reportError('async_handler_error', error, handler);
          });
        }
        
        return result;
        
      } catch (error) {
        console.error('Event handler error:', error);
        this.reportError('sync_handler_error', error, handler);
        
        // Optionally prevent error propagation
        if (options.suppressErrors) {
          event.preventDefault?.();
          event.stopPropagation?.();
        }
        
      } finally {
        // Performance monitoring
        const duration = performance.now() - startTime;
        if (duration > 16.67 && options.monitorPerformance !== false) { // > 1 frame
          console.warn(`Slow event handler detected: ${duration.toFixed(2)}ms`, handler);
        }
      }
    };
  }

  /**
   * Setup automatic cleanup on page visibility changes
   */
  setupAutoCleanup() {
    // Cleanup on page unload
    this.addEventListener(window, 'beforeunload', () => {
      this.cleanup();
    });

    // Cleanup on visibility change to hidden
    this.addEventListener(document, 'visibilitychange', () => {
      if (document.hidden) {
        this.pauseNonCriticalListeners();
      } else {
        this.resumePausedListeners();
      }
    });

    // Periodic cleanup of dead references
    this.setInterval(() => {
      this.cleanupDeadReferences();
    }, 60000); // Every minute
  }

  /**
   * Pause non-critical listeners when page is hidden
   */
  pauseNonCriticalListeners() {
    // This is a placeholder for advanced pause/resume functionality
    // Could be implemented to temporarily disable certain listeners
  }

  /**
   * Resume paused listeners when page becomes visible
   */
  resumePausedListeners() {
    // Counterpart to pauseNonCriticalListeners
  }

  /**
   * Clean up dead references and disconnected elements
   */
  cleanupDeadReferences() {
    let cleaned = 0;
    
    // Check event listeners
    for (const [id, listenerData] of this.listeners.entries()) {
      const { element } = listenerData;
      
      // Check if element is still in DOM
      if (!document.contains(element)) {
        this.removeEventListener(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} dead event listeners`);
    }
  }

  /**
   * Report errors to analytics or logging service
   */
  reportError(type, error, handler) {
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'javascript_error', {
        error_type: type,
        error_message: error.message,
        stack_trace: error.stack?.substring(0, 500)
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`Event Handler Error: ${type}`);
      console.error('Error:', error);
      console.error('Handler:', handler);
      console.error('Stack:', error.stack);
      console.groupEnd();
    }
  }

  /**
   * Get memory usage statistics
   */
  getStats() {
    return {
      listeners: this.listeners.size,
      timers: this.timers.size,
      observers: this.observers.size,
      cleanupTasks: this.cleanupTasks.size,
      instances: this.instances.size || 0 // WeakMap doesn't have size
    };
  }

  /**
   * Clean up all managed resources
   */
  cleanup() {
    console.log('Starting memory manager cleanup...');
    
    try {
      // Clean up event listeners
      for (const [id, listenerData] of this.listeners.entries()) {
        const { element, event, handler, options } = listenerData;
        element.removeEventListener(event, handler, options);
      }
      this.listeners.clear();

      // Clear timers
      for (const timerId of this.timers) {
        clearTimeout(timerId);
        clearInterval(timerId);
        cancelAnimationFrame(timerId);
      }
      this.timers.clear();

      // Disconnect observers
      for (const observer of this.observers) {
        observer.disconnect();
      }
      this.observers.clear();

      // Execute cleanup tasks
      for (const task of this.cleanupTasks) {
        try {
          task();
        } catch (error) {
          console.error('Cleanup task error:', error);
        }
      }
      this.cleanupTasks.clear();

      console.log('Memory manager cleanup completed');
      
    } catch (error) {
      console.error('Error during memory manager cleanup:', error);
    }
  }

  /**
   * Generate unique ID for listeners
   */
  generateId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
const memoryManager = new MemoryManager();

// Export utilities as a more convenient API
export const EventManager = {
  // Core event listener management
  on: (element, event, handler, options) => 
    memoryManager.addEventListener(element, event, handler, options),
  
  off: (listenerId) => memoryManager.removeEventListener(listenerId),
  
  // Specialized listeners
  delegate: (container, selector, event, handler, options) =>
    memoryManager.addDelegatedListener(container, selector, event, handler, options),
  
  debounce: (element, event, handler, delay, options) =>
    memoryManager.addDebouncedListener(element, event, handler, delay, options),
  
  throttle: (element, event, handler, delay, options) =>
    memoryManager.addThrottledListener(element, event, handler, delay, options),
  
  // Timer management
  setTimeout: (callback, delay, ...args) =>
    memoryManager.setTimeout(callback, delay, ...args),
  
  setInterval: (callback, interval, ...args) =>
    memoryManager.setInterval(callback, interval, ...args),
  
  clearTimer: (timerId) => memoryManager.clearTimer(timerId),
  
  // Animation frame management
  requestFrame: (callback) => memoryManager.requestAnimationFrame(callback),
  cancelFrame: (frameId) => memoryManager.cancelAnimationFrame(frameId),
  
  // Observer management
  createIntersectionObserver: (callback, options) =>
    memoryManager.createIntersectionObserver(callback, options),
  
  createMutationObserver: (callback) =>
    memoryManager.createMutationObserver(callback),
  
  createResizeObserver: (callback) =>
    memoryManager.createResizeObserver(callback),
  
  disconnectObserver: (observer) => memoryManager.disconnectObserver(observer),
  
  // Utility methods
  addCleanup: (task) => memoryManager.addCleanupTask(task),
  removeCleanup: (task) => memoryManager.removeCleanupTask(task),
  getStats: () => memoryManager.getStats(),
  cleanup: () => memoryManager.cleanup()
};

export default memoryManager;