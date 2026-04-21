// 内容脚本：监听用户选中文本并触发搜索
let searchPanel = null;
let searchTimer = null;

// 监听选中文本事件
document.addEventListener('mouseup', function(event) {
  try {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {
      // 延迟执行以避免连续选择时频繁触发
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        showSearchPanel(selectedText, event.pageX, event.pageY);
      }, 300);
    } else {
      // 如果没有选中文本，关闭搜索面板
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

// 定位面板
function positionPanel(x, y) {
  if (!searchPanel) return;

  const panelWidth = 600;
  const panelHeight = 400;
  const padding = 10;

  // 计算最佳位置
  let left = x + padding;
  let top = y + padding;

  // 检查右边界
  if (left + panelWidth > window.innerWidth) {
    left = window.innerWidth - panelWidth - padding;
  }

  // 检查下边界
  if (top + panelHeight > window.innerHeight) {
    top = y - panelHeight - padding;
  }

  // 确保不会超出左边界和上边界
  left = Math.max(padding, left);
  top = Math.max(padding, top);

  searchPanel.style.left = left + 'px';
  searchPanel.style.top = top + 'px';
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
