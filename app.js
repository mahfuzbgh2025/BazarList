document.addEventListener("DOMContentLoaded", () => {
  let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];
  renderLists();

  const listNameInput = document.getElementById("listNameInput");
  const addListBtn = document.getElementById("addListBtn");
  const listsContainer = document.getElementById("listsContainer");
  const totalAmountEl = document.getElementById("totalAmount");

  // ✅ নতুন লিস্ট যোগ
  addListBtn.addEventListener("click", () => {
    const name = listNameInput.value.trim();
    if (!name) {
      alert("দয়া করে লিস্টের নাম লিখুন");
      return;
    }
    lists.push({ id: Date.now(), name, items: [] });
    listNameInput.value = "";
    saveLists();
    renderLists();
  });

  // ✅ লিস্ট + আইটেম রেন্ডার
  function renderLists() {
    listsContainer.innerHTML = "";
    let totalAmount = 0;

    lists.forEach((list) => {
      const listDiv = document.createElement("div");
      listDiv.className = "list";

      const listHeader = document.createElement("h2");
      listHeader.textContent = list.name;
      listDiv.appendChild(listHeader);

      // Add Item Form
      const form = document.createElement("form");
      form.className = "item-form";
      form.innerHTML = `
        <input type="text" placeholder="পণ্যের নাম" required>
        <input type="date" required>
        <input type="number" placeholder="টাকার অংক" required>
        <input type="number" step="0.1" placeholder="পরিমাণ (কেজি/লিটার)">
        <button type="submit">➕</button>
      `;
      listDiv.appendChild(form);

      const itemList = document.createElement("ul");
      listDiv.appendChild(itemList);

      // Render Items
      list.items.forEach((item) => {
        totalAmount += item.amount;
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${item.name}</strong> 
          (${item.date}) - ৳${item.amount} 
          ${item.quantity ? `, ${item.quantity} কেজি` : ""}
          <button class="edit">✏️</button>
          <button class="delete">🗑️</button>
        `;

        // Edit button
        li.querySelector(".edit").addEventListener("click", () => {
          const newName = prompt("পণ্যের নাম পরিবর্তন করুন:", item.name);
          if (newName !== null) item.name = newName;

          const newDate = prompt("তারিখ পরিবর্তন করুন:", item.date);
          if (newDate !== null) item.date = newDate;

          const newAmount = prompt("টাকার অংক পরিবর্তন করুন:", item.amount);
          if (newAmount !== null) item.amount = parseFloat(newAmount) || item.amount;

          const newQuantity = prompt("পরিমাণ (কেজি/লিটার) পরিবর্তন করুন:", item.quantity);
          if (newQuantity !== null) item.quantity = parseFloat(newQuantity) || item.quantity;

          saveLists();
          renderLists();
        });

        // Delete button
        li.querySelector(".delete").addEventListener("click", () => {
          if (confirm("আপনি কি নিশ্চিত যে এই আইটেম মুছতে চান?")) {
            list.items = list.items.filter((i) => i !== item);
            saveLists();
            renderLists();
          }
        });

        itemList.appendChild(li);
      });

      // Add Item Event
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputs = form.querySelectorAll("input");
        const [nameInput, dateInput, amountInput, qtyInput] = inputs;
        const newItem = {
          id: Date.now(),
          name: nameInput.value,
          date: dateInput.value,
          amount: parseFloat(amountInput.value),
          quantity: parseFloat(qtyInput.value) || 0
        };
        list.items.push(newItem);
        saveLists();
        renderLists();
        form.reset();
      });

      listsContainer.appendChild(listDiv);
    });

    totalAmountEl.textContent = totalAmount;
  }

  // ✅ লোকালস্টোরেজে সেভ
  function saveLists() {
    localStorage.setItem("bazarLists", JSON.stringify(lists));
  }

  // ✅ Export Backup
  document.getElementById("exportBtn").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lists));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "bazarlist-backup.json");
    dl.click();
  });

  // ✅ Import Restore
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });

  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        lists = JSON.parse(event.target.result);
        saveLists();
        renderLists();
        alert("Backup restore সফল হয়েছে ✅");
      } catch {
        alert("ফাইলটি সঠিক নয় ❌");
      }
    };
    reader.readAsText(file);
  });
});