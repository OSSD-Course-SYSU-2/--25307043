// 内容脚本：监听用户选中文本并触发搜索
// 集成 HarmonyOS 算法优化
let searchPanel = null;
let searchTimer = null;
let harmonyOS = null;
let eventOptimizer = null;

// 初始化 HarmonyOS 算法
function initHarmonyOS() {
  if (typeof HarmonyOSAlgorithms !== 'undefined') {
    try {
      harmonyOS = new HarmonyOSAlgorithms();
      eventOptimizer = new EventOptimizer(harmonyOS.deviceInfo);
      console.log('✅ HarmonyOS 算法已启用:', harmonyOS.deviceInfo);
    } catch (error) {
      console.warn('HarmonyOS 算法初始化失败:', error);
    }
  }
}

// 监听选中文本事件
document.addEventListener('mouseup', function(event) {
  try {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {
      // 使用 HarmonyOS 事件优化或默认延迟
      const delay = eventOptimizer ? eventOptimizer.getAdaptiveDelay() : 300;
      
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        showSearchPanel(selectedText, event.pageX, event.pageY);
      }, delay);
    } else {
      hideSearchPanel();
    }
  } catch (error) {
    console.error('文本搜索助手错误:', error);
  }
});

// 显示搜索面板
function showSearchPanel(text, x, y) {
  try {
    // 如果面板已存在，先移除
    if (searchPanel) {
      hideSearchPanel();
    }

    // 创建搜索面板
    searchPanel = document.createElement('div');
    searchPanel.id = 'text-search-panel';

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'close-button';
    closeButton.addEventListener('click', hideSearchPanel);

    // 创建iframe用于显示搜索结果
    const iframe = document.createElement('iframe');
    iframe.setAttribute('allow', 'same-origin');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    // 组装面板
    searchPanel.appendChild(closeButton);
    searchPanel.appendChild(iframe);
    document.body.appendChild(searchPanel);

    // 定位面板
    positionPanel(x, y);

    // 延迟加载iframe以确保DOM已准备好
    setTimeout(() => {
      try {
        const searchUrl = chrome.runtime.getURL('search.html') + '?text=' + encodeURIComponent(text);
        console.log('加载搜索页面:', searchUrl);
        iframe.src = searchUrl;
      } catch (error) {
        console.error('加载搜索页面失败:', error);
        // 如果iframe加载失败，显示错误信息
        searchPanel.innerHTML = '<div style="padding: 20px; color: red;">搜索页面加载失败，请检查插件权限</div>';
      }
    }, 100);
  } catch (error) {
    console.error('显示搜索面板失败:', error);
  }
}

// 定位面板 - 使用 HarmonyOS 智能定位算法
function positionPanel(x, y) {
  if (!searchPanel) return;

  const panelWidth = 600;
  const panelHeight = 400;

  // 使用 HarmonyOS 智能定位算法
  if (harmonyOS) {
    const position = harmonyOS.smartPosition(x, y, panelWidth, panelHeight);
    searchPanel.style.left = position.left + 'px';
    searchPanel.style.top = position.top + 'px';
  } else {
    // 降级到传统定位算法
    const padding = 10;
    let left = x + padding;
    let top = y + padding;

    if (left + panelWidth > window.innerWidth) {
      left = window.innerWidth - panelWidth - padding;
    }

    if (top + panelHeight > window.innerHeight) {
      top = y - panelHeight - padding;
    }

    left = Math.max(padding, left);
    top = Math.max(padding, top);

    searchPanel.style.left = left + 'px';
    searchPanel.style.top = top + 'px';
  }
}

// 隐藏搜索面板
function hideSearchPanel() {
  if (searchPanel) {
    document.body.removeChild(searchPanel);
    searchPanel = null;
  }
}

// 点击页面其他地方时关闭面板
document.addEventListener('click', function(event) {
  if (searchPanel && !searchPanel.contains(event.target)) {
    hideSearchPanel();
  }
});

// 监听窗口大小变化，调整面板位置
window.addEventListener('resize', function() {
  if (searchPanel) {
    const rect = searchPanel.getBoundingClientRect();
    positionPanel(rect.left, rect.top);
  }
});

// 初始化 HarmonyOS 算法
initHarmonyOS();
