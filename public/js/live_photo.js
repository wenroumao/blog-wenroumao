/**
 * 实况照片功能
 * 支持苹果设备拍摄的实况照片展示和交互
 */

class LivePhoto {
  constructor() {
    this.containers = [];
    this.init();
  }

  init() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initLivePhotos());
    } else {
      // 如果DOM已经加载完成，立即初始化
      this.initLivePhotos();
    }
    
    // 添加延迟初始化，确保异步加载的内容也能被处理
    setTimeout(() => {
      this.initLivePhotos();
    }, 500);
  }

  initLivePhotos() {
    const livePhotoContainers = document.querySelectorAll('.live-photo-container');
    
    livePhotoContainers.forEach((container, index) => {
      // 检查是否已经初始化过
      if (container.dataset.livePhotoInitialized === 'true') {
        return;
      }
      
      try {
        this.setupLivePhoto(container, index);
        // 标记为已初始化
        container.dataset.livePhotoInitialized = 'true';
      } catch (error) {
        console.error('实况照片初始化失败:', error, container);
      }
    });
  }

  setupLivePhoto(container, index) {
    const video = container.querySelector('.live-photo-video');
    const stillImage = container.querySelector('.live-photo-still');
    const playBtn = container.querySelector('.live-photo-play-btn');
    const indicator = container.querySelector('.live-photo-indicator');
    const duration = parseFloat(container.dataset.duration) || 3;
    const playMode = container.dataset.playMode || 'hover';
    const showProgress = container.dataset.showProgress !== 'false';
    const pressDelay = parseInt(container.dataset.pressDelay) || 300;
    
    // 调试信息
    console.log('实况照片配置:', {
      playMode: playMode,
      showProgress: showProgress,
      pressDelay: pressDelay,
      duration: duration
    });
    
    if (!video || !stillImage || !playBtn) {
      console.warn('Live photo elements not found in container:', container);
      return;
    }

    // 检查是否需要自动提取封面
    this.handleSmartCover(container, video, stillImage);

    // 根据配置创建进度条
    let progressBar = null;
    if (showProgress) {
      progressBar = document.createElement('div');
      progressBar.className = 'live-photo-progress';
      container.appendChild(progressBar);
    }

    // 存储容器信息
    const livePhotoData = {
      container,
      video,
      stillImage,
      playBtn,
      indicator,
      progressBar,
      duration,
      playMode,
      showProgress,
      pressDelay,
      isPlaying: false,
      playTimeout: null,
      progressInterval: null,
      pressTimer: null,
      blurInterval: null,
      scaleInterval: null
    };

    this.containers.push(livePhotoData);

    // 设置CSS变量用于动画
    container.style.setProperty('--duration', `${duration}s`);

    // 绑定事件
    this.bindEvents(livePhotoData);
    
    // 添加悬停增强效果
    this.addHoverEnhancement(livePhotoData);

    // 预加载视频
    this.preloadVideo(livePhotoData);
  }

  bindEvents(data) {
    const { container, video, playMode } = data;

    if (playMode === 'hover') {
      // 悬停播放模式
      container.addEventListener('mouseenter', () => {
        this.startPlay(data);
      });

      container.addEventListener('mouseleave', () => {
        this.stopPlay(data);
      });
    } else if (playMode === 'press') {
      // 长按播放模式
      container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.startPressPlay(data);
      });

      container.addEventListener('mouseup', () => {
        this.stopPressPlay(data);
      });

      container.addEventListener('mouseleave', () => {
        this.stopPressPlay(data);
      });

      // 防止右键菜单干扰
      container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }

    // 视频事件
    video.addEventListener('loadstart', () => {
      container.classList.add('loading');
    });

    video.addEventListener('loadedmetadata', () => {
      // 根据视频实际尺寸设置容器比例
      this.adjustContainerAspectRatio(container, video);
    });

    video.addEventListener('canplay', () => {
      container.classList.remove('loading');
    });

    video.addEventListener('error', () => {
      container.classList.add('error');
      container.classList.remove('loading');
      console.error('Live photo video failed to load:', video.src);
    });

    video.addEventListener('ended', () => {
      this.stopPlay(data);
    });

    // 移动端触摸事件
    if (playMode === 'hover') {
      // 悬停模式在移动端模拟为触摸播放
      container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.startPlay(data);
      });

      container.addEventListener('touchend', () => {
        this.stopPlay(data);
      });

      container.addEventListener('touchcancel', () => {
        this.stopPlay(data);
      });
    } else if (playMode === 'press') {
      // 长按模式在移动端使用长按触摸
      container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.startPressPlay(data);
      });

      container.addEventListener('touchend', () => {
        this.stopPressPlay(data);
      });

      container.addEventListener('touchcancel', () => {
        this.stopPressPlay(data);
      });
    }
  }

  preloadVideo(data) {
    const { video } = data;
    
    // 设置视频属性
    video.muted = true;
    video.loop = false;
    video.playsInline = true;
    
    // 预加载元数据
    video.preload = 'metadata';
  }

  togglePlay(data) {
    if (data.isPlaying) {
      this.stopPlay(data);
    } else {
      this.startPlay(data);
    }
  }

  startPlay(data) {
    if (data.isPlaying) return;

    const { container, video, stillImage, duration } = data;
    
    // 停止其他正在播放的实况照片
    this.stopAllOthers(data);

    data.isPlaying = true;
    container.classList.add('playing');
    
    // 添加增强视觉效果类
    container.classList.add('live-photo-enhanced');
    
    // 启动渐进式模糊效果
    this.startEnhancedEffects(data);

    // 播放视频
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // 播放成功
          this.startProgress(data);
          
          // 启动动态缩放效果
          this.startDynamicScaling(data);
          
          // 设置自动停止
          data.playTimeout = setTimeout(() => {
            this.stopPlay(data);
          }, duration * 1000);
        })
        .catch((error) => {
          console.error('Live photo play failed:', error);
          container.classList.add('error');
          this.stopPlay(data);
        });
    }
  }

  stopPlay(data) {
    if (!data.isPlaying) return;

    const { container, video } = data;
    
    data.isPlaying = false;
    container.classList.remove('playing');
    container.classList.remove('live-photo-enhanced');
    
    // 停止增强效果
    this.stopEnhancedEffects(data);
    this.stopDynamicScaling(data);
    
    // 停止视频
    video.pause();
    video.currentTime = 0;
    
    // 清除定时器
    if (data.playTimeout) {
      clearTimeout(data.playTimeout);
      data.playTimeout = null;
    }
    
    // 停止进度条
    this.stopProgress(data);
  }

  stopAllOthers(currentData) {
    this.containers.forEach(data => {
      if (data !== currentData && data.isPlaying) {
        this.stopPlay(data);
      }
    });
  }

  startProgress(data) {
    const { progressBar, duration, showProgress } = data;
    
    if (!showProgress || !progressBar) {
      return;
    }
    
    let startTime = Date.now();
    
    const updateProgress = () => {
      if (!data.isPlaying) return;
      
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      progressBar.style.width = `${progress}%`;
      
      if (progress < 100) {
        data.progressInterval = requestAnimationFrame(updateProgress);
      }
    };
    
    data.progressInterval = requestAnimationFrame(updateProgress);
  }

  stopProgress(data) {
    const { progressBar, showProgress } = data;
    
    if (data.progressInterval) {
      cancelAnimationFrame(data.progressInterval);
      data.progressInterval = null;
    }
    
    if (showProgress && progressBar) {
      progressBar.style.width = '0%';
    }
  }

  /**
   * 开始长按播放
   * @param {Object} data - 实况照片数据
   */
  startPressPlay(data) {
    const { pressDelay } = data;
    
    // 清除之前的定时器
    if (data.pressTimer) {
      clearTimeout(data.pressTimer);
    }
    
    // 设置长按延迟
    data.pressTimer = setTimeout(() => {
      this.startPlay(data);
      data.pressTimer = null;
    }, pressDelay);
  }

  /**
   * 停止长按播放
   * @param {Object} data - 实况照片数据
   */
  stopPressPlay(data) {
    // 清除长按定时器
    if (data.pressTimer) {
      clearTimeout(data.pressTimer);
      data.pressTimer = null;
    }
    
    // 如果正在播放，则停止
    if (data.isPlaying) {
      this.stopPlay(data);
    }
  }

  /**
   * 处理智能封面提取（使用视频第一帧）
   * @param {HTMLElement} container - 实况照片容器
   * @param {HTMLVideoElement} video - 视频元素
   * @param {HTMLImageElement} stillImage - 静态图片元素
   */
  async handleSmartCover(container, video, stillImage) {
    // 检查是否已有自定义封面
    const hasCustomPoster = video.poster && video.poster.trim() !== '';
    if (hasCustomPoster) {
      console.log('使用自定义封面，跳过自动提取');
      return;
    }

    try {
      // 显示加载状态
      container.classList.add('extracting-cover');
      this.updateCoverStatus(container, '正在提取封面...');
      
      // 等待视频元数据加载
      await this.waitForVideoMetadata(video);
      
      // 提取第一帧作为封面
      const coverDataUrl = await this.extractFirstFrame(video);
      
      // 应用提取的封面
      this.applyCover(video, stillImage, coverDataUrl);
      
      console.log('第一帧封面提取成功');
    } catch (error) {
      console.error('封面提取失败:', error);
      // 使用静态图片作为后备
      this.useStaticImageAsFallback(video, stillImage);
    } finally {
      container.classList.remove('extracting-cover');
    }
  }

  /**
   * 等待视频元数据加载
   * @param {HTMLVideoElement} video - 视频元素
   * @returns {Promise}
   */
  waitForVideoMetadata(video) {
    return new Promise((resolve, reject) => {
      if (video.readyState >= 1) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onError);
        reject(new Error('视频元数据加载超时'));
      }, 10000);

      const onLoaded = () => {
        clearTimeout(timeout);
        video.removeEventListener('error', onError);
        resolve();
      };

      const onError = (e) => {
        clearTimeout(timeout);
        video.removeEventListener('loadedmetadata', onLoaded);
        reject(new Error(`视频加载失败: ${e.message}`));
      };

      video.addEventListener('loadedmetadata', onLoaded);
      video.addEventListener('error', onError);
      
      // 触发加载
      if (!video.src) {
        reject(new Error('视频源未设置'));
      }
    });
  }

  /**
   * 提取视频第一帧作为封面
   * @param {HTMLVideoElement} video - 视频元素
   * @returns {Promise<string>} base64格式的封面图片
   */
  async extractFirstFrame(video) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      const onSeeked = () => {
        try {
          // 设置canvas尺寸
          const maxWidth = 800;
          const maxHeight = 600;
          const scale = Math.min(maxWidth / video.videoWidth, maxHeight / video.videoHeight, 1);
          
          canvas.width = Math.floor(video.videoWidth * scale);
          canvas.height = Math.floor(video.videoHeight * scale);
          
          // 绘制视频帧
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // 转换为base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          video.removeEventListener('seeked', onSeeked);
          resolve(dataUrl);
        } catch (error) {
          video.removeEventListener('seeked', onSeeked);
          reject(error);
        }
      };
      
      video.addEventListener('seeked', onSeeked);
      video.currentTime = 0.1; // 跳转到0.1秒，避免黑屏
    });
  }

  /**
   * 应用提取的封面
   * @param {HTMLVideoElement} video - 视频元素
   * @param {HTMLImageElement} stillImage - 静态图片元素
   * @param {string} coverDataUrl - 封面数据URL
   */
  applyCover(video, stillImage, coverDataUrl) {
    // 设置视频poster
    video.poster = coverDataUrl;
    
    // 更新静态图片
    stillImage.src = coverDataUrl;
    
    // 添加标记表示使用了自动提取的封面
    video.dataset.autoExtractedCover = 'true';
  }

  /**
   * 使用静态图片作为后备方案
   * @param {HTMLVideoElement} video - 视频元素
   * @param {HTMLImageElement} stillImage - 静态图片元素
   */
  useStaticImageAsFallback(video, stillImage) {
    if (stillImage.src && stillImage.src.trim() !== '') {
      video.poster = stillImage.src;
      console.log('使用静态图片作为封面');
    }
  }

  /**
   * 更新封面提取状态
   * @param {HTMLElement} container - 容器元素
   * @param {string} status - 状态文本
   */
  updateCoverStatus(container, status) {
    const statusElement = container.querySelector('.cover-status-text');
    if (statusElement) {
      statusElement.textContent = status;
    }
  }

  /**
   * 根据视频尺寸调整容器宽高比
   * @param {HTMLElement} container - 容器元素
   * @param {HTMLVideoElement} video - 视频元素
   */
  adjustContainerAspectRatio(container, video) {
    if (video.videoWidth && video.videoHeight) {
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      // 限制宽高比范围，避免过于极端的比例
      const minRatio = 0.5; // 最小比例 (1:2)
      const maxRatio = 3.0;  // 最大比例 (3:1)
      
      const clampedRatio = Math.max(minRatio, Math.min(maxRatio, aspectRatio));
      
      // 设置CSS自定义属性
      container.style.aspectRatio = `${clampedRatio}`;
      
      console.log(`视频尺寸: ${video.videoWidth}x${video.videoHeight}, 设置比例: ${clampedRatio}`);
    }
  }

  // 公共方法：手动初始化新添加的实况照片
  refresh() {
    // 清理现有的容器数据
    this.containers = [];
    
    // 重置所有容器的初始化状态
    const livePhotoContainers = document.querySelectorAll('.live-photo-container');
    livePhotoContainers.forEach(container => {
      container.dataset.livePhotoInitialized = 'false';
    });
    
    // 重新初始化
    this.initLivePhotos();
  }

  // 公共方法：销毁所有实况照片
  destroy() {
    this.containers.forEach(data => {
      this.stopPlay(data);
    });
    this.containers = [];
  }

  /**
   * 启动增强视觉效果
   * @param {Object} data - 实况照片数据对象
   */
  startEnhancedEffects(data) {
    const { container, stillImage, video } = data;
    
    // 渐进式模糊处理
    let blurStep = 0;
    const maxBlur = 8;
    const blurSteps = 20;
    const blurIncrement = maxBlur / blurSteps;
    
    data.blurInterval = setInterval(() => {
      if (blurStep < blurSteps) {
        const currentBlur = blurStep * blurIncrement;
        const brightness = 1 - (blurStep * 0.005); // 轻微降低亮度
        const saturate = 1 - (blurStep * 0.01); // 轻微降低饱和度
        
        stillImage.style.filter = `blur(${currentBlur}px) brightness(${brightness}) saturate(${saturate})`;
        blurStep++;
      } else {
        clearInterval(data.blurInterval);
        data.blurInterval = null;
      }
    }, 30); // 每30ms更新一次，创建平滑过渡
    
    // 视频清晰化效果
    setTimeout(() => {
      if (data.isPlaying) {
        video.style.filter = 'blur(0px) brightness(1.05) saturate(1.1) contrast(1.02)';
      }
    }, 200);
  }

  /**
   * 停止增强视觉效果
   * @param {Object} data - 实况照片数据对象
   */
  stopEnhancedEffects(data) {
    const { stillImage, video } = data;
    
    // 清除模糊间隔
    if (data.blurInterval) {
      clearInterval(data.blurInterval);
      data.blurInterval = null;
    }
    
    // 重置滤镜效果
    stillImage.style.filter = 'blur(0px) brightness(1) saturate(1) contrast(1)';
    video.style.filter = 'blur(0px) brightness(1) saturate(1) contrast(1)';
  }

  /**
   * 启动动态缩放效果
   * @param {Object} data - 实况照片数据对象
   */
  startDynamicScaling(data) {
    const { container } = data;
    let scaleStep = 0;
    const maxScale = 0.04; // 最大缩放4%
    const scaleSteps = 30;
    const scaleIncrement = maxScale / scaleSteps;
    
    data.scaleInterval = setInterval(() => {
      if (scaleStep < scaleSteps && data.isPlaying) {
        const currentScale = 1 + (scaleStep * scaleIncrement);
        const rotation = Math.sin(scaleStep * 0.2) * 0.5; // 轻微旋转
        
        container.style.transform = `scale(${currentScale}) rotate(${rotation}deg) translateZ(0)`;
        scaleStep++;
      } else if (data.isPlaying) {
        // 达到最大缩放后开始回缩
        scaleStep = 0;
      }
    }, 50); // 每50ms更新一次
  }

  /**
   * 停止动态缩放效果
   * @param {Object} data - 实况照片数据对象
   */
  stopDynamicScaling(data) {
    const { container } = data;
    
    // 清除缩放间隔
    if (data.scaleInterval) {
      clearInterval(data.scaleInterval);
      data.scaleInterval = null;
    }
    
    // 重置变换
    container.style.transform = 'scale(1) rotate(0deg) translateZ(0)';
  }

  /**
   * 添加悬停增强效果
   * @param {Object} data - 实况照片数据对象
   */
  addHoverEnhancement(data) {
    const { container, stillImage } = data;
    
    container.addEventListener('mouseenter', () => {
      if (!data.isPlaying) {
        // 悬停时的轻微模糊和亮度提升
        stillImage.style.filter = 'blur(1px) brightness(1.1) saturate(1.2) contrast(1.05)';
        container.style.transform = 'scale(1.02) translateZ(0)';
      }
    });
    
    container.addEventListener('mouseleave', () => {
      if (!data.isPlaying) {
        // 恢复原始状态
        stillImage.style.filter = 'blur(0px) brightness(1) saturate(1) contrast(1)';
        container.style.transform = 'scale(1) translateZ(0)';
      }
    });
  }
}

// 全局初始化
window.livePhoto = new LivePhoto();

// 支持PJAX和其他页面加载事件
if (typeof pjax !== 'undefined') {
  document.addEventListener('pjax:complete', () => {
    window.livePhoto.refresh();
  });
}

// 监听页面完全加载事件
window.addEventListener('load', () => {
  window.livePhoto.refresh();
});

// 监听DOM内容变化（用于动态加载的内容）
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    let shouldRefresh = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.classList.contains('live-photo-container') || node.querySelector('.live-photo-container'))) {
            shouldRefresh = true;
          }
        });
      }
    });
    if (shouldRefresh) {
      setTimeout(() => window.livePhoto.refresh(), 100);
    }
  });
  
  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 导出类供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LivePhoto;
}