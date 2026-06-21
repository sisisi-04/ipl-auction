import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBoFnhlMryKch7mOT-M1BJ_heuIJiJrumM",
  authDomain: "auction-80d2b.firebaseapp.com",
  projectId: "auction-80d2b",
  storageBucket: "auction-80d2b.firebasestorage.app",
  messagingSenderId: "365337100245",
  appId: "1:365337100245:web:ae838c4e1eed2c4c1a875c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML ELEMENTS
const playerDiv = document.getElementById("player");
const money = document.getElementById("money");
const count = document.getElementById("count");

// TEAM DETAILS
onSnapshot(
  doc(db, "teams", "teamB"),
  (snap) => {
    if (!snap.exists()) return;

    const t = snap.data();

    money.innerHTML =
      `₹${t.budget / 100} Cr`;

    count.innerHTML =
      `${t.players}/15 Players`;
  }
);

// CURRENT LIVE PLAYER
onSnapshot(
  collection(db, "players"),
  (snapshot) => {

    const current =
      snapshot.docs.find(
        d => d.data().status === "live"
      );

    // Waiting Screen
    if (!current) {
      playerDiv.innerHTML = `
        <div class="player">
          <h2>
            🏏 Waiting for Host to Start Auction...
          </h2>
        </div>
      `;
      return;
    }

    const p = current.data();

    const minutes = String(
      Math.floor(p.timer / 60)
    ).padStart(2, "0");

    const seconds = String(
      p.timer % 60
    ).padStart(2, "0");

    playerDiv.innerHTML = `
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

        <div class="bid-buttons">

          <button
            onclick="bid('${current.id}', 10)"
            ${p.status !== "live" ? "disabled" : ""}>
            +10L
          </button>

          <button
            onclick="bid('${current.id}', 20)"
            ${p.status !== "live" ? "disabled" : ""}>
            +20L
          </button>

          <button
            onclick="bid('${current.id}', 50)"
            ${p.status !== "live" ? "disabled" : ""}>
            +50L
          </button>

          <button
            onclick="bid('${current.id}', 100)"
            ${p.status !== "live" ? "disabled" : ""}>
            +1 Cr
          </button>

        </div>

      </div>
    `;
  }
);

// BID FUNCTION
window.bid = async function (
  id,
  amount
) {

  const playerRef =
    doc(db, "players", id);

  const snapshot =
    await getDoc(playerRef);

  if (!snapshot.exists()) return;

  const p = snapshot.data();

  // Auction not live
  if (
    p.status !== "live" ||
    !p.active
  ) {
    return;
  }

  await updateDoc(
    playerRef,
    {
      currentBid:
        p.currentBid + amount,

      highestBidder:
        "TEAM B"
    }
  );

};
