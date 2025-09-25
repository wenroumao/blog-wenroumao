// 优化的防开发者工具检测 - F12.js版本
(function() {
    // ===== 源代码级别开关 =====
    // 设置为 false 可以完全禁用开发者工具检测
    // 设置为 true 启用检测功能
    const DETECTION_ENABLED = false;
    
    let devtoolsOpen = false;
    let threshold = 160;
    
    // 全局开关控制（可通过localStorage动态控制）
    let detectionEnabled = localStorage.getItem('f12DetectionEnabled') !== null 
        ? localStorage.getItem('f12DetectionEnabled') === 'true' 
        : DETECTION_ENABLED;
    
    // 如果源代码开关关闭，强制禁用检测
    if (!DETECTION_ENABLED) {
        detectionEnabled = false;
    }
    
    // 存储定时器ID用于管理
    let intervalIds = [];
    
    // 方法1: 检测窗口尺寸变化
    function detectBySize() {
        if (!detectionEnabled) return;
        
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showWarning();
            }
        }
    }
    
    // 方法2: 检测调试器
    function detectByDebugger() {
        if (!detectionEnabled) return;
        
        let start = new Date();
        debugger;
        let end = new Date();
        if (end - start > 100) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showWarning();
            }
        }
    }
    
    // 方法3: 检测console访问
    function detectByConsole() {
        if (!detectionEnabled) return;
        
        let devtools = new Date();
        devtools.toString = function() {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showWarning();
            }
        };
        console.log('%c', devtools);
    }
    
    // 显示警告并重新加载
    function showWarning() {
        // 使用主题统一的snackbar样式
        if (typeof anzhiyu !== 'undefined' && anzhiyu.snackbarShow) {
            anzhiyu.snackbarShow(
                '🔒 检测到开发者工具已打开，页面将自动重新加载', 
                false, 
                3000
            );
        } else if (typeof btf !== 'undefined' && btf.snackbarShow) {
            btf.snackbarShow('🔒 检测到开发者工具已打开，页面将自动重新加载', false, 3000);
        } else {
            // 创建自定义样式的提示框作为后备方案
            const warningDiv = document.createElement('div');
            warningDiv.innerHTML = '🔒 检测到开发者工具已打开，页面将自动重新加载';
            warningDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--anzhiyu-main, #425AEF);
                color: var(--anzhiyu-white, #fff);
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                z-index: 99999;
                box-shadow: var(--anzhiyu-shadow-main, 0 8px 12px -3px rgba(66, 90, 239, 0.2));
                animation: slideInDown 0.3s ease-out;
                border: var(--style-border, none);
            `;
            
            // 添加动画样式
            if (!document.getElementById('f12-warning-style')) {
                const style = document.createElement('style');
                style.id = 'f12-warning-style';
                style.textContent = `
                    @keyframes slideInDown {
                        from {
                            opacity: 0;
                            transform: translateX(-50%) translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(-50%) translateY(0);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(warningDiv);
            
            // 3秒后移除提示框
            setTimeout(() => {
                if (warningDiv.parentNode) {
                    warningDiv.remove();
                }
            }, 3000);
        }
        
        // 延迟重新加载页面
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    // 键盘事件检测
    document.onkeydown = function (e) {
        // 如果检测被禁用，只阻止默认行为但不触发警告
        if (!detectionEnabled) {
            if (123 == e.keyCode || 
                (e.ctrlKey && e.shiftKey && (74 === e.keyCode || 73 === e.keyCode || 67 === e.keyCode)) || 
                (e.ctrlKey && 85 === e.keyCode)) {
                // 不阻止默认行为，允许正常使用开发者工具
                return true;
            }
            return;
        }
        
        // F12 或 Ctrl+Shift+I/J/C 或 Ctrl+U
        if (123 == e.keyCode || 
            (e.ctrlKey && e.shiftKey && (74 === e.keyCode || 73 === e.keyCode || 67 === e.keyCode)) || 
            (e.ctrlKey && 85 === e.keyCode)) {
            e.preventDefault();
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showWarning();
            }
            event.keyCode = 0;
            event.returnValue = false;
            return false;
        }
    };
    
    // 右键菜单 - 仅禁用默认行为，不触发检测
    document.oncontextmenu = function (e) {
        // 保留右键菜单功能，不进行开发者工具检测
        // 用户可以正常使用右键菜单的其他功能
    };
    
    // 初始化
    console.log('F12 Detection Script Loaded');
    console.log('Source Code Switch (DETECTION_ENABLED):', DETECTION_ENABLED);
    console.log('Current Detection Status:', detectionEnabled ? 'Enabled' : 'Disabled');
    
    if (detectionEnabled) {
        console.log('Developer tools detection is active');
        
        // 立即检测
        detectByConsole();
        
        // 持续监控 - 存储定时器ID以便管理
        intervalIds.push(setInterval(detectBySize, 500));
        intervalIds.push(setInterval(detectByDebugger, 1000));
        intervalIds.push(setInterval(detectByConsole, 2000));
    } else {
        console.log('Developer tools detection is disabled by source code setting');
    }
    
    // 提供全局控制方法
    window.f12Detection = {
        enable: function() {
            localStorage.setItem('f12DetectionEnabled', 'true');
            location.reload();
        },
        disable: function() {
            localStorage.setItem('f12DetectionEnabled', 'false');
            // 清除所有定时器
            intervalIds.forEach(id => clearInterval(id));
            intervalIds = [];
            detectionEnabled = false;
            console.log('F12 detection disabled');
        },
        status: function() {
            return detectionEnabled;
        }
    };
})();