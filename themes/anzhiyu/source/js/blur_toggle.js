/**
 * 毛玻璃效果切换功能
 * 作者: AnZhiYu主题
 * 功能: 实时切换页面元素的毛玻璃视觉效果
 */

// 毛玻璃效果状态管理
class BlurEffectManager {
  constructor() {
    this.isBlurEnabled = localStorage.getItem('blur-effect-enabled') !== 'false';
    this.init();
  }

  init() {
    // 页面加载时应用保存的状态
    this.applyBlurEffect(this.isBlurEnabled);
    this.updateToggleButton();
    
    // 监听页面变化（PJAX支持）
    document.addEventListener('pjax:complete', () => {
      this.applyBlurEffect(this.isBlurEnabled);
    });
  }

  // 切换毛玻璃效果
  toggle() {
    this.isBlurEnabled = !this.isBlurEnabled;
    localStorage.setItem('blur-effect-enabled', this.isBlurEnabled);
    this.applyBlurEffect(this.isBlurEnabled);
    this.updateToggleButton();
    this.showNotification();
  }

  // 应用毛玻璃效果
  applyBlurEffect(enabled) {
    const body = document.body;
    
    if (enabled) {
      body.classList.add('blur-effect-enabled');
      body.classList.remove('blur-effect-disabled');
    } else {
      body.classList.add('blur-effect-disabled');
      body.classList.remove('blur-effect-enabled');
    }
  }

  // 更新切换按钮状态
  updateToggleButton() {
    const icon = document.getElementById('blur-toggle-icon');
    const text = document.getElementById('blur-toggle-text');
    const button = document.getElementById('blur-toggle-button');
    
    if (icon && text && button) {
      // 添加切换动画
      icon.style.transform = 'scale(0.8) rotate(180deg)';
      
      setTimeout(() => {
        if (this.isBlurEnabled) {
          icon.className = 'anzhiyufont anzhiyu-icon-droplet';
          text.textContent = 'Blur';
          button.classList.add('blur-active');
          button.title = '关闭毛玻璃效果 - 当前已启用';
        } else {
          icon.className = 'anzhiyufont anzhiyu-icon-eye';
          text.textContent = 'Clear';
          button.classList.remove('blur-active');
          button.title = '开启毛玻璃效果 - 当前已禁用';
        }
        
        // 恢复图标动画
        icon.style.transform = 'scale(1) rotate(0deg)';
      }, 150);
    }
  }

  // 显示切换通知
  showNotification() {
    const message = this.isBlurEnabled ? '毛玻璃效果已开启' : '毛玻璃效果已关闭';
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'blur-toggle-notification';
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }
}

// 全局函数，供模板调用
function toggleBlurEffect() {
  if (window.blurEffectManager) {
    window.blurEffectManager.toggle();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.blurEffectManager = new BlurEffectManager();
});

// PJAX支持
if (typeof pjax !== 'undefined') {
  document.addEventListener('pjax:complete', () => {
    if (!window.blurEffectManager) {
      window.blurEffectManager = new BlurEffectManager();
    }
  });
}

// 导出模块（如果需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlurEffectManager;
}