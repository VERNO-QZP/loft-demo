(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const io = "IntersectionObserver" in window;

  /* появление блоков */
  if (io) {
    root.classList.add("js");
    const ob = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); ob.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    $$(".rv").forEach((el) => ob.observe(el));
  }

  /* меню */
  const burger = $("[data-burger]"), menu = $("[data-menu]");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { menu.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("open"))); }
    else { menu.classList.remove("open"); setTimeout(() => { if (burger.getAttribute("aria-expanded") === "false") menu.hidden = true; }, 700); }
  };
  burger?.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  menu?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && burger?.getAttribute("aria-expanded") === "true") { setMenu(false); burger.focus(); } });

  /* вкладки цен */
  $$("[data-tabs]").forEach((t) => {
    const tabs = $$("[role=tab]", t);
    const pick = (b, focus) => { tabs.forEach((x) => { const on = x === b; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; }); if (focus) b.focus(); };
    tabs.forEach((b, i) => {
      b.addEventListener("click", () => pick(b));
      b.addEventListener("keydown", (e) => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); } });
    });
    const h = location.hash.slice(1); const pre = tabs.find((b) => b.id === "t-" + h); if (pre) pick(pre);
  });

  /* фильтр мастеров */
  $$(".chip[data-f]").forEach((c) => c.addEventListener("click", () => {
    $$(".chip[data-f]").forEach((x) => x.setAttribute("aria-pressed", x === c));
    $$("[data-ms] .m").forEach((m) => (m.hidden = c.dataset.f !== "all" && m.dataset.dir !== c.dataset.f));
  }));

  /* слоган: слова загораются по одному при прокрутке */
  $$("[data-words]").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    const ws = $$(".w", el);
    if (!io) return ws.forEach((w) => w.classList.add("on"));
    let ticking = false;
    const upd = () => { ticking = false; const line = innerHeight * 0.7; ws.forEach((w) => w.classList.toggle("on", w.getBoundingClientRect().top < line)); };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } };
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { addEventListener("scroll", onScroll, { passive: true }); upd(); } else removeEventListener("scroll", onScroll); }).observe(el);
  });

  /* карта по клику */
  $$("[data-map-load]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest("[data-map]"); const f = document.createElement("iframe");
    f.src = box.dataset.map; f.title = "Студия ЛОФТ на Яндекс Картах"; f.loading = "lazy"; f.allowFullscreen = true;
    box.append(f); b.remove();
  }));

  /* нижняя панель: появляется после первого экрана */
  const bar = $("[data-bar]"), hero = $(".hero");
  if (bar && hero && io) new IntersectionObserver(([e]) => bar.classList.toggle("show", !e.isIntersecting)).observe(hero);
  else bar?.classList.add("show");

  /* cookie и Метрика только после согласия */
  const cfg = window.LOFT || {}, ck = $("[data-cookie]");
  const store = { get: () => { try { return localStorage.getItem("loft_cookie"); } catch (e) { return null; } }, set: (v) => { try { localStorage.setItem("loft_cookie", v); } catch (e) {} } };
  const metrika = () => {
    if (!cfg.metrika) return;
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a); })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(cfg.metrika, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
    $$("[data-book]").forEach((a) => a.addEventListener("click", () => ym(cfg.metrika, "reachGoal", "book")));
  };
  if (ck) {
    const v = store.get();
    if (v === "all") metrika(); else if (!v) ck.hidden = false;
    $("[data-cookie-ok]", ck).addEventListener("click", () => { store.set("all"); ck.hidden = true; metrika(); });
    $("[data-cookie-no]", ck).addEventListener("click", () => { store.set("min"); ck.hidden = true; });
  }
})();
