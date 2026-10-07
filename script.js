/* ===== ROYAL GRACE — edit this block for each new couple ===== */
const weddingConfig = {
  groomName: "Hamza Syed",
  groomFather: "Jaffer Syed",
  brideName: "BRIDE NAME",
  brideFather: "Alif Syed",

  weddingDate: "2026-10-24",
  eventStart: "11:00 AM",
  eventEnd: "3:00 PM",

  venueName: "Sham Palace Shadi Hall",
  location: "Civil Quarter",

  googleMapsUrl: "YOUR_GOOGLE_MAPS_URL", // paste a full https:// link; until then buttons open a Maps search

  groomWhatsApp: "", // digits with country code, e.g. 923001234567
  brideWhatsApp: "",

  musicFile: "assets/wedding-music.mp3",
  rsvpEndpoint: "", // optional: Formspree / Supabase / Firebase function URL (POST JSON)

  timeline: [
    ["11:00 AM", "Guest Arrival"], ["12:00 PM", "Wedding Ceremony"],
    ["1:00 PM", "Celebration"], ["2:00 PM", "Lunch"], ["3:00 PM", "Farewell"]
  ],
  images: Array.from({ length: 9 }, (_, i) => `assets/images/photo${i + 1}.jpg`)
};
/* ============================================================== */

(() => {
  const C = weddingConfig;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, "0");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const title = s => (s === s.toUpperCase() ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : s);

  const [y, mo, d] = C.weddingDate.split("-").map(Number);
  const V = {
    groom: title(C.groomName), bride: title(C.brideName),
    groomFather: C.groomFather, brideFather: C.brideFather,
    dateLong: new Date(y, mo - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    dateDots: `${pad(d)} • ${pad(mo)} • ${y}`,
    time: `${C.eventStart} — ${C.eventEnd}`, venue: C.venueName, location: C.location
  };
  $$("[data-b]").forEach(e => { e.textContent = V[e.dataset.b] ?? ""; });
  if (C.brideName.trim().toUpperCase() === "BRIDE NAME") $$('[data-b="bride"]').forEach(e => e.classList.add("ph"));

  const pageTitle = `${V.groom} & ${V.bride} | Wedding Invitation`;
  const desc = `You are warmly invited to celebrate the wedding of ${V.groom} & ${V.bride}.`;
  document.title = pageTitle;
  const meta = (sel, v) => { const m = $(sel); if (m) m.setAttribute("content", v); };
  meta('meta[name="description"]', desc); meta('meta[property="og:title"]', pageTitle);
  meta('meta[property="og:description"]', desc); meta('meta[property="og:url"]', location.href.split("#")[0]);

  const mapUrl = /^https?:\/\//.test(C.googleMapsUrl) ? C.googleMapsUrl
    : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${C.venueName} ${C.location}`);
  $$("[data-map]").forEach(a => { a.href = mapUrl; });

  $("#timeline").innerHTML = C.timeline.map(([t, l]) => `<li><b>${t}</b>${l}</li>`).join("");

  /* Countdown */
  const tm = /(\d+):(\d+)\s*(AM|PM)/i.exec(C.eventStart) || [0, 0, 0, "AM"];
  let h = Number(tm[1]) % 12; if (/pm/i.test(tm[3])) h += 12;
  const target = new Date(y, mo - 1, d, h, Number(tm[2]) || 0);
  const setN = (id, v) => { const e = $("#" + id); if (e) e.textContent = v; };
  const iv = setInterval(tick, 1000);
  function tick() {
    const t = target - Date.now();
    if (t <= 0) { $("#cd").innerHTML = '<p class="arrived">The Day Has Arrived</p>'; clearInterval(iv); return; }
    const s = Math.floor(t / 1000);
    setN("cdD", Math.floor(s / 86400)); setN("cdH", pad(Math.floor(s % 86400 / 3600)));
    setN("cdM", pad(Math.floor(s % 3600 / 60))); setN("cdS", pad(s % 60));
  }
  tick();

  /* Gallery + lightbox */
  const PH = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="100%" height="100%" fill="#efe4cf"/><rect x="24" y="24" width="552" height="752" fill="none" stroke="#D4AF37"/><text x="50%" y="50%" fill="#8C6A3B" font-family="serif" font-size="30" text-anchor="middle">Your Photo</text></svg>');
  const grid = $("#grid"), lb = $("#lb"), lbImg = $("#lbImg");
  let idx = 0, opener = null;
  C.images.forEach((src, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", `Open photo ${i + 1}`);
    const im = new Image(); im.loading = "lazy"; im.alt = `Wedding photo ${i + 1}`;
    im.onerror = () => { im.onerror = null; im.src = PH; };
    im.src = src; b.append(im);
    b.onclick = () => { opener = b; show(i); lb.classList.add("open"); $("#lbClose").focus(); };
    grid.append(b);
  });
  function show(i) {
    const n = grid.children.length; idx = (i + n) % n;
    const im = grid.children[idx].firstChild; lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt;
  }
  const closeLb = () => { lb.classList.remove("open"); if (opener) opener.focus(); };
  $("#lbClose").onclick = closeLb; $("#lbPrev").onclick = () => show(idx - 1); $("#lbNext").onclick = () => show(idx + 1);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") show(idx - 1); else if (e.key === "ArrowRight") show(idx + 1);
  });

  /* Music (starts only after Open Invitation) */
  const mBtn = $("#music"); const audio = new Audio(); audio.loop = true; audio.preload = "none";
  const setOn = on => { mBtn.classList.toggle("on", on); mBtn.setAttribute("aria-pressed", on); mBtn.setAttribute("aria-label", on ? "Pause music" : "Play music"); };
  audio.onplay = () => setOn(true); audio.onpause = () => setOn(false);
  audio.onerror = () => { mBtn.hidden = true; };
  mBtn.onclick = () => { if (audio.paused) { const p = audio.play(); if (p) p.catch(() => {}); } else audio.pause(); };
  function startMusic() {
    mBtn.hidden = false; audio.src = C.musicFile;
    try { const p = audio.play(); if (p) p.catch(() => {}); } catch (e) {}
  }

  /* Reveal + particles */
  function startReveal() {
    const els = $$(".rv");
    if (!("IntersectionObserver" in window) || reduce) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .15 });
    els.forEach(e => io.observe(e));
  }
  function particles() {
    if (reduce) return;
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("span"); p.className = "pt"; p.setAttribute("aria-hidden", "true");
      p.style.left = Math.random() * 100 + "vw"; p.style.animationDuration = 16 + Math.random() * 16 + "s";
      p.style.animationDelay = -Math.random() * 20 + "s"; document.body.append(p);
    }
  }

  /* Open invitation */
  $("#openBtn").onclick = () => {
    const cover = $("#cover");
    cover.classList.add("open"); document.body.classList.add("opened"); document.body.classList.remove("locked");
    window.scrollTo(0, 0); startMusic(); startReveal(); particles();
    setTimeout(() => cover.remove(), reduce ? 50 : 2000);
  };

  /* Navigation */
  const burger = $("#burger"), menu = $("#menu");
  const toggle = o => { menu.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); };
  burger.onclick = () => toggle(!menu.classList.contains("open"));
  $$("#menu a").forEach(a => a.addEventListener("click", () => toggle(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false); });

  /* RSVP — replace/extend submitRSVP to connect a backend */
  async function submitRSVP(data) {
    try { const l = JSON.parse(localStorage.getItem("rsvps") || "[]"); l.push(data); localStorage.setItem("rsvps", JSON.stringify(l)); } catch (e) {}
    if (C.rsvpEndpoint) await fetch(C.rsvpEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  }
  $("#form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target, err = $("#err"), btn = f.querySelector("button");
    const data = { name: f.name.value.trim(), guests: Number(f.guests.value), attendance: (f.attend.value || ""), message: f.message.value.trim(), date: new Date().toISOString() };
    if (!data.name) { err.textContent = "Please enter your full name."; f.name.focus(); return; }
    if (!(data.guests >= 1)) { err.textContent = "Please enter the number of guests."; f.guests.focus(); return; }
    if (!data.attendance) { err.textContent = "Please choose whether you can attend."; return; }
    err.textContent = ""; btn.disabled = true;
    try { await submitRSVP(data); } catch (x) { err.textContent = "Could not send your RSVP. Please try again."; btn.disabled = false; return; }
    const yes = data.attendance.startsWith("Joyfully");
    $("#thanksMsg").textContent = yes ? `Thank you, ${data.name}. We look forward to celebrating with you.` : `Thank you, ${data.name}. You will be missed, and we are grateful for your good wishes.`;
    f.hidden = true; const t = $("#thanks"); t.hidden = false; t.focus();
  });

  /* Share */
  $("#share").onclick = async () => {
    const text = `You're warmly invited to celebrate the wedding of ${V.groom} & ${V.bride}.`, url = location.href.split("#")[0];
    if (navigator.share) { try { await navigator.share({ title: pageTitle, text, url }); return; } catch (e) { if (e.name === "AbortError") return; } }
    window.open("https://wa.me/?text=" + encodeURIComponent(text + "\n" + url), "_blank", "noopener");
  };

  /* Optional WhatsApp contacts (shown only if numbers are set) */
  const wa = [["Groom's side", C.groomWhatsApp], ["Bride's side", C.brideWhatsApp]].filter(x => x[1]);
  if (wa.length) {
    const box = document.createElement("p"); box.className = "note";
    box.innerHTML = "Questions? " + wa.map(([l, n]) => `<a href="https://wa.me/${n.replace(/\D/g, "")}" target="_blank" rel="noopener">${l} on WhatsApp</a>`).join(" · ");
    $("#rsvp").append(box);
  }
})();
