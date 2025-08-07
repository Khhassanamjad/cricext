document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle-theme");
  const body = document.body;
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
  }

  toggle?.addEventListener("click", () => {
    body.classList.toggle("dark");
    const theme = body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", theme);
  });

  hamburger?.addEventListener("click", () => {
    navLinks?.classList.toggle("active");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks?.classList.remove("active");
    }
  });

  function createScoreCard(match) {
    const card = document.createElement("div");
    card.className = "score-card";

    const flag1 = match.team1.toLowerCase().replace(/\s+/g, "-");
    const flag2 = match.team2.toLowerCase().replace(/\s+/g, "-");

    card.innerHTML = `
      <h3>
        <img src="flags/${flag1}.png" alt="${match.team1}" />
        ${match.team1} vs ${match.team2}
        <img src="flags/${flag2}.png" alt="${match.team2}" />
      </h3>
      <p>${match.team1}: ${match.score1}</p>
      <p>${match.team2}: ${match.score2}</p>
      <strong>${match.status}</strong>
    `;
    return card;
  }

  async function fetchScoresForHomeScreen() {
    try {
      const response = await fetch("scores.json");
      const scores = await response.json();

      const scoreSection = document.getElementById("score-section");
      const moreScoresBtn = document.getElementById("more-scores-btn");

      if (!scoreSection || !moreScoresBtn) return;

      const updateVisibleScores = () => {
        scoreSection.innerHTML = "";
        const isMobile = window.innerWidth < 992;
        const visibleCount = isMobile ? 2 : 3;

        scores.slice(0, visibleCount).forEach(score => {
          scoreSection.appendChild(createScoreCard(score));
        });

        moreScoresBtn.style.display = scores.length > visibleCount ? "block" : "none";
      };

      updateVisibleScores();
      window.addEventListener("resize", updateVisibleScores);

      moreScoresBtn.addEventListener("click", () => {
        history.pushState(null, "", "scores.html");
        loadPage("scores.html");
        navLinks?.classList.remove("active");
      });
    } catch (err) {
      console.error("Error fetching scores:", err);
    }
  }

  function fetchScores() {
    const section = document.getElementById("score-section");
    if (!section) return;

    fetch("scores.json")
      .then(res => res.json())
      .then(data => {
        section.innerHTML = "";
        data.forEach(match => {
          section.appendChild(createScoreCard(match));
        });
      })
      .catch(err => console.error("Error loading full scores:", err));
  }

  function fetchTweets() {
    fetch("tweets.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load tweets");
        return res.json();
      })
      .then(data => {
        const container = document.getElementById("tweets-container");
        if (!container) return;

        container.innerHTML = "";
        data.forEach(tweet => {
          const tweetCard = document.createElement("div");
          tweetCard.className = "tweet-card";
          tweetCard.innerHTML = `
            <div class="tweet-header">
              <img class="tweet-dp" src="x/${tweet.profilePic}" alt="Profile Picture" />
              <div class="tweet-user-info">
                <span class="tweet-name">${tweet.name}</span>
                <span class="tweet-handle">${tweet.handle} · 
                  <span class="tweet-time">${tweet.time}</span>
                </span>
              </div>
            </div>
            <p class="tweet-msg">${tweet.tweet}</p>
          `;
          container.appendChild(tweetCard);
        });
      })
      .catch(err => {
        console.error("Error loading tweets:", err);
        const container = document.getElementById("tweets-container");
        if (container) {
          container.innerHTML = `<p style="color: red; text-align: center;">Unable to load tweets.</p>`;
        }
      });
  }

  function loadPage(url) {
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Page not found");
        return res.text();
      })
      .then(html => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        const duplicateNav = tempDiv.querySelector(".navbar");
        if (duplicateNav) duplicateNav.remove();

        const scripts = tempDiv.querySelectorAll("script");
        scripts.forEach(script => script.remove());

        document.getElementById("app").innerHTML = tempDiv.innerHTML;

        highlightActiveTab(url);

        scripts.forEach(oldScript => {
          const newScript = document.createElement("script");
          if (oldScript.src) {
            newScript.src = oldScript.src;
          } else {
            newScript.textContent = oldScript.textContent;
          }
          document.body.appendChild(newScript);
        });

        switch (url) {
          case "home.html":
            fetchScoresForHomeScreen();
            break;
          case "scores.html":
            fetchScores();
            break;
          case "cricext.html":
            fetchTweets();
            break;
        }
      })
      .catch(() => {
        document.getElementById("app").innerHTML = `<div class="not-found">404 - Page Not Found</div>`;
        highlightActiveTab("");
      });
  }

  function highlightActiveTab(currentUrl) {
    document.querySelectorAll("a[data-link]").forEach(link => {
      const href = link.getAttribute("href");
      const path = currentUrl.split("/").pop();
      link.classList.toggle("active", href === path);
    });
  }

  document.querySelectorAll("a[data-link]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const url = link.getAttribute("href");
      if (location.pathname !== `/cricext/${url}`) {
        history.pushState(null, "", url);
        loadPage(url);
      }
      navLinks?.classList.remove("active");
    });
  });

  window.addEventListener("popstate", () => {
    const url = location.pathname.split("/").pop() || "home.html";
    loadPage(url);
  });

  const initialPage = location.pathname.split("/").pop() || "home.html";
  loadPage(initialPage);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/cricext/service-worker.js")
      .then(reg => {
        console.log("Service Worker registered:", reg);
      })
      .catch(err => {
        console.error("Service Worker registration failed:", err);
      });
  });
}
