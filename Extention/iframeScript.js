console.log("iFrame loaded - setting up follow-up listener");
document.getElementById("iframeFollowupButton").addEventListener("click", () => {
    const input = document.getElementById("iframeFollowupInput");
    const text = input.value.trim();
    if (text) {
        console.log("Follow-up button clicked in iFrame with:", text);
        window.parent.postMessage({ followup: text }, "*");
        input.value = "";
    } else {
        console.log("Follow-up button clicked but text is empty");
    }
});