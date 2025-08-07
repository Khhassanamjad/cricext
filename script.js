document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle-theme");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");

  // Redirect fix for GitHub Pages (force index.html)
  if (location.pathname !== "/" && !location.pathname.includes("cricext")) {
    location.replace("/cricext/");
    return;
  }

  // Theme toggle
  const body = document.body;
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    body.classList.toggle("dark");
    localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
  });

  // Hamburger menu toggle
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("show");
    }
  });

  // Page routing based on hash
  function loadPage() {
    const route = location.hash.slice(1) || "/";
    let file = "home.html";
    if (route === "/scores") file = "scores.html";
    else if (route === "/cricext") file = "cricext.html";

    fetch(file)
      .then(res => res.text())
      .then(html => {
        document.getElementById("app").innerHTML = html;
        if (file === "scores.html") fetchScores();
        if (file === "cricext.html") fetchTweets();
        highlightActiveTab();
      })
      .catch(() => {
        document.getElementById("app").innerHTML = "<h2>Page not found</h2>";
      });
  }

  function highlightActiveTab() {
    const links = document.querySelectorAll(".nav-links a");
    links.forEach(link => link.classList.remove("active"));
    const currentHash = location.hash || "#/";
    links.forEach(link => {
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });
  }

  // Fetch scores from JSON
  function fetchScores() {
    fetch("scores.json")
      .then(res => res.json())
      .then(data => {
        const scoreSection = document.getElementById("score-section");
        const extraSection = document.getElementById("extra-score-section");
        const moreBtn = document.getElementById("more-scores");

        if (!data || !Array.isArray(data.scores)) return;

        const createScoreCard = (match) => {
          const card = document.createElement("div");
          card.className = "score-card";
          card.innerHTML = `
            <div class="team-names">${match.teams}</div>
            <div class="scores">${match.score}</div>
            <div class="status">${match.status}</div>
            <img src="flags/${getFlag(match.teams.split('vs')[0].trim())}" class="flag left-flag">
            <img src="flags/${getFlag(match.teams.split('vs')[1].trim())}" class="flag right-flag">
          `;
          return card;
        };

        scoreSection.innerHTML = "";
        extraSection.innerHTML = "";

        const matches = data.scores;
        matches.slice(0, 3).forEach(match => scoreSection.appendChild(createScoreCard(match)));
        matches.slice(3).forEach(match => extraSection.appendChild(createScoreCard(match)));

        moreBtn.style.display = matches.length > 3 ? "block" : "none";
        extraSection.style.display = "none";

        moreBtn.addEventListener("click", () => {
          extraSection.style.display = extraSection.style.display === "none" ? "flex" : "none";
          moreBtn.textContent = extraSection.style.display === "none" ? "More Scores" : "Less Scores";
        });
      });
  }

  function getFlag(team) {
    return team.toLowerCase().replace(/\s+/g, "-") + ".png";
  }

  // Fetch tweets from JSON
  function fetchTweets() {
    fetch("tweets.json")
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById("tweet-container");
        if (!container || !data || !Array.isArray(data.tweets)) return;
        container.innerHTML = "";
        data.tweets.forEach(tweet => {
          const div = document.createElement("div");
          div.className = "tweet-card";
          div.innerHTML = `
            <div class="tweet-header">
              <img src="${tweet.dp}" alt="DP" class="tweet-dp">
              <div class="tweet-user">
                <div class="tweet-name">${tweet.name}</div>
                <div class="tweet-handle">@${tweet.handle}</div>
              </div>
            </div>
            <div class="tweet-msg">${tweet.msg}</div>
            <div class="tweet-time">${tweet.time}</div>
          `;
          container.appendChild(div);
        });
      });
  }

  // Hash change listener
  window.addEventListener("hashchange", loadPage);
  loadPage();

  // Register service worker (optional)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/cricext/service-worker.js").catch(err => {
      console.warn("Service Worker failed", err);
    });
  }
});
