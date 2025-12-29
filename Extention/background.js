chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scan",
    title: "Scan this image for AI-generated content",
    contexts: ["image"]
  });
});

async function checkImage(imageUrl) {
  const response = await fetch('http://127.0.0.1:8080/check-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image_url: imageUrl }),
    mode: 'cors'
  });
  const data = await response.json();
  return data;
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "scan") {
    console.log("Scan option clicked!");
    const image = info.srcUrl;
    checkImage(image).then(output => {
      console.log(output.score);
      console.log(output.is_ai_generated);
      console.log(output.is_deceptive_graph);

      // Inject content script to display the results using the new scripting API
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: displayResults,
        args: [output.score, output.is_ai_generated, output.is_deceptive_graph]
      });
    }).catch(error => {
      console.error('Error:', error);
    });
  }
});

function displayResults(score, isAIGenerated, isDeceptiveGraph) {
  const iframe = document.createElement('iframe');
  iframe.id = 'result-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '10px';
  iframe.style.right = '10px';
  iframe.style.zIndex = '10000';
  iframe.style.border = 'none';
  iframe.style.width = '400px';
  iframe.style.height = '300px'; // Increased height for additional content
  
  //Create the confidence bar
  var confidenceBar = "[";
  for (let i = 0; i < score * 50; i++) {
    confidenceBar += "|";
  }
  for (let i = 0; i < 50 - score * 50; i++) {
    confidenceBar += "-";
  }
  confidenceBar += "]";
  
  // Determine the content based on detection results
  let mainTitle = '';
  let titleClass = 'text-primary';
  let additionalInfo = '';
  
  if (isAIGenerated && isDeceptiveGraph) {
    mainTitle = 'AI Generated & Deceptive Chart Detected!';
    titleClass = 'text-danger';
    additionalInfo = '<div class="alert alert-warning mt-2"><strong>Warning:</strong> This image appears to be both AI-generated and contains a misleading chart.</div>';
  } else if (isAIGenerated) {
    mainTitle = 'This image looks AI generated';
    titleClass = 'text-primary';
  } else if (isDeceptiveGraph) {
    mainTitle = 'Deceptive Chart Detected!';
    titleClass = 'text-warning';
    additionalInfo = '<div class="alert alert-warning mt-2"><strong>Chart Warning:</strong> This chart may contain misleading visual elements.</div>';
  } else {
    mainTitle = 'This image looks human made';
    titleClass = 'text-success';
  }
  
  iframe.srcdoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
          crossorigin="anonymous">
        <style>
          body { margin: 0; padding: 15px; background-color: white; position: relative; }
          #close-btn { position: absolute; top: 5px; right: 5px; }
          .content-wrapper {
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 15px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 90%;
              position: relative;
              min-height: 200px;
              overflow: hidden;
              margin-top: 10px;
              margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <button id="close-btn" class="btn btn-danger btn-sm">X</button>
        <div class="content-wrapper">
          <h1 class="${titleClass}">${mainTitle}</h1>
          <p>We are ${Math.round(score * 100)}% confident!</p>
          <p><code>${confidenceBar}</code></p>
          ${additionalInfo}
        </div>
      </body>
    </html>
  `;
  
  // Append the iframe and then attach the event listener once loaded
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    const btn = iframe.contentDocument.getElementById('close-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        // Instead of inline scripting, send a message from the iframe to the parent.
        window.postMessage({action: 'closeIframe'}, '*');
      });
    }
  };
}

setInterval(async () => {
  try {
    // Poll your backend for trigger
    const response = await fetch("http://127.0.0.1:8080/get_trigger", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();

    if (data.trigger === "take_screenshot" && data.callback_url) {
      console.log("Polling: trigger found. Taking screenshot...");
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      // Use captureVisibleTab instead; supply tab.windowId
      const screenshotUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
      const base64Image = screenshotUrl.split(",")[1];

      await fetch(data.callback_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshot: base64Image })
      });
      console.log("Screenshot taken and sent.");

      // Optionally notify backend to clear the trigger
      await fetch("http://127.0.0.1:8080/clear_trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "take_screenshot" })
      });
    }
  } catch (err) {
    console.error("Error polling for trigger:", err);
  }
}, 1000);