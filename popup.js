const toggle = document.getElementById('toggleExt');
const uploadH = document.getElementById('uploadHorizontal');
const uploadV = document.getElementById('uploadVertical');

chrome.storage.local.get(['isEnabled'], (data) => {
    toggle.checked = data.isEnabled !== false;
});

toggle.addEventListener('change', () => {
    chrome.storage.local.set({ isEnabled: toggle.checked });
});

function showSuccessStatus(statusElementId) {
    const statusEl = document.getElementById(statusElementId);
    statusEl.classList.add('show');

    setTimeout(() => {
        statusEl.classList.remove('show');
    }, 2500);
}

function handleFileUpload(inputElement, storageKey, labelElementId, statusElementId) {
    inputElement.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const labelEl = document.getElementById(labelElementId);
        labelEl.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;

            chrome.storage.local.set({ [storageKey]: base64String }, () => {
                showSuccessStatus(statusElementId);
                setTimeout(() => {
                    labelEl.textContent = 'Choose another file';
                }, 3000);
            });
        };
        reader.readAsDataURL(file);
    });
}

handleFileUpload(uploadH, 'hCover', 'labelHorizontal', 'statusHorizontal');
handleFileUpload(uploadV, 'vCover', 'labelVertical', 'statusVertical');
