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
const showTrashBtn = document.getElementById('showTrashBtn');
const trashModal = document.getElementById('trashModal');
const trashItemsContainer = document.getElementById('trashItemsContainer');
const editModal = document.getElementById('editModal');

// Data structure to hold all the lists and items, and a separate array for trash
let bazarLists = [];
let trash = [];

// --- Helper Functions ---

// Function to save data to local storage
function saveToLocalStorage() {
  localStorage.setItem('bazarLists', JSON.stringify(bazarLists));
  localStorage.setItem('bazarTrash', JSON.stringify(trash));
  updateTotalCost();
}

// Function to update the total cost display
function updateTotalCost() {
  const total = bazarLists.reduce((sum, list) => {
    return sum + list.items.reduce((itemSum, item) => {
      return itemSum + (parseFloat(item.price) || 0);
    }, 0);
  }, 0);
  totalAmountSpan.textContent = total.toFixed(2);
}

// --- Main Rendering Functions ---

function renderList(list) {
  const listDiv = document.createElement('div');
  listDiv.className = 'list';
  listDiv.id = list.id;
  listDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2>${list.name}</h2>
      <div class="list-actions">
        <button class="pdf-btn" data-list-id="${list.id}">📄 PDF</button>
        <button class="delete-list-btn" data-list-id="${list.id}">🗑️</button>
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
  `;
  
  const form = listDiv.querySelector('.item-form');
  const itemsList = listDiv.querySelector('ul');
  
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
    moveToTrash(item.id);
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

// --- Event Handlers ---

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

function addItemToList(listId, itemName, itemQuantity, itemPrice, itemDate) {
  const list = bazarLists.find(l => l.id === listId);
  if (list) {
    // If no date is provided, use the current date
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

// --- Trash functionality ---
function moveToTrash(itemId) {
  let itemToMove;
  bazarLists.forEach(list => {
    const itemIndex = list.items.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      itemToMove = list.items.splice(itemIndex, 1)[0];
    }
  });

  if (itemToMove) {
    trash.push(itemToMove);
    alert('আইটেমটি ট্র্যাশে সরানো হয়েছে।');
    saveToLocalStorage();
    renderAllLists();
  }
}

showTrashBtn.addEventListener('click', () => {
  renderTrashItems();
  trashModal.style.display = 'block';
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
    trashItemDiv.innerHTML = `
      <span>${item.name} (${item.price} টাকা) - ${item.date}</span>
      <div class="item-buttons">
        <button class="restore-btn" data-item-id="${item.id}">♻️ ফিরিয়ে আনুন</button>
        <button class="permanent-delete-btn" data-item-id="${item.id}">❌ স্থায়ীভাবে মুছুন</button>
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
  if (e.target.classList.contains('restore-btn')) {
    const itemId = e.target.dataset.itemId;
    restoreItemFromTrash(itemId);
  } else if (e.target.classList.contains('permanent-delete-btn')) {
    const itemId = e.target.dataset.itemId;
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

function permanentDeleteItem(itemId) {
  trash = trash.filter(item => item.id !== itemId);
  saveToLocalStorage();
  renderTrashItems();
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
listsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('pdf-btn')) {
    const listId = e.target.dataset.listId;
    downloadPDF(listId);
  }
});

function downloadPDF(listId) {
  const list = bazarLists.find(l => l.id === listId);
  if (!list) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  
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
  const dataToExport = {
    bazarLists: bazarLists,
    trash: trash
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
  importFile.click();
});

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.bazarLists && importedData.trash) {
          bazarLists = importedData.bazarLists;
          trash = importedData.trash;
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

// --- Initial Setup ---

function initializeApp() {
  const storedData = localStorage.getItem('bazarLists');
  if (storedData) {
    bazarLists = JSON.parse(storedData);
  }
  const storedTrash = localStorage.getItem('bazarTrash');
  if (storedTrash) {
    trash = JSON.parse(storedTrash);
  }
  renderAllLists();
}

document.addEventListener('DOMContentLoaded', initializeApp);
