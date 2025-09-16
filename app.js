// A simple function to generate a unique ID
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
const totalAmountSpan = document.getElementById('totalAmount');
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
const sidebarHeader = document.getElementById('sidebarHeader');
const themeButtons = document.querySelectorAll('.theme-btn');

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

// Enable offline persistence
firebase.database().ref().keepSynced(true);

// Data structure to hold all the lists and items
let bazarLists = [];
let dokanBakiiLists = [];
let billPaymentsLists = [];
let trash = [];
let archivedLists = [];

// --- Helper Functions ---

// Function to save data to a specific Firebase path
function saveToFirebase(path, data) {
    if (userId) {
        database.ref('users/' + userId + '/' + path).set(data)
        .then(() => {
            // Optional: Log success
        })
        .catch((error) => {
            console.error('Data save error:', error.message);
        });
    }
}

// Function to save data to local storage
function saveToLocalStorage() {
  localStorage.setItem('bazarLists', JSON.stringify(bazarLists));
  localStorage.setItem('dokanBakiiLists', JSON.stringify(dokanBakiiLists));
  localStorage.setItem('billPaymentsLists', JSON.stringify(billPaymentsLists));
  localStorage.setItem('bazarTrash', JSON.stringify(trash));
  localStorage.setItem('bazarArchived', JSON.stringify(archivedLists));
  updateTotalCost();
}

// Function to update the overall total cost display
function updateTotalCost() {
  const total = bazarLists.reduce((sum, list) => {
    return sum + list.items.reduce((itemSum, item) => {
      return itemSum + (parseFloat(item.price) || 0);
    }, 0);
  }, 0);
  const dokanTotal = dokanBakiiLists.reduce((sum, list) => {
    return sum + list.items.reduce((itemSum, item) => {
      return itemSum + (parseFloat(item.price) || 0);
    }, 0);
  }, 0);
  const billTotal = billPaymentsLists.reduce((sum, list) => {
    return sum + list.items.reduce((itemSum, item) => {
      return itemSum + (parseFloat(item.price) || 0);
    }, 0);
  }, 0);

  totalAmountSpan.textContent = (total + dokanTotal + billTotal).toFixed(2);
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

  const listTotal = list.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  let totalLabel;
  let formHTML;
  let archiveButtonHTML = '';
  
  if (containerId === 'dokanBakiiContainer') {
      totalLabel = 'মোট বাকি';
      formHTML = `
      <form class="item-form" data-list-id="${list.id}" data-container-id="${containerId}">
          <input type="text" placeholder="পণ্যের নাম" required>
          <input type="text" placeholder="পরিমাণ" style="width: 15%;">
          <input type="number" placeholder="দাম (টাকা)" required>
          <input type="date" placeholder="তারিখ">
          <button type="submit">➕</button>
      </form>
      `;
  } else if (containerId === 'billPaymentContainer') {
      totalLabel = 'মোট বিল';
      formHTML = `
      <form class="item-form" data-list-id="${list.id}" data-container-id="${containerId}">
          <input type="text" placeholder="বিলের নাম" required>
          <input type="text" placeholder="পণ্যের নাম">
          <input type="number" placeholder="দাম (টাকা)" required>
          <input type="date" placeholder="তারিখ">
          <button type="submit">➕</button>
      </form>
      `;
  } else {
      totalLabel = 'মোট খরচ';
      formHTML = `
      <form class="item-form" data-list-id="${list.id}" data-container-id="${containerId}">
          <input type="text" placeholder="পণ্যের নাম" required>
          <input type="text" placeholder="পরিমাণ" style="width: 15%;">
          <input type="number" placeholder="দাম (টাকা)" required>
          <input type="date" placeholder="তারিখ">
          <button type="submit">➕</button>
      </form>
      `;
      archiveButtonHTML = `<button class="archive-list-btn" data-list-id="${list.id}">✓ আর্কাইভ</button>`;
  }

  const imageDisplayHTML = list.imageURL ? `<img src="${list.imageURL}" alt="${list.name}" class="item-image" style="margin-top: 10px;">` : '';

  listDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2>${list.name}</h2>
      <div class="dropdown">
        <button class="dropbtn">⋮</button>
        <div class="dropdown-content">
          <button class="edit-list-name-btn" data-list-id="${list.id}" data-container-id="${containerId}">নাম পরিবর্তন</button>
          ${list.imageURL ? `<button class="view-image-btn" data-image-url="${list.imageURL}">🖼️ ছবি দেখুন</button>` : ''}
          ${containerId === 'dokanBakiiContainer' ? `<label for="image-upload-${list.id}" class="image-upload-label">
              <input type="file" id="image-upload-${list.id}" class="dokan-image-edit-input" data-list-id="${list.id}" accept="image/*" style="display:none;">
              <i class="fas fa-camera"></i> ছবি পরিবর্তন
          </label>` : ''}
          <button class="pdf-btn" data-list-id="${list.id}" data-container-id="${containerId}">📄 PDF ডাউনলোড</button>
          <button class="delete-list-btn" data-list-id="${list.id}" data-container-id="${containerId}">🗑️ লিস্ট ডিলিট</button>
        </div>
      </div>
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
  
  listDiv.querySelector('.dropbtn').addEventListener('click', (e) => {
    e.stopPropagation();
    listDiv.querySelector('.dropdown-content').classList.toggle('show');
  });

  listDiv.querySelector('.edit-list-name-btn').addEventListener('click', (e) => {
    const listId = e.target.dataset.listId;
    const containerId = e.target.dataset.containerId;
    let listToEdit = [];
    if (containerId === 'listsContainer') {
      listToEdit = bazarLists.find(l => l.id === listId);
    } else if (containerId === 'dokanBakiiContainer') {
      listToEdit = dokanBakiiLists.find(l => l.id === listId);
    } else {
      listToEdit = billPaymentsLists.find(l => l.id === listId);
    }
    const newName = prompt("লিস্টের নতুন নাম লিখুন:", listToEdit.name);
    if (newName) {
      listToEdit.name = newName;
      saveToLocalStorage();
      saveToFirebase(getFirebasePath(containerId), getListArray(containerId));
      renderAllLists();
    }
  });

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
    let listToDownload = [];
    if (containerId === 'listsContainer') {
      listToDownload = bazarLists.find(l => l.id === listId);
    } else if (containerId === 'dokanBakiiContainer') {
      listToDownload = dokanBakiiLists.find(l => l.id === listId);
    } else {
      listToDownload = billPaymentsLists.find(l => l.id === listId);
    }
    downloadPDF(listToDownload, containerId);
  });

  listDiv.querySelector('.delete-list-btn').addEventListener('click', (e) => {
    const listId = e.target.dataset.listId;
    const containerId = e.target.dataset.containerId;
    if (confirm('আপনি কি এই লিস্টটি মুছে ফেলতে চান?')) {
      moveToTrash(listId, 'list', containerId);
    }
  });

  if (containerId === 'listsContainer') {
    const archiveButton = listDiv.querySelector('.archive-list-btn');
    if (archiveButton) {
        archiveButton.addEventListener('click', (e) => {
            const listId = e.target.dataset.listId;
            archiveList(listId);
        });
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const listId = e.target.dataset.listId;
      const containerId = e.target.dataset.containerId;
      const nameInput = e.target.querySelector('input[type="text"]');
      const quantityInput = e.target.querySelector('input[placeholder="পরিমাণ"]');
      const priceInput = e.target.querySelector('input[type="number"]');
      const dateInput = e.target.querySelector('input[type="date"]');
      
      addItemToList(listId, nameInput.value, quantityInput ? quantityInput.value : null, priceInput.value, dateInput.value, containerId);
      e.target.reset();
    });
  }
  
  if (list.items) {
    list.items.forEach(item => {
      renderItem(itemsList, item, containerId);
    });
  }
  
  const targetContainer = document.getElementById(containerId);
  if (targetContainer) {
    targetContainer.appendChild(listDiv);
  }
}

function renderItem(parentListElement, item, containerId) {
  const listItem = document.createElement('li');
  
  listItem.innerHTML = `
    <div class="item-details">
      <span>${item.name} (${item.quantity || 'N/A'}) - ${item.price} টাকা</span>
      <div class="item-meta">তারিখ: ${item.date}</div>
    </div>
    <div class="item-buttons">
      <button class="edit-btn" data-item-id="${item.id}" data-container-id="${containerId}">🖊️</button>
      <button class="delete-btn" data-item-id="${item.id}" data-container-id="${containerId}">❌</button>
    </div>
  `;
  
  listItem.querySelector('.delete-btn').addEventListener('click', () => {
    moveToTrash(item.id, 'item', containerId);
  });
  
  listItem.querySelector('.edit-btn').addEventListener('click', () => {
    showEditModal(item, containerId);
  });

  parentListElement.appendChild(listItem);
}

function renderAllLists() {
  listsContainer.innerHTML = '';
  dokanBakiiContainer.innerHTML = '';
  billPaymentContainer.innerHTML = '';
  if (bazarLists) bazarLists.forEach(list => renderList(list, 'listsContainer'));
  if (dokanBakiiLists) dokanBakiiLists.forEach(list => renderList(list, 'dokanBakiiContainer'));
  if (billPaymentsLists) billPaymentsLists.forEach(list => renderList(list, 'billPaymentContainer'));
  updateTotalCost();
}

function renderArchive() {
  listsContainer.innerHTML = '<h2>আর্কাইভ করা লিস্টসমূহ</h2>';
  if (!archivedLists || archivedLists.length === 0) {
    listsContainer.innerHTML += '<p style="text-align: center;">আর্কাইভ খালি আছে।</p>';
  } else {
    archivedLists.forEach(list => {
      const listDiv = document.createElement('div');
      listDiv.className = 'list';
      listDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>${list.name} (আর্কাইভ)</h2>
          <button class="restore-list-btn" data-list-id="${list.id}">♻️ ফিরিয়ে আনুন</button>
        </div>
        <ul></ul>
      `;
      const itemsList = listDiv.querySelector('ul');
      if (list.items) {
          list.items.forEach(item => renderItem(itemsList, item, 'listsContainer'));
      }
      listsContainer.appendChild(listDiv);
    });
  }
}

// Helper function to get the Firebase path and local array based on container ID
function getFirebasePath(containerId) {
    if (containerId === 'listsContainer') return 'lists';
    if (containerId === 'dokanBakiiContainer') return 'dokanBakii';
    if (containerId === 'billPaymentContainer') return 'billPayments';
    return '';
}

function getListArray(containerId) {
    if (containerId === 'listsContainer') return bazarLists;
    if (containerId === 'dokanBakiiContainer') return dokanBakiiLists;
    if (containerId === 'billPaymentContainer') return billPaymentsLists;
    return [];
}

// --- Event Handlers ---
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

addListBtn.addEventListener('click', () => {
  const listName = listNameInput.value.trim();
  if (listName) {
    const newList = {
      id: generateId(),
      name: listName,
      items: []
    };
    bazarLists.push(newList);
    listNameInput.value = '';
    saveToLocalStorage();
    saveToFirebase('lists', bazarLists);
    renderAllLists();
  }
});

addDokanBakiiBtn.addEventListener('click', () => {
  const dokanName = dokanNameInput.value.trim();
  const dokanImageFile = dokanImageInput.files[0];

  if (dokanName) {
    const newDokan = {
      id: generateId(),
      name: dokanName,
      imageURL: null,
      items: []
    };

    if (dokanImageFile) {
        uploadDokanImage(newDokan.id, dokanImageFile, () => {
            dokanBakiiLists.push(newDokan);
            dokanNameInput.value = '';
            dokanImageInput.value = '';
            saveToLocalStorage();
            saveToFirebase('dokanBakii', dokanBakiiLists);
            renderAllLists();
        });
    } else {
        dokanBakiiLists.push(newDokan);
        dokanNameInput.value = '';
        saveToLocalStorage();
        saveToFirebase('dokanBakii', dokanBakiiLists);
        renderAllLists();
    }
  }
});


addBillPaymentBtn.addEventListener('click', () => {
  const billName = billNameInput.value.trim();
  if (billName) {
    const newBill = {
      id: generateId(),
      name: billName,
      items: []
    };
    billPaymentsLists.push(newBill);
    billNameInput.value = '';
    saveToLocalStorage();
    saveToFirebase('billPayments', billPaymentsLists);
    renderAllLists();
  }
});

openSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
});

closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
});

showBazarListBtn.addEventListener('click', () => {
    bazarListSection.style.display = 'block';
    dokanBakiiSection.style.display = 'none';
    billPaymentSection.style.display = 'none';
    showBazarListBtn.classList.add('active');
    showDokanBakiiBtn.classList.remove('active');
    showBillPaymentBtn.classList.remove('active');
    renderAllLists();
    sidebar.classList.remove('active');
});

showDokanBakiiBtn.addEventListener('click', () => {
    bazarListSection.style.display = 'none';
    dokanBakiiSection.style.display = 'block';
    billPaymentSection.style.display = 'none';
    showDokanBakiiBtn.classList.add('active');
    showBazarListBtn.classList.remove('active');
    showBillPaymentBtn.classList.remove('active');
    renderAllLists();
    sidebar.classList.remove('active');
});

showBillPaymentBtn.addEventListener('click', () => {
    bazarListSection.style.display = 'none';
    dokanBakiiSection.style.display = 'none';
    billPaymentSection.style.display = 'block';
    showBillPaymentBtn.classList.add('active');
    showBazarListBtn.classList.remove('active');
    showDokanBakiiBtn.classList.remove('active');
    renderAllLists();
    sidebar.classList.remove('active');
});

showArchiveBtn.addEventListener('click', () => {
  renderArchive();
  sidebar.classList.remove('active');
});

listsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('restore-list-btn')) {
    const listId = e.target.dataset.listId;
    restoreListFromArchive(listId);
  }
});

signInBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
});

signOutBtn.addEventListener('click', () => {
    firebase.auth().signOut()
        .then(() => {
            console.log('User signed out.');
            bazarLists = [];
            dokanBakiiLists = [];
            billPaymentsLists = [];
            trash = [];
            archivedLists = [];
            saveToLocalStorage();
            renderAllLists();
            updateUI(null);
        })
        .catch((error) => {
            console.error('Sign-out failed:', error);
        });
});

sidebarHeader.addEventListener('click', () => {
    if (userId) {
        saveToFirebase('lists', bazarLists);
        saveToFirebase('dokanBakii', dokanBakiiLists);
        saveToFirebase('billPayments', billPaymentsLists);
        saveToFirebase('trash', trash);
        saveToFirebase('archived', archivedLists);
    }
});

// --- New Features Logic ---
function uploadDokanImage(listId, file, callback) {
    const storageRef = storage.ref(`images/${userId}/${listId}-${file.name}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
        (snapshot) => {
            // Optional: Handle progress
        },
        (error) => {
            console.error("Image upload failed:", error);
            alert("ছবি আপলোড করতে ব্যর্থ হয়েছে।");
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                const dokanList = dokanBakiiLists.find(l => l.id === listId);
                if (dokanList) {
                    dokanList.imageURL = downloadURL;
                    saveToLocalStorage();
                    saveToFirebase('dokanBakii', dokanBakiiLists);
                    renderAllLists();
                    alert("ছবি সফলভাবে আপলোড হয়েছে এবং সেভ হয়েছে!");
                }
                if (callback) callback();
            });
        }
    );
}

function addItemToList(listId, itemName, itemQuantity, itemPrice, itemDate, containerId) {
  let targetListArray = getListArray(containerId);
  const list = targetListArray.find(l => l.id === listId);
  if (list) {
    const dateToSave = itemDate ? formatDate(new Date(itemDate)) : formatDate(new Date());
    const newItem = {
      id: generateId(),
      name: itemName,
      quantity: itemQuantity,
      price: itemPrice,
      date: dateToSave
    };
    list.items.push(newItem);
    saveToLocalStorage();
    saveToFirebase(getFirebasePath(containerId), targetListArray);
    renderAllLists();
  }
}

function moveToTrash(itemId, type, containerId) {
    if (type === 'item') {
        let itemToMove;
        let targetListArray = getListArray(containerId);
        targetListArray.forEach(list => {
            const itemIndex = list.items.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                itemToMove = list.items.splice(itemIndex, 1)[0];
                if (itemToMove) {
                    trash.push(itemToMove);
                }
            }
        });
    } else if (type === 'list') {
        let targetListArray = getListArray(containerId);
        const listIndex = targetListArray.findIndex(list => list.id === itemId);
        if (listIndex > -1) {
            const listToMove = targetListArray.splice(listIndex, 1)[0];
            trash.push(listToMove);
        }
    }
    
    alert('আইটেমটি ট্র্যাশে সরানো হয়েছে।');
    saveToLocalStorage();
    saveToFirebase(getFirebasePath(containerId), getListArray(containerId));
    saveToFirebase('trash', trash);
    renderAllLists();
}

showTrashBtn.addEventListener('click', () => {
  renderTrashItems();
  trashModal.style.display = 'block';
  sidebar.classList.remove('active');
});

function renderTrashItems() {
  trashItemsContainer.innerHTML = '';
  if (trash.length === 0) {
    trashItemsContainer.innerHTML = '<p style="text-align: center;">ট্র্যাশ খালি আছে।</p>';
    return;
  }
  trash.forEach(item => {
    const trashItemDiv = document.createElement('div');
    trashItemDiv.className = 'list-item';
    
    const isList = item.hasOwnProperty('items');
    const nameText = isList ? item.name : `${item.name} (${item.price} টাকা) - ${item.date}`;
    
    trashItemDiv.innerHTML = `
      <span>${nameText}</span>
      <div class="item-buttons">
        <button class="restore-btn" data-item-id="${item.id}" data-type="${isList ? 'list' : 'item'}">♻️ ফিরিয়ে আনুন</button>
        <button class="permanent-delete-btn" data-item-id="${item.id}" data-type="${isList ? 'list' : 'item'}">❌ স্থায়ীভাবে মুছুন</button>
      </div>
    `;
    trashItemsContainer.appendChild(trashItemDiv);
  });
}

trashModal.addEventListener('click', (e) => {
  if (e.target.classList.contains('close-btn') || e.target === trashModal) {
    trashModal.style.display = 'none';
  }
});

trashItemsContainer.addEventListener('click', (e) => {
  const itemId = e.target.dataset.itemId;
  const itemType = e.target.dataset.type;

  if (e.target.classList.contains('restore-btn')) {
    if (itemType === 'item') {
      restoreItemFromTrash(itemId);
    } else {
      restoreListFromTrash(itemId);
    }
  } else if (e.target.classList.contains('permanent-delete-btn')) {
    if (confirm('আপনি কি এই আইটেমটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      permanentDeleteItem(itemId);
    }
  }
});

function restoreItemFromTrash(itemId) {
  const itemIndex = trash.findIndex(item => item.id === itemId);
  if (itemIndex > -1) {
    const restoredItem = trash.splice(itemIndex, 1)[0];
    const defaultListName = 'Restored Items';
    let restoredList = bazarLists.find(list => list.name === defaultListName);
    if (!restoredList) {
      restoredList = { id: generateId(), name: defaultListName, items: [] };
      bazarLists.push(restoredList);
    }
    restoredList.items.push(restoredItem);
    saveToLocalStorage();
    saveToFirebase('trash', trash);
    saveToFirebase('lists', bazarLists);
    renderAllLists();
    renderTrashItems();
  }
}

function restoreListFromTrash(listId) {
  const listIndex = trash.findIndex(list => list.id === listId);
  if (listIndex > -1) {
    const restoredList = trash.splice(listIndex, 1)[0];
    bazarLists.push(restoredList);
    saveToLocalStorage();
    saveToFirebase('trash', trash);
    saveToFirebase('lists', bazarLists);
    renderAllLists();
    renderTrashItems();
  }
}

function permanentDeleteItem(itemId) {
  trash = trash.filter(item => item.id !== itemId);
  saveToLocalStorage();
  saveToFirebase('trash', trash);
  renderTrashItems();
}

function archiveList(listId) {
  const listIndex = bazarLists.findIndex(list => list.id === listId);
  if (listIndex > -1) {
    const listToArchive = bazarLists.splice(listIndex, 1)[0];
    archivedLists.push(listToArchive);
    alert('লিস্টটি আর্কাইভ করা হয়েছে!');
    saveToLocalStorage();
    saveToFirebase('lists', bazarLists);
    saveToFirebase('archived', archivedLists);
    renderAllLists();
  }
}

function restoreListFromArchive(listId) {
  const listIndex = archivedLists.findIndex(list => list.id === listId);
  if (listIndex > -1) {
    const restoredList = archivedLists.splice(listIndex, 1)[0];
    bazarLists.push(restoredList);
    saveToLocalStorage();
    saveToFirebase('archived', archivedLists);
    saveToFirebase('lists', bazarLists);
    renderAllLists();
  }
}

// --- Edit Modal Functionality ---
function showEditModal(item, containerId) {
  const editModal = document.getElementById('editModal');
  editModal.style.display = 'block';

  document.getElementById('editName').value = item.name;
  document.getElementById('editQuantity').value = item.quantity;
  document.getElementById('editPrice').value = item.price;
  document.getElementById('editDate').value = item.date.split('/').reverse().join('-');

  document.getElementById('saveEditBtn').onclick = () => {
    const newName = document.getElementById('editName').value;
    const newQuantity = document.getElementById('editQuantity').value;
    const newPrice = document.getElementById('editPrice').value;
    const newDate = document.getElementById('editDate').value;
    
    let targetListArray = getListArray(containerId);
    const list = targetListArray.find(l => l.items.find(i => i.id === item.id));
    if (list) {
      const existingItem = list.items.find(i => i.id === item.id);
      existingItem.name = newName;
      existingItem.quantity = newQuantity;
      existingItem.price = newPrice;
      existingItem.date = formatDate(new Date(newDate));
      saveToLocalStorage();
      saveToFirebase(getFirebasePath(containerId), targetListArray);
      renderAllLists();
    }
    editModal.style.display = 'none';
  };
  
  editModal.querySelector('.close-btn').onclick = () => {
    editModal.style.display = 'none';
  };
}

// --- PDF Download Functionality ---
function downloadPDF(list, containerId) {
  if (!list) return;

  if (!navigator.onLine) {
    alert("পিডিএফ ডাউনলোড করার জন্য ইন্টারনেট সংযোগ প্রয়োজন।");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  
  const title = containerId === 'dokanBakiiContainer' ? `বাকি: ${list.name}` : `বাজারের তালিকা: ${list.name}`;
  doc.setFontSize(16);
  doc.text(title, 10, y);
  y += 10;

  let totalListPrice = 0;
  
  doc.setFontSize(12);
  doc.text('আইটেমসমূহ:', 10, y);
  y += 10;
  
  if (list.items) {
      list.items.forEach(item => {
        doc.text(`- ${item.name} (${item.quantity || ''}) - ${item.price} টাকা | তারিখ: ${item.date}`, 15, y);
        if (item.imageURL) {
          doc.text(`ছবি: ${item.imageURL}`, 20, y + 5);
          y += 5;
        }
        totalListPrice += parseFloat(item.price) || 0;
        y += 7;
      });
  }

  doc.setFontSize(14);
  y += 5;
  const totalLabel = containerId === 'dokanBakiiContainer' ? 'মোট বাকি' : 'মোট খরচ';
  doc.text(`${totalLabel}: ${totalListPrice.toFixed(2)} টাকা`, 10, y);
  y += 10;

  doc.save(`${list.name}.pdf`);
}
// --- Import/Export Functionality ---

exportBtn.addEventListener('click', () => {
  if (!navigator.onLine) {
    alert("ডেটা এক্সপোর্ট করার জন্য ইন্টারনেট সংযোগ প্রয়োজন।");
    return;
  }

  const dataToExport = {
    bazarLists: bazarLists,
    dokanBakiiLists: dokanBakiiLists,
    billPaymentsLists: billPaymentsLists,
    trash: trash,
    archivedLists: archivedLists
  };
  const dataStr = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bazarlist_full_backup.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => {
  if (!navigator.onLine) {
    alert("ডেটা ইম্পোর্ট করার জন্য ইন্টারনেট সংযোগ প্রয়োজন।");
    return;
  }
  importFile.click();
});

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.bazarLists && importedData.dokanBakiiLists && importedData.billPaymentsLists && importedData.trash && importedData.archivedLists) {
          bazarLists = importedData.bazarLists;
          dokanBakiiLists = importedData.dokanBakiiLists;
          billPaymentsLists = importedData.billPaymentsLists;
          trash = importedData.trash;
          archivedLists = importedData.archivedLists;
          saveToLocalStorage();
          saveToFirebase('lists', bazarLists);
          saveToFirebase('dokanBakii', dokanBakiiLists);
          saveToFirebase('billPayments', billPaymentsLists);
          saveToFirebase('trash', trash);
          saveToFirebase('archived', archivedLists);
          renderAllLists();
          alert('ডেটা সফলভাবে ইম্পোর্ট করা হয়েছে!');
        } else {
          alert('ফাইলটি সঠিক ফরম্যাটে নেই।');
        }
      } catch (error) {
        alert('ফাইলটি পড়ার সময় একটি সমস্যা হয়েছে।');
      }
    };
    reader.readAsText(file);
  }
});

// --- Settings Modal Logic ---
openSettingsModalBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
    sidebar.classList.remove('active');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-btn') || e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

resetDataBtn.addEventListener('click', () => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।')) {
        bazarLists = [];
        dokanBakiiLists = [];
        billPaymentsLists = [];
        trash = [];
        archivedLists = [];
        saveToLocalStorage();
        if (userId) {
            database.ref('users/' + userId).remove();
        }
        renderAllLists();
        alert('সমস্ত ডেটা সফলভাবে মুছে ফেলা হয়েছে।');
        settingsModal.style.display = 'none';
    }
});

// --- Theme Changer Logic ---
function setAppTheme(theme) {
    document.body.className = '';
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'golden-dark') {
        document.body.classList.add('golden-dark-theme');
    }
    localStorage.setItem('appTheme', theme);
}

themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        setAppTheme(theme);
    });
});

// --- Initial Setup ---
function initializeApp() {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
        setAppTheme(savedTheme);
    }
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            userId = user.uid;
            console.log('Authentication state changed: User is logged in.', user.email);
            updateUI(user);
            loadAllData();
        } else {
            userId = null;
            console.log('Authentication state changed: User is logged out.');
            updateUI(null);
            const storedData = localStorage.getItem('bazarLists');
            if (storedData) {
                bazarLists = JSON.parse(storedData);
            }
            const storedDokanBakii = localStorage.getItem('dokanBakiiLists');
            if (storedDokanBakii) {
                dokanBakiiLists = JSON.parse(storedDokanBakii);
            }
            const storedBillPayments = localStorage.getItem('billPaymentsLists');
            if (storedBillPayments) {
                billPaymentsLists = JSON.parse(storedBillPayments);
            }
            const storedTrash = localStorage.getItem('bazarTrash');
            if (storedTrash) {
                trash = JSON.parse(storedTrash);
            }
            const storedArchived = localStorage.getItem('bazarArchived');
            if (storedArchived) {
                archivedLists = JSON.parse(storedArchived);
            }
            renderAllLists();
        }
    });
}

// Function to load all data from Firebase
function loadAllData() {
    if (!userId) return;

    // Load Bazar Lists (using 'on' for real-time updates)
    database.ref('users/' + userId + '/lists').on('value', (snapshot) => {
        bazarLists = snapshot.val() || [];
        renderAllLists();
    });

    // Load Dokan Bakii (using 'on' for real-time updates)
    database.ref('users/' + userId + '/dokanBakii').on('value', (snapshot) => {
        dokanBakiiLists = snapshot.val() || [];
        renderAllLists();
    });

    // Load Bill Payments (using 'on' for real-time updates)
    database.ref('users/' + userId + '/billPayments').on('value', (snapshot) => {
        billPaymentsLists = snapshot.val() || [];
        renderAllLists();
    });

    // Load Archive (using 'on' for real-time updates)
    database.ref('users/' + userId + '/archived').on('value', (snapshot) => {
        archivedLists = snapshot.val() || [];
    });

    // Load Trash (using 'on' for real-time updates)
    database.ref('users/' + userId + '/trash').on('value', (snapshot) => {
        trash = snapshot.val() || [];
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);

