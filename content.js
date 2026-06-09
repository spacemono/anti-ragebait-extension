document.documentElement.setAttribute('data-yt-covers', 'enabled');

const targetSelectors = 'img.yt-core-image, ytd-thumbnail img, img.ytCoreImageHost, yt-image img, .yt-core-image--fill-parent-height';

let isEnabled = true;
let hCoverUrl = chrome.runtime.getURL("horizontal.jpg"); // Дефолт
let vCoverUrl = chrome.runtime.getURL("vertical.jpg");   // Дефолт

chrome.storage.local.get(['isEnabled', 'hCover', 'vCover'], (data) => {
  isEnabled = data.isEnabled !== false;
  if (data.hCover) hCoverUrl = data.hCover;
  if (data.vCover) vCoverUrl = data.vCover;

  applyState();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) isEnabled = changes.isEnabled.newValue;
  if (changes.hCover) hCoverUrl = changes.hCover.newValue;
  if (changes.vCover) vCoverUrl = changes.vCover.newValue;

  applyState();
});

function applyState() {
  if (isEnabled) {
    document.documentElement.setAttribute('data-yt-covers', 'enabled');
    processImages();
  } else {
    document.documentElement.removeAttribute('data-yt-covers');
    restoreOriginalImages();
  }
}

function isElementShorts(img) {
  if (img.closest('ytd-reel-item-renderer, ytd-rich-item-renderer[is-shorts], ytd-shorts-element-renderer')) return true;
  const anchor = img.closest('a');
  return anchor && anchor.href && anchor.href.includes('/shorts/');
}

function processImages() {
  if (!isEnabled) return;
  const thumbnails = document.querySelectorAll(targetSelectors);

  thumbnails.forEach(img => {
    if (img.closest('#avatar, #avatar-container, .ytd-channel-name')) return;

    const isShorts = isElementShorts(img);
    const finalUrl = isShorts ? vCoverUrl : hCoverUrl;

    if (!img.dataset.originalSrc && img.src && !img.src.startsWith('data:image')) {
      img.dataset.originalSrc = img.src;
    }

    if (img.getAttribute('src') !== finalUrl) {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src = finalUrl;
      img.setAttribute('data-replaced', 'true');
    }
  });
}

function restoreOriginalImages() {
  const replacedImages = document.querySelectorAll('img[data-replaced="true"]');
  replacedImages.forEach(img => {
    if (img.dataset.originalSrc) {
      img.src = img.dataset.originalSrc;
    }
    img.removeAttribute('data-replaced');
  });
}

const observer = new MutationObserver(() => {
  if (isEnabled) processImages();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['src', 'srcset']
});

window.addEventListener('yt-navigate-finish', () => {
  if (isEnabled) processImages();
});
