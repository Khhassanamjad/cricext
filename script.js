document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle-theme");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");

  // Theme toggle
  const body = document.body;
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark");
    if (toggle) toggle.checked = true;
  }

  toggle?.addEventListener("change", () => {
    body.classList.toggle("dark");
    localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
  });

  // Hamburger menu toggle
  hamburger?.addEventListener("click", () => {
    navLinks?.classList.toggle("show");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks?.classList.remove("show");
    }
  });

  // SPA routing using hash (#home, #scores, #cricext)
  function loadPage() {
    const route = location.hash.replace("#", "") || "home";
    let file = "home.html";

    if (route === "scores") file = "scores.html";
    else if (route === "cricext") file = "cricext.html";

    fetch(file)
      .then(res => {
        if (!res.ok) throw new Error("Page not found");
        return res.text();
      })
      .then(html => {
        document.getElementById("app").innerHTML = html;
        highlightActiveTab(route);

        if (file === "scores.html") fetchScores();
        else if (file === "cricext.html") fetchTweets();
      })
      .catch(() => {
        document.getElementById("app").innerHTML = "<h2>404 - Page Not Found</h2>";
      });
  }

  function highlightActiveTab(current) {
    const links = document.querySelectorAll(".nav-links a");
    links.forEach(link => {
      const target = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", target === current);
    });
  }

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
          const isVisible = extraSection.style.display === "flex";
          extraSection.style.display = isVisible ? "none" : "flex";
          moreBtn.textContent = isVisible ? "More Scores" : "Less Scores";
        });
      });
  }

  function getFlag(team) {
    return team.toLowerCase().replace(/\s+/g, "-") + ".png";
  }

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

  // Hash routing
  window.addEventListener("hashchange", loadPage);
  loadPage();

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(err => {
      console.warn("Service Worker failed", err);
    });
  }
});
