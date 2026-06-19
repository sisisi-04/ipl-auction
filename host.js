import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
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

// HTML Elements
const name = document.getElementById("name");
const category = document.getElementById("category");
const price = document.getElementById("price");
const img = document.getElementById("img");
const playersDiv = document.getElementById("players");

// Add Player
window.addPlayer = async function () {
  if (!name.value || !price.value) {
    alert("Please enter player name and price.");
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
    timer: 10,
    active: false
  });

  // Clear inputs
  name.value = "";
  price.value = "";
  img.value = "";
};

// Display Players Live
onSnapshot(playersRef, (snapshot) => {
  playersDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const p = doc.data();

    playersDiv.innerHTML += `
      <div class="card">

        <img
          src="${p.image || "https://via.placeholder.com/130"}"
        >

        <h2>${p.name}</h2>

        <p>${p.category}</p>

        <h3>
          ₹${p.currentBid} Lakhs
        </h3>

        <p>
          Highest Bidder:
          ${p.highestBidder || "None"}
        </p>

      </div>
    `;
  });
});

