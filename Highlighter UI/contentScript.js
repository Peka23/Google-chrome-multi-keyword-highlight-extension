// contentScript.js


function highlightText(keywords, color) {
    const bodyTextNodes = getTextNodesIn(document.body);
    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi'); // Regex to match the keyword globally and case-insensitively
        bodyTextNodes.forEach(node => {
            const matches = [...node.textContent.matchAll(regex)];
            if (matches.length > 0) {
                const newContent = document.createDocumentFragment();
                let lastIndex = 0;
                matches.forEach(match => {
                    const start = match.index;
                    const end = start + match[0].length;
                    newContent.appendChild(document.createTextNode(node.textContent.slice(lastIndex, start)));
                    const highlightSpan = document.createElement('span');
                    highlightSpan.style.backgroundColor = color;
                    highlightSpan.textContent = node.textContent.slice(start, end);
                    newContent.appendChild(highlightSpan);
                    lastIndex = end;
                });
                newContent.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
                node.parentNode.replaceChild(newContent, node);
            }
        });
    });
}

function getTextNodesIn(node) {
    let textNodes = [];
    if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
    } else {
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
            textNodes.push(...getTextNodesIn(children[i]));
        }
    }
    return textNodes;
}