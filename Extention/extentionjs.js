chrome.storage.local.get(["activelyFiltering"], (result) => {
    if (result.activelyFiltering === undefined) {
        console.log("Initializing to protected");
        chrome.storage.local.set({ activelyFiltering: true }, () => {});
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("toggleSwitch");
    const statusText = document.getElementById("status");

    chrome.storage.local.get(['activelyFiltering'], (result) => {
        if (result.activelyFiltering) {
            toggleSwitch.setAttribute("data-state", "off");
            statusText.textContent = `You are not protected`;
        } else {
            toggleSwitch.setAttribute("data-state", "on");
            statusText.textContent = `You are being protected`;
        }
    });

    toggleSwitch.addEventListener("click", () => {
        const isOn = toggleSwitch.getAttribute("data-state") === "on";
        toggleSwitch.setAttribute("data-state", isOn ? "off" : "on");
        statusText.textContent = `You are ${isOn ? "not protected" : "being protected"}`;
        chrome.storage.local.set({ "activelyFiltering": isOn }, () => {
            console.log('Successfully saved!');
        });
    });
});

// Global conversation array
let messages = [];

function updateChatIframe() {
    const iframe = document.getElementById('gpt-iframe');
    // Build the HTML for messages
    const messagesHTML = messages.map(msg => {
        const role = msg.role === 'assistant' ? 'GPT' : 'User';
        const bubbleClass = msg.role === 'assistant' ? 'gpt' : 'user';
        return `<div class="bubble ${bubbleClass}">
                    <strong>${role}:</strong> ${msg.content}
                </div>`;
    }).join('');
    
    // Update the iframe srcdoc with Bootstrap styling.
    // The button now contains an inline SVG send icon.
    iframe.srcdoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <style>
          body {
            margin: 0;
            padding: 10px;
            background-color: #f9f9f9;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .chat-container {
            display: flex;
            flex-direction: column;
            max-height: 450px;
            min-height: 450px;
            overflow-y: auto;
          }
          .bubble {
            padding: 10px;
            margin: 5px 0;
            border-radius: 15px;
            word-wrap: break-word;
          }
          .user {
            background-color: #d0e6ff;
            align-self: flex-end;
          }
          .gpt {
            background-color: #e2e2e2;
            align-self: flex-start;
          }
          .followup-container {
            margin-top: auto;
          }
        </style>
      </head>
      <body>
          <div class="chat-container" id="chatContainer">
            ${messagesHTML}
          </div>
          <div class="followup-container mt-3">
            <div class="d-flex">
              <input type="text" id="iframeFollowupInput" class="form-control" placeholder="Enter your follow-up question">
              <button id="iframeFollowupButton" class="btn btn-primary ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.878 2.144a.75.75 0 0 0-.85-.15L1.713 10.313a.75.75 0 0 0 .023 1.406l5.883 2.343 2.343 5.883a.75.75 0 0 0 1.406.023l8.32-20.315a.75.75 0 0 0-.11-.509l-.01-.01zM9.612 18.04l-1.713-4.303 5.592-5.592-6.718 4.27-4.303-1.713 17.35-7.093-7.093 17.35z"/>
                </svg>
              </button>
            </div>
          </div>
          <script src="iframeScript.js"></script>
      </body>
    </html>
    `;
}

// Helper function to create the iframe only once
function createChatIframe() {
    if (!document.getElementById('gpt-iframe')) {
        const iframe = document.createElement('iframe');
        iframe.id = 'gpt-iframe';
        iframe.style.position = 'fixed';
        iframe.style.top = '0px';
        iframe.style.right = '0px';
        iframe.style.zIndex = '10000';
        iframe.style.border = 'none';
        iframe.style.width = '400px';
        iframe.style.height = '600px'; // increased height to fit follow-up area
        document.body.appendChild(iframe);
    }
}

// Handle initial conversation via chatgptButton
document.getElementById("chatgptButton").addEventListener("click", async () => {
    console.log("ChatGPT button clicked!");
    const userprompt = document.getElementById("chatgptInput").value;
    
    // Create the iframe when the first message is sent
    createChatIframe();
    
    // Reset conversation and add initial user prompt
    messages = [];
    messages.push({ role: 'user', content: userprompt });
    //Give the backend a port
    const idc = await fetch('http://127.0.0.1:8080/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hi:"hi" })
    });
    const dat = await idc.json();
    console.log(dat);

    // Call your chatgpt endpoint with the current conversation
    const response = await fetch('http://127.0.0.1:8080/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: userprompt, messages: messages }),
        mode: 'cors'
    });
  
    const data = await response.json();
    messages.push({ role: 'assistant', content: data.response });
    
    // Update the iframe with the conversation and follow-up input
    updateChatIframe();
});

// Listen for follow-up messages from the iFrame
window.addEventListener("message", async (event) => {
    if (event.data && event.data.followup) {
        const followupText = event.data.followup;
        // Append follow-up message
        messages.push({ role: 'user', content: followupText });
        
        // Send updated conversation to endpoint
        const response = await fetch('http://127.0.0.1:8080/chatgpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_prompt: followupText, messages: messages }),
            mode: 'cors'
        });
        const data = await response.json();
        messages.push({ role: 'assistant', content: data.response });
        
        // Update the iframe with the new conversation state
        updateChatIframe();
    }
});

chrome.runtime.onMessageExternal.addListener(
    async (request, sender, sendResponse) => {
        if (request.trigger === 'take_screenshot' && request.callback_url) {
            console.log("Received screenshot trigger from backend.");
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                const screenshotUrl = await chrome.tabs.captureTab(tab.id);
                const base64Image = screenshotUrl.split(",")[1];
                await fetch(request.callback_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ screenshot: base64Image })
                });
                sendResponse({ message: "Screenshot taken and sent." });
            } catch (err) {
                sendResponse({ error: err.toString() });
            }
        }
    }
);