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

const monetagLink = "https://omg10.com/4/10859582";

let points = 0;
let userId = "guest";
let sessionAds = 0;
const maxAdsPerSession = 5;

if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user) {
  userId = String(Telegram.WebApp.initDataUnsafe.user.id);
}

async function loadPoints() {
  const docRef = db.collection("users").doc(userId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    points = docSnap.data().points || 0;
  } else {
    await docRef.set({
      points: 0,
      lastAdTime: 0
    });
    points = 0;
  }

  document.getElementById("points").textContent = points;
}

loadPoints();

function watchPopup() {
  document.getElementById("rewardModal").style.display = "flex";
}

function closePopup() {
  document.getElementById("rewardModal").style.display = "none";
}

async function addPoints(amount) {
  points += amount;

  document.getElementById("points").textContent = points;

  await db.collection("users").doc(userId).update({
    points: points,
    lastAdTime: Date.now()
  });
}

async function watchAd() {
  if (sessionAds >= maxAdsPerSession) {
  alert("لقد وصلت للحد المسموح اليوم، حاول لاحقًا");
  return;
}

sessionAds++;

  const btns = document.querySelectorAll(".reward-btn");

  btns.forEach(btn => {
    btn.disabled = true;
    btn.innerText = "جارٍ فتح الإعلان...";
  });

  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.openLink(monetagLink);
  } else {
    window.open(monetagLink, "_blank");
  }

  setTimeout(async () => {
    try {
      points += 10;

      document.getElementById("points").textContent = points;

      await db.collection("users").doc(userId).update({
        points: points,
        lastAdTime: Date.now()
      });

      closePopup();

      alert("تمت إضافة 10 نقاط بنجاح");

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ النقاط");
    }

    btns.forEach(btn => {
      btn.disabled = false;
      btn.innerText = "🎁 شاهد إعلان واربح 10 نقاط";
    });

  }, 10000);
}