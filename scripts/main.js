// Mobile Menu Toggle
document.querySelector('.menu-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('active');
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth',
    });
  });
});

// Scroll Animations
window.addEventListener('scroll', () => {
  const elements = document.querySelectorAll('.animate-on-scroll');

  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;

    if (elementTop < window.innerHeight && elementBottom > 0) {
      element.classList.add('active');
    }
  });
});

// Dynamic Copyright Year
document.querySelector('#copyright-year').textContent =
  new Date().getFullYear();

// Image Lazy Loading
const lazyImages = document.querySelectorAll('img.lazy');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

lazyImages.forEach((img) => {
  imageObserver.observe(img);
});

// Contact Form Handling
document
  .getElementById('contact-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      const response = await fetch('https://formspree.io/f/your-form-id', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        alert('Mesaj trimis cu succes!');
      }
    } catch (error) {
      console.error('Eroare:', error);
    }
  });

// Fade-in on scroll
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -20px 0px',
};

const appearOnScroll = new IntersectionObserver(function (entries, observer) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach((fader) => {
  appearOnScroll.observe(fader);
});

// Filtering functionality
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const filter = urlParams.get('filter') || 'all';

  const articles = document.querySelectorAll('.article-card');
  const sectionTitle = document.querySelector('.section-title');

  // Update title based on filter
  const filterTitles = {
    reflection: 'Reflecții',
    fashion: 'Modă',
    arta: 'Artă',
    all: 'Toate Articolele',
  };
  sectionTitle.textContent = filterTitles[filter];

  // Filter articles
  articles.forEach((article) => {
    if (filter === 'all' || article.dataset.tag === filter) {
      article.style.display = 'block';
    } else {
      article.style.display = 'none';
    }
  });
});


// Add active class to current filter
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentFilter = urlParams.get('filter');

  if (currentFilter) {
    const filterLinks = document.querySelectorAll('.filter-btn');
    filterLinks.forEach((link) => {
      if (link.getAttribute('href').includes(currentFilter)) {
        link.classList.add('active-filter');
      }
    });
  }
});
