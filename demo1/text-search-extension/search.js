// 搜索结果页面脚本
let searchEngine = 'google';
let searchText = '';

document.addEventListener('DOMContentLoaded', function() {
  // 获取URL参数中的搜索文本
  const urlParams = new URLSearchParams(window.location.search);
  searchText = urlParams.get('text');

  if (searchText) {
    document.getElementById('search-input').value = searchText;
    performSearch(searchText);
  }

  // 设置事件监听器
  document.getElementById('search-button').addEventListener('click', handleSearch);
  document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
  document.getElementById('engine-select').addEventListener('change', function() {
    searchEngine = this.value;
    const searchInput = document.getElementById('search-input');
    if (searchInput.value.trim()) {
      performSearch(searchInput.value.trim());
    }
  });

  // 加载保存的搜索引擎设置
  loadSettings();
});

function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const text = searchInput.value.trim();
  if (text) {
    searchText = text;
    performSearch(text);
  }
}

function performSearch(text) {
  const searchResults = document.getElementById('search-results');
  searchResults.innerHTML = '<div class="loading">搜索中...</div>';

  const searchUrls = {
    google: `https://www.google.com/search?q=${encodeURIComponent(text)}`,
    baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(text)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(text)}`
  };

  const searchUrl = searchUrls[searchEngine];

  // 由于浏览器的CORS限制，我们无法直接获取搜索结果
  // 这里使用iframe显示搜索页面
  searchResults.innerHTML = `
    <div class="search-iframe-container">
      <div class="iframe-header">
        <span>正在使用${getEngineName(searchEngine)}搜索: ${text}</span>
        <a href="${searchUrl}" target="_blank" class="external-link">在新标签页中打开</a>
      </div>
      <iframe src="${searchUrl}" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
    </div>
  `;
}

function getEngineName(engine) {
  const names = {
    google: 'Google',
    baidu: '百度',
    bing: '必应'
  };
  return names[engine] || 'Google';
}

function loadSettings() {
  chrome.storage.local.get(['searchEngine'], function(result) {
    if (result.searchEngine) {
      searchEngine = result.searchEngine;
      document.getElementById('engine-select').value = searchEngine;
      if (searchText) {
        performSearch(searchText);
      }
    }
  });
}
