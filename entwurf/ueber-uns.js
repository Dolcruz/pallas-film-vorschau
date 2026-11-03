const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

async function loadTimeline() {
  const { chronik: entries } = await websiteContent;
  const timeline = document.querySelector(".about-timeline");
  for (const entry of entries) {
    const item = document.createElement("li");
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const year = document.createElement("span");
    const title = document.createElement("strong");
    const icon = document.createElement("span");
    year.className = "about-year";
    year.textContent = entry.year;
    title.textContent = entry.title;
    icon.className = "timeline-icon";
    icon.setAttribute("aria-hidden", "true");
    summary.append(year, title, icon);
    details.append(summary);
    for (const paragraph of entry.body.split(/\n\s*\n/)) {
      const text = document.createElement("p");
      text.textContent = paragraph;
      details.append(text);
    }
    item.append(details);
    timeline.append(item);
  }

  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reducedMotion.matches || entry.target.contains(document.activeElement)) continue;
      entry.target.animate(
        [{ opacity: .25, translate: "0 16px" }, { opacity: 1, translate: "none" }],
        { duration: 420, easing: "cubic-bezier(.22, .65, .3, 1)" },
      );
    }
  });
  document.querySelectorAll(".about-timeline summary").forEach(station => observer.observe(station));
}

loadTimeline().catch(() => {
  document.querySelector("#timeline-status").textContent = "Die Chronik ist gerade nicht verfügbar.";
});
