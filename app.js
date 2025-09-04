let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];

function saveData() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
}

function renderLists() {
  const listsDiv = document.getElementById("lists");
  listsDiv.innerHTML = "";

  lists.forEach((list, listIndex) => {
    let listDiv = document.createElement("div");
    listDiv.className = "list";

    let title = document.createElement("h2");
    title.innerText = list.name;

    let productForm = document.createElement("div");
    productForm.innerHTML = `
      <input type="text" placeholder="পণ্যের নাম" id="pname-${listIndex}">
      <input type="date" id="pdate-${listIndex}">
      <input type="number" placeholder="কেজি/পরিমাণ" id="pqty-${listIndex}">
      <input type="number" placeholder="টাকা" id="pprice-${listIndex}">
      <button onclick="addProduct(${listIndex})">➕ প্রোডাক্ট</button>
    `;

    let productsDiv = document.createElement("div");
    list.products.forEach((product) => {
      let p = document.createElement("div");
      p.className = "product";
      p.innerHTML = `
        <span>${product.name} (${product.qty} কেজি) - ${product.price}৳</span>
        <small>${product.date}</small>
      `;
      productsDiv.appendChild(p);
    });

    listDiv.appendChild(title);
    listDiv.appendChild(productForm);
    listDiv.appendChild(productsDiv);
    listsDiv.appendChild(listDiv);
  });
}

function addList() {
  let name = document.getElementById("listName").value;
  if (name.trim() === "") return alert("লিস্টের নাম লিখুন!");
  lists.push({ name: name, products: [] });
  saveData();
  renderLists();
  document.getElementById("listName").value = "";
}

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

renderLists();