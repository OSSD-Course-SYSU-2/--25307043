// 后台脚本：处理搜索逻辑和消息传递
chrome.runtime.onInstalled.addListener(function() {
  console.log('文本搜索助手插件已安装');
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'search') {
    performSearch(request.text, request.engine);
  }
});

// 执行搜索
function performSearch(text, engine) {
  const searchEngines = {
    google: `https://www.google.com/search?q=${encodeURIComponent(text)}`,
    baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(text)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(text)}`
  };

  const searchUrl = searchEngines[engine] || searchEngines.google;

  // 打开新的搜索标签页
  chrome.tabs.create({ url: searchUrl });
}

// 监听设置变化
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local') {
    if (changes.searchEngine) {
      console.log('搜索引擎已更改为:', changes.searchEngine.newValue);
    }
    if (changes.autoSearch) {
      console.log('自动搜索已', changes.autoSearch.newValue ? '启用' : '禁用');
    }
  }
});
