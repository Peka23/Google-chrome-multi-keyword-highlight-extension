// highlighter.js

document.addEventListener('DOMContentLoaded', () => {
    restoreState();
    updateRows(50);
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
            url: tab.url,
            type: 'URL_CHANGE'
        });
    }
});

const sendData = async () => {

    chrome.runtime.sendMessage({
        count: 12,
        data: []
    }, function(response) {
        console.log(response.received);
    });

}

function restoreState() {
    chrome.storage.local.get(['rows'], function(result) {
        if (result.rows) {
            result.rows.forEach((row, index) => {
                const textSpan = document.querySelectorAll('.text')[index];
                const colorPicker = document.querySelectorAll('.color-picker')[index];
                const toggleBtn = document.querySelectorAll('.slider-toggle')[index];
                if (textSpan && colorPicker && toggleBtn) {
                    textSpan.textContent = row.text;
                    colorPicker.value = row.color;
                    toggleBtn.checked = row.isActive;
                    if (row.isActive) {
                        updateHighlight(row.text, row.color);
                    }
                }
            });
        }
    });
}

function saveState() {
    const rows = Array.from(document.querySelectorAll('.row')).map(row => ({
        text: row.querySelector('.text').textContent,
        color: row.querySelector('.color-picker').value,
        isActive: row.querySelector('.slider-toggle').checked
    }));
    chrome.storage.local.set({rows: rows});
}

function updateRows(numRows) {
    const container = document.getElementById('textRows');
    container.innerHTML = '';
    const colors = ['#FFFF00', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD', '#FF4500', '#e5d094', '#C71585', '#FFA500', '#008B8B'];
    for (let i = 0; i < numRows; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.style.backgroundColor = colors[i % colors.length];
        const textSpan = document.createElement('span');
        textSpan.className = 'text';
        textSpan.contentEditable = true;
        textSpan.oninput = (event) => handleTextInput(event, i, colors[i % colors.length]);
        textSpan.onblur = saveState;
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.className = 'color-picker';
        colorPicker.value = colors[i % colors.length];
        colorPicker.onchange = (event) => {
            row.style.backgroundColor = event.target.value;
            updateHighlight(textSpan.textContent, event.target.value);
            saveState();
        };
        const toggleBtn = document.createElement('input');
        toggleBtn.type = 'checkbox';
        toggleBtn.className = 'slider-toggle';
        toggleBtn.checked = true;
        toggleBtn.onchange = () => {
            toggleHighlight(textSpan.textContent, colorPicker.value, toggleBtn.checked);
            saveState();
        };
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = () => {
            row.remove();
            saveState();
        };
        row.appendChild(textSpan);
        row.appendChild(colorPicker);
        row.appendChild(toggleBtn);
        row.appendChild(deleteBtn);
        container.appendChild(row);
    }
}

function handleTextInput(event, rowIndex, color) {
    const maxCharsPerRow = 150;
    let textContent = event.target.textContent;
    if (textContent.length > maxCharsPerRow) {
        event.target.textContent = textContent.slice(0, maxCharsPerRow);
        textContent = textContent.slice(maxCharsPerRow);
        const nextRow = event.target.parentElement.nextElementSibling;
        if (nextRow) {
            const nextTextSpan = nextRow.querySelector('.text');
            nextTextSpan.textContent = textContent + nextTextSpan.textContent;
            handleTextInput({target: nextTextSpan}, rowIndex + 1, color);
        }
    }
    updateHighlight(textContent, color);
}

function updateHighlight(keywords, color) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "highlight", keywords: keywords.split(' '), color: color});
    });
}

function toggleHighlight(keywords, color, isActive) {
    if (isActive) {
        updateHighlight(keywords, color);
    } else {
        updateHighlight(keywords, 'transparent'); // Remove highlighting
    }
    saveState();
}