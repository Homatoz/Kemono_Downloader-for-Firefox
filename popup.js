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

localizeHtmlPage();

const specialId = 'cbRemoveDupByName'; //This checkbox cannot be enabled from the popup page.

// Checkbox accessibility
function updateState(isActive) {
  const cb = document.getElementById(specialId);
  if (cb) {
    //If the checkbox is not selected, then make it inactive.
    cb.disabled = !isActive;
    cb.parentElement.style.opacity = isActive ? '1' : '0.5';
  }
}

// When page opened, data is loaded from storage in checkbox
chrome.storage.local.get(null, (data) => {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (data[cb.id] !== undefined) {
      cb.checked = data[cb.id];
    }
  });
  updateState(data[specialId]);
});

// Autosave for checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', () => {
    chrome.storage.local.set({ [cb.id]: cb.checked });
    
    if (cb.id === specialId && !cb.checked) {
      updateState(false);
    }
  });
});

// Sync when storage changes.
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (let [key, { newValue }] of Object.entries(changes)) {
      const el = document.getElementById(key);
      if (el && el.type === 'checkbox') {
        el.checked = newValue;
        
        if (key === specialId) {
          updateState(newValue);
        }
      }
    }
  }
});

// Open Settings button handler
document.getElementById('open-settings').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('settings.html'));
  }
});
