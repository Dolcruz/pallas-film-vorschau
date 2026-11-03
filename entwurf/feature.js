const films = [
  {
    key: "uhrenmesse",
    id: "6tke-ZVcuN4",
    title: "Watch Time – Die Welt der Uhren",
    category: "Handwerk",
    description: "Ein Blick hinter die Kulissen der Uhrenmesse in Düsseldorf und zu den Menschen hinter den Marken.",
  },
  {
    key: "fortis",
    id: "gMryRI4LG9I",
    title: "Die beste Uhr der Welt?",
    category: "Manufaktur",
    description: "Zu Besuch bei Fortis, wo die Schweizer Manufaktur Uhren für die Tiefsee und den Weltraum entwickelt.",
  },
  {
    key: "norden",
    id: "UsJOnPGgzYs",
    title: "Der Norden macht glücklich",
    category: "Reise",
    description: "Kopenhagen, Oslo und Tallinn. Was macht diese Städte so lebenswert?",
  },
  {
    key: "oktoberfest",
    id: "hxSdjQo1IAg",
    title: "Oktoberfest – Der große Abschied",
    category: "Kultur",
    description: "Der letzte Abend in der Fischer Vroni. Wirte, Gäste und die Münchner Zwietracht verabschieden sich von der Wiesn.",
  },
];

const artwork = document.querySelector(".feature-art");
const copy = document.querySelector(".feature-copy");
const title = document.querySelector("#feature-title");
const category = document.querySelector("#feature-category");
const intro = document.querySelector("#feature-intro");
const watch = document.querySelector(".watch");
const position = document.querySelector("#feature-position");
const status = document.querySelector("#feature-status");
const toggle = document.querySelector("#feature-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let index = 0;
let playing = !reducedMotion.matches;
let rotation;
let outgoingArtwork;
let artworkMotion;
let copyMotion;
const easeOut = "cubic-bezier(.22, .65, .3, 1)";

function showFilm(nextIndex, announce = false) {
  outgoingArtwork?.remove();
  artworkMotion?.cancel();
  copyMotion?.cancel();
  if (artwork.dataset.film && !reducedMotion.matches) {
    const direction = nextIndex > index ? 1 : -1;
    const previous = artwork.cloneNode();
    outgoingArtwork = previous;
    artwork.before(previous);
    const timing = { duration: 360, easing: easeOut };
    previous.animate(
      [{ opacity: 1, translate: "none" }, { opacity: 0, translate: `${-direction * 14}% 0` }],
      { ...timing, fill: "forwards" },
    ).addEventListener("finish", () => previous.remove());
    artworkMotion = artwork.animate(
      [{ opacity: 0, translate: `${direction * 14}% 0` }, { opacity: 1, translate: "none" }],
      timing,
    );
    copyMotion = copy.animate(
      [{ opacity: .45, translate: `${direction * 24}px 0` }, { opacity: 1, translate: "none" }],
      timing,
    );
  }
  index = (nextIndex + films.length) % films.length;
  const film = films[index];
  artwork.dataset.film = film.key;
  title.textContent = film.title;
  category.textContent = film.category;
  intro.textContent = film.description;
  watch.href = "https://www.youtube.com/watch?v=" + film.id;
  position.textContent = String(index + 1).padStart(2, "0") + " / 04";
  if (announce) status.textContent = (index + 1) + " von " + films.length + ": " + film.title;
}

function scheduleRotation() {
  clearInterval(rotation);
  toggle.setAttribute("aria-label", playing ? "Rotation pausieren" : "Rotation starten");
  toggle.firstElementChild.textContent = playing ? "Ⅱ" : "▶";
  if (playing) {
    rotation = setInterval(() => {
      if (!document.hidden && document.activeElement !== watch) showFilm(index + 1);
    }, 8000);
  }
}

function browse(direction) {
  showFilm(index + direction, true);
  scheduleRotation();
}

document.querySelector("#feature-prev").addEventListener("click", () => browse(-1));
document.querySelector("#feature-next").addEventListener("click", () => browse(1));
toggle.addEventListener("click", () => {
  playing = !playing;
  scheduleRotation();
});
reducedMotion.addEventListener("change", (event) => {
  playing = !event.matches;
  scheduleRotation();
});

showFilm(0);
scheduleRotation();

if (!reducedMotion.matches && !location.hash) {
  artworkMotion = artwork.animate(
    [{ opacity: .55, transform: "scale(1.025)" }, { opacity: 1, transform: "none" }],
    { duration: 650, easing: easeOut },
  );
  copyMotion = copy.animate(
    [{ opacity: .5, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }],
    { duration: 520, easing: easeOut },
  );
  document.querySelector(".feature-controls").animate(
    [{ opacity: .35, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
    { duration: 460, easing: easeOut },
  );
}

const sectionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.intersectionRatio < .15) continue;
    sectionObserver.unobserve(entry.target);
    if (reducedMotion.matches || entry.target.contains(document.activeElement)) continue;
    entry.target.animate(
      [{ opacity: .45, translate: "0 24px" }, { opacity: 1, translate: "none" }],
      { duration: 480, easing: easeOut },
    );
  }
}, { threshold: .15 });
for (const element of document.querySelectorAll(
  ".films .section-heading, .film-grid > *, .platforms > :not(.platform-grid), .platform-grid > *, .studio-inner > *, .partners h2, .partner-grid",
)) {
  sectionObserver.observe(element);
}
