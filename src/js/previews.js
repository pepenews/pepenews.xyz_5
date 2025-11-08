const API_URL = '/api/ingest';
const articlesContainer = document.getElementById('articles-container');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

let articles = [];

async function fetchArticles() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    articles = data.items || [];
    renderArticles();
  } catch (error) {
    console.error('Error fetching articles:', error);
    articlesContainer.innerHTML = `<div class="error">Error loading articles: ${error.message}</div>`;
  }
}

function renderArticles() {
  if (articles.length === 0) {
    articlesContainer.innerHTML = '<div class="loading">No articles found.</div>';
    return;
  }

  articlesContainer.innerHTML = '<div class="articles-grid"></div>';
  const grid = articlesContainer.querySelector('.articles-grid');

  articles.forEach((article, index) => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.addEventListener('click', () => openModal(index));

    card.innerHTML = `
      <h2>${escapeHtml(article.ppTitle || article.title)}</h2>
      <div class="date">${formatDate(article.pubDate)}</div>
      <div class="preview">${truncatePreview(article.preview || '')}</div>
    `;

    grid.appendChild(card);
  });
}

function openModal(index) {
  const article = articles[index];
  if (!article) return;

  modalBody.innerHTML = `
    <h2>${escapeHtml(article.ppTitle || article.title)}</h2>
    <div class="date">${formatDate(article.pubDate)}</div>
    <div class="preview">${escapeHtml(article.preview || 'No preview available.')}</div>
    <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="original-link">
      Original on CoinDesk
    </a>
  `;

  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

function formatDate(dateString) {
  if (!dateString) return 'Date unknown';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

function truncatePreview(text, maxLength = 150) {
  if (!text) return 'No preview available.';
  if (text.length <= maxLength) return escapeHtml(text);
  return escapeHtml(text.substring(0, maxLength)) + '...';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load articles on page load
fetchArticles();

