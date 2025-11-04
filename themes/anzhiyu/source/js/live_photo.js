/**
 * 实况照片功能
 * 支持苹果设备拍摄的实况照片展示和交互
 * 优化点：修复内存泄漏、提升性能、增强兼容性、完善边界处理
 */

if (typeof window.LivePhoto === 'undefined') {
  class LivePhoto {
    constructor(options = {}) {
      this.containers = [];
      this.observer = null;
      this.refreshDebounce = null;
      this.config = {
        debug: options.debug || false,
        preloadThreshold: options.preloadThreshold || 3,
        defaultAspectRatio: '16/9'
      };
      this.init();
    }

    init() {
      // 初始化实况照片
      const init = () => this.initLivePhotos();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
      setTimeout(init, 500);

      // 初始化DOM变化监听
      this.initMutationObserver();

      // 绑定全局事件
      this.bindGlobalEvents();
    }

    initMutationObserver() {
      if (typeof MutationObserver === 'undefined') return;

      this.observer = new MutationObserver((mutations) => {
        let shouldRefresh = false;
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && (node.classList.contains('live-photo-container') || node.querySelector('.live-photo-container'))) {
                shouldRefresh = true;
              }
            });
          }
        });
        if (shouldRefresh && !this.refreshDebounce) {
          this.refreshDebounce = setTimeout(() => {
            this.refresh();
            this.refreshDebounce = null;
          }, 100);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    bindGlobalEvents() {
      // 支持PJAX
      if (typeof pjax !== 'undefined') {
        document.addEventListener('pjax:complete', () => this.refresh());
      }

      // 页面加载完成
      window.addEventListener('load', () => this.refresh());
    }

    initLivePhotos() {
      document.querySelectorAll('.live-photo-container').forEach(container => {
        if (container.dataset.livePhotoInitialized === 'true') return;

        try {
          this.setupLivePhoto(container);
          container.dataset.livePhotoInitialized = 'true';
        } catch (error) {
          this.logError('初始化失败:', error, container);
        }
      });

      this.optimizePreload();
    }

    setupLivePhoto(container) {
      const video = container.querySelector('.live-photo-video');
      const stillImage = container.querySelector('.live-photo-still');
      const playBtn = container.querySelector('.live-photo-play-btn');
      
      if (!video || !stillImage || !playBtn) {
        this.logWarn('缺少必要元素:', container);
        return;
      }

      // 配置参数
      const data = {
        container,
        video,
        stillImage,
        playBtn,
        indicator: container.querySelector('.live-photo-indicator'),
        progressBar: null,
        duration: parseFloat(container.dataset.duration) || 3,
        playMode: container.dataset.playMode || 'hover',
        showProgress: container.dataset.showProgress !== 'false',
        pressDelay: parseInt(container.dataset.pressDelay) || 300,
        isPlaying: false,
        timers: {},
        events: []
      };

      // 创建进度条
      if (data.showProgress) {
        data.progressBar = document.createElement('div');
        data.progressBar.className = 'live-photo-progress';
        container.appendChild(data.progressBar);
      }

      // 样式配置
      container.style.setProperty('--duration', `${data.duration}s`);
      this.fixAspectRatioSupport(container);

      // 绑定事件
      this.bindEvents(data);

      // 处理封面
      this.handleSmartCover(data);

      // 悬停效果
      this.addHoverEnhancement(data);

      this.containers.push(data);
    }

    bindEvents(data) {
      const { container, video, playMode } = data;
      const bindEvent = (el, type, handler) => {
        el.addEventListener(type, handler);
        data.events.push({ el, type, handler });
      };

      if (playMode === 'hover') {
        // 桌面端悬停
        bindEvent(container, 'mouseenter', () => this.startPlay(data));
        bindEvent(container, 'mouseleave', () => this.stopPlay(data));

        // 移动端触摸
        let touchStartX = 0, touchStartY = 0;
        bindEvent(container, 'touchstart', (e) => {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        });
        bindEvent(container, 'touchend', (e) => {
          const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
          if (dx < 10 && dy < 10) {
            this.startPlay(data);
            data.timers.playTimeout = setTimeout(() => this.stopPlay(data), data.duration * 1000);
          }
        });
        bindEvent(container, 'touchcancel', () => this.stopPlay(data));

      } else if (playMode === 'press') {
        // 长按模式
        bindEvent(container, 'mousedown', () => {
          data.timers.pressTimer = setTimeout(() => this.startPlay(data), data.pressDelay);
        });
        bindEvent(container, 'mouseup', () => this.stopPressPlay(data));
        bindEvent(container, 'mouseleave', () => this.stopPressPlay(data));
        bindEvent(container, 'contextmenu', e => e.preventDefault());

        // 移动端长按
        bindEvent(container, 'touchstart', () => {
          data.timers.pressTimer = setTimeout(() => this.startPlay(data), data.pressDelay);
        });
        bindEvent(container, 'touchend', () => this.stopPressPlay(data));
        bindEvent(container, 'touchcancel', () => this.stopPressPlay(data));
      }

      // 视频事件
      bindEvent(video, 'loadstart', () => container.classList.add('loading'));
      bindEvent(video, 'loadedmetadata', () => this.adjustContainerAspectRatio(data));
      bindEvent(video, 'canplay', () => container.classList.remove('loading'));
      bindEvent(video, 'error', () => {
        container.classList.add('error');
        container.classList.remove('loading');
        this.logError('视频加载失败:', video.src);
      });
      bindEvent(video, 'ended', () => this.stopPlay(data));
    }

    optimizePreload() {
      const visibleContainers = this.containers.filter(data => {
        const rect = data.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });

      visibleContainers.slice(0, this.config.preloadThreshold).forEach(data => this.preloadVideo(data));
    }

    preloadVideo(data) {
      const { video } = data;
      if (!video.src) return;

      video.muted = true;
      video.loop = false;
      video.playsInline = true;
      video.preload = 'metadata';

      const handleUserInteraction = () => {
        video.load();
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };

      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    }

    startPlay(data) {
      if (data.isPlaying) return;

      this.stopAllOthers(data);
      data.isPlaying = true;
      data.container.classList.add('playing', 'live-photo-enhanced');

      this.startEnhancedEffects(data);

      const playPromise = data.video.play();
      if (playPromise) {
        playPromise
          .then(() => {
            this.startProgress(data);
            this.startDynamicScaling(data);
            data.timers.playTimeout = setTimeout(() => this.stopPlay(data), data.duration * 1000);
          })
          .catch(error => {
            this.logError('播放失败:', error);
            data.container.classList.add('error');
            this.stopPlay(data);
          });
      }
    }

    stopPlay(data) {
      if (!data.isPlaying) return;

      data.isPlaying = false;
      data.container.classList.remove('playing', 'live-photo-enhanced');

      this.stopEnhancedEffects(data);
      this.stopDynamicScaling(data);
      this.stopProgress(data);

      data.video.pause();
      data.video.currentTime = 0;

      Object.values(data.timers).forEach(timer => timer && clearTimeout(timer));
      data.timers = {};
    }

    stopAllOthers(currentData) {
      this.containers.forEach(data => {
        if (data !== currentData && data.isPlaying) this.stopPlay(data);
      });
    }

    startProgress(data) {
      if (!data.showProgress || !data.progressBar) return;

      const startTime = Date.now();
      const updateProgress = () => {
        if (!data.isPlaying) return;

        const progress = Math.min(((Date.now() - startTime) / 1000 / data.duration) * 100, 100);
        data.progressBar.style.width = `${progress}%`;
        if (progress < 100) {
          data.timers.progressInterval = requestAnimationFrame(updateProgress);
        }
      };

      data.timers.progressInterval = requestAnimationFrame(updateProgress);
    }

    stopProgress(data) {
      if (data.timers.progressInterval) {
        cancelAnimationFrame(data.timers.progressInterval);
        data.timers.progressInterval = null;
      }
      if (data.progressBar) data.progressBar.style.width = '0%';
    }

    startPressPlay(data) {
      if (data.timers.pressTimer) clearTimeout(data.timers.pressTimer);
      data.timers.pressTimer = setTimeout(() => this.startPlay(data), data.pressDelay);
    }

    stopPressPlay(data) {
      if (data.timers.pressTimer) {
        clearTimeout(data.timers.pressTimer);
        data.timers.pressTimer = null;
      }
      if (data.isPlaying) this.stopPlay(data);
    }

    async handleSmartCover(data) {
      const { container, video, stillImage } = data;

      if (video.poster && video.poster.trim()) {
        stillImage.src = stillImage.src || video.poster;
        return;
      }

      try {
        container.classList.add('extracting-cover');
        this.updateCoverStatus(container, '正在提取封面...');

        await this.waitForVideoMetadata(video, 15000);
        const coverDataUrl = await this.extractFirstFrame(video);

        video.poster = coverDataUrl;
        stillImage.src = stillImage.src || coverDataUrl;
        video.dataset.autoExtractedCover = 'true';
      } catch (error) {
        this.logError('封面提取失败:', error);
        if (stillImage.src) {
          video.poster = stillImage.src;
        } else {
          container.classList.add('no-cover');
        }
      } finally {
        container.classList.remove('extracting-cover');
      }
    }

    waitForVideoMetadata(video, timeout = 10000) {
      return new Promise((resolve, reject) => {
        if (!video.src) return reject(new Error('无视频源'));
        if (video.readyState >= 1) return resolve();

        let retryCount = 0;
        const maxRetries = 2;
        const timer = setTimeout(() => reject(new Error('超时')), timeout);

        const checkReady = () => {
          if (video.readyState >= 1) {
            clearTimeout(timer);
            resolve();
          } else if (retryCount < maxRetries) {
            retryCount++;
            video.currentTime = 0.2 * retryCount;
            setTimeout(checkReady, 1000);
          } else {
            reject(new Error('加载失败'));
          }
        };

        video.addEventListener('loadedmetadata', () => {
          clearTimeout(timer);
          resolve();
        });
        setTimeout(checkReady, 500);
      });
    }

    extractFirstFrame(video) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('不支持Canvas'));

        const tryExtract = (times = [0.1, 0.3, 0.5]) => {
          if (!times.length) return reject(new Error('无法提取有效帧'));

          const time = times.shift();
          const onSeeked = () => {
            try {
              const container = video.closest('.live-photo-container');
              const cw = container.clientWidth || video.videoWidth;
              const ch = container.clientHeight || video.videoHeight;
              const scale = Math.min(cw / video.videoWidth, ch / video.videoHeight, 1);

              canvas.width = Math.floor(video.videoWidth * scale);
              canvas.height = Math.floor(video.videoHeight * scale);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              if (this.checkIfBlackFrame(ctx.getImageData(0, 0, canvas.width, canvas.height))) {
                video.removeEventListener('seeked', onSeeked);
                tryExtract(times);
              } else {
                video.removeEventListener('seeked', onSeeked);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
              }
            } catch (e) {
              video.removeEventListener('seeked', onSeeked);
              tryExtract(times);
            }
          };

          video.addEventListener('seeked', onSeeked);
          video.currentTime = time;
        };

        tryExtract();
      });
    }

    checkIfBlackFrame(imageData) {
      const { data, width, height } = imageData;
      let darkCount = 0;
      const sampleRate = 100; // 每100个像素抽样一个

      for (let i = 0; i < data.length; i += 4 * sampleRate) {
        const brightness = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114) / 255;
        if (brightness < 0.05) darkCount++;
      }

      return darkCount / (width * height / sampleRate) > 0.8;
    }

    updateCoverStatus(container, status) {
      let el = container.querySelector('.cover-status-text');
      if (!el) {
        el = document.createElement('div');
        el.className = 'cover-status-text';
        container.appendChild(el);
      }
      el.textContent = status;
    }

    adjustContainerAspectRatio(data) {
      const { container, video } = data;
      if (!video.videoWidth || !video.videoHeight) return;

      const ratio = video.videoWidth / video.videoHeight;
      const clamped = Math.max(0.5, Math.min(3.0, ratio));

      if (this.supportsAspectRatio()) {
        container.style.aspectRatio = `${clamped}`;
      } else {
        container.style.aspectRatio = 'auto';
        container.style.paddingTop = `${100 / clamped}%`;
      }
    }

    supportsAspectRatio() {
      return CSS.supports('aspect-ratio', '1');
    }

    fixAspectRatioSupport(container) {
      if (!this.supportsAspectRatio()) {
        container.classList.add('aspect-ratio-fallback');
      }
    }

    startEnhancedEffects(data) {
      const { stillImage, video } = data;
      stillImage.classList.remove('blur-animation-reverse');
      video.classList.remove('enhance-animation-reverse');
      stillImage.classList.add('blur-animation');
      video.classList.add('enhance-animation');
    }

    stopEnhancedEffects(data) {
      const { stillImage, video } = data;
      stillImage.classList.remove('blur-animation');
      stillImage.classList.add('blur-animation-reverse');
      video.classList.remove('enhance-animation');
      video.classList.add('enhance-animation-reverse');

      const clear = () => {
        stillImage.classList.remove('blur-animation-reverse');
        video.classList.remove('enhance-animation-reverse');
        stillImage.removeEventListener('transitionend', clear);
        video.removeEventListener('transitionend', clear);
      };
      stillImage.addEventListener('transitionend', clear);
      video.addEventListener('transitionend', clear);
    }

    startDynamicScaling(data) {
      data.container.classList.add('scale-animation');
    }

    stopDynamicScaling(data) {
      data.container.classList.remove('scale-animation');
    }

    addHoverEnhancement(data) {
      const { container, stillImage } = data;

      const enter = () => {
        if (!data.isPlaying) {
          stillImage.classList.add('hover-blur');
          container.classList.add('hover-scale');
        }
      };

      const leave = () => {
        if (!data.isPlaying) {
          stillImage.classList.remove('hover-blur');
          container.classList.remove('hover-scale');
        }
      };

      container.addEventListener('mouseenter', enter);
      container.addEventListener('mouseleave', leave);
      data.events.push(
        { el: container, type: 'mouseenter', handler: enter },
        { el: container, type: 'mouseleave', handler: leave }
      );
    }

    refresh() {
      this.containers.forEach(data => this.cleanupContainer(data));
      this.containers = [];
      document.querySelectorAll('.live-photo-container').forEach(c => {
        c.dataset.livePhotoInitialized = 'false';
      });
      this.initLivePhotos();
    }

    cleanupContainer(data) {
      this.stopPlay(data);
      data.events.forEach(({ el, type, handler }) => {
        el.removeEventListener(type, handler);
      });
      if (data.progressBar?.parentElement) {
        data.progressBar.parentElement.removeChild(data.progressBar);
      }
      const statusEl = data.container.querySelector('.cover-status-text');
      if (statusEl?.parentElement) {
        statusEl.parentElement.removeChild(statusEl);
      }
    }

    destroy() {
      this.containers.forEach(data => this.cleanupContainer(data));
      this.containers = [];
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      window.removeEventListener('load', () => this.refresh());
      if (typeof pjax !== 'undefined') {
        document.removeEventListener('pjax:complete', () => this.refresh());
      }
    }

    logInfo(...args) {
      if (this.config.debug) console.log('[LivePhoto]', ...args);
    }

    logWarn(...args) {
      console.warn('[LivePhoto]', ...args);
    }

    logError(...args) {
      console.error('[LivePhoto]', ...args);
    }
  }

  // 全局初始化
  window.LivePhoto = LivePhoto;
  window.livePhoto = new LivePhoto();
}

/* 配套CSS样式（需添加到样式表中）
.live-photo-container {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.live-photo-still, .live-photo-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.live-photo-video {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.live-photo-container.playing .live-photo-video {
  opacity: 1;
}

.live-photo-container.playing .live-photo-still {
  opacity: 0;
}

.live-photo-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);
  width: 0%;
  transition: width 0.1s linear;
}

.live-photo-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.live-photo-container:hover .live-photo-play-btn {
  opacity: 1;
}

.blur-animation {
  transition: filter 0.6s ease-out;
  filter: blur(8px) brightness(0.95) saturate(0.9);
}

.blur-animation-reverse {
  transition: filter 0.3s ease-in;
  filter: blur(0) brightness(1) saturate(1);
}

.enhance-animation {
  transition: filter 0.3s ease-out;
  filter: brightness(1.05) saturate(1.1) contrast(1.02);
}

.enhance-animation-reverse {
  transition: filter 0.3s ease-in;
  filter: brightness(1) saturate(1) contrast(1);
}

.scale-animation {
  animation: scale 3s ease-in-out;
}

@keyframes scale {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.04) rotate(0.5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.hover-blur {
  transition: filter 0.2s ease;
  filter: blur(1px) brightness(1.1) saturate(1.2);
}

.hover-scale {
  transition: transform 0.2s ease;
  transform: scale(1.02);
}

.aspect-ratio-fallback {
  height: 0;
  overflow: hidden;
}

.aspect-ratio-fallback > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.live-photo-container.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.cover-status-text {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  text-align: center;
  color: white;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
*/