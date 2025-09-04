let lists = JSON.parse(localStorage.getItem("bazarLists")) || {};

function saveData() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
}

// ✅ লিস্ট তৈরি
function addList() {
  const name = document.getElementById("newListName").value.trim();
  if (!name) return alert("লিস্টের নাম লিখুন!");
  if (!lists[name]) lists[name] = [];
  saveData();
  renderLists();
  document.getElementById("newListName").value = "";
}

// ✅ প্রোডাক্ট যোগ
function addProduct(listName) {
  const listContainer = document.getElementById(listName);
  const name = listContainer.querySelector(".product-name").value.trim();
  const qty = listContainer.querySelector(".product-qty").value.trim();
  const price = parseFloat(listContainer.querySelector(".product-price").value.trim());
  const date = new Date().toISOString().split("T")[0];

  if (!name || !qty || !price) return alert("সব ঘর পূরণ করুন!");

  lists[listName].push({ name, qty, price, date });
  saveData();
  renderLists();
}

// ✅ প্রোডাক্ট ডিলিট
function deleteProduct(listName, index) {
  lists[listName].splice(index, 1);
  saveData();
  renderLists();
}

// ✅ মোট হিসাব
function updateTotal(listName, container) {
  let total = lists[listName].reduce((sum, p) => sum + p.price, 0);
  let totalBox = container.querySelector(".total-box");
  if (!totalBox) {
    totalBox = document.createElement("div");
    totalBox.className = "total-box";
    container.appendChild(totalBox);
  }
  totalBox.innerHTML = `মোট: ${total}৳`;
}

// ✅ লিস্ট রেন্ডার
function renderLists() {
  const listsDiv = document.getElementById("lists");
  listsDiv.innerHTML = "";

  for (let listName in lists) {
    const listDiv = document.createElement("div");
    listDiv.className = "list";
    listDiv.id = listName;

    listDiv.innerHTML = `
      <h3>${listName}</h3>
      <input class="product-name" placeholder="পণ্যের নাম">
      <input class="product-qty" placeholder="কেজি/পরিমাণ">
      <input type="number" class="product-price" placeholder="টাকা">
      <button onclick="addProduct('${listName}')">➕ প্রোডাক্ট</button>
      <div class="products"></div>
    `;

    const productsDiv = listDiv.querySelector(".products");
    lists[listName].forEach((p, index) => {
      const productDiv = document.createElement("div");
      productDiv.className = "product";

      productDiv.innerHTML = `
        <span>${p.name} (${p.qty}) - ${p.price}৳</span>
        <small>${p.date}</small>
        <button onclick="deleteProduct('${listName}', ${index})">❌</button>
      `;

      productsDiv.appendChild(productDiv);
    });

    updateTotal(listName, listDiv);
    listsDiv.appendChild(listDiv);
  }
}

// ✅ এক্সপোর্ট
function exportBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lists));
  const dl = document.createElement("a");
  dl.href = dataStr;
  dl.download = "bazarlist-backup.json";
  dl.click();
}

// ✅ ইম্পোর্ট
function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      lists = JSON.parse(e.target.result);
      saveData();
      renderLists();
    } catch {
      alert("Invalid file!");
    }
  };
  reader.readAsText(file);
}

// ✅ বাটন ইভেন্ট
document.getElementById("addListBtn").onclick = addList;
document.getElementById("exportBtn").onclick = exportBackup;
document.getElementById("importBtn").onclick = () => document.getElementById("importFile").click();
document.getElementById("importFile").addEventListener("change", importBackup);

renderLists();