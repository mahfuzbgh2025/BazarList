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
const addListBtn = document.getElementById('addListBtn');
const listsContainer = document.getElementById('listsContainer');
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
const database = firebase.database();

// Data structure to hold all the lists and items
let bazarLists = [];
let trash = [];
let archivedLists = [];

// --- Helper Functions ---

// Function to save data to local storage
function saveToLocalStorage() {
  localStorage.setItem('bazarLists', JSON.stringify(bazarLists));
  localStorage.setItem('bazarTrash', JSON.stringify(trash));
  localStorage.setItem('bazarArchived', JSON.stringify(archivedLists));
  updateTotalCost();

  // Check if user is logged in, then save to Firebase
  const user = firebase.auth().currentUser;
  if (user) {
    saveToFirebase(user.uid);
  }
}

// Function to save data to Firebase
function saveToFirebase(uid) {
    if (uid) {
        database.ref('users/' + uid).set({
            lists: bazarLists,
            trash: trash,
            archived: archivedLists
        })
        .then(() => {
            console.log('Data saved to Firebase successfully.');
        })
        .catch((error) => {
            console.error('Error saving data:', error);
        });
    }
}

// Function to load data from Firebase
function loadDataFromFirebase(uid) {
    database.ref('users/' + uid).once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                bazarLists = data.lists || [];
                trash = data.trash || [];
                archivedLists = data.archived || [];
                renderAllLists();
                console.log('Data loaded from Firebase.');
            }
        })
        .catch((error) => {
            console.error('Error loading data:', error);
        });
}

// Function to update the overall total cost display
function updateTotalCost() {
  const total = bazarLists.reduce((sum, list) => {
    return sum + list.items.reduce((itemSum, item) => {
      return itemSum + (parseFloat(item.price) || 0);
    }, 0);
  }, 0);
  totalAmountSpan.textContent = total.toFixed(2);
}

// Update UI based on user login status
function updateUI(user) {
    console.log('updateUI function called. User:', user);
    if (user) {
        console.log('User is signed in. Email:', user.email);
        signInBtn.style.display = 'none';
        signOutBtn.style.display = 'inline-block';
        userDisplayName.textContent = user.displayName || 'লগইন করা হয়েছে';
        userEmail.textContent = user.email;
    } else {
        console.log('User is signed out.');
        signInBtn.style.display = 'inline-block';
        signOutBtn.style.display = 'none';
        userDisplayName.textContent = 'লগইন করুন';
        userEmail.textContent = '';
    }
}

// --- Main Rendering Functions ---

function renderList(list) {
  const listDiv = document.createElement('div');
  listDiv.className = 'list';
  listDiv.id = list.id;

  // Calculate total price for this specific list
  const listTotal = list.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  listDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2>${list.name}</h2>
      <div class="dropdown">
        <button class="dropbtn">⋮</button>
        <div class="dropdown-content">
          <button class="edit-list-name-btn" data-list-id="${list.id}">নাম পরিবর্তন</button>
          <button class="pdf-btn" data-list-id="${list.id}">📄 PDF ডাউনলোড</button>
          <button class="delete-list-btn" data-list-id="${list.id}">🗑️ লিস্ট ডিলিট</button>
        </div>
      </div>
    </div>
    <form class="item-form">
      <input type="text" placeholder="পণ্যের নাম" required>
      <input type="text" placeholder="পরিমাণ" style="width: 15%;">
      <input type="number" placeholder="দাম (টাকা)" required>
      <input type="date" placeholder="তারিখ">
      <button type="submit">➕ যোগ করুন</button>
    </form>
    <ul></ul>
    <div style="text-align: right; margin-top: 10px;">
      <h4>মোট খরচ: ${listTotal.toFixed(2)} টাকা</h4>
      <button class="archive-list-btn" data-list-id="${list.id}">✓ আর্কাইভ</button>
    </div>
  `;
  
  const form = listDiv.querySelector('.item-form');
  const itemsList = listDiv.querySelector('ul');
  
  // Event listener for the 3-dot dropdown menu
  listDiv.querySelector('.dropbtn').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents document click from closing it immediately
    listDiv.querySelector('.dropdown-content').classList.toggle('show');
  });

  // Event listeners for dropdown menu actions
  listDiv.querySelector('.edit-list-name-btn').addEventListener('click', (e) => {
    const listId = e.target.dataset.listId;
    const listToEdit = bazarLists.find(l => l.id === listId);
    const newName = prompt("লিস্টের নতুন নাম লিখুন:", listToEdit.name);
    if (newName) {
      listToEdit.name = newName;
      saveToLocalStorage();
      renderAllLists();
    }
  });

  listDiv.querySelector('.pdf-btn').addEventListener('click', (e) => {
    const listId = e.target.dataset.listId;
    downloadPDF(listId);
  });

  listDiv.querySelector('.delete-list-btn').addEventListener('click', (e) => {
    const listId = e.target.dataset.listId;
    if (confirm('আপনি কি এই লিস্টটি মুছে ফেলতে চান?')) {
      moveToTrash(listId, 'list');
    }
  });

  // Event listener for archiving the list
  listDiv.querySelector('.archive-list-btn').addEventListener('click', (e) => {
    const listId = e.target.dataset.listId;
    archiveList(listId);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const [nameInput, quantityInput, priceInput, dateInput] = e.target.querySelectorAll('input');
    addItemToList(list.id, nameInput.value, quantityInput.value, priceInput.value, dateInput.value);
    e.target.reset();
  });
  
  list.items.forEach(item => {
    renderItem(itemsList, item);
  });
  
  listsContainer.appendChild(listDiv);
}

function renderItem(parentListElement, item) {
  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <div class="item-details">
      <span>${item.name} (${item.quantity}) - ${item.price} টাকা</span>
      <div class="item-meta">তারিখ: ${item.date}</div>
    </div>
    <div class="item-buttons">
      <button class="edit-btn" data-item-id="${item.id}">🖊️</button>
      <button class="delete-btn" data-item-id="${item.id}">❌</button>
    </div>
  `;
  
  listItem.querySelector('.delete-btn').addEventListener('click', () => {
    moveToTrash(item.id, 'item');
  });
  
  listItem.querySelector('.edit-btn').addEventListener('click', () => {
    showEditModal(item);
  });

  parentListElement.appendChild(listItem);
}

function renderAllLists() {
  listsContainer.innerHTML = '';
  bazarLists.forEach(list => renderList(list));
  updateTotalCost();
}

function renderArchive() {
  listsContainer.innerHTML = '<h2>আর্কাইভ করা লিস্টসমূহ</h2>';
  if (archivedLists.length === 0) {
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
      list.items.forEach(item => renderItem(itemsList, item));
      listsContainer.appendChild(listDiv);
    });
  }
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
    renderAllLists();
  }
});

openSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
});

closeSidebarBtn.addEventListener('click', () => {
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
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log('User signed in successfully:', user.email);
            // After successful sign-in, load user data and update UI
            loadDataFromFirebase(user.uid);
            updateUI(user);
        })
        .catch((error) => {
            console.error('Sign-in failed:', error);
            // Handle specific errors like "auth/popup-closed-by-user"
        });
});

signOutBtn.addEventListener('click', () => {
    firebase.auth().signOut()
        .then(() => {
            console.log('User signed out.');
            bazarLists = [];
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

// --- New Features Logic ---

function addItemToList(listId, itemName, itemQuantity, itemPrice, itemDate) {
  const list = bazarLists.find(l => l.id === listId);
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
    renderAllLists();
  }
}

function moveToTrash(itemId, type) {
  if (type === 'item') {
    let itemToMove;
    bazarLists.forEach(list => {
      const itemIndex = list.items.findIndex(item => item.id === itemId);
      if (itemIndex > -1) {
        itemToMove = list.items.splice(itemIndex, 1)[0];
        if (itemToMove) {
          trash.push(itemToMove);
        }
      }
    });
  } else if (type === 'list') {
    const listIndex = bazarLists.findIndex(list => list.id === itemId);
    if (listIndex > -1) {
      const listToMove = bazarLists.splice(listIndex, 1)[0];
      trash.push(listToMove);
    }
  }
  
  alert('আইটেমটি ট্র্যাশে সরানো হয়েছে।');
  saveToLocalStorage();
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
    renderAllLists();
    renderTrashItems();
  }
}

function permanentDeleteItem(itemId) {
  trash = trash.filter(item => item.id !== itemId);
  saveToLocalStorage();
  renderTrashItems();
}

function archiveList(listId) {
  const listIndex = bazarLists.findIndex(list => list.id === listId);
  if (listIndex > -1) {
    const listToArchive = bazarLists.splice(listIndex, 1)[0];
    archivedLists.push(listToArchive);
    alert('লিস্টটি আর্কাইভ করা হয়েছে!');
    saveToLocalStorage();
    renderAllLists();
  }
}

function restoreListFromArchive(listId) {
  const listIndex = archivedLists.findIndex(list => list.id === listId);
  if (listIndex > -1) {
    const restoredList = archivedLists.splice(listIndex, 1)[0];
    bazarLists.push(restoredList);
    saveToLocalStorage();
    renderAllLists();
  }
}

// --- Edit Modal Functionality ---
function showEditModal(item) {
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
    
    const list = bazarLists.find(l => l.items.find(i => i.id === item.id));
    if (list) {
      const existingItem = list.items.find(i => i.id === item.id);
      existingItem.name = newName;
      existingItem.quantity = newQuantity;
      existingItem.price = newPrice;
      existingItem.date = formatDate(new Date(newDate));
      saveToLocalStorage();
      renderAllLists();
    }
    editModal.style.display = 'none';
  };
  
  editModal.querySelector('.close-btn').onclick = () => {
    editModal.style.display = 'none';
  };
}

// --- PDF Download Functionality ---
function downloadPDF(listId) {
  const list = bazarLists.find(l => l.id === listId);
  if (!list) return;

  // Check for internet connection before downloading
  if (!navigator.onLine) {
    alert("পিডিএফ ডাউনলোড করার জন্য ইন্টারনেট সংযোগ প্রয়োজন।");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  
  doc.setFont('NotoSansBengaliNormal', 'normal');
  
  doc.setFontSize(16);
  doc.text(`বাজারের তালিকা: ${list.name}`, 10, y);
  y += 10;

  let totalListPrice = 0;
  
  doc.setFontSize(12);
  doc.text('আইটেমসমূহ:', 10, y);
  y += 10;
  
  list.items.forEach(item => {
    doc.text(`- ${item.name} (${item.quantity}) - ${item.price} টাকা | তারিখ: ${item.date}`, 15, y);
    totalListPrice += parseFloat(item.price) || 0;
    y += 7;
  });

  doc.setFontSize(14);
  y += 5;
  doc.text(`মোট খরচ: ${totalListPrice.toFixed(2)} টাকা`, 10, y);
  y += 10;

  doc.save(`${list.name}.pdf`);
}
// --- Import/Export Functionality ---

exportBtn.addEventListener('click', () => {
  // Check for internet connection before exporting
  if (!navigator.onLine) {
    alert("ডেটা এক্সপোর্ট করার জন্য ইন্টারনেট সংযোগ প্রয়োজন।");
    return;
  }

  const dataToExport = {
    bazarLists: bazarLists,
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
  // Check for internet connection before importing
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
        if (importedData.bazarLists && importedData.trash && importedData.archivedLists) {
          bazarLists = importedData.bazarLists;
          trash = importedData.trash;
          archivedLists = importedData.archivedLists;
          saveToLocalStorage();
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
        trash = [];
        archivedLists = [];
        saveToLocalStorage();
        renderAllLists();
        alert('সমস্ত ডেটা সফলভাবে মুছে ফেলা হয়েছে।');
        settingsModal.style.display = 'none';
    }
});


// --- Initial Setup ---

function initializeApp() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('Authentication state changed: User is logged in.', user.email);
            updateUI(user);
            loadDataFromFirebase(user.uid);
        } else {
            console.log('Authentication state changed: User is logged out.');
            updateUI(null);
            const storedData = localStorage.getItem('bazarLists');
            if (storedData) {
                bazarLists = JSON.parse(storedData);
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

document.addEventListener('DOMContentLoaded', initializeApp);
