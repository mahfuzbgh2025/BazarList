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

// Data structure to hold all the lists and items
let bazarLists = [];

// --- Helper Functions ---

// Function to save data to local storage
function saveToLocalStorage() {
  localStorage.setItem('bazarLists', JSON.stringify(bazarLists));
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
      <button class="delete-list-btn" data-list-id="${list.id}">🗑️</button>
    </div>
    <form class="item-form">
      <input type="text" placeholder="পণ্যের নাম" required>
      <input type="text" placeholder="পরিমাণ" style="width: 15%;">
      <input type="number" placeholder="দাম (টাকা)" required>
      <button type="submit">➕ যোগ করুন</button>
    </form>
    <ul></ul>
  `;
  
  const form = listDiv.querySelector('.item-form');
  const itemsList = listDiv.querySelector('ul');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const [nameInput, quantityInput, priceInput] = e.target.querySelectorAll('input');
    addItemToList(list.id, nameInput.value, quantityInput.value, priceInput.value);
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
    deleteItem(item.id);
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

function addItemToList(listId, itemName, itemQuantity, itemPrice) {
  const list = bazarLists.find(l => l.id === listId);
  if (list) {
    const newItem = {
      id: generateId(),
      name: itemName,
      quantity: itemQuantity,
      price: itemPrice,
      date: formatDate(new Date()) // Add current date here
    };
    list.items.push(newItem);
    saveToLocalStorage();
    renderAllLists();
  }
}

function deleteItem(itemId) {
  bazarLists.forEach(list => {
    list.items = list.items.filter(item => item.id !== itemId);
  });
  saveToLocalStorage();
  renderAllLists();
}

listsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-list-btn')) {
    const listId = e.target.dataset.listId;
    bazarLists = bazarLists.filter(list => list.id !== listId);
    saveToLocalStorage();
    renderAllLists();
  }
});

// --- Edit Modal Functionality ---
function showEditModal(item) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <h3>পণ্য পরিবর্তন করুন</h3>
      <input type="text" id="editName" value="${item.name}">
      <input type="text" id="editQuantity" value="${item.quantity}">
      <input type="number" id="editPrice" value="${item.price}">
      <button id="saveEditBtn">সেভ করুন</button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = 'block';

  modal.querySelector('.close-btn').addEventListener('click', () => {
    modal.style.display = 'none';
    modal.remove();
  });
  
  modal.querySelector('#saveEditBtn').addEventListener('click', () => {
    const newName = modal.querySelector('#editName').value;
    const newQuantity = modal.querySelector('#editQuantity').value;
    const newPrice = modal.querySelector('#editPrice').value;

    const list = bazarLists.find(l => l.items.find(i => i.id === item.id));
    if (list) {
      const existingItem = list.items.find(i => i.id === item.id);
      existingItem.name = newName;
      existingItem.quantity = newQuantity;
      existingItem.price = newPrice;
      saveToLocalStorage();
      renderAllLists();
    }

    modal.style.display = 'none';
    modal.remove();
  });
}

// --- Import/Export Functionality ---

exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(bazarLists, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bazarlist_backup.json';
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
        if (Array.isArray(importedData)) {
          bazarLists = importedData;
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
  renderAllLists();
}

document.addEventListener('DOMContentLoaded', initializeApp);
