// New global variables for settings modal
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const resetDataBtn = document.getElementById('resetDataBtn');

// Open the settings modal
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

// Close the settings modal
settingsModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-btn') || e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Reset all data
resetDataBtn.addEventListener('click', () => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।')) {
        bazarLists = [];
        trash = [];
        archivedLists = [];
        saveToLocalStorage(); // Save the empty arrays
        renderAllLists();
        alert('সমস্ত ডেটা সফলভাবে মুছে ফেলা হয়েছে।');
        settingsModal.style.display = 'none';
    }
});
