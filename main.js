// Flashcards storage
let cards = JSON.parse(localStorage.getItem("flashcards") || "[]");
let currentIndex = null;

// Elements
const termsList = document.getElementById("terms");
const termText = document.getElementById("termText");
const definitionText = document.getElementById("definitionText");
const cardEl = document.getElementById("card");
const revealBtn = document.getElementById("revealBtn");
const searchInput = document.getElementById("search");

const addBtn = document.getElementById("addBtn");
const randomBtn = document.getElementById("randomBtn");
const importBtn = document.getElementById("importBtn");
const exportBtn = document.getElementById("exportBtn");

const showDefinitionOnly = document.getElementById("showDefinitionOnly");

// Modal elements
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const termInput = document.getElementById("termInput");
const defInput = document.getElementById("defInput");
const saveCardBtn = document.getElementById("saveCardBtn");
const cancelBtn = document.getElementById("cancelBtn");

// IO Modal
const ioModal = document.getElementById("ioModal");
const ioTitle = document.getElementById("ioTitle");
const jsonArea = document.getElementById("jsonArea");
const fileInput = document.getElementById("fileInput");
const ioDownload = document.getElementById("ioDownload");
const ioApply = document.getElementById("ioApply");
const ioUpload = document.getElementById("ioUpload");
const ioClose = document.getElementById("ioClose");

let editIndex = null;

// ===== Utility =====
function saveCards() {
  localStorage.setItem("flashcards", JSON.stringify(cards));
}

function renderList(filter = "") {
  termsList.innerHTML = "";
  const defOnly = showDefinitionOnly.checked;

  cards.forEach((card, i) => {
    if (filter && !card.term.toLowerCase().includes(filter.toLowerCase())) return;

    const li = document.createElement("li");
    li.textContent = defOnly ? "Flashcard" : card.term;

    li.onclick = () => {
      currentIndex = i;
      renderCard(currentIndex);
    };

    const del = document.createElement("button");
    del.textContent = "✖";
    del.className = "delete-btn";
    
    del.onclick = (e) => {
      e.stopPropagation();
      cards.splice(i, 1);
      saveCards();
      renderList(searchInput.value);
      renderCard(null);
    };

    li.appendChild(del);
    termsList.appendChild(li);
  });
}

function renderCard(index) {
  cardEl.classList.remove("revealed");

  if (index === null || index < 0 || index >= cards.length) {
    termText.textContent = "Select a term";
    definitionText.textContent = "";
    return;
  }

  const card = cards[index];
  const defOnly = showDefinitionOnly.checked;

  if (defOnly) {
    termText.textContent = card.definition;
    definitionText.textContent = "";
  } else {
    termText.textContent = card.term;
    definitionText.textContent = "";
  }
}

// ===== Events =====
revealBtn.onclick = () => {
  if (currentIndex === null) return;
  const card = cards[currentIndex];
  const defOnly = showDefinitionOnly.checked;

  if (defOnly) {
    definitionText.textContent = card.term;
  } else {
    definitionText.textContent = card.definition;
  }
};

addBtn.onclick = () => {
  modal.classList.remove("hidden");
  modalTitle.textContent = "Add Flashcard";
  termInput.value = "";
  defInput.value = "";
  editIndex = null;
};

cancelBtn.onclick = () => modal.classList.add("hidden");

saveCardBtn.onclick = () => {
  const term = termInput.value.trim();
  const def = defInput.value.trim();
  if (!term || !def) return;
  if (editIndex !== null) {
    cards[editIndex] = { term, definition: def };
  } else {
    cards.push({ term, definition: def });
  }
  saveCards();
  modal.classList.add("hidden");
  renderList(searchInput.value);
};

randomBtn.onclick = () => {
  if (cards.length === 0) return;
  const i = Math.floor(Math.random() * cards.length);
  currentIndex = i;
  renderCard(i);
};

// ===== Import / Export =====
importBtn.onclick = () => {
  ioModal.classList.remove("hidden");
  ioTitle.textContent = "Import JSON";
  jsonArea.value = "";
  ioApply.classList.remove("hidden");
  ioUpload.classList.remove("hidden");
  ioDownload.classList.add("hidden");
};

exportBtn.onclick = () => {
  ioModal.classList.remove("hidden");
  ioTitle.textContent = "Export JSON";
  jsonArea.value = JSON.stringify(cards, null, 2);
  ioDownload.classList.remove("hidden");
  ioApply.classList.add("hidden");
  ioUpload.classList.add("hidden");
};

ioApply.onclick = () => {
  try {
    const data = JSON.parse(jsonArea.value);
    if (!Array.isArray(data)) throw new Error("Invalid JSON");
    cards = data;
    saveCards();
    renderList(searchInput.value);
    ioModal.classList.add("hidden");
  } catch (e) {
    alert("Invalid JSON format.");
  }
};

ioUpload.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid JSON");
      cards = data;
      saveCards();
      renderList(searchInput.value);
      ioModal.classList.add("hidden");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
};

ioDownload.onclick = () => {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards.json";
  a.click();
  URL.revokeObjectURL(url);
};

ioClose.onclick = () => ioModal.classList.add("hidden");

// ===== Search =====
searchInput.oninput = () => renderList(searchInput.value);

// ===== Settings =====
showDefinitionOnly.addEventListener("change", () => {
  localStorage.setItem("showDefinitionOnly", showDefinitionOnly.checked);
  renderList(searchInput.value);
  renderCard(currentIndex);
});

// Load preference
if (localStorage.getItem("showDefinitionOnly") === "true") {
  showDefinitionOnly.checked = true;
}

// ===== Init =====
renderList();
renderCard(null);
