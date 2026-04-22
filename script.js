// =========================
// Firebase Config
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyBWpgOD-N-u-WX0bJ_6yX09JIrQ4iazrA0",
  authDomain: "smart-kasb.firebaseapp.com",
  projectId: "smart-kasb",
  storageBucket: "smart-kasb.firebasestorage.app",
  messagingSenderId: "415786426274",
  appId: "1:415786426274:web:d3d6461944fb6604671cfb"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =========================
// Ad Link (غيره لاحقًا لو حبيت)
// =========================
const monetagLink = "https://omg10.com/4/10859582";

// =========================
// User Data
// =========================
let points = 0;
let userId = "guest";
let sessionAds = 0;
const maxAdsPerSession = 5;

// Telegram User ID
if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user) {
  userId = String(Telegram.WebApp.initDataUnsafe.user.id);
}

// =========================
// Load User Data
// =========================
async function loadUser() {
  const ref = db.collection("users").doc(userId);
  const snap = await ref.get();

  const today = new Date().toDateString();

  if (!snap.exists) {
    await ref.set({
      points: 0,
      adsToday: 0,
      lastReset: today,
      lastAdTime: 0
    });
  } else {
    const data = snap.data();

    // reset daily limit
    if (data.lastReset !== today) {
      await ref.update({
        adsToday: 0,
        lastReset: today
      });
    }
  }

  const updated = await ref.get();
  points = updated.data().points || 0;

  document.getElementById("points").textContent = points;
}

loadUser();

// =========================
// Watch Ad
// =========================
function watchAd() {
  if (sessionAds >= maxAdsPerSession) {
    alert("وصلت للحد المسموح اليوم");
    return;
  }

  sessionAds++;

  // mark pending reward
  localStorage.setItem("pendingReward", "true");

  // open ad
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.openLink(monetagLink);
  } else {
    window.open(monetagLink, "_blank");
  }

  alert("بعد ما تخلص الإعلان اضغط 'استلام المكافأة'");
}

// =========================
// Claim Reward (safe system)
// =========================
async function claimReward() {
  const pending = localStorage.getItem("pendingReward");

  if (!pending) {
    alert("لا يوجد إعلان مكتمل");
    return;
  }

  const ref = db.collection("users").doc(userId);
  const snap = await ref.get();
  const data = snap.data();

  if (data.adsToday >= maxAdsPerSession) {
    alert("وصلت للحد اليومي");
    return;
  }

  points += 10;

  await ref.update({
    points: points,
    adsToday: data.adsToday + 1,
    lastAdTime: Date.now()
  });

  document.getElementById("points").textContent = points;

  localStorage.removeItem("pendingReward");

  alert("تم إضافة 10 نقاط");
}

// =========================
// UI Helpers
// =========================
function watchPopup() {
  document.getElementById("rewardModal").style.display = "flex";
}

function closePopup() {
  document.getElementById("rewardModal").style.display = "none";
}