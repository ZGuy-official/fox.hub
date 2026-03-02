const search = document.getElementById('search');
const items = [...document.querySelectorAll('#web-list li')];

if (search) {
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const tags = (item.dataset.tags || '').toLowerCase();
      item.classList.toggle('hidden', q && !text.includes(q) && !tags.includes(q));
    });
  });
}
