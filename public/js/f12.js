// 优化的防开发者工具检测 - F12.js版本
(function() {
    let devtoolsOpen = false;
    let threshold = 160;
    
    // 方法1: 检测窗口尺寸变化
    function detectBySize() {
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
        if (typeof btf !== 'undefined' && btf.snackbarShow) {
            btf.snackbarShow('检测到开发者工具已打开，页面将重新加载！', false, 3000);
        } else {
            alert('检测到开发者工具已打开，页面将重新加载！');
        }
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    // 键盘事件检测
    document.onkeydown = function (e) {
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
    
    // 立即检测
    detectByConsole();
    
    // 持续监控
    setInterval(detectBySize, 500);
    setInterval(detectByDebugger, 1000);
    setInterval(detectByConsole, 2000);
})();