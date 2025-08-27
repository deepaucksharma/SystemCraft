/**
 * Advanced Image Lazy Loading with Performance Optimization
 * Implements modern lazy loading with placeholder generation, WebP support,
 * and responsive image optimization
 */

class ImageLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      maxRetries: 3,
      retryDelay: 1000,
      enableWebP: true,
      enablePlaceholders: true,
      enableProgressiveLoading: true,
      quality: 85,
      ...options
    };
    
    this.observer = null;
    this.loadingImages = new Set();
    this.loadedImages = new Set();
    this.failedImages = new Map();
    this.retryQueue = new Set();
    
    this.init();
  }

  static async init(options) {
    const instance = new ImageLazyLoader(options);
    return instance;
  }

  init() {
    // Check for native lazy loading support
    this.hasNativeLazyLoading = 'loading' in HTMLImageElement.prototype;
    
    // Set up intersection observer for browsers that don't support native lazy loading
    if (!this.hasNativeLazyLoading) {
      this.setupIntersectionObserver();
    }
    
    // Process all images on the page
    this.processImages();
    
    // Set up event listeners
    this.bindEvents();
    
    // Set up retry mechanism
    this.setupRetryMechanism();
    
    console.log('Image lazy loading initialized', {
      nativeSupport: this.hasNativeLazyLoading,
      imagesProcessed: document.querySelectorAll('img[data-src], img[loading="lazy"]').length
    });
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadAllImages();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }

  processImages() {
    // Get all images that need lazy loading
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    
    images.forEach(img => {
      if (this.hasNativeLazyLoading) {
        this.setupNativeLazyLoading(img);
      } else {
        this.setupCustomLazyLoading(img);
      }
    });
    
    // Process existing images without lazy loading attributes
    const existingImages = document.querySelectorAll('img:not([data-src]):not([loading])');
    existingImages.forEach(img => {
      if (this.shouldOptimizeImage(img)) {
        this.optimizeExistingImage(img);
      }
    });
  }

  setupNativeLazyLoading(img) {
    // Use native lazy loading
    img.loading = 'lazy';
    
    // Move data-src to src for native lazy loading
    if (img.dataset.src && !img.src) {
      img.src = img.dataset.src;
    }
    
    if (img.dataset.srcset && !img.srcset) {
      img.srcset = img.dataset.srcset;
    }
    
    // Add load event listener for analytics
    this.addImageLoadListeners(img);
  }

  setupCustomLazyLoading(img) {
    // Create placeholder if enabled
    if (this.options.enablePlaceholders) {
      this.createPlaceholder(img);
    }
    
    // Add to intersection observer
    if (this.observer) {
      this.observer.observe(img);
    }
    
    // Add loading state
    img.classList.add('lazy-loading');
  }

  shouldOptimizeImage(img) {
    // Check if image should be optimized (size, format, etc.)
    const src = img.src || img.dataset.src;
    if (!src) return false;
    
    // Skip if already optimized
    if (img.dataset.optimized) return false;
    
    // Skip external images (optional)
    if (this.options.skipExternal && this.isExternalImage(src)) return false;
    
    return true;
  }

  optimizeExistingImage(img) {
    const originalSrc = img.src;
    
    // Check for WebP support and create optimized version
    if (this.options.enableWebP && this.supportsWebP()) {
      this.convertToWebP(img);
    }
    
    // Add loading listeners
    this.addImageLoadListeners(img);
    
    // Mark as optimized
    img.dataset.optimized = 'true';
  }

  createPlaceholder(img) {
    // Create a blurred placeholder or solid color
    const placeholder = this.generatePlaceholder(img);
    
    if (placeholder) {
      img.style.backgroundImage = `url(${placeholder})`;
      img.style.backgroundSize = 'cover';
      img.style.backgroundPosition = 'center';
    } else {
      // Use a simple color placeholder
      img.style.backgroundColor = '#f0f0f0';
    }
    
    // Add transition for smooth loading
    img.style.transition = 'opacity 0.3s ease';
  }

  generatePlaceholder(img) {
    // Generate a tiny blurred version or use a solid color
    // This could be enhanced to generate actual blur placeholders
    const width = img.dataset.width || 40;
    const height = img.dataset.height || 30;
    
    // Create a canvas-based placeholder (simplified)
    if (img.dataset.placeholder) {
      return img.dataset.placeholder;
    }
    
    // Generate a gradient placeholder based on dominant color hint
    const color = img.dataset.dominantColor || '#e0e0e0';
    return this.createGradientPlaceholder(width, height, color);
  }

  createGradientPlaceholder(width, height, color) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // Create a subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.adjustBrightness(color, -20));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.1); // Very low quality for placeholder
  }

  adjustBrightness(hex, percent) {
    // Simple brightness adjustment for placeholder gradients
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  async loadImage(img) {
    if (this.loadingImages.has(img) || this.loadedImages.has(img)) {
      return;
    }
    
    this.loadingImages.add(img);
    
    try {
      // Determine the best source to load
      const src = await this.getBestImageSource(img);
      
      // Preload the image
      await this.preloadImage(src);
      
      // Update the image source
      this.updateImageSource(img, src);
      
      // Mark as loaded
      this.loadingImages.delete(img);
      this.loadedImages.add(img);
      
      // Remove loading state
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      
      // Fade in effect
      img.style.opacity = '1';
      
      // Clear placeholder background
      setTimeout(() => {
        img.style.backgroundImage = '';
        img.style.backgroundColor = '';
      }, 300);
      
    } catch (error) {
      this.handleImageLoadError(img, error);
    }
  }

  async getBestImageSource(img) {
    let src = img.dataset.src || img.src;
    
    // Check for responsive images
    if (img.dataset.srcset) {
      src = this.selectBestSource(img.dataset.srcset);
    }
    
    // Check for WebP support
    if (this.options.enableWebP && this.supportsWebP()) {
      const webpSrc = this.getWebPVersion(src);
      if (webpSrc) {
        try {
          await this.preloadImage(webpSrc);
          return webpSrc;
        } catch (error) {
          // Fallback to original if WebP fails
          console.log('WebP version failed, using original:', error);
        }
      }
    }
    
    return src;
  }

  selectBestSource(srcset) {
    // Parse srcset and select best source based on viewport and DPR
    const sources = srcset.split(',').map(src => {
      const [url, descriptor] = src.trim().split(' ');
      return {
        url: url.trim(),
        descriptor: descriptor ? descriptor.trim() : '1x'
      };
    });
    
    const dpr = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    
    // Simple selection logic - can be enhanced
    let bestSource = sources[0];
    
    for (const source of sources) {
      if (source.descriptor.endsWith('w')) {
        const width = parseInt(source.descriptor);
        if (width >= viewportWidth * dpr && width < (bestSource.descriptor.endsWith('w') ? parseInt(bestSource.descriptor) : Infinity)) {
          bestSource = source;
        }
      } else if (source.descriptor.endsWith('x')) {
        const density = parseFloat(source.descriptor);
        if (density <= dpr && density > parseFloat(bestSource.descriptor)) {
          bestSource = source;
        }
      }
    }
    
    return bestSource.url;
  }

  getWebPVersion(src) {
    // Generate WebP version URL if applicable
    if (src.includes('unsplash.com') || src.includes('pixabay.com')) {
      // These services support WebP via URL parameters
      return src + (src.includes('?') ? '&' : '?') + 'fm=webp';
    }
    
    // For local images, check if WebP version exists
    if (!src.startsWith('http')) {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return webpSrc !== src ? webpSrc : null;
    }
    
    return null;
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
        img.onabort = null;
      };
      
      img.onload = () => {
        cleanup();
        resolve(img);
      };
      
      img.onerror = () => {
        cleanup();
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.onabort = () => {
        cleanup();
        reject(new Error(`Image load aborted: ${src}`));
      };
      
      img.src = src;
    });
  }

  updateImageSource(img, src) {
    // Progressive enhancement: update src and srcset
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      delete img.dataset.srcset;
    }
    
    img.src = src;
    delete img.dataset.src;
    
    // Update sizes attribute if present
    if (img.dataset.sizes) {
      img.sizes = img.dataset.sizes;
      delete img.dataset.sizes;
    }
  }

  handleImageLoadError(img, error) {
    console.error('Image load failed:', error);
    
    this.loadingImages.delete(img);
    
    const retryCount = this.failedImages.get(img) || 0;
    
    if (retryCount < this.options.maxRetries) {
      this.failedImages.set(img, retryCount + 1);
      this.retryQueue.add(img);
      
      // Add error class for styling
      img.classList.add('lazy-error');
      
      console.log(`Retrying image load (${retryCount + 1}/${this.options.maxRetries})`);
    } else {
      // Max retries reached, show fallback
      this.showImageFallback(img);
    }
  }

  showImageFallback(img) {
    // Show a fallback image or placeholder
    img.classList.add('lazy-failed');
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgZmlsbD0iI0Y5RkFGQiIgc3Ryb2tlPSIjRDFEMUQ2IiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiIGZpbGw9IiNEMUQxRDYiLz4KPHBhdGggZD0ibTkgMTIgMS4xNjUtMS45NTVhMSAxIDAgMCAxIDEuNjcgMEwxNSAxNUgzeiIgZmlsbD0iI0QxRDFENiIvPgo8L3N2Zz4K';
    img.alt = img.alt || 'Image failed to load';
  }

  setupRetryMechanism() {
    // Process retry queue periodically
    setInterval(() => {
      if (this.retryQueue.size > 0) {
        const retryImages = Array.from(this.retryQueue);
        this.retryQueue.clear();
        
        retryImages.forEach(img => {
          setTimeout(() => {
            this.loadImage(img);
          }, this.options.retryDelay);
        });
      }
    }, this.options.retryDelay * 2);
  }

  addImageLoadListeners(img) {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      
      // Track performance metrics
      this.trackImagePerformance(img, loadTime, true);
      
      // Remove event listeners
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
    
    const handleError = () => {
      const loadTime = performance.now() - startTime;
      
      // Track performance metrics
      this.trackImagePerformance(img, loadTime, false);
      
      // Remove event listeners
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
    
    img.addEventListener('load', handleLoad, { once: true, passive: true });
    img.addEventListener('error', handleError, { once: true, passive: true });
  }

  trackImagePerformance(img, loadTime, success) {
    // Send performance metrics to analytics
    if (window.gtag) {
      window.gtag('event', 'image_load', {
        load_time: Math.round(loadTime),
        success: success,
        src: img.src,
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0
      });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Image load metrics:', {
        src: img.src,
        loadTime: Math.round(loadTime),
        success,
        dimensions: `${img.naturalWidth}x${img.naturalHeight}`
      });
    }
  }

  bindEvents() {
    // Handle dynamically added images
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'IMG') {
                this.processNewImage(node);
              } else {
                const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                images.forEach(img => this.processNewImage(img));
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
    // Handle viewport changes for responsive images
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleViewportChange();
      }, 250);
    }, { passive: true });
  }

  processNewImage(img) {
    if (img.dataset.src || img.dataset.srcset || this.shouldOptimizeImage(img)) {
      if (this.hasNativeLazyLoading) {
        this.setupNativeLazyLoading(img);
      } else {
        this.setupCustomLazyLoading(img);
      }
    }
  }

  handleViewportChange() {
    // Re-evaluate responsive images on viewport change
    const responsiveImages = document.querySelectorAll('img[srcset]');
    responsiveImages.forEach(img => {
      if (img.dataset.originalSrcset) {
        const newSrc = this.selectBestSource(img.dataset.originalSrcset);
        if (newSrc !== img.src) {
          img.src = newSrc;
        }
      }
    });
  }

  loadAllImages() {
    // Fallback function to load all images immediately
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      this.loadImage(img);
    });
  }

  supportsWebP() {
    // Check for WebP support
    if (!this._webpSupport) {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      this._webpSupport = canvas.toDataURL('image/webp').indexOf('webp') > 0;
    }
    return this._webpSupport;
  }

  isExternalImage(src) {
    return src.startsWith('http') && !src.includes(window.location.hostname);
  }

  // Public API methods
  refresh() {
    // Re-scan for new images
    this.processImages();
  }

  loadAll() {
    // Force load all lazy images
    this.loadAllImages();
  }

  getStats() {
    return {
      loaded: this.loadedImages.size,
      loading: this.loadingImages.size,
      failed: this.failedImages.size,
      retrying: this.retryQueue.size
    };
  }

  destroy() {
    // Clean up
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.loadingImages.clear();
    this.loadedImages.clear();
    this.failedImages.clear();
    this.retryQueue.clear();
  }
}

export default ImageLazyLoader;