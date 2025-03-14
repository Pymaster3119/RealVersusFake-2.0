chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scan",
    title: "Scan this image for AI-generated content",
    contexts: ["image"]
  });
});

async function isImageAI(imageUrl) {
  const response = await fetch('https://realversusfake2-0-backend.onrender.com/check-image', {
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
    isImageAI(image).then(output => {
      console.log(output.score);
      console.log(output.is_ai_generated);

      // Inject content script to display the results using the new scripting API
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: displayResults,
        args: [output.score, output.is_ai_generated]
      });
    }).catch(error => {
      console.error('Error:', error);
    });
  }
});

function displayResults(score, isAIGenerated) {
  const iframe = document.createElement('iframe');
  iframe.id = 'result-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '10px';
  iframe.style.right = '10px';
  iframe.style.zIndex = '10000';
  iframe.style.border = 'none';
  iframe.style.width = '400px';
  iframe.style.height = '250px';
  
  //Create the confidence bar
  var confidenceBar = "[";
  for (let i = 0; i < score * 50; i++) {
    confidenceBar += "|";
  }
  for (let i = 0; i < 50 - score * 50; i++) {
    confidenceBar += "-";
  }
  confidenceBar += "]";
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
          <h1 class="text-primary">This image looks ${isAIGenerated ? 'AI generated' : 'human made'}</h1>
          <p>We are ${score * 100}% sure!</p>
          <p>${confidenceBar}</p>
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