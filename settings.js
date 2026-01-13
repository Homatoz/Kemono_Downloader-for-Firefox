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
  var removedupbyurl = document.getElementById("removedupbyurl").checked;
  var removedupbyname = document.getElementById("removedupbyname").checked;
  var macro = document.getElementById("macro").value;
  var macro2 = document.getElementById("macro2").value;
  var macro3 = document.getElementById("macro3").value;

  chrome.storage.local.set(
    {
      savetext: txt,
      saveimg: img,
      saveattr: attr,
      removedupbyurl: removedupbyurl,
      removedupbyname: removedupbyname,
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
    ["savetext", "saveimg", "saveattr", "macro", "macro2", "macro3", "removedupbyurl", "removedupbyname"],
    function (load) {
      document.getElementById("txt").checked = load.savetext;
      document.getElementById("img").checked = load.saveimg;
      document.getElementById("attr").checked = load.saveattr;
      document.getElementById("removedupbyurl").checked = load.removedupbyurl;
      document.getElementById("removedupbyname").checked = load.removedupbyname;
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
  document.getElementById("removedupbyurl").checked = true;
  document.getElementById("removedupbyname").checked = false;
  document.getElementById("macro").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/__main__text__";
  document.getElementById("macro2").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/$Counter$";
  document.getElementById("macro3").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/$AttachmentName$";
  save_settings();
}

document.addEventListener("DOMContentLoaded", () => {
  localizeHtmlPage(); // UI 텍스트를 먼저 지역화합니다.
  load_settings();    // 그 다음 설정을 불러옵니다.
});
document.getElementById("save").addEventListener("click", save_settings);
document.getElementById("reset").addEventListener("click", initialize_settings);
document.getElementById("reload").addEventListener("click", load_settings);

document.getElementById('removedupbyname').addEventListener('click', function(event) {
  if (this.checked) {
    const confirmText = chrome.i18n.getMessage("confirm_remove_dupes_by_name");

    if (!confirm(confirmText)) {
      event.preventDefault();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.copy-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const textToCopy = row.cells[1].textContent.trim();

      const el = document.createElement('textarea');
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();

      try {
        document.execCommand('copy');
        const originalIcon = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => btn.textContent = originalIcon, 1000);
      } catch (err) {
        console.error('Copy failed', err);
      }

      document.body.removeChild(el);
    });
  });
});
