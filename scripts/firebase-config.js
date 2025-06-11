import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import {
  getFirestore,
  doc,
  onSnapshot,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAqcw40o8B68vFMEUVgRzBPrCOil06r8Bw',
  authDomain: 'ae-thechronicles.firebaseapp.com',
  projectId: 'ae-thechronicles',
  storageBucket: 'ae-thechronicles.firebasestorage.app',
  messagingSenderId: '451442760184',
  appId: '1:451442760184:web:40406d0e931dcec9421e0d',
  measurementId: 'G-0SQ9C8S3J4',
};

// Initialize Firebase
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export function initializeLikeSystem() {
  if (!db) return;

  const likeBtn = document.getElementById('like-button');
  const heartIcon = document.getElementById('heart-icon');
  const likeCountSpan = document.getElementById('like-count');

  if (!likeBtn || !heartIcon || !likeCountSpan) return;

  const articleId = window.location.pathname
    .split('/')
    .pop()
    .replace('.html', '');

  // Real-time updates
  const unsubscribe = onSnapshot(doc(db, 'articles', articleId), (docSnap) => {
    if (docSnap.exists()) {
      likeCountSpan.textContent = docSnap.data().likes || 0;
    }
  });

  // Initial state check
  const hasLiked = localStorage.getItem(`liked_${articleId}`);
  if (hasLiked) {
    heartIcon.classList.remove('fa-regular');
    heartIcon.classList.add('fa-solid', 'liked');
    likeBtn.disabled = true;
  }

  likeBtn.addEventListener('click', async () => {
    const alreadyLiked = localStorage.getItem(`liked_${articleId}`);
    if (alreadyLiked) return;

    // Optimistic UI update
    let currentCount = parseInt(likeCountSpan.textContent) || 0;
    likeCountSpan.textContent = currentCount + 1;
    heartIcon.classList.remove('fa-regular');
    heartIcon.classList.add('fa-solid', 'liked');
    likeBtn.disabled = true;
    localStorage.setItem(`liked_${articleId}`, 'true');

    try {
      const articleRef = doc(db, 'articles', articleId);

      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(articleRef);
        const currentLikes = docSnap.exists() ? docSnap.data().likes : 0;

        transaction.set(
          articleRef,
          {
            likes: currentLikes + 1,
          },
          { merge: true }
        );
      });
    } catch (error) {
      // Rollback UI changes
      likeCountSpan.textContent = currentCount;
      heartIcon.classList.remove('fa-solid', 'liked');
      heartIcon.classList.add('fa-regular');
      likeBtn.disabled = false;
      localStorage.removeItem(`liked_${articleId}`);

      console.error('Like failed:', error);
      likeBtn.textContent =
        error.code === 'permission-denied'
          ? 'Necesită actualizare ♻️'
          : 'Eroare la like ⚠️';

      setTimeout(() => {
        likeBtn.textContent = '❤️ Îmi place';
      }, 3000);
    }
  });

  // Cleanup function
  return () => {
    unsubscribe();
    likeBtn.replaceWith(likeBtn.cloneNode(true)); // Remove event listeners
  };
}

// --- Newsletter email signup logic ---
export function initializeNewsletterForm() {
  if (!db) return;

  const form = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('newsletterEmail');
  const messageDiv = document.getElementById('newsletterMessage');

  if (!form || !emailInput || !messageDiv) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email || !validateEmail(email)) {
      messageDiv.textContent = 'Te rog să introduci o adresă validă.';
      messageDiv.style.color = 'red';
      return;
    }

    try {
      const emailRef = collection(db, 'newsletterEmails');
      const q = query(emailRef, where('email', '==', email.toLowerCase()));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        messageDiv.textContent = 'Această adresă este deja abonată.';
        messageDiv.style.color = 'orange';
        return;
      }

      await addDoc(collection(db, 'newsletterEmails'), {
        email,
        timestamp: serverTimestamp(),
      });

      messageDiv.textContent = 'Mulțumim pentru abonare!';
      messageDiv.style.color = 'green';
      emailInput.value = '';
    } catch (error) {
      console.error('Eroare la salvarea email-ului:', error);
      messageDiv.textContent = 'A apărut o eroare. Încearcă din nou.';
      messageDiv.style.color = 'red';
    }
  });
}

// Simple email validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
