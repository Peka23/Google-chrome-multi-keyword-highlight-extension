// background.js

chrome.runtime.onMessage.addListener(
    function(data,request, sender, sendResponse) {
      if (request.action === "updateContent") {
        // Send a message to the content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "executeUpdate"});
        });
      }
    }
  );
