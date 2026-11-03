const search = document.querySelector("#catalog-search");
const grid = document.querySelector("#catalog-grid");
const status = document.querySelector("#catalog-status");
const pagers = document.querySelectorAll(".catalog-pages");
const pageSize = 24;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let cardObserver;

function animateCards(direction = 0) {
  if (reducedMotion.matches) return;
  const cards = Array.from(grid.children);
  const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
  const offset = direction ? `${direction * 42}px 10px` : "0 32px";
  cardObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const card = entry.target;
      observer.unobserve(card);
      if (reducedMotion.matches || card.contains(document.activeElement)) continue;
      const delay = direction ? (cards.indexOf(card) % columns) * 45 : 0;
      card.animate(
        [{ opacity: .15, translate: offset }, { opacity: 1, translate: "none" }],
        { duration: 420, delay, fill: "backwards", easing: "cubic-bezier(.22, .65, .3, 1)" },
      );
    }
  });
  cards.forEach(card => cardObserver.observe(card));
}

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) grid.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
});

const localThumbnails = {
  "6tke-ZVcuN4": "uhrenmesse",
  "gMryRI4LG9I": "fortis",
  UsJOnPGgzYs: "norden",
  hxSdjQo1IAg: "oktoberfest",
  nFKBXVDtjhQ: "wiesn",
  T_TEwargiB0: "legenden",
  dl2eexe4mcw: "inseln",
};

function filmCard({ id, title, thumbnail }) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  const image = document.createElement("img");
  const heading = document.createElement("h3");
  const media = document.createElement("div");
  const play = document.createElement("span");
  link.href = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
  image.alt = "";
  image.width = 320;
  image.height = 180;
  image.loading = "lazy";
  image.decoding = "async";
  image.src = localThumbnails[id] ? `assets/${localThumbnails[id]}-karte.webp` : thumbnail;
  heading.textContent = title.trim().replace(/\s+/g, " ").replace(/\s+([!?.,:])/g, "$1").replace(/\s+[-–—]+$/, "");
  media.className = "catalog-card-media";
  play.className = "catalog-card-play";
  play.setAttribute("aria-hidden", "true");
  media.append(image, play);
  link.append(media, heading);
  item.append(link);
  return item;
}

async function loadCatalog() {
  try {
    const response = await fetch("dokus.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Katalog nicht verfügbar");
    const { films, statistics } = await response.json();
    const metrics = document.querySelector(".catalog-metrics");
    const number = new Intl.NumberFormat("de-DE");
    for (const metric of metrics.children) {
      const value = statistics[metric.dataset.stat];
      metric.hidden = value == null;
      if (value != null) metric.querySelector("dd").textContent = number.format(value);
    }
    metrics.hidden = !Array.from(metrics.children).some(metric => !metric.hidden);
    let page = 1;
    const searchText = value => value.normalize("NFC").trim().toLocaleLowerCase("de");
    function render() {
      cardObserver?.disconnect();
      const query = searchText(search.value);
      const matches = films.filter(film => searchText(film.title).includes(query));
      const pages = Math.ceil(matches.length / pageSize);
      const offset = (page - 1) * pageSize;
      grid.replaceChildren(...matches.slice(offset, offset + pageSize).map(filmCard));
      status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? "Film" : "Filme"}` : "Keine Filme gefunden.";
      for (const pager of pagers) {
        const label = pager.querySelector("[data-page-label]");
        label.textContent = `${page} / ${pages}`;
        label.setAttribute("aria-label", `Seite ${page} von ${pages}`);
        pager.hidden = pages <= 1;
        pager.querySelector('[data-step="-1"]').disabled = page <= 1;
        pager.querySelector('[data-step="1"]').disabled = page >= pages;
      }
    }
    for (const button of document.querySelectorAll(".catalog-pages button")) {
      button.addEventListener("click", () => {
        const direction = Number(button.dataset.step);
        page += direction;
        render();
        if (!button.closest(".catalog-toolbar")) {
          document.querySelector("#catalog-title").scrollIntoView();
        }
        animateCards(direction);
      });
    }
    search.disabled = false;
    search.addEventListener("input", () => {
      page = 1;
      render();
    });
    render();
    animateCards();
  } catch {
    status.textContent = "Die Filmliste ist gerade nicht verfügbar. Auf YouTube findest du den DOKU-Kanal.";
  }
}

loadCatalog();
