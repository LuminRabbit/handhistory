const ranks = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const suits = [
  { s: "♠", c: "spades" },
  { s: "♥", c: "hearts" },
  { s: "♦", c: "diamonds" },
  { s: "♣", c: "clubs" }
];

let selectedCards = [];

function startHand() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("hand").classList.remove("hidden");
  renderCards();
}

function renderCards() {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  ranks.forEach(r => {
    suits.forEach(s => {
      const btn = document.createElement("button");
      btn.className = `card-btn ${s.c}`;
      btn.textContent = r + s.s;
      btn.onclick = () => selectCard(r + s.s, btn);
      container.appendChild(btn);
    });
  });
}

function selectCard(card, btn) {
  if (selectedCards.includes(card)) return;
  if (selectedCards.length >= 2) return;

  selectedCards.push(card);
  btn.style.background = "#22c55e";
  btn.style.color = "#022c22";
}

function saveHand() {
  const hand = {
    heroCards: selectedCards,
    actions: document.getElementById("actions").value,
    date: new Date().toISOString()
  };

  const hands = JSON.parse(localStorage.getItem("hands") || "[]");
  hands.push(hand);
  localStorage.setItem("hands", JSON.stringify(hands));

  alert("Hand saved!");
  location.reload();
}

// PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
