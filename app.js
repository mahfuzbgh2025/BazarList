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
const dokanImageInput = document.getElementById('dokanImageInput'); // New
const billNameInput = document.getElementById('billNameInput');
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
const storage = firebase.storage();

// Data structure to hold all the lists and items
let bazarLists = [];
let dokanBakiiLists = [];
let billPaymentsLists = [];
let trash = [];
let archivedLists = [];

// --- Helper Functions ---

// Function to save data to local storage
function saveToLocalStorage() {
  localStorage.setItem('bazarLists', JSON.stringify(bazarLists));
  localStorage.setItem('dokanBakiiLists', JSON.stringify(dokanBakiiLists));
  localStorage.setItem('billPaymentsLists', JSON.stringify(billPaymentsLists));
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
            dokanBakii: dokanBakiiLists,
            billPayments: billPaymentsLists,
            trash: trash,
            archived: archivedLists
        })
        .then(() => {
            // alert('আপনার ডেটা ক্লাউডে সফলভাবে সেভ হয়েছে! ☁️'); // Removed to avoid too many alerts
        })
        .catch((error) => {
            alert('ডেটা সেভ করার সময় একটি সমস্যা হয়েছে: ' + error.message);
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
                dokanBakiiLists = data.dokanBakii || [];
                billPaymentsLists = data.billPayments || [];
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
      return itemSum + (parseFloat(
