// Settings for searching for incorrect macros.
// The list of allowed macros is stored as a regexp.
// Standard: These are macros allowed in all input fields.
// Rules: These are macros available for input fields with specific IDs.
//        They are combined with the standard list. If the value is empty,
//        only standard macros can be used for this input field.
const MACRO_CONFIG = {
  standard: 'PlatformName|UserName|UserID|Title|PageID|ImagesCount|AttsCount|N?(YYYY|YY|MM|DD|hh|mm)',
  rules: {
    'txtMacroText': '',
    'txtMacroImages': 'ImageCounter|ImageCounter#\\d+|ImageName',
    'txtMacroAttachments': 'AttCounter|AttCounter#\\d+|AttName'
  }
};

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
  input.style.marginLeft = '1px';

  // Move input in div
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  // Create buttons and add it in div after input
  const btnContainer = document.createElement('span');
  btnContainer.style.display = 'flex';
  btnContainer.style.flexShrink = '0'; // Don't shrink buttons

  const btnSave = createBtn('💾', () => {
    // Before saving, the path is cleared and a notification is displayed if the path has changed.
    const rawValue = input.value;
    const cleanValue = sanitizeMacroPath(rawValue);

    input.value = cleanValue; // The clear path is displayed in the field.

    if (rawValue !== cleanValue) {
      if (typeof browser !== 'undefined' && browser.notifications) {
        browser.notifications.create({
          "type": "basic",
          "iconUrl": "icons/icon-48.png",
          "title": chrome.i18n.getMessage("notify_path_cleaned_title"),
          "message": chrome.i18n.getMessage("notify_path_cleaned_message", [cleanValue])
        });
      } else {
        console.log(chrome.i18n.getMessage("notify_path_cleaned_message", [cleanValue]));
      }
    }

    // Macro checking. The first invalid macro is found, enclosed in [>][<], and highlighted in the input field. Saving is canceled.
    const errorPath = findFirstError(cleanValue, input.id);

    if (errorPath) {
      input.value = errorPath;

      // "Bad" visual effects.
      input.style.transition = 'background-color 0.4s ease, box-shadow 0.4s ease';
      input.style.backgroundColor = '#f8d7da';
      input.style.boxShadow = 'inset 0 0 0 1px #dc3545';

      const startIdx = errorPath.indexOf('[>]');
      const endIdx = errorPath.indexOf('[<]') + 3;

      input.focus();
      setTimeout(() => {
        input.setSelectionRange(startIdx, endIdx);
        // NEED FIX: Scrolling the field to display the selected fragment. Other options didn't work. Need a test. Or maybe not. :-)
        const charWidth = 6;
        input.scrollLeft = startIdx * charWidth;
      }, 10);

      setTimeout(() => {
        input.style.backgroundColor = '';
        input.style.outline = '';
      }, 1500);

      return;
    }

    chrome.storage.local.set({ [input.id]: cleanValue }, () => {
      // "Good" visual effects.
      const originalBg = input.style.backgroundColor;
      const originalShadow = input.style.boxShadow;

      input.style.transition = 'background-color 0.4s ease, box-shadow 0.4s ease';

      input.style.backgroundColor = '#d4edda';
      input.style.boxShadow = 'inset 0 0 0 1px #28a745';

      setTimeout(() => {
        input.style.backgroundColor = originalBg;
        input.style.boxShadow = originalShadow;
      }, 1000);
    });
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

function sanitizeMacroPath(inputPath) {
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;

    const cleanPath = inputPath
        .replace(/^[a-z]+:\/+/i, '')
        .replace(/\\/g, '/')
        .split('/')
        .filter(part => {
            const p = part.trim();
            return Boolean(p) && p !== '..' && p !== '.' && !reservedNames.test(p);
        })
        .join('/')
        .replace(/[:*?"<>|]/g, '_');

    return cleanPath || 'default_filename.txt';
}

function findFirstError(path, inputId) {
  const dollarCount = (path.match(/\$/g) || []).length;
  const specificMacros = MACRO_CONFIG.rules[inputId] || '';
  const combinedPattern = specificMacros
    ? `^(${MACRO_CONFIG.standard}|${specificMacros})$`
    : `^(${MACRO_CONFIG.standard})$`;
  const macroRegex = new RegExp(combinedPattern);

  let firstErrorPath = null;

  // Find the first pair $...$ that does not pass validation.
  path.replace(/\$([^$]*)\$/g, (match, content, offset) => {
    if (firstErrorPath) return match;

    if (content === "" || !macroRegex.test(content)) {
      // The following string is formed: text_BEFORE + [>]$error$[<] + text_AFTER
      firstErrorPath = path.substring(0, offset) + `[>]${match}[<]` + path.substring(offset + match.length);
    }
    return match;
  });

  // If the macros in pairs are ok, but there is an odd number of $ signs, surround the last $ with [>][<],
  if (!firstErrorPath && dollarCount % 2 !== 0) {
    const lastDollarIdx = path.lastIndexOf('$');
    firstErrorPath = path.substring(0, lastDollarIdx) + "[>]$[<]" + path.substring(lastDollarIdx + 1);
  }
  return firstErrorPath;
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
