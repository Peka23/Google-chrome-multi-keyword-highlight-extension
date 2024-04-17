document.addEventListener('DOMContentLoaded', function() {
    let highlightingEnabled = false;  // Initialize highlighting as disabled

    // Load saved text when the popup is opened
    chrome.storage.local.get(['highlightText'], function(result) {
        if (result.highlightText) {
            document.getElementById('inputText').value = result.highlightText;
        }
    });

    document.getElementById('highlightButton').addEventListener('click', () => {
        const text = document.getElementById('inputText').value;
        chrome.storage.local.set({'highlightText': text}, function() {
            chrome.runtime.sendMessage({action: "highlight", text: text});
        });
    });

    const toggleButton = document.getElementById('toggleHighlightButton');
    toggleButton.addEventListener('change', () => {
        highlightingEnabled = toggleButton.checked;
        const text = document.getElementById('inputText').value;
        chrome.runtime.sendMessage({action: "toggleHighlight", state: highlightingEnabled, text: text});
    });
});