const { ipcRenderer } = require('electron');
const topInput = document.getElementById('top');

topInput.addEventListener('change', function () {
  if (this.files.length > 0) {
    this.style.color = 'black'; // Change text color to black if a file is selected
  } else {
    this.style.color = 'transparent'; // Reset to transparent if no file is selected
  }
});

const trajInput = document.getElementById('traj');
trajInput.addEventListener('change', function () {
  if (this.files.length > 0) {
    this.style.color = 'black'; // Change text color to black if a file is selected
  } else {
    this.style.color = 'transparent'; // Reset to transparent if no file is selected
  }
});
// Variable to store selected output folder path
let outFolderPath = "";

// Function to display the custom alert
function showCustomAlert(message) {
  // Get the modal and message elements
  const modal = document.getElementById('customAlert');
  const modalMessage = document.getElementById('modalMessage');
  const closeModal = document.getElementById('closeModal');
  const confirmBtn = document.getElementById('confirmBtn');

  // Set the message
  modalMessage.textContent = message;

  // Show the modal
  modal.style.display = "flex";

  // Hide modal on close button or confirm button click
  closeModal.onclick = () => (modal.style.display = "none");
  confirmBtn.onclick = () => (modal.style.display = "none");

  // Hide modal when clicking outside the modal content
  window.onclick = function (event) {
      if (event.target === modal) {
          modal.style.display = "none";
      }
  };
}

// Add event listener for folder selection
document.getElementById('selectOutputFolder').addEventListener('click', () => {
    // Request the main process to show the open dialog
    ipcRenderer.send('open-folder-dialog');
});

// Listen for the selected folder path sent from the main process
ipcRenderer.on('selected-output-folder', (event, folderPath) => {
    if (folderPath && folderPath.length > 0) {
        outFolderPath = folderPath[0];  // Store the selected folder path
        document.getElementById('output').innerText = `Output Folder: ${outFolderPath}`;
    }
});
// Listen for warning if the folder is not empty
ipcRenderer.on('folder-not-empty-warning', (event, folderPath) => {
  showCustomAlert(`Warning: The selected folder (${folderPath}) is not empty. Please choose an empty folder or clear it.`);
});

//results button to open output folder

document.getElementById('resultsButton').addEventListener('click', () => {
  if (outFolderPath) {
    ipcRenderer.send('open-output-folder', outFolderPath);
  } else {
    console.error('Output folder path is not specified.');
  }
});

// Clear button functionality
document.getElementById('clearButton').addEventListener('click', () => {
  // Clear all file inputs
  topparFolderPath = null;
  outFolderPath = null;
  
  document.getElementById('customForceFieldName').value = '';
  // Reset dropdown to default
  const ffFolder = document.getElementById('ffFolder');
  ffFolder.value = 'amber99sb-ildn'; // Reset to the default option value
  // Reset other inputs to their default values if needed
  document.getElementById('nt').value = 4; // Reset to default threads
  document.getElementById('gmxrcPath').value = '/usr/local/gromacs/bin/GMXRC'; // Reset GMXRC Path
  // Reset checkboxes
  document.getElementById('nofixpdb').checked = false;
  document.getElementById('solvate').checked = false;
  document.getElementById('npt').checked = false;
  document.getElementById('lig').checked = false;
  document.getElementById('existing').checked = false;
  //hide custom forcefield input
  document.getElementById('customForceFieldName').style.display = 'none';
  document.getElementById('ligGroRow').style.display = 'none';
  document.getElementById('ligItpRow').style.display = 'none';
  document.getElementById('topRow').style.display = 'none';
  document.getElementById('trajRow').style.display = 'none';
  document.getElementById('topparRow').style.display = 'none';
  document.getElementById('includeFilesRow').style.display = 'none';
  // Clear displayed paths
  document.getElementById('output').innerText = '';
  // Clear log output
  document.getElementById('logOutput').innerText = '';
});
document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = 'index.html'; // Navigate back to index.html
});
document.getElementById("helpButton").addEventListener("click", () => {
  window.location.href = "help.html"; // Create a help.html page for documentation
});
document.getElementById("creditsButton").addEventListener("click", () => {
  window.location.href = "credits.html"; // Create a credits.html page
});

// Variable to store the selected force field name
let ffFolderPath = "";

// Handle the change event for the force field dropdown
document.getElementById('ffFolder').addEventListener('change', function() {
  const selectedValue = this.value;

  if (selectedValue === "custom") {
    // Show alert instructing the user to place the force field in the GROMACS default directory
    showCustomAlert("Please place your custom force field folder in the GROMACS default directory (/gromacs/share/gromacs/top/) and write the force field name in the box.");
    ffFolderPath = "custom" // Indicate that "custom" is selected

    // Display the input for entering the custom force field name
    document.getElementById('customForceFieldName').style.display = 'inline-block';
    
  } else {
    // Hide the custom name input if a predefined force field is selected
    document.getElementById('customForceFieldName').style.display = 'none';
    document.getElementById('customForceFieldName').value = ""; // Clear custom name input
    ffFolderPath = selectedValue; // Store the selected force field name
  }
});
// Add event listener for browsing the GMXRC path
document.getElementById('browseGmxrcPath').addEventListener('click', () => {
  // Request the main process to show the open dialog for files
  ipcRenderer.send('open-gmxrc-dialog');
});

// Listen for the selected GMXRC path sent from the main process
ipcRenderer.on('selected-gmxrc-path', (event, filePath) => {
  if (filePath && filePath.length > 0) {
      document.getElementById('gmxrcPath').value = filePath[0]; // Update the input field with the selected path
  }
});

document.getElementById("lig").addEventListener("change", function() {
  const isChecked = this.checked;
  document.getElementById("ligGroRow").style.display = isChecked ? "table-row" : "none";
  document.getElementById("ligItpRow").style.display = isChecked ? "table-row" : "none";
});

document.getElementById("existing").addEventListener("change", function() {
  const isChecked = this.checked;
  document.getElementById("topRow").style.display = isChecked ? "table-row" : "none";
  document.getElementById("topparRow").style.display = isChecked ? "table-row" : "none";
  document.getElementById("trajRow").style.display = isChecked ? "table-row" : "none";
  document.getElementById("includeFilesRow").style.display = isChecked ? "table-row" : "none";
});
// Variable to store selected toppar folder path
let topparFolderPath = "";
// Add event listener for toppar folder selection
document.getElementById('selectTopparFolder').addEventListener('click', () => {
  // Request the main process to show the open dialog
  ipcRenderer.send('open-toppar-folder-dialog');
});
// Listen for the selected folder path sent from the main process
ipcRenderer.on('selected-toppar-folder', (event, folderPath) => {
  if (folderPath && folderPath.length > 0) {
      topparFolderPath = folderPath[0];  // Store the selected folder path
      document.getElementById('topparOutput').innerText = `Toppar Folder: ${topparFolderPath}`;
  }
});
// Handle the form submission
document.getElementById('workflowForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const pdbFile = "demo/3HTB.pdb";
  const mdpFolderPath = "demo/mdp";
  const ffFolder = document.getElementById('ffFolder').value === 'custom' ? document.getElementById('customForceFieldName').value: document.getElementById('ffFolder').value; // Defaults to amber99sb-ildn
  const initPairFilterCutoff = parseFloat(document.getElementById('initPairFilterCutoff').value); // Parse as float
  const nofixpdb = document.getElementById('nofixpdb').checked;
  const top = document.getElementById('top').files[0]?.path;
  const traj = document.getElementById('traj').files[0]?.path;
  const solvate = document.getElementById('solvate').checked;
  const npt = document.getElementById('npt').checked;
  const sourceSel = document.getElementById('sourceSel').value;
  const targetSel = document.getElementById('targetSel').value;
  const lig = document.getElementById('lig').checked;
  const ligGroFile = "demo/jz4.gro";
  const ligItpFile = "demo/jz4.itp";
  const nt = parseInt(document.getElementById('nt').value); // Parse as integer
  const gmxrcPath = document.getElementById('gmxrcPath').value;
  const noconsoleHandler = document.getElementById('noconsoleHandler').checked;
  const includeFiles = Array.from(document.getElementById('includeFiles').files).map(file => file.path);

 
  // Ensure the selected output folder path is used
  const args = {
    pdb_file: pdbFile,
    mdp_files_folder: mdpFolderPath,
    out_folder: outFolderPath,  // Use the selected folder path
    ff_folder: ffFolder,
    init_pair_filter_cutoff: initPairFilterCutoff, 
    nofixpdb,
    top,
    toppar: topparFolderPath,
    traj,
    solvate,
    npt,
    source_sel: sourceSel,
    target_sel: targetSel,
    lig,
    lig_gro_file: ligGroFile,
    lig_itp_file: ligItpFile,
    nt,
    gmxrc_path: gmxrcPath,
    noconsole_handler: noconsoleHandler,
    include_files: includeFiles,
  };
  if (!outFolderPath) {
    // Warn the user if no folder is selected
    showCustomAlert('Please select an output folder before proceeding.');
  } else {
    // Proceed with the process
    console.log("Data being sent to Python:", JSON.stringify(args));
    ipcRenderer.send('run-workflow', JSON.stringify(args));
  }

});

 // Handle log messages from Python and display them in the HTML
ipcRenderer.on('workflow-log', (event, logMessage) => {
  const logContainer = document.getElementById('logOutput');  
  logContainer.textContent = "";  // Clear previous log message
  const logEntry = document.createElement('p');
  logEntry.textContent = logMessage;
  logEntry.classList.add("log-entry"); // Add a class for styling
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
});




// Function to open a modal by ID
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

// Function to close a modal by ID
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Close modal if clicked outside of the content
window.onclick = function(event) {
  const sourceModal = document.getElementById('sourceModal');
  const targetModal = document.getElementById('targetModal');
  
  if (event.target == sourceModal) {
    sourceModal.style.display = 'none';
  }
  if (event.target == targetModal) {
    targetModal.style.display = 'none';
  }
}


