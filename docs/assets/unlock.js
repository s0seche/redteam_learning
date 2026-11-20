/* Déchiffrement côté navigateur des writeups protégés.
 * Format produit par build.py : AES-256-GCM, clé PBKDF2-SHA256 (sel 16 o, IV 12 o, tag GCM en fin de ct). */
(function () {
  "use strict";
  var form = document.getElementById("unlock-form");
  if (!form) return;
  var payload = JSON.parse(document.getElementById("enc-payload").textContent);
  var input = document.getElementById("pw");
  var btn = form.querySelector("button[type=submit]");
  var err = document.getElementById("unlock-err");
  var locked = document.getElementById("locked");
  var target = document.getElementById("unlocked");

  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function showErr(msg) {
    err.textContent = msg;
    err.hidden = false;
    form.classList.remove("shake");
    void form.offsetWidth;
    form.classList.add("shake");
  }

  async function decrypt(pw) {
    var enc = new TextEncoder();
    var material = await crypto.subtle.importKey("raw", enc.encode(pw.normalize("NFC")), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: b64(payload.salt), iterations: payload.iter, hash: "SHA-256" },
      material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(payload.iv) }, key, b64(payload.ct));
    return new TextDecoder().decode(plain);
  }

  if (!(window.crypto && crypto.subtle)) {
    showErr("Le déchiffrement nécessite une page servie en HTTPS (ou depuis localhost).");
    btn.disabled = true;
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    err.hidden = true;
    if (!input.value) { showErr("Saisis le mot de passe."); return; }
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Déchiffrement…";
    form.setAttribute("aria-busy", "true");
    try {
      var html = await decrypt(input.value);
      target.innerHTML = html;
      locked.hidden = true;
      target.hidden = false;
      input.value = "";
      if (window.SiteEnhance) window.SiteEnhance(target);
      var h = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (h) h.scrollIntoView();
    } catch (ex) {
      showErr(ex && ex.name === "OperationError"
        ? "Mot de passe incorrect."
        : "Erreur inattendue lors du déchiffrement (" + (ex && ex.message || ex) + ").");
      input.select();
    } finally {
      btn.disabled = false;
      btn.textContent = label;
      form.removeAttribute("aria-busy");
    }
  });
})();
