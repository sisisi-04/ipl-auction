import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let timerInterval = null;

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBoFnhlMryKch7mOT-M1BJ_heuIJiJrumM",
  authDomain: "auction-80d2b.firebaseapp.com",
  projectId: "auction-80d2b",
  storageBucket: "auction-80d2b.firebasestorage.app",
  messagingSenderId: "365337100245",
  appId: "1:365337100245:web:ae838c4e1eed2c4c1a875c",
  measurementId: "G-0E5RSF3J71"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const playersRef = collection(db, "players");

// HTML ELEMENTS
const name = document.getElementById("name");
const category = document.getElementById("category");
const price = document.getElementById("price");
const img = document.getElementById("img");
const playersDiv = document.getElementById("players");

let currentPlayerId = null;

// IPL CATEGORY ORDER
const categoryOrder = {
  "Marquee": 1,
  "Batter": 2,
  "All Rounder": 3,
  "Wicket Keeper": 4,
  "Bowler": 5,
  "Emerging Player": 6
};

function sortPlayers(docs) {
  docs.sort((a, b) => {
    return (
      categoryOrder[a.data().category] -
      categoryOrder[b.data().category]
    );
  });

  return docs;
}

// ADD PLAYER
window.addPlayer = async function () {
  if (!name.value || !price.value) {
    alert("Enter player name and price.");
    return;
  }

  await addDoc(playersRef, {
    name: name.value,
    category: category.value,
    image: img.value,
    basePrice: Number(price.value),
    currentBid: Number(price.value),
    highestBidder: null,
    soldTo: null,
    status: "waiting",
    timer: 300,
    active: false
  });

  name.value = "";
  price.value = "";
  img.value = "";
};

// START AUCTION
window.startAuction = async function (id) {
  if (timerInterval) return;

  const snapshot = await getDocs(playersRef);

  const playerDoc =
    snapshot.docs.find(
      d => d.id === id
    );

  if (!playerDoc) return;

  const p = playerDoc.data();

  if (p.status === "live") return;

  await updateDoc(
    doc(db, "players", id),
    {
      active: true,
      status: "live"
    }
  );

  window.runTimer(id);
};

// TIMER
window.runTimer = function (id) {
  if (timerInterval) return;

  timerInterval = setInterval(async () => {
    const snapshot =
      await getDocs(playersRef);

    const playerDoc =
      snapshot.docs.find(
        d => d.id === id
      );

    if (!playerDoc) {
      clearInterval(timerInterval);
      timerInterval = null;
      return;
    }

    const p = playerDoc.data();

    if (p.timer <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;

      await updateDoc(
        doc(db, "players", id),
        {
          active: false,
          status: "ended"
        }
      );

      return;
    }

    await updateDoc(
      doc(db, "players", id),
      {
        timer: p.timer - 1
      }
    );

  }, 1000);
};

// SELL TO TEAM A
window.sellA = async function (id) {
  await updateDoc(
    doc(db, "players", id),
    {
      soldTo: "TEAM A",
      status: "sold",
      active: false
    }
  );

  clearInterval(timerInterval);
  timerInterval = null;

  nextPlayer();
};

// SELL TO TEAM B
window.sellB = async function (id) {
  await updateDoc(
    doc(db, "players", id),
    {
      soldTo: "TEAM B",
      status: "sold",
      active: false
    }
  );

  clearInterval(timerInterval);
  timerInterval = null;

  nextPlayer();
};

// NEXT PLAYER
window.nextPlayer = async function () {
  const snapshot =
    await getDocs(playersRef);

  let docs =
    snapshot.docs.filter(
      d => d.data().status !== "sold"
    );

  docs = sortPlayers(docs);

  if (docs.length === 0) {
    currentPlayerId = null;

    playersDiv.innerHTML =
      "<h2>🏆 AUCTION FINISHED</h2>";

    return;
  }

  let index =
    docs.findIndex(
      d => d.id === currentPlayerId
    );

  index++;

  if (index >= docs.length) {
    index = 0;
  }

  currentPlayerId =
    docs[index].id;

  renderCurrentPlayer(docs);
};

// RENDER PLAYER
function renderCurrentPlayer(docs) {
  if (docs.length === 0) return;

  docs = sortPlayers(docs);

  if (!currentPlayerId) {
    currentPlayerId = docs[0].id;
  }

  const currentPlayerDoc =
    docs.find(
      d => d.id === currentPlayerId
    );

  if (!currentPlayerDoc) {
    currentPlayerId = docs[0].id;
    return renderCurrentPlayer(docs);
  }

  const p =
    currentPlayerDoc.data();

  const minutes = String(
    Math.floor(p.timer / 60)
  ).padStart(2, "0");

  const seconds = String(
    p.timer % 60
  ).padStart(2, "0");

  playersDiv.innerHTML = `
    <div class="player">

      <img
        src="${
          p.image ||
          "https://via.placeholder.com/280"
        }"
      >

      <h1>${p.name}</h1>

      <div class="category">
        ${p.category}
      </div>

      <div class="bid">
        ₹${p.currentBid} Lakhs
      </div>

      <p>
        Highest Bidder:
        ${p.highestBidder || "None"}
      </p>

      <div class="timer">
        ${minutes}:${seconds}
      </div>

      <div class="controls">

        <button
          onclick="startAuction('${currentPlayerDoc.id}')"
          ${p.status === "live" ? "disabled" : ""}>
          START AUCTION
        </button>

        <button
          onclick="sellA('${currentPlayerDoc.id}')"
          ${p.status !== "ended" ? "disabled" : ""}>
          SELL TO TEAM A
        </button>

        <button
          onclick="sellB('${currentPlayerDoc.id}')"
          ${p.status !== "ended" ? "disabled" : ""}>
          SELL TO TEAM B
        </button>

        <button
          onclick="nextPlayer()">
          NEXT PLAYER
        </button>

      </div>

    </div>
  `;
}

// LIVE LISTENER
onSnapshot(playersRef, (snapshot) => {
  let docs =
    snapshot.docs.filter(
      d => d.data().status !== "sold"
    );

  docs = sortPlayers(docs);

  renderCurrentPlayer(docs);
});

