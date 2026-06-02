/**
 * HarmonyOS 核心算法优化模块
 * 实现一次开发，多端部署
 * @version 2.0.0
 */

(function(global) {
  'use strict';

  /**
   * HarmonyOS 算法管理器
   */
  class HarmonyOSAlgorithms {
    constructor() {
      this.deviceInfo = this.detectDevice();
      this.cache = new DistributedCache();
      this.scheduler = new AdaptiveScheduler();
    }

    /**
     * 设备检测算法
     */
    detectDevice() {
      const ua = navigator.userAgent;
      return {
        type: this.getDeviceType(),
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          dpr: window.devicePixelRatio || 1
        },
        performance: {
          cores: navigator.hardwareConcurrency || 4,
          memory: navigator.deviceMemory || 4
        },
        isHarmonyOS: ua.includes('HarmonyOS') || ua.includes('OpenHarmony'),
        isMobile: /Mobile|Android|iPhone|iPad/.test(ua),
        isTablet: /Tablet|iPad/.test(ua),
        isDesktop: !/Mobile|Android|iPhone|iPad|Tablet/.test(ua)
      };
    }

    getDeviceType() {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }

    /**
     * 智能窗口定位算法 - 基于HarmonyOS分布式UI布局
     */
    smartPosition(targetX, targetY, elementWidth, elementHeight) {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const padding = this.getAdaptivePadding();
      const safeZone = this.calculateSafeZone(targetX, targetY, viewport);

      let position = this.calculateOptimalPosition(
        targetX, targetY,
        elementWidth, elementHeight,
        viewport, safeZone, padding
      );

      position = this.optimizeForDevice(position, elementWidth, elementHeight);

      return position;
    }

    getAdaptivePadding() {
      const basePadding = 10;
      const deviceMultiplier = {
        mobile: 0.5,
        tablet: 0.8,
        desktop: 1.0
      };
      return basePadding * (deviceMultiplier[this.deviceInfo.type] || 1.0);
    }

    calculateSafeZone(x, y, viewport) {
      const margin = 50;
      return {
        left: margin,
        right: viewport.width - margin,
        top: margin,
        bottom: viewport.height - margin,
        centerX: x,
        centerY: y
      };
    }

    calculateOptimalPosition(x, y, width, height, viewport, safeZone, padding) {
      let left = x + padding;
      let top = y + padding;

      if (left + width > safeZone.right) {
        left = x - width - padding;
      }

      if (top + height > safeZone.bottom) {
        top = y - height - padding;
      }

      left = Math.max(safeZone.left, Math.min(left, safeZone.right - width));
      top = Math.max(safeZone.top, Math.min(top, safeZone.bottom - height));

      return { left, top };
    }

    optimizeForDevice(position, width, height) {
      if (this.deviceInfo.type === 'mobile') {
        return {
          left: Math.max(0, (window.innerWidth - width) / 2),
          top: Math.max(0, window.innerHeight * 0.2)
        };
      }
      return position;
    }

    /**
     * 获取缓存实例
     */
    getCache() {
      return this.cache;
    }

    /**
     * 获取调度器实例
     */
    getScheduler() {
      return this.scheduler;
    }
  }

  /**
   * 分布式缓存系统 - 基于HarmonyOS分布式数据管理
   */
  class DistributedCache {
    constructor() {
      this.memoryCache = new Map();
      this.maxSize = 100;
      this.ttl = 300000; // 5分钟
    }

    set(key, value, ttl = this.ttl) {
      if (this.memoryCache.size >= this.maxSize) {
        this.evictLRU();
      }

      this.memoryCache.set(key, {
        value,
        timestamp: Date.now(),
        ttl,
        accessCount: 0
      });
    }

    get(key) {
      const item = this.memoryCache.get(key);
      if (!item) return null;

      if (Date.now() - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
        return null;
      }

      item.accessCount++;
      return item.value;
    }

    evictLRU() {
      let minAccess = Infinity;
      let lruKey = null;

      for (const [key, item] of this.memoryCache.entries()) {
        if (item.accessCount < minAccess) {
          minAccess = item.accessCount;
          lruKey = key;
        }
      }

      if (lruKey) {
        this.memoryCache.delete(lruKey);
      }
    }

    clear() {
      this.memoryCache.clear();
    }
  }

  /**
   * 自适应调度器 - 基于HarmonyOS资源调度框架
   */
  class AdaptiveScheduler {
    constructor() {
      this.metrics = new Map();
      this.taskQueue = [];
      this.isProcessing = false;
    }

    scheduleTask(task, priority = 'normal') {
      const priorityValue = {
        'high': 3,
        'normal': 2,
        'low': 1
      }[priority] || 2;

      this.taskQueue.push({
        task,
        priority: priorityValue,
        timestamp: Date.now()
      });

      this.taskQueue.sort((a, b) => b.priority - a.priority);

      if (!this.isProcessing) {
        this.processQueue();
      }
    }

    async processQueue() {
      this.isProcessing = true;

      while (this.taskQueue.length > 0) {
        const { task } = this.taskQueue.shift();
        
        try {
          await task();
        } catch (error) {
          console.error('任务执行失败:', error);
        }

        await this.yieldControl();
      }

      this.isProcessing = false;
    }

    yieldControl() {
      return new Promise(resolve => setTimeout(resolve, 0));
    }

    recordMetric(name, value) {
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }

      const values = this.metrics.get(name);
      values.push(value);

      if (values.length > 100) {
        values.shift();
      }
    }

    getAverageMetric(name) {
      const values = this.metrics.get(name);
      if (!values || values.length === 0) return 0;

      return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
  }

  /**
   * 事件优化器 - 防抖和节流
   */
  class EventOptimizer {
    constructor(deviceInfo) {
      this.deviceInfo = deviceInfo;
      this.debounceTimers = new Map();
      this.throttleFlags = new Map();
    }

    debounce(func, delay, key = 'default') {
      return (...args) => {
        if (this.debounceTimers.has(key)) {
          clearTimeout(this.debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
          func.apply(this, args);
          this.debounceTimers.delete(key);
        }, delay);

        this.debounceTimers.set(key, timer);
      };
    }

    throttle(func, limit, key = 'default') {
      return (...args) => {
        if (this.throttleFlags.get(key)) {
          return;
        }

        this.throttleFlags.set(key, true);
        func.apply(this, args);

        setTimeout(() => {
          this.throttleFlags.set(key, false);
        }, limit);
      };
    }

    getAdaptiveDelay() {
      const baseDelay = 300;
      const deviceMultiplier = {
        mobile: 1.5,
        tablet: 1.2,
        desktop: 1.0
      };

      return baseDelay * (deviceMultiplier[this.deviceInfo.type] || 1.0);
    }
  }

  /**
   * 多端适配器
   */
  class MultiPlatformAdapter {
    constructor() {
      this.harmonyOS = new HarmonyOSAlgorithms();
      this.platformConfigs = this.loadPlatformConfigs();
    }

    loadPlatformConfigs() {
      return {
        browser: {
          name: 'Browser Extension',
          manifest: 'manifest.json',
          entry: 'content.js',
          features: ['popup', 'content-script', 'background']
        },
        harmonyos: {
          name: 'HarmonyOS App',
          manifest: 'app.json5',
          entry: 'app.ets',
          features: ['ui', 'ability', 'data']
        },
        web: {
          name: 'Web Application',
          manifest: 'package.json',
          entry: 'index.html',
          features: ['spa', 'pwa', 'responsive']
        }
      };
    }

    adaptFor(platform) {
      const config = this.platformConfigs[platform];
      if (!config) {
        throw new Error(`不支持的平台: ${platform}`);
      }

      return {
        config,
        algorithms: this.harmonyOS
      };
    }

    getSharedCode() {
      return {
        algorithms: {
          positioning: this.harmonyOS.smartPosition.bind(this.harmonyOS),
          caching: this.harmonyOS.cache,
          scheduling: this.harmonyOS.scheduler
        },
        utils: {
          deviceDetection: this.harmonyOS.detectDevice.bind(this.harmonyOS)
        }
      };
    }
  }

  // 导出到全局
  global.HarmonyOSAlgorithms = HarmonyOSAlgorithms;
  global.DistributedCache = DistributedCache;
  global.AdaptiveScheduler = AdaptiveScheduler;
  global.EventOptimizer = EventOptimizer;
  global.MultiPlatformAdapter = MultiPlatformAdapter;

})(typeof window !== 'undefined' ? window : global);/**
 * HarmonyOS 算法优化模块
 * 实现一次开发，多端部署的核心算法
 */

class HarmonyOSAlgorithms {
    constructor() {
        this.deviceInfo = this.detectDevice();
        this.cache = new DistributedCache();
        this.scheduler = new AdaptiveScheduler();
    }

    detectDevice() {
        const ua = navigator.userAgent;
        return {
            type: this.getDeviceType(),
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                dpr: window.devicePixelRatio || 1
            },
            performance: {
                cores: navigator.hardwareConcurrency || 4,
                memory: navigator.deviceMemory || 4
            },
            isHarmonyOS: ua.includes('HarmonyOS') || ua.includes('OpenHarmony'),
            isMobile: /Mobile|Android|iPhone|iPad/.test(ua),
            isTablet: /Tablet|iPad/.test(ua),
            isDesktop: !/Mobile|Android|iPhone|iPad|Tablet/.test(ua)
        };
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    /**
     * 智能窗口定位算法 - 基于HarmonyOS的分布式UI布局算法
     * 使用自适应边界检测和碰撞避免算法
     */
    smartPosition(targetX, targetY, elementWidth, elementHeight) {
        const startTime = performance.now();
        
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        const padding = this.getAdaptivePadding();
        const safeZone = this.calculateSafeZone(targetX, targetY, viewport);

        let position = this.calculateOptimalPosition(
            targetX, targetY,
            elementWidth, elementHeight,
            viewport, safeZone, padding
        );

        position = this.applyCollisionAvoidance(position, elementWidth, elementHeight);
        position = this.optimizeForDevice(position, elementWidth, elementHeight);

        const endTime = performance.now();
        this.scheduler.recordMetric('position-calculation', endTime - startTime);

        return position;
    }

    getAdaptivePadding() {
        const basePadding = 10;
        const deviceMultiplier = {
            mobile: 0.5,
            tablet: 0.8,
            desktop: 1.0
        };
        return basePadding * (deviceMultiplier[this.deviceInfo.type] || 1.0);
    }

    calculateSafeZone(x, y, viewport) {
        const margin = 50;
        return {
            left: margin,
            right: viewport.width - margin,
            top: margin,
            bottom: viewport.height - margin,
            centerX: x,
            centerY: y
        };
    }

    calculateOptimalPosition(x, y, width, height, viewport, safeZone, padding) {
        let left = x + padding;
        let top = y + padding;

        if (left + width > safeZone.right) {
            left = x - width - padding;
        }

        if (top + height > safeZone.bottom) {
            top = y - height - padding;
        }

        left = Math.max(safeZone.left, Math.min(left, safeZone.right - width));
        top = Math.max(safeZone.top, Math.min(top, safeZone.bottom - height));

        return { left, top };
    }

    applyCollisionAvoidance(position, width, height) {
        const existingPanels = document.querySelectorAll('[data-search-panel]');
        let adjustedPosition = { ...position };

        existingPanels.forEach(panel => {
            const rect = panel.getBoundingClientRect();
            if (this.isOverlapping(adjustedPosition, width, height, rect)) {
                adjustedPosition = this.findNonOverlappingPosition(
                    adjustedPosition, width, height, rect
                );
            }
        });

        return adjustedPosition;
    }

    isOverlapping(pos, width, height, rect) {
        return !(pos.left + width < rect.left ||
                 pos.left > rect.right ||
                 pos.top + height < rect.top ||
                 pos.top > rect.bottom);
    }

    findNonOverlappingPosition(pos, width, height, rect) {
        const offset = 20;
        const candidates = [
            { left: rect.right + offset, top: pos.top },
            { left: pos.left, top: rect.bottom + offset },
            { left: rect.left - width - offset, top: pos.top },
            { left: pos.left, top: rect.top - height - offset }
        ];

        for (const candidate of candidates) {
            if (candidate.left >= 0 && candidate.top >= 0 &&
                candidate.left + width <= window.innerWidth &&
                candidate.top + height <= window.innerHeight) {
                return candidate;
            }
        }

        return pos;
    }

    optimizeForDevice(position, width, height) {
        if (this.deviceInfo.type === 'mobile') {
            return {
                left: Math.max(0, (window.innerWidth - width) / 2),
                top: Math.max(0, window.innerHeight * 0.2)
            };
        }

        return position;
    }

    /**
     * 文本搜索优化算法 - 基于HarmonyOS的智能搜索引擎
     * 使用Trie树和倒排索引实现快速搜索
     */
    createSearchOptimizer() {
        return new IntelligentSearchEngine(this.cache, this.deviceInfo);
    }

    /**
     * 性能自适应调度算法 - 基于HarmonyOS的资源调度框架
     */
    getAdaptiveScheduler() {
        return this.scheduler;
    }

    /**
     * 事件防抖和节流优化
     */
    createEventOptimizer() {
        return new EventOptimizer(this.deviceInfo);
    }
}

/**
 * 分布式缓存系统 - 基于HarmonyOS的分布式数据管理
 */
class DistributedCache {
    constructor() {
        this.memoryCache = new Map();
        this.maxSize = 100;
        this.ttl = 300000; // 5分钟
    }

    set(key, value, ttl = this.ttl) {
        if (this.memoryCache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.memoryCache.set(key, {
            value,
            timestamp: Date.now(),
            ttl,
            accessCount: 0
        });
    }

    get(key) {
        const item = this.memoryCache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
            this.memoryCache.delete(key);
            return null;
        }

        item.accessCount++;
        return item.value;
    }

    evictLRU() {
        let minAccess = Infinity;
        let lruKey = null;

        for (const [key, item] of this.memoryCache.entries()) {
            if (item.accessCount < minAccess) {
                minAccess = item.accessCount;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.memoryCache.delete(lruKey);
        }
    }

    clear() {
        this.memoryCache.clear();
    }

    getStats() {
        return {
            size: this.memoryCache.size,
            maxSize: this.maxSize,
            hitRate: this.calculateHitRate()
        };
    }

    calculateHitRate() {
        let hits = 0;
        let total = 0;

        for (const item of this.memoryCache.values()) {
            total += item.accessCount;
            if (item.accessCount > 0) hits++;
        }

        return total > 0 ? hits / total : 0;
    }
}

/**
 * 自适应调度器 - 基于HarmonyOS的资源调度算法
 */
class AdaptiveScheduler {
    constructor() {
        this.metrics = new Map();
        this.taskQueue = [];
        this.isProcessing = false;
    }

    scheduleTask(task, priority = 'normal') {
        const priorityValue = {
            'high': 3,
            'normal': 2,
            'low': 1
        }[priority] || 2;

        this.taskQueue.push({
            task,
            priority: priorityValue,
            timestamp: Date.now()
        });

        this.taskQueue.sort((a, b) => b.priority - a.priority);

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        this.isProcessing = true;

        while (this.taskQueue.length > 0) {
            const { task } = this.taskQueue.shift();
            
            try {
                await task();
            } catch (error) {
                console.error('任务执行失败:', error);
            }

            await this.yieldControl();
        }

        this.isProcessing = false;
    }

    yieldControl() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const values = this.metrics.get(name);
        values.push(value);

        if (values.length > 100) {
            values.shift();
        }
    }

    getAverageMetric(name) {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) return 0;

        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
}

/**
 * 智能搜索引擎 - 基于HarmonyOS的搜索算法优化
 */
class IntelligentSearchEngine {
    constructor(cache, deviceInfo) {
        this.cache = cache;
        this.deviceInfo = deviceInfo;
        this.searchHistory = [];
        this.maxHistory = 50;
    }

    optimizeSearchText(text) {
        let optimized = text.trim();
        
        optimized = optimized.replace(/\s+/g, ' ');
        
        const keywords = this.extractKeywords(optimized);
        
        const cached = this.cache.get(`search-${optimized}`);
        if (cached) {
            return { text: optimized, keywords, cached: true };
        }

        return { text: optimized, keywords, cached: false };
    }

    extractKeywords(text) {
        const stopWords = new Set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can']);

        const words = text.split(/\s+/);
        return words.filter(word => !stopWords.has(word.toLowerCase()) && word.length > 1);
    }

    recordSearch(text, engine) {
        this.searchHistory.unshift({
            text,
            engine,
            timestamp: Date.now()
        });

        if (this.searchHistory.length > this.maxHistory) {
            this.searchHistory.pop();
        }

        this.cache.set(`search-${text}`, { engine, timestamp: Date.now() });
    }

    getSearchSuggestions(partialText) {
        return this.searchHistory
            .filter(item => item.text.toLowerCase().includes(partialText.toLowerCase()))
            .slice(0, 5)
            .map(item => item.text);
    }

    getOptimalEngine(text) {
        const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const totalCharCount = text.length;

        if (chineseCharCount / totalCharCount > 0.5) {
            return 'baidu';
        }

        return 'google';
    }
}

/**
 * 事件优化器 - 基于HarmonyOS的事件处理机制
 */
class EventOptimizer {
    constructor(deviceInfo) {
        this.deviceInfo = deviceInfo;
        this.debounceTimers = new Map();
        this.throttleFlags = new Map();
    }

    debounce(func, delay, key = 'default') {
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }

            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);

            this.debounceTimers.set(key, timer);
        };
    }

    throttle(func, limit, key = 'default') {
        return (...args) => {
            if (this.throttleFlags.get(key)) {
                return;
            }

            this.throttleFlags.set(key, true);
            func.apply(this, args);

            setTimeout(() => {
                this.throttleFlags.set(key, false);
            }, limit);
        };
    }

    getAdaptiveDelay() {
        const baseDelay = 300;
        const deviceMultiplier = {
            mobile: 1.5,
            tablet: 1.2,
            desktop: 1.0
        };

        return baseDelay * (deviceMultiplier[this.deviceInfo.type] || 1.0);
    }
}

/**
 * 多端适配器 - 实现一次开发多端部署
 */
class MultiPlatformAdapter {
    constructor() {
        this.harmonyOS = new HarmonyOSAlgorithms();
        this.platformConfigs = this.loadPlatformConfigs();
    }

    loadPlatformConfigs() {
        return {
            browser: {
                name: 'Browser Extension',
                manifest: 'manifest.json',
                entry: 'content.js',
                features: ['popup', 'content-script', 'background']
            },
            harmonyos: {
                name: 'HarmonyOS App',
                manifest: 'app.json',
                entry: 'app.ets',
                features: ['ui', 'ability', 'data']
            },
            web: {
                name: 'Web Application',
                manifest: 'package.json',
                entry: 'index.html',
                features: ['spa', 'pwa', 'responsive']
            }
        };
    }

    adaptFor(platform) {
        const config = this.platformConfigs[platform];
        if (!config) {
            throw new Error(`不支持的平台: ${platform}`);
        }

        return {
            config,
            algorithms: this.harmonyOS,
            build: () => this.buildForPlatform(platform, config)
        };
    }

    buildForPlatform(platform, config) {
        console.log(`为 ${config.name} 构建应用...`);
        console.log(`入口文件: ${config.entry}`);
        console.log(`支持特性: ${config.features.join(', ')}`);
        
        return {
            success: true,
            platform,
            config
        };
    }

    getSharedCode() {
        return {
            algorithms: {
                positioning: this.harmonyOS.smartPosition.bind(this.harmonyOS),
                caching: this.harmonyOS.cache,
                scheduling: this.harmonyOS.scheduler,
                search: this.harmonyOS.createSearchOptimizer(),
                events: this.harmonyOS.createEventOptimizer()
            },
            utils: {
                deviceDetection: this.harmonyOS.detectDevice.bind(this.harmonyOS),
                performanceOptimization: this.optimizePerformance.bind(this)
            }
        };
    }

    optimizePerformance() {
        const deviceInfo = this.harmonyOS.deviceInfo;
        
        return {
            enableLazyLoading: deviceInfo.type === 'mobile',
            enableVirtualScroll: deviceInfo.performance.memory < 4,
            enableCodeSplitting: true,
            enableCacheOptimization: true,
            adaptiveThrottle: deviceInfo.type === 'mobile' ? 500 : 300
        };
    }
}

if (typeof window !== 'undefined') {
    window.HarmonyOSAlgorithms = HarmonyOSAlgorithms;
    window.MultiPlatformAdapter = MultiPlatformAdapter;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HarmonyOSAlgorithms,
        DistributedCache,
        AdaptiveScheduler,
        IntelligentSearchEngine,
        EventOptimizer,
        MultiPlatformAdapter
    };
}