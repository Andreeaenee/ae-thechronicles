import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import {
  getFirestore,
  doc,
  onSnapshot,
  runTransaction,
  increment,
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

  // Like button handler
  likeBtn.addEventListener('click', async () => {
    if (hasLiked) return;

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

      localStorage.setItem(`liked_${articleId}`, 'true');
      likeBtn.disabled = true;
      heartIcon.classList.remove('fa-regular');
      heartIcon.classList.add('fa-solid', 'liked');
    } catch (error) {
      console.error('Like error:', error);
      likeBtn.textContent =
        error.code === 'permission-denied'
          ? 'Necesită actualizare ♻️'
          : 'Eroare neașteptată ⚠️';

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
