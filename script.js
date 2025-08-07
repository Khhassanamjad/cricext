document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle-theme");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");
  const app = document.getElementById("app");

  const BASE_PATH = "/cricext/"; // <-- Important for GitHub Pages

  // 🌙 Theme Toggle
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  // 🍔 Hamburger Toggle
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("show");
    }
  });

  // 🔁 Routing Logic
  function navigateTo(url) {
    history.pushState(null, null, BASE_PATH + url);
    loadPage(url);
  }

  async function loadPage(page) {
    try {
      const res = await fetch(`${BASE_PATH}${page}`);
      const html = await res.text();
      app.innerHTML = html;
      highlightActiveTab(page);
    } catch (err) {
      app.innerHTML = "<h2>Page not found.</h2>";
    }
  }

  // 🔗 Link Intercept for SPA
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (link) {
      e.preventDefault();
      const href = link.getAttribute("href");
      const path = href.startsWith("/") ? href.slice(1) : href;
      navigateTo(path);
    }
  });

  // 🔄 Back/Forward Browser Buttons
  window.addEventListener("popstate", () => {
    const path = window.location.pathname.replace(BASE_PATH, "");
    loadPage(path || "index.html");
  });

  // ⭐ Highlight Active Tab
  function highlightActiveTab(path) {
    document.querySelectorAll("nav a[data-link]").forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === path);
    });
  }

  // 🚀 Initial Load
  const initialPath = window.location.pathname.replace(BASE_PATH, "") || "index.html";
  loadPage(initialPath);
});
