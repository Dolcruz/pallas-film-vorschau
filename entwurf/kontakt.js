const form = document.querySelector(".contact-form");
const button = form.querySelector("button");
const messageStatus = document.querySelector("#contact-status");

form.addEventListener("submit", async event => {
  event.preventDefault();
  button.disabled = true;
  messageStatus.textContent = "Nachricht wird gesendet …";
  try {
    const response = await fetch(form.action, { method: "POST", body: new FormData(form) });
    const result = await response.json();
    messageStatus.textContent = result.message;
    if (response.ok && result.sent === true) form.reset();
  } catch {
    messageStatus.textContent = "Der Versand ist hier nicht verfügbar. Du kannst uns direkt per E-Mail erreichen.";
  } finally {
    button.disabled = false;
  }
});

const map = document.querySelector("#contact-map");
const preview = map.querySelector(".contact-map-start");
const frame = document.createElement("iframe");
frame.title = "Interaktive Google-Karte für Pallas Film am Baldusweg in München";
frame.referrerPolicy = "strict-origin-when-cross-origin";
frame.hidden = true;
frame.addEventListener("load", () => {
  frame.hidden = false;
  preview.hidden = true;
}, { once: true });
frame.src = "https://www.google.com/maps?q=Baldusweg%201%2C%2080997%20M%C3%BCnchen&hl=de&z=15&output=embed";
map.append(frame);
