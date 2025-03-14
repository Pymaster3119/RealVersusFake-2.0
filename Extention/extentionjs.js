chrome.storage.local.get(["activelyFiltering"], (result) => {
    if (result.activelyFiltering === undefined)
    {
        console.log("Initializing to protected");
        chrome.storage.local.set({activelyFiltering: true},() => {});
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("toggleSwitch");
    const statusText = document.getElementById("status");
    
    chrome.storage.local.get(['activelyFiltering'], (result) => {
        if (result.activelyFiltering) {
            toggleSwitch.setAttribute("data-state", true ? "off" : "on");
            statusText.textContent = `You are ${true ? "not protected" : "being protected"}`;
        } else {
            toggleSwitch.setAttribute("data-state", false ? "off" : "on");
            statusText.textContent = `You are ${false ? "not protected" : "being protected"}`;
        }
    });

    toggleSwitch.addEventListener("click", () => {
        const isOn = toggleSwitch.getAttribute("data-state") === "on";
        toggleSwitch.setAttribute("data-state", isOn ? "off" : "on");
        statusText.textContent = `You are ${isOn ? "not protected" : "being protected"}`;
        chrome.storage.local.set({"activelyFiltering": isOn}, () => {
            console.log('Successfully saved!');
        });
    });
});