// A simple function to generate a unique ID
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
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
      // Use parseFloat to handle potential non-numeric input
      return itemSum + (parseFloat(item.price) || 0);
    }, 0);
  }, 0);
  totalAmountSpan.textContent = total.toFixed(2);
}

// --- Main Rendering Functions ---

// Renders an individual list and its items to the DOM
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

// Renders a single item inside a list
function renderItem(parentListElement, item) {
  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <span>${item.name} (${item.quantity}) - ${item.price} টাকা</span>
    <button class="delete-item-btn" data-item-id="${item.id}">❌</button>
  `;
  listItem.querySelector('.delete-item-btn').addEventListener('click', () => {
    deleteItem(item.id);
  });
  parentListElement.appendChild(listItem);
}

// Renders all lists from the data array
function renderAllLists() {
  listsContainer.innerHTML = '';
  bazarLists.forEach(list => renderList(list));
  updateTotalCost();
}

// --- Event Handlers ---

// Adds a new list
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

// Adds a new item to a specific list
function addItemToList(listId, itemName, itemQuantity, itemPrice) {
  const list = bazarLists.find(l => l.id === listId);
  if (list) {
    const newItem = {
      id: generateId(),
      name: itemName,
      quantity: itemQuantity,
      price: itemPrice
    };
    list.items.push(newItem);
    saveToLocalStorage();
    renderAllLists();
  }
}

// Deletes an item
function deleteItem(itemId) {
  bazarLists.forEach(list => {
    list.items = list.items.filter(item => item.id !== itemId);
  });
  saveToLocalStorage();
  renderAllLists();
}

// Deletes a list
listsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-list-btn')) {
    const listId = e.target.dataset.listId;
    bazarLists = bazarLists.filter(list => list.id !== listId);
    saveToLocalStorage();
    renderAllLists();
  }
});

// --- Import/Export Functionality ---

// Export data to a JSON file
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

// Import data from a JSON file
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

// Load data from local storage on app start
function initializeApp() {
  const storedData = localStorage.getItem('bazarLists');
  if (storedData) {
    bazarLists = JSON.parse(storedData);
  }
  renderAllLists();
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
