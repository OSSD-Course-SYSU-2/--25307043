// Popup 脚本：处理插件弹窗的交互
document.addEventListener('DOMContentLoaded', function() {
  // 加载保存的设置
  loadSettings();

  // 监听搜索引擎选择变化
  const searchEngineSelect = document.getElementById('search-engine');
  searchEngineSelect.addEventListener('change', function() {
    saveSettings();
  });

  // 监听自动搜索复选框变化
  const autoSearchCheckbox = document.getElementById('auto-search');
  autoSearchCheckbox.addEventListener('change', function() {
    saveSettings();
  });
});

// 加载设置
function loadSettings() {
  chrome.storage.local.get(['searchEngine', 'autoSearch'], function(result) {
    if (result.searchEngine) {
      document.getElementById('search-engine').value = result.searchEngine;
    }
    if (result.autoSearch !== undefined) {
      document.getElementById('auto-search').checked = result.autoSearch;
    }
  });
}

// 保存设置
function saveSettings() {
  const settings = {
    searchEngine: document.getElementById('search-engine').value,
    autoSearch: document.getElementById('auto-search').checked
  };
  chrome.storage.local.set(settings, function() {
    console.log('设置已保存');
  });
}
