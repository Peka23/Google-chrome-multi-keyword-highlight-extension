chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "highlight") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.scripting.executeScript({
              target: {tabId: tabs[0].id},
              function: highlightTextOnPage,
              args: [request.text]
          });
      });
  } else if (request.action === "toggleHighlight") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (request.state) {
              chrome.scripting.executeScript({
                  target: {tabId: tabs[0].id},
                  function: highlightTextOnPage,
                  args: [request.text] // Use the text from the message payload
              });
          } else {
              chrome.scripting.executeScript({
                  target: {tabId: tabs[0].id},
                  function: clearHighlights
              });
          }
      });
  }
});

function clearHighlights() {
  const highlighted = document.querySelectorAll('span[style*="background-color"]');
  highlighted.forEach(span => {
      span.outerHTML = span.innerText; // Remove the span, leaving the text
  });
}

function highlightTextOnPage(text) {
  const colors = ['green', 'yellow', 'orange', 'cyan', 'pink'];
  const keywords = text.split(/\s+/); // Split the input text by spaces to get individual words
  let colorIndex = 0;

  keywords.forEach((keyword) => {
      if (keyword.trim() !== '') { // Check if the keyword is not just empty spaces
          const color = colors[colorIndex % colors.length];
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi'); // Use word boundaries to ensure whole words are matched
          document.body.innerHTML = document.body.innerHTML.replace(regex, `<span style="background-color: ${color};">${keyword}</span>`);
          colorIndex++; // Increment to use the next color for the next keyword
      }
  });
}