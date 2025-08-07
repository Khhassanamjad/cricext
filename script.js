const BASE_PATH = '/cricext'; // Important for GitHub Pages folder hosting

// Redirect fix for GitHub Pages SPA
if (
  location.pathname !== BASE_PATH + '/' &&
  !location.pathname.startsWith(BASE_PATH + '/')
) {
  const path = location.pathname.replace('/', '');
  location.replace(`${BASE_PATH}/#/${path}`);
}

// Function to fetch and load page content
function loadPage(url) {
  fetch(`${BASE_PATH}/${url}`)
    .then(res => {
      if (!res.ok) throw new Error('Page not found');
      return res.text();
    })
    .then(html => {
      document.getElementById('app').innerHTML = html;
      highlightActiveTab(url);
      if (url === 'cricext.html') fetchTweets();
    })
    .catch(err => {
      document.getElementById('app').innerHTML = `<p>Page not found.</p>`;
    });
}

// Handle active nav tab highlighting
function highlightActiveTab(url) {
  document.querySelectorAll('a[data-link]').forEach(link => {
    link.classList.remove('active');
    const linkHref = link.getAttribute('href').replace(BASE_PATH + '/', '');
    if (linkHref === url) {
      link.classList.add('active');
    }
  });
}

// SPA navigation
document.addEventListener('click', e => {
  const link = e.target.closest('a[data-link]');
  if (link) {
    e.preventDefault();
    const href = link.getAttribute('href').replace(BASE_PATH + '/', '');
    history.pushState(null, '', `${BASE_PATH}/${href}`);
    loadPage(href);
  }
});

// Browser back/forward navigation
window.addEventListener('popstate', () => {
  const path = location.pathname.replace(BASE_PATH + '/', '') || 'index.html';
  loadPage(path);
});

// Theme toggle
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

// Hamburger menu toggle
function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('open');
}

function closeMenuOnResize() {
  const navLinks = document.querySelector('.nav-links');
  if (window.innerWidth > 768) {
    navLinks.classList.remove('open');
  }
}

// Fetch scorecards
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

      if (data.length > 3) {
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

// Toggle more scores
function toggleMoreScores() {
  const extraSection = document.getElementById('extra-score-section');
  const btn = document.getElementById('more-scores-btn');
  if (extraSection.style.display === 'none') {
    extraSection.style.display = 'flex';
    btn.textContent = 'Hide Scores';
  } else {
    extraSection.style.display = 'none';
    btn.textContent = 'More Scores';
  }
}

// Fetch tweets
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

  // Optional: register service worker (if using)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${BASE_PATH}/service-worker.js`).catch(console.error);
  }
});
