//コンテキスト表示
chrome.contextMenus.create({
  id: "kemo",
  title: "해당 페이지를 저장",
  type: "normal",
  contexts: ["page"],
  documentUrlPatterns: [
    "https://kemono.cr/*/post/*",
    "https://kemono.cr/*/post/*",
  ],
  /*,
    'onclick' : function(info){
      chrome.extention.sendMessage({type: 'get'});
    }*/
});

//選択時のイベント
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { message: "getImage" });
  });
});

//直リンに出来ない物は一度storageに投げた方がよさそう
chrome.runtime.onMessage.addListener(function (request) {
  if (request.type == "download") {
    console.log(request.filename);
    download(request.url, request.filename);
  } else if (request.type == "blob") {
    console.log(request.filename);
    const blob = URL.createObjectURL(request.blob);
    download(blob, request.filename);
  } else if (request.type == "set") {
    chrome.runtime.openOptionsPage(); //background.jsから発火する必要がある
  }
  return true;
});

function download(url, filename) {
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false,
  });
}
