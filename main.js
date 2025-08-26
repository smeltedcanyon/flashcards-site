const termsList = document.getElementById("terms");
const termText = document.getElementById("termText");
const defText = document.getElementById("definitionText");
const revealBtn = document.getElementById("revealBtn");
const searchInput = document.getElementById("search");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalTerm = document.getElementById("modalTerm");
const modalDef = document.getElementById("modalDef");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const addBtn = document.getElementById("addBtn");

const importBtn = document.getElementById("importBtn");
const exportBtn = document.getElementById("exportBtn");
const randomBtn = document.getElementById("randomBtn");
const fileInput = document.getElementById("fileInput");

const jsonModal = document.getElementById("jsonModal");
const jsonTitle = document.getElementById("jsonTitle");
const jsonArea = document.getElementById("jsonArea");
const jsonApplyBtn = document.getElementById("jsonApplyBtn");
const jsonCloseBtn = document.getElementById("jsonCloseBtn");
const jsonDownloadBtn = document.getElementById("jsonDownloadBtn");
const jsonUploadBtn = document.getElementById("jsonUploadBtn");

let cards = JSON.parse(localStorage.getItem("flashcards") || "[]");
let selected = null;
let editing = null;
let mode = null; // "import" or "export"

function saveCards() {
  localStorage.setItem("flashcards", JSON.stringify(cards));
}

function renderList(filter = "") {
  termsList.innerHTML = "";
  cards
    .filter(c => c.term.toLowerCase().includes(filter.toLowerCase()))
    .forEach(c => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = c.term;
      span.style.flex = "1";
      span.onclick = () => selectCard(c);

      const delBtn = document.createElement("button");
      delBtn.textContent = "✕";
      delBtn.className = "delete-btn";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        deleteCard(c);
      };

      li.appendChild(span);
      li.appendChild(delBtn);

      li.className = c === selected ? "active" : "";
      termsList.appendChild(li);
    });
}

function selectCard(card) {
  selected = card;
  termText.textContent = card.term;
  defText.textContent = card.definition;
  document.getElementById("card").classList.remove("revealed");
  renderList(searchInput.value);
}

function deleteCard(card) {
  if (!confirm(`Delete flashcard: "${card.term}"?`)) return;
  cards = cards.filter(c => c !== card);
  if (selected === card) {
    selected = null;
    termText.textContent = "Select a term";
    defText.textContent = "";
    document.getElementById("card").classList.remove("revealed");
  }
  saveCards();
  renderList(searchInput.value);
}

revealBtn.onclick = () => {
  if (!selected) return;
  document.getElementById("card").classList.toggle("revealed");
};

searchInput.oninput = () => renderList(searchInput.value);

addBtn.onclick = () => {
  editing = null;
  modalTitle.textContent = "Add Flashcard";
  modalTerm.value = "";
  modalDef.value = "";
  modal.classList.remove("hidden");
};

cancelBtn.onclick = () => modal.classList.add("hidden");

saveBtn.onclick = () => {
  const term = modalTerm.value.trim();
  const def = modalDef.value.trim();
  if (!term || !def) return;
  if (editing) {
    editing.term = term;
    editing.definition = def;
  } else {
    cards.push({ term, definition: def });
  }
  saveCards();
  renderList();
  modal.classList.add("hidden");
};

// ===== RANDOM =====
randomBtn.onclick = () => {
  if (cards.length === 0) return alert("No cards available!");
  const randomCard = cards[Math.floor(Math.random() * cards.length)];
  selectCard(randomCard);
};

// ===== EXPORT =====
exportBtn.onclick = () => {
  mode = "export";
  jsonTitle.textContent = "Export JSON";
  jsonArea.value = JSON.stringify(cards, null, 2);
  jsonDownloadBtn.classList.remove("hidden");
  jsonUploadBtn.classList.add("hidden");
  jsonApplyBtn.classList.add("hidden");
  jsonModal.classList.remove("hidden");
};

jsonDownloadBtn.onclick = () => {
  const dataStr = JSON.stringify(cards, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ===== IMPORT =====
importBtn.onclick = () => {
  mode = "import";
  jsonTitle.textContent = "Import JSON";
  jsonArea.value = "";
  jsonDownloadBtn.classList.add("hidden");
  jsonUploadBtn.classList.remove("hidden");
  jsonApplyBtn.classList.remove("hidden");
  jsonModal.classList.remove("hidden");
};

jsonUploadBtn.onclick = () => {
  fileInput.click();
};

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      applyImport(imported);
    } catch {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
};

jsonApplyBtn.onclick = () => {
  try {
    const imported = JSON.parse(jsonArea.value);
    applyImport(imported);
    jsonModal.classList.add("hidden");
  } catch {
    alert("Invalid JSON format.");
  }
};

jsonCloseBtn.onclick = () => jsonModal.classList.add("hidden");

function applyImport(imported) {
  if (!Array.isArray(imported)) {
    alert("Invalid JSON format.");
    return;
  }
  if (confirm("Replace existing cards with imported deck? Click Cancel to merge.")) {
    cards = imported;
  } else {
    cards = [...cards, ...imported];
  }
  saveCards();
  renderList();
}

// Load starter deck if empty
if (cards.length === 0) {
  cards = [
    { term: "Photosynthesis", definition: "Process plants use to turn sunlight into energy." },
    { term: "Mitosis", definition: "Cell division resulting in two identical daughter cells." },
    { term: "Ecosystem", definition: "Community of living organisms and their environment." },
  ];
  saveCards();
}

renderList();
