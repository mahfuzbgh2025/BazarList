// লোকাল স্টোরেজ থেকে ডাটা লোড
let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];

// ডাটা সেভ করার ফাংশন
function saveData() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
}

// সব লিস্ট রেন্ডার করার ফাংশন
function renderLists() {
  const listsDiv = document.getElementById("lists");
  listsDiv.innerHTML = "";

  lists.forEach((list, listIndex) => {
    let listDiv = document.createElement("div");
    listDiv.className = "list";

    // লিস্টের নাম
    let title = document.createElement("h2");
    title.innerText = list.name;

    // প্রোডাক্ট যোগ করার ফর্ম
    let productForm = document.createElement("div");
    productForm.innerHTML = `
      <input type="text" placeholder="পণ্যের নাম" id="pname-${listIndex}">
      <input type="date" id="pdate-${listIndex}">
      <input type="number" placeholder="কেজি/পরিমাণ" id="pqty-${listIndex}">
      <input type="number" placeholder="টাকা" id="pprice-${listIndex}">
      <button onclick="addProduct(${listIndex})">➕ প্রোডাক্ট</button>
    `;

    // প্রোডাক্ট লিস্ট
    let productsDiv = document.createElement("div");
    list.products.forEach((product, productIndex) => {
      let p = document.createElement("div");
      p.className = "product";
      p.innerHTML = `
        <span>
          ${product.name} (${product.qty} কেজি) - ${product.price}৳
        </span>
        <small>${product.date}</small>
        <button onclick="deleteProduct(${listIndex}, ${productIndex})">🗑️</button>
      `;
      productsDiv.appendChild(p);
    });

    // লিস্ট ডিলিট বাটন
    let deleteListBtn = document.createElement("button");
    deleteListBtn.innerText = "❌ লিস্ট মুছুন";
    deleteListBtn.onclick = () => deleteList(listIndex);

    // DOM এ যোগ করা
    listDiv.appendChild(title);
    listDiv.appendChild(productForm);
    listDiv.appendChild(productsDiv);
    listDiv.appendChild(deleteListBtn);

    listsDiv.appendChild(listDiv);
  });
}

// নতুন লিস্ট যোগ করা
function addList() {
  let name = document.getElementById("listName").value;
  if (name.trim() === "") return alert("লিস্টের নাম লিখুন!");

  lists.push({ name: name, products: [] });
  saveData();
  renderLists();

  document.getElementById("listName").value = "";
}

// নতুন প্রোডাক্ট যোগ করা
function addProduct(listIndex) {
  let name = document.getElementById(`pname-${listIndex}`).value;
  let date = document.getElementById(`pdate-${listIndex}`).value;
  let qty = document.getElementById(`pqty-${listIndex}`).value;
  let price = document.getElementById(`pprice-${listIndex}`).value;

  if (!name || !date || !qty || !price) return alert("সব তথ্য পূরণ করুন!");

  lists[listIndex].products.push({ name, date, qty, price });
  saveData();
  renderLists();
}

// প্রোডাক্ট ডিলিট করা
function deleteProduct(listIndex, productIndex) {
  if (confirm("আপনি কি এই প্রোডাক্ট ডিলিট করতে চান?")) {
    lists[listIndex].products.splice(productIndex, 1);
    saveData();
    renderLists();
  }
}

// লিস্ট ডিলিট করা
function deleteList(listIndex) {
  if (confirm("আপনি কি এই লিস্ট ডিলিট করতে চান?")) {
    lists.splice(listIndex, 1);
    saveData();
    renderLists();
  }
}

// ======================
// 📤 Backup System
// ======================
const APP_STORAGE_PREFIX = "bazarlist";

function collectAllAppData() {
  const dump = { meta: {}, data: {} };
  dump.meta.exportedAt = new Date().toISOString();
  dump.meta.app = "BazarList";
  dump.meta.version = 1;

  // localStorage থেকে ডাটা কালেক্ট করা
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.toLowerCase().includes(APP_STORAGE_PREFIX)) {
      dump.data[k] = localStorage.getItem(k);
    }
  }
  return dump;
}

function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function restoreAllAppData(dump) {
  if (!dump || !dump.data || typeof dump.data !== "object") {
    alert("❌ Invalid backup file.");
    return false;
  }
  // পুরোনো ডাটা মুছে ফেলা
  Object.entries(dump.data).forEach(([k, v]) => {
    localStorage.setItem(k, v);
  });

  localStorage.setItem("bazarlist-last-restore-at", new Date().toISOString());
  return true;
}

// Backup export
document.getElementById("exportBtn")?.addEventListener("click", () => {
  const data = collectAllAppData();
  const date = new Date().toISOString().slice(0, 10);
  downloadJSON(data, `BazarList-backup-${date}.json`);
});

// Backup import
document.getElementById("importFile")?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const json = JSON.parse(text);
    const ok = restoreAllAppData(json);
    if (ok) {
      alert("✅ Backup restored! The app will reload.");
      location.reload();
    }
  } catch (err) {
    console.error(err);
    alert("❌ Could not restore. Please select a valid backup JSON file.");
  } finally {
    e.target.value = ""; // reset
  }
});

// ======================

// প্রথমবার রেন্ডার
renderLists();