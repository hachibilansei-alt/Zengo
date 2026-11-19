/* Zengo Pro — site interactions */

// Catalog / grid filters (title search + kind/genre/platform)
(() => {
  const search = document.getElementById("searchInput");
  const cards = [...document.querySelectorAll(".review-card")];
  if (!cards.length) return;

  let kind = "all";
  let genre = "all";
  let platform = "all";

  function filterCards() {
    let shown = 0;
    const q = (search?.value || "").trim().toLocaleLowerCase("fa");
    cards.forEach((card) => {
      const okKind = kind === "all" || card.dataset.kind === kind;
      const okGenre = genre === "all" || card.dataset.genre === genre;
      const okPlatform =
        platform === "all" ||
        !card.dataset.platform ||
        (card.dataset.platform || "").toLowerCase().includes(platform.toLowerCase());
      const okText =
        !q ||
        (card.dataset.title || "").toLocaleLowerCase("fa").includes(q) ||
        card.innerText.toLocaleLowerCase("fa").includes(q);
      const show = okKind && okGenre && okPlatform && okText;
      card.classList.toggle("hidden", !show);
      if (show) shown++;
    });
    const count = document.getElementById("resultCount");
    if (count) count.textContent = shown + " مورد";
    document.getElementById("noResults")?.classList.toggle("hidden", shown !== 0);
  }

  search?.addEventListener("input", filterCards);

  document.querySelectorAll(".filter").forEach((b) => {
    b.addEventListener("click", () => {
      const group = b.closest(".filters");
      group?.querySelector(".filter.active")?.classList.remove("active");
      b.classList.add("active");
      if (b.dataset.kind) kind = b.dataset.kind;
      if (b.dataset.platform) platform = b.dataset.platform;
      filterCards();
    });
  });

  document.querySelectorAll(".genre").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelector(".genre.active")?.classList.remove("active");
      b.classList.add("active");
      genre = b.dataset.genre || "all";
      filterCards();
    });
  });
})();

// Service worker (PWA)
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Responsive side navigation
(() => {
  const sidePanel = document.getElementById("sidePanel");
  const sidebarScrim = document.getElementById("sidebarScrim");
  const menuToggle = document.getElementById("menuToggle");
  if (!menuToggle || !sidePanel || !sidebarScrim) return;

  const closeMenu = () => {
    sidePanel.classList.remove("open");
    sidebarScrim.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = sidePanel.classList.toggle("open");
    sidebarScrim.classList.toggle("show", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  sidebarScrim.addEventListener("click", closeMenu);
  sidePanel.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();

// Theme preference
(() => {
  const key = "zengo-theme";
  const button = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  const meta = document.getElementById("themeColorMeta");

  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    if (icon) icon.textContent = theme === "light" ? "☾" : "☀";
    const label = button?.querySelector(".theme-label");
    if (label) label.textContent = theme === "light" ? "حالت تاریک" : "حالت روشن";
    if (meta) meta.content = theme === "light" ? "#f3f5fa" : "#0b0d14";
  };

  let saved = "dark";
  try {
    saved = localStorage.getItem(key) || "dark";
  } catch (e) {}
  apply(saved);

  button?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    apply(next);
    try {
      localStorage.setItem(key, next);
    } catch (e) {}
  });
})();

// Reading progress on article pages
(() => {
  const article = document.querySelector(".article-body");
  if (!article) return;

  const barWrap = document.createElement("div");
  barWrap.className = "reading-progress";
  barWrap.setAttribute("aria-hidden", "true");
  const bar = document.createElement("div");
  bar.className = "reading-progress-bar";
  barWrap.appendChild(bar);
  document.body.prepend(barWrap);

  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const pct = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
    bar.style.width = pct + "%";
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
})();

// Subtle fade-in for lazy images
(() => {
  if (!("IntersectionObserver" in window)) return;
  const imgs = document.querySelectorAll("img[loading='lazy']");
  imgs.forEach((img) => {
    img.style.opacity = "0";
    img.style.transition = "opacity .45s ease";
    if (img.complete) {
      img.style.opacity = "1";
      return;
    }
    img.addEventListener("load", () => {
      img.style.opacity = "1";
    });
  });
})();
