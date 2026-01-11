function localizeHtmlPage() {
  // data-l10n-id 속성을 가진 모든 요소를 찾습니다.
  const localizableElements = document.querySelectorAll('[data-l10n-id]');
  
  localizableElements.forEach(elem => {
    // data-l10n-id 속성 값을 가져옵니다 (이것이 messages.json의 key가 됩니다).
    const messageKey = elem.getAttribute('data-l10n-id');
    if (messageKey) {
      // chrome.i18n.getMessage API를 사용하여 브라우저 언어에 맞는 텍스트를 가져옵니다.
      const message = chrome.i18n.getMessage(messageKey);
      if (message) {
        elem.textContent = message;
      }
    }
  });
}

function save_settings() {
  var txt = document.getElementById("txt").checked;
  var img = document.getElementById("img").checked;
  var attr = document.getElementById("attr").checked;
  var textname = document.getElementById("textname").value;
  var macro = document.getElementById("macro").value;
  var macro2 = document.getElementById("macro2").value;
  var macro3 = document.getElementById("macro3").value;
  chrome.storage.local.set(
    {
      savetext: txt,
      saveimg: img,
      saveattr: attr,
      textname: textname,
      macro: macro,
      macro2: macro2,
      macro3: macro3,
    },
    function () {
      console.log("Done: save_settings()");
    }
  );
}

function load_settings() {
  chrome.storage.local.get(
    ["savetext", "saveimg", "saveattr", "textname", "macro", "macro2", "macro3"],
    function (load) {
      document.getElementById("txt").checked = load.savetext;
      document.getElementById("img").checked = load.saveimg;
      document.getElementById("attr").checked = load.saveattr;
      document.getElementById("textname").value = load.textname;
      document.getElementById("macro").value = load.macro;
      document.getElementById("macro2").value = load.macro2;
      document.getElementById("macro3").value = load.macro3;
      if (load.macro == undefined) {
        initialize_settings();
        console.log("Initializing Settings");
        return null;
      }
      console.log("Done: load_settings()");
    }
  );
}
function clear_settings() {
  chrome.storage.local.clear(function () {
    console.log("Done: reset_settings()");
    location.reload();
  });
}

function initialize_settings() {
  document.getElementById("txt").checked = true;
  document.getElementById("img").checked = true;
  document.getElementById("attr").checked = true;
  document.getElementById("textname").value =
    "__main__text__";
  document.getElementById("macro").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/$TextName$";
  document.getElementById("macro2").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/$Diff$";
  document.getElementById("macro3").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/$AttrName$";
  save_settings();
}

document.addEventListener("DOMContentLoaded", () => {
  localizeHtmlPage(); // UI 텍스트를 먼저 지역화합니다.
  load_settings();    // 그 다음 설정을 불러옵니다.
});
document.getElementById("save").addEventListener("click", save_settings);
document.getElementById("reset").addEventListener("click", initialize_settings);
document.getElementById("reload").addEventListener("click", load_settings);
