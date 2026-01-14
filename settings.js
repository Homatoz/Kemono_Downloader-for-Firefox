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
  var cbDlText = document.getElementById("cbDlText").checked;
  var cbDlImages = document.getElementById("cbDlImages").checked;
  var cbDlAttachments = document.getElementById("cbDlAttachments").checked;
  var cbRemoveDupByUrl = document.getElementById("cbRemoveDupByUrl").checked;
  var cbRemoveDupByName = document.getElementById("cbRemoveDupByName").checked;
  var txtMacroText = document.getElementById("txtMacroText").value;
  var txtMacroImages = document.getElementById("txtMacroImages").value;
  var txtMacroAttachments = document.getElementById("txtMacroAttachments").value;

  chrome.storage.local.set(
    {
      cbDlText: cbDlText,
      cbDlImages: cbDlImages,
      cbDlAttachments: cbDlAttachments,
      cbRemoveDupByUrl: cbRemoveDupByUrl,
      cbRemoveDupByName: cbRemoveDupByName,
      txtMacroText: txtMacroText,
      txtMacroImages: txtMacroImages,
      txtMacroAttachments: txtMacroAttachments,
    },
    function () {
      console.log("Done: save_settings()");
    }
  );
}

function load_settings() {
  chrome.storage.local.get(
    ["cbDlText", "cbDlImages", "cbDlAttachments", "txtMacroText", "txtMacroImages", "txtMacroAttachments", "cbRemoveDupByUrl", "cbRemoveDupByName"],
    function (load) {
      document.getElementById("cbDlText").checked = load.cbDlText;
      document.getElementById("cbDlImages").checked = load.cbDlImages;
      document.getElementById("cbDlAttachments").checked = load.cbDlAttachments;
      document.getElementById("cbRemoveDupByUrl").checked = load.cbRemoveDupByUrl;
      document.getElementById("cbRemoveDupByName").checked = load.cbRemoveDupByName;
      document.getElementById("txtMacroText").value = load.txtMacroText;
      document.getElementById("txtMacroImages").value = load.txtMacroImages;
      document.getElementById("txtMacroAttachments").value = load.txtMacroAttachments;
      if (load.txtMacroText == undefined) {
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
  document.getElementById("cbDlText").checked = true;
  document.getElementById("cbDlImages").checked = true;
  document.getElementById("cbDlAttachments").checked = true;
  document.getElementById("cbRemoveDupByUrl").checked = true;
  document.getElementById("cbRemoveDupByName").checked = false;
  document.getElementById("txtMacroText").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/__main__text__";
  document.getElementById("txtMacroImages").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/$ImageCounter#3$";
  document.getElementById("txtMacroAttachments").value =
    "Kemono_Downloader/$PlatformName$/$UserName$/$YY$$MM$$DD$_$Title$/$AttName$";
  save_settings();
}

// Checkboxes autosave
document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', (e) => {
    chrome.storage.local.set({ [cb.id]: cb.checked });
  });
});

// Prevent the "Remove duplicates by name" checkbox from being enabled without confirmation.
document.getElementById('cbRemoveDupByName').addEventListener('click', function(event) {
  if (this.checked) {
    const confirmText = chrome.i18n.getMessage("confirm_remove_dupes_by_name");
    if (!confirm(confirmText)) {
      event.preventDefault();
    }
  }
});


// Save and Cancel buttons for inputs
document.querySelectorAll('input[type="text"]').forEach(input => {
  // Create div - flex 100% width
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';
  wrapper.style.boxSizing = 'border-box';

  input.style.flexGrow = '1'; //Input fill all free space

  // Move input in div
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  // Create buttons and add it in div after input
  const btnContainer = document.createElement('span');
  btnContainer.style.display = 'flex';
  btnContainer.style.flexShrink = '0'; // Don't shrink buttons

  const btnSave = createBtn('💾', () => {
    chrome.storage.local.set({ [input.id]: input.value });
  });

  const btnReset = createBtn('\u21A9\uFE0E', () => {
    chrome.storage.local.get(input.id, (res) => {
      if (res[input.id] !== undefined) input.value = res[input.id];
    });
  });

  btnContainer.append(btnSave, btnReset);
  wrapper.appendChild(btnContainer);
});

function createBtn(icon, onClick) {
  const btn = document.createElement('button');
  btn.textContent = icon;
  btn.style.cursor = 'pointer';
  btn.style.marginLeft = '1px';
  btn.onclick = onClick;
  return btn;
}

// Listener for changes in the storage for real-time synchronization
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (let [key, { newValue }] of Object.entries(changes)) {
      const el = document.getElementById(key);
      if (el && el.type === 'checkbox')
        el.checked = newValue;
    }
  }
});

// Buttons for copying a macro.
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

document.getElementById("reset").addEventListener("click", initialize_settings);

document.addEventListener("DOMContentLoaded", () => {
  localizeHtmlPage(); // UI 텍스트를 먼저 지역화합니다.
  load_settings();    // 그 다음 설정을 불러옵니다.
});
