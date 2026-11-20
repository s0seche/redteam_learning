/* s0seche · writeups — copie de code, zoom images, sommaire actif, recherche/filtres */
(function () {
  "use strict";

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(new Error("copy")); }
      catch (e) { reject(e); }
      finally { ta.remove(); }
    });
  }

  function flash(btn, msg, ok) {
    btn.textContent = msg;
    btn.classList.toggle("done", ok);
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.textContent = "Copier"; btn.classList.remove("done"); }, 1600);
  }

  function lightbox(src, alt) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", alt || "Image agrandie");
    var img = document.createElement("img");
    img.src = src; img.alt = alt || "";
    box.appendChild(img);
    function close() { box.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    box.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(box);
  }

  function activeToc(root) {
    var links = root.querySelectorAll(".toc a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[decodeURIComponent(a.getAttribute("href").slice(1))] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (a) { a.classList.remove("active"); });
          map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-70px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) obs.observe(h); });
  }

  /* appelé au chargement, et sur le contenu déchiffré d'un writeup protégé */
  function enhance(root) {
    root.querySelectorAll(".code-block").forEach(function (block) {
      if (block.dataset.ready) return;
      block.dataset.ready = "1";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copier";
      btn.setAttribute("aria-label", "Copier le code");
      btn.addEventListener("click", function () {
        var code = block.querySelector("code");
        copyText(code.innerText.replace(/\n$/, "")).then(
          function () { flash(btn, "Copié ✓", true); },
          function () { flash(btn, "Échec", false); });
      });
      block.querySelector(".code-head").appendChild(btn);
    });
    root.querySelectorAll(".content img").forEach(function (img) {
      if (img.dataset.ready) return;
      img.dataset.ready = "1";
      img.addEventListener("click", function () { lightbox(img.currentSrc || img.src, img.alt); });
    });
    activeToc(root);
  }
  window.SiteEnhance = enhance;

  function norm(s) {
    return (s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  function initFilters() {
    var grid = document.getElementById("cards");
    if (!grid) return;
    var q = document.getElementById("q");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".card"));
    var countEl = document.getElementById("count");
    var empty = document.getElementById("empty");
    var reset = document.getElementById("reset");
    var platformBtns = document.querySelectorAll("[data-filter-platform]");
    var tagBtns = document.querySelectorAll("[data-filter-tag]");
    var platform = "";
    var tags = new Set();

    function apply() {
      var terms = norm(q.value).split(/\s+/).filter(Boolean);
      var n = 0;
      cards.forEach(function (c) {
        var ctags = (c.dataset.tags || "").split("|");
        var ok = (!platform || c.dataset.platform === platform) &&
          Array.from(tags).every(function (t) { return ctags.indexOf(t) !== -1; }) &&
          terms.every(function (t) { return c.dataset.search.indexOf(t) !== -1; });
        c.hidden = !ok;
        if (ok) n++;
      });
      countEl.textContent = n;
      empty.hidden = n > 0;
      reset.hidden = !(platform || tags.size || terms.length);
    }

    platformBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        platform = b.dataset.filterPlatform;
        platformBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        apply();
      });
    });
    tagBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.dataset.filterTag;
        tags.has(t) ? tags.delete(t) : tags.add(t);
        b.setAttribute("aria-pressed", String(tags.has(t)));
        apply();
      });
    });
    q.addEventListener("input", apply);
    reset.addEventListener("click", function () {
      q.value = ""; platform = ""; tags.clear();
      platformBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.filterPlatform === "")); });
      tagBtns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      apply();
      q.focus();
    });
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    enhance(document);
    initFilters();
  });
})();
