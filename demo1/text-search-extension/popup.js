// Popup 脚本：处理插件弹窗的交互
// 兼容不同浏览器API
const storageAPI = typeof chrome !== 'undefined' ? chrome.storage : (typeof browser !== 'undefined' ? browser.storage : null);

document.addEventListener('DOMContentLoaded', function() {
  // 加载保存的设置
  loadSettings();

  // 监听搜索引擎选择变化
  const searchEngineSelect = document.getElementById('search-engine');
  if (searchEngineSelect) {
    searchEngineSelect.addEventListener('change', function() {
      saveSettings();
    });
  }

  // 监听自动搜索复选框变化
  const autoSearchCheckbox = document.getElementById('auto-search');
  if (autoSearchCheckbox) {
    autoSearchCheckbox.addEventListener('change', function() {
      saveSettings();
    });
  }
});

// 加载设置
function loadSettings() {
  if (!storageAPI) {
    console.warn('无法访问存储API');
    return;
  }
  
  storageAPI.local.get(['searchEngine', 'autoSearch'], function(result) {
    if (result.searchEngine) {
      const searchEngineSelect = document.getElementById('search-engine');
      if (searchEngineSelect) {
        searchEngineSelect.value = result.searchEngine;
      }
    }
    if (result.autoSearch !== undefined) {
      const autoSearchCheckbox = document.getElementById('auto-search');
      if (autoSearchCheckbox) {
        autoSearchCheckbox.checked = result.autoSearch;
      }
    }
  });
}

// 保存设置
function saveSettings() {
  if (!storageAPI) {
    console.warn('无法访问存储API');
    return;
  }
  
  const searchEngineSelect = document.getElementById('search-engine');
  const autoSearchCheckbox = document.getElementById('auto-search');
  
  const settings = {
    searchEngine: searchEngineSelect ? searchEngineSelect.value : 'google',
    autoSearch: autoSearchCheckbox ? autoSearchCheckbox.checked : true
  };
  
  storageAPI.local.set(settings, function() {
    console.log('设置已保存');
  });
}
