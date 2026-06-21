import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const playerDiv =
  document.getElementById("player");

const money =
  document.getElementById("money");

const count =
  document.getElementById("count");
