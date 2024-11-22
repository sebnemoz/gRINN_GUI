const { ipcRenderer } = require('electron');

// Handle the Back button click event
document.getElementById("backButton").addEventListener("click", () => {
  ipcRenderer.send("navigate-to-index");  // Send message to navigate back to index.html
});
