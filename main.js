// Elements
const termsList = document.getElementById("terms");
const termText = document.getElementById("termText");
const definitionText = document.getElementById("definitionText");
const revealBtn = document.getElementById("revealBtn");
const searchInput = document.getElementById("search");
const addBtn = document.getElementById("addBtn");
const randomBtn = document.getElementById("randomBtn");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const termInput = document.getElementById("termInput");
const defInput = document.getElementById("defInput");
const saveCardBtn = document.getElementById("saveCardBtn");
const cancelBtn = document.getElementById("cancelBtn");
const ioModal = document.getElementById("ioModal");
const ioTitle = document.getElementById("ioTitle");
const jsonArea = document.getElementById("jsonArea");
const ioDownload = document.getElementById("ioDownload");
const ioUpload = document.getElementById("ioUpload");
const ioClose = document.getElementById("ioClose");
const importBtn = document.getElementById("importBtn");
const exportBtn = document.getElementById("exportBtn");
const showDefinitionOnly = document.getElementById("showDefinitionOnly");
const cardEl = document.getElementById("card");

// State
let cards = JSON.parse(localStorage.getItem("flashcards") || "[]");
let currentIndex = null;
let editingIndex = null;

// Init
renderList();
renderCard(null);

// Save cards
function saveCards() {
  localStorage.setItem("flashcards", JSON.stringify(cards));
}

// Render list
function renderList(filter = "") {
  termsList.innerHTML = "";
  cards.forEach((c, i) => {
    if (!c.term.toLowerCase().includes(filter.toLowerCase())) return;
    const li = document.createElement("li");
    li.textContent = c.term;
    if (i === currentIndex) li.classList.add("active");

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.className = "delete-btn";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      cards.splice(i, 1);
      saveCards();
      if (currentIndex === i) currentIndex = null;
      renderList(searchInput.value);
      renderCard(currentIndex);
    };

    li.appendChild(delBtn);
    li.onclick = () => {
      currentIndex = i;
      renderList(searchInput.value);
      renderCard(i);
    };

    termsList.appendChild(li);
  });
}

// Render card (swaps roles if definition-first mode)
function renderCard(index) {
  if (index === null || index < 0 || index >= cards.length) {
    termText.textContent = "Select a term";
    definitionText.textContent = "";
    return;
  }

  const card = cards[index];
  const defOnly = showDefinitionOnly.checked;

  if (defOnly) {
    // Swap → definition shown first
    termText.textContent = card.definition;
    definitionText.textContent = "";
  } else {
    // Normal
    termText.textContent = card.term;
    definitionText.textContent = "";
  }
}

// Reveal button
revealBtn.onclick = () => {
  if (currentIndex === null) return;
  const card = cards[currentIndex];
  const defOnly = showDefinitionOnly.checked;

  if (defOnly) {
    definitionText.textContent = card.term; // reveal term
  } else {
    definitionText.textContent = card.definition; // reveal definition
  }
};

// Add
addBtn.onclick = () => {
  editingIndex = null;
  modalTitle.textContent = "Add Flashcard";
  termInput.value = "";
  defInput.value = "";
  modal.classList.remove("hidden");
};

// Save card
saveCardBtn.onclick = () => {
  const term = termInput.value.trim();
  const def = defInput.value.trim();
  if (!term || !def) return;

  if (editingIndex !== null) {
    cards[editingIndex] = { term, definition: def };
  } else {
    cards.push({ term, definition: def });
  }

  saveCards();
  renderList(searchInput.value);
  modal.classList.add("hidden");
};

// Cancel modal
cancelBtn.onclick = () => modal.classList.add("hidden");

// Search
searchInput.oninput = () => {
  renderList(searchInput.value);
};

// Random
randomBtn.onclick = () => {
  if (cards.length === 0) return;
  currentIndex = Math.floor(Math.random() * cards.length);
  renderList(searchInput.value);
  renderCard(currentIndex);
};

// Import / Export
importBtn.onclick = () => {
  ioTitle.textContent = "Import Flashcards";
  jsonArea.value = "";
  ioModal.classList.remove("hidden");
};

exportBtn.onclick = () => {
  ioTitle.textContent = "Export Flashcards";
  jsonArea.value = JSON.stringify(cards, null, 2);
  ioModal.classList.remove("hidden");
};

ioClose.onclick = () => ioModal.classList.add("hidden");

ioDownload.onclick = () => {
  const blob = new Blob([jsonArea.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards.json";
  a.click();
  URL.revokeObjectURL(url);
};

ioUpload.onclick = () => {
  try {
    const imported = JSON.parse(jsonArea.value);
    if (Array.isArray(imported)) {
      cards = imported;
      saveCards();
      renderList(searchInput.value);
      renderCard(null);
      ioModal.classList.add("hidden");
    } else {
      alert("Invalid JSON format");
    }
  } catch (e) {
    alert("Invalid JSON");
  }
};

// Load preference
if (localStorage.getItem("showDefinitionOnly") === "true") {
  showDefinitionOnly.checked = true;
}

// Toggle preference
showDefinitionOnly.addEventListener("change", () => {
  localStorage.setItem("showDefinitionOnly", showDefinitionOnly.checked);
  renderCard(currentIndex);
});
