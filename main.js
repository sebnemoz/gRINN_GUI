const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const si = require('systeminformation'); // Ensure `npm install systeminformation`

let open; // Placeholder for the dynamically imported `open` module
// Disable hardware acceleration based on GPU detection
(async () => {
  try {
    const graphics = await si.graphics();
    const hasDedicatedGPU = graphics.controllers.some(
      (controller) => controller.vram > 0 && controller.vendor.toLowerCase() !== 'microsoft' // Exclude basic adapters
    );

    if (!hasDedicatedGPU) {
      console.log("No dedicated GPU detected. Disabling hardware acceleration.");
      app.disableHardwareAcceleration(); // Must be called before `app.whenReady()`
    } else {
      console.log("Dedicated GPU detected. Running with hardware acceleration.");
    }
  } catch (error) {
    console.error("Error detecting GPU:", error);
    app.disableHardwareAcceleration(); // Fallback to software acceleration
  }

  // App initialization
  app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
})();

// Function to create the main window
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    icon: 'images/icon.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
}

// Handle workflow execution
ipcMain.on('run-workflow', (event, args) => {
  const parsedArgs = JSON.parse(args);
  console.log('Data received in main process:', parsedArgs);

  const python = spawn('python3', ['python/call_grinn.py', JSON.stringify(parsedArgs)]);

  python.stdout.on('data', (data) => {
    console.log(`Python output: ${data}`);
    event.reply('workflow-log', data.toString());
  });

  python.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  python.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
});

// Folder dialog handlers
ipcMain.on('open-folder-dialog', async (event) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(focusedWindow, { properties: ['openDirectory'] });

  if (result.filePaths?.length) {
    const selectedFolderPath = result.filePaths[0];
    const isEmpty = fs.readdirSync(selectedFolderPath).length === 0;

    if (!isEmpty) {
      event.sender.send('folder-not-empty-warning', selectedFolderPath);
    } else {
      event.sender.send('selected-output-folder', result.filePaths);
    }
  }
});

// Generalized folder selection
const folderDialogs = {
  'open-mdp-folder-dialog': 'selected-mdp-folder',
  'open-ff-folder-dialog': 'selected-ff-folder',
  'open-toppar-folder-dialog': 'selected-toppar-folder',
};

for (const [eventName, replyName] of Object.entries(folderDialogs)) {
  ipcMain.on(eventName, async (event) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(focusedWindow, { properties: ['openDirectory'] });

    if (result.filePaths?.length) {
      event.sender.send(replyName, result.filePaths);
    }
  });
}

// GMXRC selection
ipcMain.on('open-gmxrc-dialog', async (event) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(focusedWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Executable Files', extensions: ['*'] }],
  });

  if (result.filePaths?.length) {
    event.sender.send('selected-gmxrc-path', result.filePaths);
  }
});

// Back button handler
ipcMain.on('navigate-to-index', (event) => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.loadFile('index.html');
  }
});

// Results button handler
ipcMain.on('open-output-folder', async (event, folderPath) => {
  try {
    if (open) {
      await open(folderPath);
      console.log(`Successfully opened folder: ${folderPath}`);
    } else {
      throw new Error('Failed to load the open module.');
    }
  } catch (err) {
    console.error(`Failed to open folder: ${err}`);
    event.sender.send('open-folder-error', `Could not open folder: ${err.message}`);
  }
});
