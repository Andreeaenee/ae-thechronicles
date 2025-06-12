import { titles } from './titles.js';

export function initializeSearch() {
  const input = document.getElementById('articleSearch');
  const list = document.getElementById('autocompleteList');

  input.addEventListener('input', () => {
    const val = input.value.toLowerCase();
    list.innerHTML = '';

    // ✅ Minimum 3 characters before showing results
    if (val.length < 3) {
      list.style.display = 'none';
      return;
    }

    const results = titles.filter((item) =>
      item.title.toLowerCase().includes(val)
    );

    results.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item.title;
      li.tabIndex = 0;
      li.addEventListener('click', () => {
        window.location.href = item.url;
      });
      list.appendChild(li);
    });

    list.style.display = results.length ? 'block' : 'none';
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.style.display = 'none';
    }
  });
}
