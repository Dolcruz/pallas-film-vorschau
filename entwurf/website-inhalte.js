const websiteContent = fetch("inhalte/website.json", { cache: "no-cache" }).then(response => {
  if (!response.ok) throw new Error("Website-Inhalte nicht verfügbar");
  return response.json();
});

websiteContent.then(content => {
  for (const element of document.querySelectorAll("[data-edit]")) {
    const [page, key] = element.dataset.edit.split(".");
    const value = content[page]?.[key];
    if (typeof value === "string") element.textContent = value;
  }
}).catch(() => {}); // Static copy remains visible.
