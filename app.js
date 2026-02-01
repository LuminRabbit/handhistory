const ranks = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const suits = [
  { s:"♠", c:"spades" },
  { s:"♥", c:"hearts" },
  { s:"♦", c:"diamonds" },
  { s:"♣", c:"clubs" }
];

const positions = ["UTG","UTG+1","LJ","HJ","CO","BTN","SB","BB"];
const streets = ["Preflop","Flop","Turn","River"];

let hand = resetHand();

function resetHand() {
  return {
    heroCards: [],
    position: "",
    board: [],
    actions: [],
    streetIndex: 0,
    date: new Date().toISOString()
  };
}

/* ---------- NAV ---------- */

function newHand() {
  hand = resetHand();
  show("hand");
  renderCards();
  renderPositions();
  renderBoard();
  updateLog();
}

function goHome() {
  show("home");
}

function viewHands() {
  show("review");
  const list = document.getElementById("handList");
  list.innerHTML = "";
  const hands = JSON.parse(localStorage.getItem("hands") || "[]");

  hands.forEach(h => {
    const div = document.createElement("div");
    div.className = "log";
    div.textContent = `${h.heroCards.join(" ")} | ${h.position}`;
    list.appendChild(div);
  });
}

function show(id) {
  ["home","hand","review"].forEach(x =>
    document.getElementById(x).classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
}

/* ---------- HERO CARDS ---------- */

function renderCards() {
  const el = document.getElementById("cards");
  el.innerHTML = "";

  ranks.forEach(r =>
    suits.forEach(s => {
      const b = document.createElement("button");
      b.className = `card-btn ${s.c}`;
      b.textContent = r + s.s;
      b.onclick = () => {
        if (hand.heroCards.length < 2) {
          hand.heroCards.push(b.textContent);
          b.style.background = "#22c55e";
        }
      };
      el.appendChild(b);
    })
  );
}

/* ---------- POSITION ---------- */

function renderPositions() {
  const el = document.getElementById("positions");
  el.innerHTML = "";

  positions.forEach(p => {
    const b = document.createElement("button");
    b.className = "btn secondary";
    b.textContent = p;
    b.onclick = () => {
      hand.position = p;
      renderPositions();
    };
    if (hand.position === p) b.style.background = "#22c55e";
    el.appendChild(b);
  });
}

/* ---------- ACTIONS ---------- */

function logAction(action) {
  const entry = `${streets[hand.streetIndex]}: Hero ${action}`;
  hand.actions.push(entry);
  updateLog();
}

function updateLog() {
  document.getElementById("log").innerHTML = hand.actions.join("<br>");
  document.getElementById("streetTitle").textContent = streets[hand.streetIndex];
}

/* ---------- BOARD ---------- */

function renderBoard() {
  const el = document.getElementById("board");
  el.innerHTML = "";

  ranks.forEach(r =>
    suits.forEach(s => {
      const b = document.createElement("button");
      b.className = `card-btn ${s.c}`;
      b.textContent = r + s.s;
      b.onclick = () => {
        if (
          (hand.streetIndex === 1 && hand.board.length < 3) ||
          (hand.streetIndex > 1 && hand.board.length < hand.streetIndex + 2)
        ) {
          hand.board.push(b.textContent);
          b.style.background = "#22c55e";
          if (
            hand.streetIndex === 1 && hand.board.length === 3 ||
            hand.streetIndex > 1
          ) {
            hand.streetIndex++;
            updateLog();
          }
        }
      };
      el.appendChild(b);
    })
  );
}

/* ---------- VOICE ---------- */

function voiceInput() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice not supported");
    return;
  }

  const rec = new webkitSpeechRecognition();
  rec.lang = "en-US";
  rec.onresult = e => {
    hand.actions.push(`${streets[hand.streetIndex]}: ${e.results[0][0].transcript}`);
    updateLog();
  };
  rec.start();
}

/* ---------- SAVE ---------- */

function saveHand() {
  const hands = JSON.parse(localStorage.getItem("hands") || "[]");
  hands.push(hand);
  localStorage.setItem("hands", JSON.stringify(hands));
  alert("Hand saved");
  goHome();
}

/* ---------- PWA ---------- */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
