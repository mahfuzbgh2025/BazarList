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

// প্রথমবার রেন্ডার
renderLists();