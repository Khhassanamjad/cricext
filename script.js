// Detect if running on GitHub Pages or locally
const BASE_PATH = window.location.hostname === 'khhassanamjad.github.io' ? '/cricext' : '';

// Helper: get correct page path for both localhost & GitHub Pages
function getPagePath(page) {
  return `${BASE_PATH}/${page}`.replace(/\/+/, '/');
}

// Load page content into #app without duplicating nav
function loadPage(url) {
  fetch(getPagePath(url))
    .then(res => {
      if (!res.ok) throw new Error('Page not found');
      return res.text();
    })
    .then(html => {
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // If fetched page has #app, use its innerHTML; otherwise, use all content
      const newContent = temp.querySelector('#app')
        ? temp.querySelector('#app').innerHTML
        : temp.innerHTML;

      document.getElementById('app').innerHTML = newContent;

      highlightActiveTab(url);
      if (url === 'cricext.html') fetchTweets();
    })
    .catch(() => {
      document.getElementById('app').innerHTML = `<p>Page not found.</p>`;
    });
}

// Highlight active link
function highlightActiveTab(url) {
  document.querySelectorAll('a[data-link]').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === url) {
      link.classList.add('active');
    }
  });
}

// SPA link clicks
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (!link) return;

  e.preventDefault();
  const href = link.getAttribute("href");

  history.pushState(null, null, getPagePath(href));
  loadPage(href);
});

// Handle browser navigation
window.addEventListener('popstate', () => {
  const currentPath = location.pathname.replace(BASE_PATH + '/', '') || 'index.html';
  loadPage(currentPath);
});

// Theme toggle
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  document.body.classList.toggle('dark', savedTheme === 'dark');
}

// Hamburger menu
function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

function closeMenuOnResize() {
  if (window.innerWidth > 768) {
    document.querySelector('.nav-links').classList.remove('open');
  }
}

// Fetch scores
function fetchScores() {
  fetch(`${BASE_PATH}/scores.json`)
    .then(res => res.json())
    .then(data => {
      const scoreSection = document.getElementById('score-section');
      const extraSection = document.getElementById('extra-score-section');
      const moreBtn = document.getElementById('more-scores-btn');

      if (!data || data.length === 0) return;

      scoreSection.innerHTML = '';
      extraSection.innerHTML = '';

      data.forEach((match, i) => {
        const card = createScoreCard(match);
        if (i < 3) scoreSection.appendChild(card);
        else extraSection.appendChild(card);
      });

      if (data.length > 3 && moreBtn) {
        moreBtn.style.display = 'block';
      }
    })
    .catch(console.error);
}

function createScoreCard(match) {
  const card = document.createElement('div');
  card.className = 'score-card';
  const team1 = match.team1.replace(/\s+/g, '').toLowerCase();
  const team2 = match.team2.replace(/\s+/g, '').toLowerCase();
  card.innerHTML = `
    <div class="team">
      <img src="${BASE_PATH}/flags/${team1}.png" alt="${match.team1}" />
      <span>${match.team1}</span>
    </div>
    <div class="score">${match.score1}</div>
    <div class="vs">vs</div>
    <div class="score">${match.score2}</div>
    <div class="team">
      <img src="${BASE_PATH}/flags/${team2}.png" alt="${match.team2}" />
      <span>${match.team2}</span>
    </div>
  `;
  return card;
}

// More scores toggle
function toggleMoreScores() {
  const extraSection = document.getElementById('extra-score-section');
  const btn = document.getElementById('more-scores-btn');
  if (!extraSection || !btn) return;

  if (extraSection.style.display === 'none') {
    extraSection.style.display = 'flex';
    btn.textContent = 'Hide Scores';
  } else {
    extraSection.style.display = 'none';
    btn.textContent = 'More Scores';
  }
}

// Tweets
function fetchTweets() {
  fetch(`${BASE_PATH}/tweets.json`)
    .then(res => res.json())
    .then(data => {
      const tweetContainer = document.getElementById('tweet-section');
      if (!tweetContainer || !data) return;
      tweetContainer.innerHTML = '';
      data.forEach(tweet => {
        const card = document.createElement('div');
        card.className = 'tweet-card';
        card.innerHTML = `
          <div class="tweet-header">
            <img src="${tweet.profilePic}" alt="dp" class="tweet-dp">
            <div class="tweet-user">
              <span class="tweet-name">${tweet.name}</span>
              <span class="tweet-handle">@${tweet.handle}</span>
            </div>
            <span class="tweet-time">${tweet.time}</span>
          </div>
          <div class="tweet-message">${tweet.message}</div>
        `;
        tweetContainer.appendChild(card);
      });
    })
    .catch(console.error);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();

  const toggle = document.getElementById('toggle-theme');
  const hamburger = document.getElementById('hamburger');
  const moreBtn = document.getElementById('more-scores-btn');

  if (toggle) toggle.addEventListener('click', toggleTheme);
  if (hamburger) hamburger.addEventListener('click', toggleMenu);
  if (moreBtn) moreBtn.addEventListener('click', toggleMoreScores);

  window.addEventListener('resize', closeMenuOnResize);

  const path = location.pathname.replace(BASE_PATH + '/', '') || 'index.html';
  loadPage(path);
  fetchScores();

  // Register service worker (optional)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${BASE_PATH}/service-worker.js`).catch(console.error);
  }
});
