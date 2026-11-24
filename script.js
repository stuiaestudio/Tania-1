document.documentElement.classList.add("js");

/* ---------- Galería: lightbox con anterior / siguiente ---------- */
const lightbox = document.querySelector(".lightbox");

if (lightbox && typeof lightbox.showModal === "function") {
  const allLinks = [...document.querySelectorAll(".gallery-photo")];
  let links = allLinks;
  const enlarged = lightbox.querySelector("img");
  const caption = lightbox.querySelector(".lb-caption");
  const count = lightbox.querySelector(".lb-count");
  let current = 0;

  const show = (index) => {
    links = allLinks.filter((l) => !l.closest("figure").hidden);
    current = (index + links.length) % links.length;
    const link = links[current];
    const thumb = link.querySelector("img");
    enlarged.src = link.href;
    enlarged.alt = thumb.alt;
    caption.textContent = link.closest("figure").querySelector("figcaption").textContent.replace("↗", "").trim();
    count.textContent = `${current + 1} / ${links.length}`;
  };

  allLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      links = allLinks.filter((l) => !l.closest("figure").hidden);
      show(links.indexOf(link));
      lightbox.showModal();
    });
  });

  lightbox.querySelector(".lb-close").addEventListener("click", () => lightbox.close());
  lightbox.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });

  // Deslizar con el dedo en móvil
  let startX = null;
  lightbox.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
}

/* ---------- Filtros de la galería ---------- */
const filterButtons = document.querySelectorAll("[data-filter]");
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.filter;
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    document.querySelectorAll(".gallery figure").forEach((fig) => {
      fig.hidden = cat !== "todos" && fig.dataset.cat !== cat;
      if (!fig.hidden) fig.classList.add("is-visible");
    });
  });
});

/* ---------- Reseñas: el verde sigue al ratón, al dedo o al teclado ---------- */
const reviewCards = document.querySelectorAll(".review-grid article");
const activate = (card) => reviewCards.forEach((c) => c.classList.toggle("is-active", c === card));
reviewCards.forEach((card) => {
  card.addEventListener("pointerenter", () => activate(card));
  card.addEventListener("pointerdown", () => activate(card));
  card.addEventListener("focus", () => activate(card));
});

/* ---------- Comparador antes / después ---------- */
document.querySelectorAll(".compare").forEach((compare) => {
  const range = compare.querySelector(".compare-range");
  const update = () => compare.style.setProperty("--pos", `${range.value}%`);
  range.addEventListener("input", update);
  update();
});

/* ---------- Abierto ahora (hora de Canarias) ---------- */
const status = document.querySelector("[data-open-status]");
if (status) {
  const OPEN = 9 * 60 + 30, CLOSE = 19 * 60;
  const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Atlantic/Canary", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const workday = day >= 2 && day <= 5;
  const text = status.querySelector("[data-open-text]");

  if (workday && minutes >= OPEN && minutes < CLOSE) {
    status.classList.add("is-open");
    text.textContent = "Abierto ahora · hasta las 19:00";
  } else {
    let next = day;
    if (!(workday && minutes < OPEN)) {
      do { next = (next + 1) % 7; } while (next < 2 || next > 5);
    }
    text.textContent = `Cerrado · abre ${next === day ? "hoy" : next === (day + 1) % 7 ? "mañana" : "el " + DAYS[next]} a las 09:30`;
  }
  status.hidden = false;

  const today = document.querySelector(`.hours tr[data-day="${day}"]`);
  if (today) today.classList.add("is-today");
}

/* ---------- Mapa bajo demanda ---------- */
const map = document.querySelector(".map");
if (map) {
  const mapButton = map.querySelector("button");
  mapButton.hidden = false;
  mapButton.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.title = "Mapa de Las Tijeras de Tania, Calle María Estrada 19";
    frame.src = "https://maps.google.com/maps?q=Las+Tijeras+de+Tania,+Calle+Mar%C3%ADa+Estrada+19,+Puerto+del+Rosario&z=16&output=embed";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.loading = "lazy";
    map.append(frame);
    mapButton.hidden = true;
    map.querySelector(".map-fallback").focus();
  }, { once: true });
}

/* ---------- Aparición suave al hacer scroll ---------- */
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  revealItems.forEach((el) => io.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Año del pie ---------- */
const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
