/**
 * Taco Bell / OrderFlow Pizza AI Chat Widget
 * Embeddable floating chat button — self-contained, <50KB
 *
 * Usage:
 *   <script src="https://your-domain.com/widget.js"
 *     data-restaurant="taco-bell"
 *     data-lang="en"
 *     data-color="#6D28FF"
 *     data-position="right">
 *   </script>
 */
(function () {
  "use strict";

  // ── Config from data attributes ─────────────────────────────────────────────
  var script    = document.currentScript;
  var restaurant = (script && script.getAttribute("data-restaurant")) || "taco-bell";
  var lang       = (script && script.getAttribute("data-lang"))       || "en";
  var accentColor = (script && script.getAttribute("data-color"))     || "#6D28FF";
  var position   = (script && script.getAttribute("data-position"))  || "right";

  var API_PATH = restaurant === "pizza"
    ? "/api/pizza-chat"
    : "/api/tacobell-chat";

  // ── Strings ─────────────────────────────────────────────────────────────────
  var STR = {
    en: {
      title:        "AI Assistant",
      placeholder:  "Type your order...",
      send:         "Send",
      listening:    "Listening...",
      Welcoming:    "Welcome! What can I get for you today?",
      error:        "Something went wrong. Please try again.",
      toggle:       "Chat with AI",
    },
    es: {
      title:        "Asistente AI",
      placeholder:  "Escribe tu pedido...",
      send:         "Enviar",
      listening:    "Escuchando...",
      Welcoming:    "¡Bienvenido! ¿Qué te puedo poner hoy?",
      error:        "Algo salió mal. Intenta de nuevo.",
      toggle:       "Chatea con AI",
    },
  };

  function t(key) {
    return (STR[lang] && STR[lang][key]) || STR.en[key] || key;
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  var COLORS = {
    bg:        "#1a1030",
    surface:   "rgba(255,255,255,0.06)",
    border:    "rgba(255,255,255,0.1)",
    text:      "#ffffff",
    muted:     "#948DA3",
    accent:    accentColor,
    accentDim: accentColor + "22",
    input:     "rgba(255,255,255,0.08)",
  };

  function injectStyles() {
    var s = document.createElement("style");
    s.textContent = [
      "/* ── Base reset ── */",
      ".aiw-* { box-sizing: border-box; margin: 0; padding: 0; }",
      ".aiw-float-btn {",
      "  position: fixed;",
      "  bottom: 24px;",
      position === "left" ? "  left: 24px;" : "  right: 24px;",
      "  width: 60px; height: 60px;",
      "  border-radius: 50%;",
      "  background: " + COLORS.accent + ";",
      "  border: none; cursor: pointer;",
      "  box-shadow: 0 4px 24px " + COLORS.accent + "66;",
      "  display: flex; align-items: center; justify-content: center;",
      "  z-index: 2147483647;",
      "  transition: transform 0.2s, box-shadow 0.2s;",
      "}",
      ".aiw-float-btn:hover { transform: scale(1.08); box-shadow: 0 6px 32px " + COLORS.accent + "99; }",
      ".aiw-float-btn svg { width: 26px; height: 26px; fill: white; }",
      ".aiw-badge {",
      "  position: absolute; top: -4px; right: -4px;",
      "  width: 18px; height: 18px; border-radius: 50%;",
      "  background: #e63946; border: 2px solid #1a1030;",
      "  display: none; font-size: 10px; color: white;",
      "  align-items: center; justify-content: center; font-weight: 700;",
      "}",
      ".aiw-panel {",
      "  position: fixed; bottom: 96px;",
      position === "left" ? "  left: 24px;" : "  right: 24px;",
      "  width: 380px; max-width: calc(100vw - 48px);",
      "  height: 560px; max-height: calc(100vh - 140px);",
      "  background: " + COLORS.bg + ";",
      "  border-radius: 20px;",
      "  border: 1px solid " + COLORS.border + ";",
      "  display: none; flex-direction: column; overflow: hidden;",
      "  z-index: 2147483647;",
      "  box-shadow: 0 20px 60px rgba(0,0,0,0.5);",
      "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
      "}",
      ".aiw-panel.aiw-open { display: flex; }",
      ".aiw-header {",
      "  padding: 16px 20px;",
      "  background: linear-gradient(135deg, " + COLORS.accent + ", " + COLORS.accent + "cc);",
      "  display: flex; align-items: center; gap: 12px;",
      "}",
      ".aiw-header-icon {",
      "  width: 40px; height: 40px; border-radius: 12px;",
      "  background: rgba(255,255,255,0.15);",
      "  display: flex; align-items: center; justify-content: center; flex-shrink: 0;",
      "}",
      ".aiw-header-icon svg { width: 22px; height: 22px; fill: white; }",
      ".aiw-header-text { flex: 1; min-width: 0; }",
      ".aiw-header-title { color: white; font-size: 15px; font-weight: 700; }",
      ".aiw-header-sub { color: rgba(255,255,255,0.7); font-size: 11px; margin-top: 2px; }",
      ".aiw-lang-btns { display: flex; gap: 6px; }",
      ".aiw-lang-btn {",
      "  padding: 3px 8px; border-radius: 6px;",
      "  border: 1px solid rgba(255,255,255,0.3);",
      "  background: transparent; color: white;",
      "  font-size: 11px; font-weight: 700; cursor: pointer;",
      "  transition: background 0.15s;",
      "}",
      ".aiw-lang-btn.aiw-active { background: rgba(255,255,255,0.25); }",
      ".aiw-close {",
      "  width: 28px; height: 28px; border-radius: 8px;",
      "  background: rgba(255,255,255,0.1); border: none;",
      "  color: white; cursor: pointer; font-size: 16px;",
      "  display: flex; align-items: center; justify-content: center;",
      "  flex-shrink: 0;",
      "}",
      ".aiw-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px; }",
      ".aiw-body::-webkit-scrollbar { width: 4px; }",
      ".aiw-body::-webkit-scrollbar-thumb { background: " + COLORS.border + "; border-radius: 4px; }",
      ".aiw-msg {",
      "  max-width: 80%; padding: 10px 14px; border-radius: 14px;",
      "  font-size: 14px; line-height: 1.5; word-break: break-word;",
      "}",
      ".aiw-msg-user {",
      "  align-self: flex-end;",
      "  background: " + COLORS.accent + "; color: white;",
      "  border-bottom-right-radius: 4px;",
      "}",
      ".aiw-msg-ai {",
      "  align-self: flex-start;",
      "  background: " + COLORS.surface + ";",
      "  color: " + COLORS.text + ";",
      "  border: 1px solid " + COLORS.border + ";",
      "  border-bottom-left-radius: 4px;",
      "}",
      ".aiw-typing {",
      "  align-self: flex-start;",
      "  background: " + COLORS.surface + ";",
      "  border: 1px solid " + COLORS.border + ";",
      "  border-bottom-left-radius: 4px;",
      "  padding: 10px 14px; display: flex; gap: 4px;",
      "}",
      ".aiw-dot {",
      "  width: 7px; height: 7px; border-radius: 50%;",
      "  background: " + COLORS.muted + ";",
      "  animation: aiw-bounce 1.2s infinite;",
      "}",
      ".aiw-dot:nth-child(2) { animation-delay: 0.15s; }",
      ".aiw-dot:nth-child(3) { animation-delay: 0.3s; }",
      "@keyframes aiw-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }",
      ".aiw-footer {",
      "  padding: 12px 16px;",
      "  border-top: 1px solid " + COLORS.border + ";",
      "  display: flex; gap: 8px; align-items: center;",
      "}",
      ".aiw-input {",
      "  flex: 1; background: " + COLORS.input + ";",
      "  border: 1px solid " + COLORS.border + ";",
      "  border-radius: 12px; padding: 10px 14px;",
      "  color: " + COLORS.text + "; font-size: 14px;",
      "  outline: none; transition: border-color 0.2s;",
      "}",
      ".aiw-input::placeholder { color: " + COLORS.muted + "; }",
      ".aiw-input:focus { border-color: " + COLORS.accent + "80; }",
      ".aiw-send {",
      "  width: 40px; height: 40px; border-radius: 12px;",
      "  background: " + COLORS.accent + "; border: none;",
      "  cursor: pointer; display: flex; align-items: center; justify-content: center;",
      "  flex-shrink: 0; transition: opacity 0.2s;",
      "}",
      ".aiw-send:disabled { opacity: 0.4; cursor: not-allowed; }",
      ".aiw-send svg { width: 18px; height: 18px; fill: white; }",
    ].join("\n");
    document.head.appendChild(s);
  }

  // ── SVG Icons ───────────────────────────────────────────────────────────────
  function iconChat() {
    return '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  }
  function iconClose() {
    return '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  }
  function iconSend() {
    return '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  }
  function iconCar() {
    return '<svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>';
  }
  function iconPhone() {
    return '<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';
  }

  // ── Chat state ─────────────────────────────────────────────────────────────
  var messages = [];
  var isLoading = false;
  var panelOpen = false;

  // ── DOM builders ────────────────────────────────────────────────────────────
  function buildUI() {
    injectStyles();

    // Floating button
    var btn = document.createElement("button");
    btn.className = "aiw-float-btn";
    btn.setAttribute("aria-label", t("toggle"));
    btn.innerHTML = iconChat() + '<span class="aiw-badge"></span>';
    btn.onclick = togglePanel;
    document.body.appendChild(btn);

    // Chat panel
    var panel = document.createElement("div");
    panel.className = "aiw-panel";
    panel.id = "aiw-panel";
    panel.innerHTML = buildPanelHTML();
    document.body.appendChild(panel);

    // Event listeners
    panel.querySelector(".aiw-close").onclick = togglePanel;
    panel.querySelector(".aiw-send").onclick = sendMessage;
    panel.querySelector(".aiw-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    panel.querySelectorAll(".aiw-lang-btn").forEach(function (b) {
      b.onclick = function () {
        lang = b.getAttribute("data-lang");
        updateLangUI();
        // Update stored lang
        try { localStorage.setItem("lang", lang); } catch (e) {}
      };
    });

    updateLangUI();
    appendMessage("ai", t("Welcoming"));
  }

  function buildPanelHTML() {
    var brandIcon = restaurant === "pizza" ? iconPhone() : iconCar();
    var brandName = restaurant === "pizza" ? "OrderFlow Pizza" : "Taco Bell";
    return [
      '<div class="aiw-header">',
      '  <div class="aiw-header-icon">' + brandIcon + '</div>',
      '  <div class="aiw-header-text">',
      '    <div class="aiw-header-title">' + brandName + '</div>',
      '    <div class="aiw-header-sub">' + t("title") + '</div>',
      '  </div>',
      '  <div class="aiw-lang-btns">',
      '    <button class="aiw-lang-btn aiw-active" data-lang="en">EN</button>',
      '    <button class="aiw-lang-btn" data-lang="es">ES</button>',
      '  </div>',
      '  <button class="aiw-close">' + iconClose() + '</button>',
      '</div>',
      '<div class="aiw-body" id="aiw-body"></div>',
      '<div class="aiw-footer">',
      '  <input class="aiw-input" id="aiw-input" placeholder="' + t("placeholder") + '" autocomplete="off" />',
      '  <button class="aiw-send" id="aiw-send">' + iconSend() + '</button>',
      '</div>',
    ].join("");
  }

  function updateLangUI() {
    var btns = document.querySelectorAll(".aiw-lang-btn");
    btns.forEach(function (b) {
      b.classList.toggle("aiw-active", b.getAttribute("data-lang") === lang);
    });
    var input = document.getElementById("aiw-input");
    if (input) input.placeholder = t("placeholder");
  }

  function togglePanel() {
    panelOpen = !panelOpen;
    var panel = document.getElementById("aiw-panel");
    if (!panel) return;
    panel.classList.toggle("aiw-open", panelOpen);
    if (panelOpen) {
      setTimeout(function () { var inp = document.getElementById("aiw-input"); if (inp) inp.focus(); }, 100);
    }
  }

  function appendMessage(role, content) {
    var body = document.getElementById("aiw-body");
    if (!body) return;
    var div = document.createElement("div");
    div.className = "aiw-msg aiw-msg-" + role;
    div.textContent = content;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    var body = document.getElementById("aiw-body");
    if (!body) return;
    var div = document.createElement("div");
    div.className = "aiw-typing";
    div.id = "aiw-typing";
    div.innerHTML = '<div class="aiw-dot"></div><div class="aiw-dot"></div><div class="aiw-dot"></div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("aiw-typing");
    if (el) el.remove();
  }

  function setLoading(state) {
    isLoading = state;
    var sendBtn = document.getElementById("aiw-send");
    var input = document.getElementById("aiw-input");
    if (sendBtn) sendBtn.disabled = state;
    if (input) input.disabled = state;
  }

  function sendMessage() {
    if (isLoading) return;
    var input = document.getElementById("aiw-input");
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    input.value = "";
    appendMessage("user", text);
    messages.push({ role: "user", content: text });

    setLoading(true);
    showTyping();

    fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages, language: lang }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (fullText) {
        hideTyping();
        appendMessage("ai", fullText);
        messages.push({ role: "assistant", content: fullText });
        setLoading(false);
      })
      .catch(function () {
        hideTyping();
        appendMessage("ai", t("error"));
        setLoading(false);
      });
  }

  // ── Boot ────────────────────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else {
    buildUI();
  }
})();
