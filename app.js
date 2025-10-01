// A simple function to generate a unique ID (kept for backward compatibility with existing data)
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Function to format the date as 'DD/MM/YYYY'
function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// Global variables for DOM elements
const listNameInput = document.getElementById('listNameInput');
const dokanNameInput = document.getElementById('dokanNameInput');
const billNameInput = document.getElementById('billNameInput');
const dokanImageInput = document.getElementById('dokanImageInput');
const addListBtn = document.getElementById('addListBtn');
const addDokanBakiiBtn = document.getElementById('addDokanBakiiBtn');
const addBillPaymentBtn = document.getElementById('addBillPaymentBtn');
const listsContainer = document.getElementById('listsContainer');
const dokanBakiiContainer = document.getElementById('dokanBakiiContainer');
const billPaymentContainer = document.getElementById('billPaymentContainer');
const archivedListsContainer = document.getElementById('archivedListsContainer'); // New container for archived lists
const totalAmountSpan = document.getElementById('totalAmount'); // Now correctly identified
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const trashModal = document.getElementById('trashModal');
const trashItemsContainer = document.getElementById('trashItemsContainer');
const editModal = document.getElementById('editModal');
const settingsModal = document.getElementById('settingsModal');
const showTrashBtn = document.getElementById('showTrashBtn');
const showArchiveBtn = document.getElementById('showArchiveBtn');
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebar = document.getElementById('sidebar');
const openSettingsModalBtn = document.getElementById('openSettingsModalBtn');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userDisplayName = document.getElementById('userDisplayName');
const userEmail = document.getElementById('userEmail');
const resetDataBtn = document.getElementById('resetDataBtn');
const showBazarListBtn = document.getElementById('showBazarListBtn');
const showDokanBakiiBtn = document.getElementById('showDokanBakiiBtn');
const showBillPaymentBtn = document.getElementById('showBillPaymentBtn');
const bazarListSection = document.getElementById('bazarListSection');
const dokanBakiiSection = document.getElementById('dokanBakiiSection');
const billPaymentSection = document.getElementById('billPaymentSection');
const archiveSection = document.getElementById('archiveSection'); // New archive section reference
const sidebarHeader = document.getElementById('sidebarHeader');
const themeButtons = document.querySelectorAll('.theme-btn');
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.input-section'); // All sections for toggling

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBu9_s_myizAJNYBZLEb5DU4Hz-pFMMBoI", 
    authDomain: "bazarlist-c157c.firebaseapp.com",
    databaseURL: "https://bazarlist-c157c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bazarlist-c157c",
    storageBucket: "bazarlist-c157c.firebasestorage.app",
    messagingSenderId: "694772066634",
    appId: "1:694772066634:web:d85fb77c9b84b7bfc1b9b3",
    measurementId: "G-JE42BLD2RQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const provider = new firebase.auth.GoogleAuthProvider();
let userId = null;

// Enable offline persistence (মূল অফলাইন মোড)
firebase.database().ref().keepSynced(true);

// Data structure to hold all the lists and items
let bazarLists = [];
let dokanBakiiLists = [];
let billPaymentsLists = [];
let trash = [];
let archivedLists = [];

// --- Helper Functions ---
function getFirebasePath(containerId) {
    if (containerId === 'listsContainer') return 'lists';
    if (containerId === 'dokanBakiiContainer') return 'dokanBakii';
    if (containerId === 'billPaymentContainer') return 'billPayments';
    if (containerId === 'archivedListsContainer') return 'archived'; // For archived lists
    return '';
}

function getListArray(containerId) {
    if (containerId === 'listsContainer') return bazarLists;
    if (containerId === 'dokanBakiiContainer') return dokanBakiiLists;
    if (containerId === 'billPaymentContainer') return billPaymentsLists;
    if (containerId === 'archivedListsContainer') return archivedLists; // Return archivedLists for archive container
    return [];
}

// Function to save data to a specific Firebase path
// This is primarily for *initializing* or *overwriting* data.
// For adding/updating individual items, it's better to use specific Firebase ref operations.
function saveToFirebase(path, data) {
    if (userId) {
        database.ref('users/' + userId + '/' + path).set(data)
            .catch((error) => {
                console.error(`Firebase data save error for path ${path}:`, error.message);
            });
    }
}

// Function to save data to local storage (called after Firebase data updates)
function saveToLocalStorage() {
    localStorage.setItem('bazarLists', JSON.stringify(bazarLists));
    localStorage.setItem('dokanBakiiLists', JSON.stringify(dokanBakiiLists));
    localStorage.setItem('billPaymentsLists', JSON.stringify(billPaymentsLists));
    localStorage.setItem('bazarTrash', JSON.stringify(trash));
    localStorage.setItem('bazarArchived', JSON.stringify(archivedLists));
    updateTotalCost();
    // No need to call renderAllLists here, as it's triggered by Firebase 'on' listeners for main sections.
    // For archive/trash, render functions are called when their buttons are clicked.
}

// Function to update the overall total cost display
function updateTotalCost() {
    let total = 0;
    
    // Calculate total for bazar lists
    total += (bazarLists || []).reduce((sum, list) => {
        return sum + (list.items || []).reduce((itemSum, item) => {
            return itemSum + (parseFloat(item.price) || 0);
        }, 0);
    }, 0);

    // Calculate total for dokan bakii lists
    total += (dokanBakiiLists || []).reduce((sum, list) => {
        return sum + (list.items || []).reduce((itemSum, item) => {
            return itemSum + (parseFloat(item.price) || 0);
        }, 0);
    }, 0);

    // Calculate total for bill payments lists
    total += (billPaymentsLists || []).reduce((sum, list) => {
        return sum + (list.items || []).reduce((itemSum, item) => {
            return itemSum + (parseFloat(item.price) || 0);
        }, 0);
    }, 0);

    if (totalAmountSpan) {
        totalAmountSpan.textContent = total.toFixed(2);
    } else {
        console.error("Error: totalAmountSpan element not found.");
    }
}

// Update UI based on user login status
function updateUI(user) {
    if (user) {
        signInBtn.style.display = 'none';
        signOutBtn.style.display = 'inline-block';
        userDisplayName.textContent = user.displayName || 'লগইন করা হয়েছে';
        userEmail.textContent = user.email;
        sidebarHeader.classList.add('clickable-header');
    } else {
        signInBtn.style.display = 'inline-block';
        signOutBtn.style.display = 'none';
        userDisplayName.textContent = 'লগইন করুন';
        userEmail.textContent = '';
        sidebarHeader.classList.remove('clickable-header');
    }
}

// --- Main Rendering Functions ---
function renderList(list, containerId) {
    const listDiv = document.createElement('div');
    listDiv.className = 'list';
    listDiv.id = list.id;

    const listTotal = (list.items || []).reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    let totalLabel;
    let formHTML;
    let archiveButtonHTML = '';
    let dropdownContentButtons = `
        <button class="edit-list-name-btn" data-list-id="${list.id}" data-container-id="${containerId}">নাম পরিবর্তন</button>
        ${list.imageURL ? `<button class="view-image-btn" data-image-url="${list.imageURL}">🖼️ ছবি দেখুন</button>` : ''}
        ${containerId === 'dokanBakiiContainer' ? `<label for="image-upload-${list.id}" class="image-upload-label">
            <input type="file" id="image-upload-${list.id}" class="dokan-image-edit-input" data-list-id="${list.id}" accept="image/*" style="display:none;">
            <i class="fas fa-camera"></i> ছবি পরিবর্তন
        </label>` : ''}
        <button class="pdf-btn" data-list-id="${list.id}" data-container-id="${containerId}">📄 PDF ডাউনলোড</button>
    `;

    if (containerId === 'dokanBakiiContainer') {
        totalLabel = 'মোট বাকি';
        formHTML = `
        <form class="item-form" data-list-id="${list.id}" data-container-id="${containerId}">
            <input type="text" placeholder="পণ্যের নাম" required>
            <input type="text" placeholder="পরিমাণ" style="width: 15%;">
            <input type="number" placeholder="দাম (টাকা)" required>
            <input type="date">
            <button type="submit">➕</button>
        </form>
        `;
        dropdownContentButtons += `<button class="delete-list-btn" data-list-id="${list.id}" data-container-id="${containerId}">🗑️ লিস্ট ডিলিট</button>`;
    } else if (containerId === 'billPaymentContainer') {
        totalLabel = 'মোট বিল';
        formHTML = `
        <form class="item-form" data-list-id="${list.id}" data-container-id="${containerId}">
            <input type="text" placeholder="বিলের নাম" required>
            <input type="text" placeholder="পণ্যের নাম">
            <input type="number" placeholder="দাম (টাকা)" required>
            <input type="date">
            <button type="submit">➕</button>
        </form>
        `;
        dropdownContentButtons += `<button class="delete-list-btn" data-list-id="${list.id}" data-container-id="${containerId}">🗑️ লিস্ট ডিলিট</button>`;
    } else if (containerId === 'archivedListsContainer') {
        totalLabel = 'মোট খরচ';
        formHTML = ''; // No form for archived lists
        dropdownContentButtons = ''; // No dropdown for archived lists
        archiveButtonHTML = `<button class="restore-list-btn" data-list-id="${list.id}">♻️ ফিরিয়ে আনুন</button>`;
    } else { // listsContainer (Bazar List)
        totalLabel = 'মোট খরচ';
        formHTML = `
        <form class="item-form" data-list-id="${list.id}" data-container-id="${containerId}">
            <input type="text" placeholder="পণ্যের নাম" required>
            <input type="text" placeholder="পরিমাণ" style="width: 15%;">
            <input type="number" placeholder="দাম (টাকা)" required>
            <input type="date">
            <button type="submit">➕</button>
        </form>
        `;
        archiveButtonHTML = `<button class="archive-list-btn" data-list-id="${list.id}">✓ আর্কাইভ</button>`;
        dropdownContentButtons += `<button class="delete-list-btn" data-list-id="${list.id}" data-container-id="${containerId}">🗑️ লিস্ট ডিলিট</button>`;
    }

    const imageDisplayHTML = list.imageURL ? `<img src="${list.imageURL}" alt="${list.name}" class="item-image" style="margin-top: 10px;">` : '';

    listDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2>${list.name}</h2>
      ${containerId !== 'archivedListsContainer' ? `
      <div class="dropdown">
        <button class="dropbtn">⋮</button>
        <div class="dropdown-content">
          ${dropdownContentButtons}
        </div>
      </div>` : ''}
    </div>
    ${imageDisplayHTML}
    ${formHTML}
    <ul></ul>
    <div style="text-align: right; margin-top: 10px;">
      <h4>${totalLabel}: ${listTotal.toFixed(2)} টাকা</h4>
      ${archiveButtonHTML}
    </div>
  `;

    const form = listDiv.querySelector('.item-form');
    const itemsList = listDiv.querySelector('ul');

    const dropbtn = listDiv.querySelector('.dropbtn');
    if (dropbtn) {
        dropbtn.addEventListener('click', (e) => {
            e.stopPropagation();
            listDiv.querySelector('.dropdown-content').classList.toggle('show');
        });
    }

    const editListNameBtn = listDiv.querySelector('.edit-list-name-btn');
    if (editListNameBtn) {
        editListNameBtn.addEventListener('click', (e) => {
            const listId = e.target.dataset.listId;
            const currentListArray = getListArray(e.target.dataset.containerId);
            let listToEdit = currentListArray.find(l => l.id === listId);
            const newName = prompt("লিস্টের নতুন নাম লিখুন:", listToEdit.name);
            if (newName) {
                listToEdit.name = newName;
                if (userId) {
                    database.ref('users/' + userId + '/' + getFirebasePath(containerId) + '/' + listId).update({ name: newName });
                }
                saveToLocalStorage(); // Update local storage after Firebase sync (or directly if offline)
            }
        });
    }

    const viewImageBtn = listDiv.querySelector('.view-image-btn');
    if (viewImageBtn) {
        viewImageBtn.addEventListener('click', () => {
            const imageUrl = viewImageBtn.dataset.imageUrl;
            window.open(imageUrl, '_blank');
        });
    }

    const dokanImageEditInput = listDiv.querySelector('.dokan-image-edit-input');
    if (dokanImageEditInput) {
        dokanImageEditInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const listId = e.target.dataset.listId;
            if (file) {
                uploadDokanImage(listId, file);
            }
        });
    }

    listDiv.querySelector('.pdf-btn').addEventListener('click', (e) => {
        const listId = e.target.dataset.listId;
        const containerId = e.target.dataset.containerId;
        let listToDownload = getListArray(containerId).find(l => l.id === listId);
        downloadPDF(listToDownload, containerId);
    });

    const deleteListBtn = listDiv.querySelector('.delete-list-btn');
    if (deleteListBtn) {
        deleteListBtn.addEventListener('click', (e) => {
            const listId = e.target.dataset.listId;
            const containerId = e.target.dataset.containerId;
            if (confirm('আপনি কি এই লিস্টটি মুছে ফেলতে চান?')) {
                moveToTrash(listId, 'list', containerId);
            }
        });
    }

    if (containerId === 'listsContainer') {
        const archiveButton = listDiv.querySelector('.archive-list-btn');
        if (archiveButton) {
            archiveButton.addEventListener('click', (e) => {
                const listId = e.target.dataset.listId;
                archiveList(listId);
            });
        }
    } else if (containerId === 'archivedListsContainer') { // For archive section restore button
        const restoreButton = listDiv.querySelector('.restore-list-btn');
        if (restoreButton) {
            restoreButton.addEventListener('click', (e) => {
                const listId = e.target.dataset.listId;
                restoreListFromArchive(listId);
            });
        }
    }


    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const listId = e.target.dataset.listId;
            const containerId = e.target.dataset.containerId;
            const nameInput = e.target.querySelector('input[type="text"]:first-of-type');
            const quantityInput = e.target.querySelector('input[placeholder="পরিমাণ"]');
            const priceInput = e.target.querySelector('input[type="number"]');
            const dateInput = e.target.querySelector('input[type="date"]');

            addItemToList(listId, nameInput.value, quantityInput ? quantityInput.value : null, priceInput.value, dateInput.value, containerId);
            e.target.reset();
        });
    }

    (list.items || []).forEach(item => {
        renderItem(itemsList, item, containerId);
    });

    const targetContainer = document.getElementById(containerId);
    if (targetContainer) {
        targetContainer.appendChild(listDiv);
    }
}

function renderItem(parentListElement, item, containerId) {
    const listItem = document.createElement('li');
    listItem.id = `item-${item.id}`; // Add ID for easier removal/update

    listItem.innerHTML = `
    <div class="item-details">
      <span>${item.name} (${item.quantity || 'N/A'}) - ${item.price} টাকা</span>
      <div class="item-meta">তারিখ: ${item.date}</div>
    </div>
    <div class="item-buttons">
      <button class="edit-btn" data-item-id="${item.id}" data-container-id="${containerId}" data-list-id="${parentListElement.closest('.list').id}">🖊️</button>
      <button class="delete-btn" data-item-id="${item.id}" data-container-id="${containerId}" data-list-id="${parentListElement.closest('.list').id}">❌</button>
    </div>
  `;

    listItem.querySelector('.delete-btn').addEventListener('click', (e) => {
        const listId = e.target.dataset.listId;
        const itemId = e.target.dataset.itemId;
        const currentContainerId = e.target.dataset.containerId;
        moveToTrash(listId, itemId, 'item', currentContainerId);
    });

    listItem.querySelector('.edit-btn').addEventListener('click', (e) => {
        const listId = e.target.dataset.listId;
        const itemId = e.target.dataset.itemId;
        const currentContainerId = e.target.dataset.containerId;
        showEditModal(listId, itemId, currentContainerId);
    });

    parentListElement.appendChild(listItem);
}

// Renders all lists for the main sections. This will be triggered by Firebase 'on' listeners.
function renderAllLists() {
    listsContainer.innerHTML = '';
    dokanBakiiContainer.innerHTML = '';
    billPaymentContainer.innerHTML = '';
    archivedListsContainer.innerHTML = ''; // Clear archived container too

    if (bazarLists) bazarLists.forEach(list => renderList(list, 'listsContainer'));
    if (dokanBakiiLists) dokanBakiiLists.forEach(list => renderList(list, 'dokanBakiiContainer'));
    if (billPaymentsLists) billPaymentsLists.forEach(list => renderList(list, 'billPaymentContainer'));
    // Archived lists are rendered separately by renderArchive() when the button is clicked
    updateTotalCost();
}

function renderArchive() {
    archivedListsContainer.innerHTML = ''; // Clear current content
    if (!archivedLists || archivedLists.length === 0) {
        archivedListsContainer.innerHTML = '<p style="text-align: center; color: #555;">আর্কাইভ খালি আছে।</p>';
    } else {
        archivedLists.forEach(list => {
            renderList(list, 'archivedListsContainer'); // Use the common renderList, but specify archived container
        });
    }
}

// --- Event Handlers (প্রত্যেকটি বাটনের জন্য ইভেন্ট লিসনার আছে) ---
document.addEventListener('click', (e) => {
    if (!e.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
});

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        sections.forEach(sec => sec.classList.remove('active')); // Hide all sections
        sidebar.classList.remove('active'); // Close sidebar

        if (button.id === 'showBazarListBtn') {
            bazarListSection.classList.add('active');
            renderAllLists(); // Re-render main lists
        } else if (button.id === 'showDokanBakiiBtn') {
            dokanBakiiSection.classList.add('active');
            renderAllLists(); // Re-render main lists
        } else if (button.id === 'showBillPaymentBtn') {
            billPaymentSection.classList.add('active');
            renderAllLists(); // Re-render main lists
        } else if (button.id === 'showArchiveBtn') {
            archiveSection.classList.add('active');
            renderArchive(); // Render archived lists
        } else if (button.id === 'showTrashBtn') {
            trashModal.style.display = 'block';
            renderTrashItems(); // Render trash items
        } else if (button.id === 'openSettingsModalBtn') {
            settingsModal.style.display = 'block';
        }
    });
});

addListBtn.addEventListener('click', () => {
    const listName = listNameInput.value.trim();
    if (listName && userId) { // Ensure user is logged in
        const newListRef = database.ref('users/' + userId + '/lists').push();
        const newList = {
            id: newListRef.key,
            name: listName,
            items: []
        };
        newListRef.set(newList)
            .then(() => {
                listNameInput.value = '';
                // Data will be updated via Firebase 'on' listener
            })
            .catch(error => console.error("Error adding list:", error));
    } else if (!userId) {
        alert("লিস্ট যোগ করার জন্য অনুগ্রহ করে লগইন করুন।");
    }
});

addDokanBakiiBtn.addEventListener('click', () => {
    const dokanName = dokanNameInput.value.trim();
    const dokanImageFile = dokanImageInput.files[0];

    if (dokanName && userId) { // Ensure user is logged in
        const newDokanRef = database.ref('users/' + userId + '/dokanBakii').push();
        const newDokan = {
            id: newDokanRef.key,
            name: dokanName,
            imageURL: null,
            items: []
        };

        if (dokanImageFile) {
            uploadDokanImage(newDokan.id, dokanImageFile, (downloadURL) => {
                newDokan.imageURL = downloadURL;