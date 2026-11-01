const COOKIE_NAME = "trip_access";
const SCOPE = "trip-access-v1";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const EMBEDDED_EDIT_PASSWORD_SHA256 = "aad3afbb8a6388aa8b081c423634390830a4926da84c73cf9d644894b08fbe14";
const EMBEDDED_READ_PASSWORD_SHA256 = "15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sha256Bytes(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return new Uint8Array(digest);
}

async function sha256Hex(text) {
  const bytes = await sha256Bytes(text);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hashesMatch(actual, expected) {
  if (!actual || !expected || actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}

export function safeNext(value) {
  const text = String(value || "/");
  if (!text.startsWith("/") || text.startsWith("//") || text.includes("\\") || /[\r\n]/.test(text)) return "/";
  return text.slice(0, 300);
}

export function readCookie(header, name = COOKIE_NAME) {
  const prefix = `${name}=`;
  const found = String(header || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : "";
}

export async function accessToken(secret, mode) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${SCOPE}:${mode}`));
  return base64Url(new Uint8Array(signature));
}

export async function passwordMatches(given, expectedHash) {
  return hashesMatch(await sha256Hex(given), expectedHash);
}

export async function resolveAccessMode(cookieHeader, editHash, readHash) {
  const given = readCookie(cookieHeader);
  const separator = given.indexOf(".");
  if (separator <= 0) return "";
  const mode = given.slice(0, separator);
  const token = given.slice(separator + 1);
  if (mode === "edit" && hashesMatch(token, await accessToken(editHash, "edit"))) return "edit";
  if (mode === "read" && hashesMatch(token, await accessToken(readHash, "read"))) return "read";
  return "";
}

export function stampAccessMode(html, mode) {
  const safeMode = mode === "read" ? "read" : "edit";
  const meta = `<meta name="trip-access-mode" content="${safeMode}">`;
  if (html.includes('name="trip-access-mode"')) {
    return html.replace(/<meta name="trip-access-mode" content="(?:edit|read)">/, meta);
  }
  return html.replace("<head>", `<head>\n  ${meta}`);
}

function loginPage(nextPath, options = {}) {
  const selectedMode = options.selectedMode === "edit" || options.selectedMode === "read" ? options.selectedMode : "";
  const rejected = Boolean(options.rejected);
  const label = selectedMode === "edit" ? "可编辑" : "只读";
  const message = rejected
    ? `密码不正确，请输入${label}密码。`
    : selectedMode
      ? `请输入${label}密码。验证通过后进入${label}页面。`
      : "先选择只读或可编辑，再输入对应的密码。";
  const chooseAgain = `/__switch?next=${encodeURIComponent(nextPath)}`;
  const passwordStep = selectedMode ? `
    <input type="hidden" name="mode" value="${selectedMode}">
    <p class="${rejected ? "error" : ""}">${message}</p>
    <label>${label}密码<input type="password" name="password" autocomplete="current-password" required autofocus></label>
    <button type="submit">进入${label}</button>
    <a class="back-link" href="${escapeHtml(chooseAgain)}">重新选择</a>` : `
    <p>${message}</p>
    <div class="mode-choices">
      <button class="mode-choice mode-choice-read" type="submit" name="mode" value="read">只读</button>
      <button class="mode-choice mode-choice-edit" type="submit" name="mode" value="edit">可编辑</button>
    </div>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex">
  <title>${selectedMode ? `输入${label}密码` : "选择进入方式"}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px;
      color: #13262f; background: #f3f6f2;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    }
    form {
      width: min(100%, 420px); display: grid; gap: 16px; padding: 28px 24px;
      border: 1px solid rgba(19, 38, 47, .08); border-radius: 24px; background: #fff;
      box-shadow: 0 18px 50px rgba(18, 42, 50, .08);
    }
    h1 { margin: 0; font-size: 28px; line-height: 1.2; }
    p { margin: 0; color: #607174; font-size: 14px; line-height: 1.6; }
    label { display: grid; gap: 8px; font-size: 13px; font-weight: 700; }
    input {
      width: 100%; min-height: 48px; padding: 0 14px; border: 1px solid #d5e0e2; border-radius: 12px;
      color: inherit; background: #fff; font: inherit;
    }
    button, .mode-choice {
      min-height: 48px; border: 0; border-radius: 12px; color: #fff; cursor: pointer;
      font: inherit; font-weight: 750;
    }
    .mode-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .mode-choice-read { color: #8a4b12; background: #f8ead7; }
    .mode-choice-edit { color: #1d6b3c; background: #e4f5ea; }
    button[type="submit"] { background: #287b90; }
    .back-link { justify-self: start; color: #607174; font-size: 13px; font-weight: 700; }
    .error { color: #9a3d32; }
    .gate { width: min(100%, 420px); display: grid; gap: 12px; }
    .language-switch { display: flex; justify-content: flex-end; gap: 6px; }
    .language-switch button {
      min-height: 28px; padding: 0 10px; border: 1px solid #d5e0e2; border-radius: 999px;
      background: transparent; color: #607174; font: inherit; font-size: 12px; font-weight: 760; cursor: pointer;
    }
    .language-switch button.is-current { color: #13262f; background: #fff; border-color: transparent; box-shadow: 0 1px 2px rgba(19,38,47,.08); }
    form { width: 100%; }
  </style>
</head>
<body>
  <div class="gate">
    <div class="language-switch" role="group" aria-label="Language">
      <button type="button" data-set-lang="en">English</button>
      <button type="button" data-set-lang="zh">中文</button>
    </div>
    <form method="post" action="/__unlock">
    <h1>${selectedMode ? `进入${label}` : "选择进入方式"}</h1>
    <input type="hidden" name="next" value="${escapeHtml(nextPath)}">
    ${passwordStep}
    </form>
  </div>
  <script>
    const next = document.querySelector('[name="next"]');
    if (next && location.hash && !next.value.includes("#")) next.value += location.hash;
    const KEY = "trip-page-language";
    const copy = {
      "选择进入方式": "Choose how to enter",
      "进入只读": "Enter read-only",
      "进入可编辑": "Enter editable",
      "输入只读密码": "Enter the read-only password",
      "输入可编辑密码": "Enter the editable password",
      "只读": "Read-only",
      "可编辑": "Editable",
      "只读密码": "Read-only password",
      "可编辑密码": "Editable password",
      "密码不正确，请输入只读密码。": "Incorrect password. Enter the read-only password.",
      "密码不正确，请输入可编辑密码。": "Incorrect password. Enter the editable password.",
      "请输入只读密码。验证通过后进入只读页面。": "Enter the read-only password to open the read-only page.",
      "请输入可编辑密码。验证通过后进入可编辑页面。": "Enter the editable password to open the editable page.",
      "先选择只读或可编辑，再输入对应的密码。": "Choose read-only or editable, then enter that password.",
      "重新选择": "Choose again"
    };
    const ordered = Object.entries(copy).sort((left, right) => right[0].length - left[0].length);
    function currentLang() {
      try { return localStorage.getItem(KEY) === "en" ? "en" : "zh"; } catch (error) { return "zh"; }
    }
    function translate(value) {
      if (!value || !/[\\u4e00-\\u9fff]/.test(value)) return value;
      const trimmed = value.trim();
      if (copy[trimmed]) {
        const start = value.match(/^\\s*/)[0];
        const end = value.match(/\\s*$/)[0];
        return start + copy[trimmed] + end;
      }
      let nextText = value;
      ordered.forEach(([zh, en]) => { if (nextText.includes(zh)) nextText = nextText.split(zh).join(en); });
      return nextText;
    }
    function applyLoginLanguage() {
      const lang = currentLang();
      document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
      document.querySelectorAll("[data-set-lang]").forEach((button) => {
        const on = button.dataset.setLang === lang;
        button.classList.toggle("is-current", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (lang !== "en") return;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        if (node.parentElement?.closest("[data-set-lang]")) return;
        const nextText = translate(node.nodeValue);
        if (nextText !== node.nodeValue) node.nodeValue = nextText;
      });
      document.title = translate(document.title);
    }
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLang = button.dataset.setLang === "en" ? "en" : "zh";
        try { localStorage.setItem(KEY, nextLang); } catch (error) {}
        location.reload();
      });
    });
    applyLoginLanguage();
  </script>
</body>
</html>`;
}

function page(body, status, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      "content-type": status === 200 || status === 401 ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
      ...extraHeaders
    }
  });
}

function wantsDocument(request, url) {
  if (url.pathname === "/" || url.pathname.endsWith(".html") || url.pathname === "/__unlock") return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

async function accessHashes(editPassword = "") {
  return {
    editHash: editPassword ? await sha256Hex(editPassword) : EMBEDDED_EDIT_PASSWORD_SHA256,
    readHash: EMBEDDED_READ_PASSWORD_SHA256
  };
}

function selectedMode(value) {
  return value === "edit" || value === "read" ? value : "";
}

function accessCookie(mode, token, secure) {
  return `${COOKIE_NAME}=${encodeURIComponent(`${mode}.${token}`)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure ? "; Secure" : ""}`;
}

export async function authorize(request, editPassword = "") {
  const url = new URL(request.url);
  const { editHash, readHash } = await accessHashes(editPassword);
  if (!editHash || !readHash) return page("站点密码尚未配置。", 503);

  if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/__switch") {
    const nextPath = safeNext(url.searchParams.get("next") || "/");
    return page(loginPage(nextPath, { selectedMode: selectedMode(url.searchParams.get("mode")) }), 200);
  }

  if (request.method === "POST" && url.pathname === "/__unlock") {
    const form = await request.formData();
    const nextPath = safeNext(form.get("next"));
    const requestedMode = selectedMode(String(form.get("mode") || ""));
    const given = String(form.get("password") || "");
    if (!requestedMode || !given) return page(loginPage(nextPath, { selectedMode: requestedMode }), 200);
    const expectedHash = requestedMode === "edit" ? editHash : readHash;
    if (await passwordMatches(given, expectedHash)) {
      const token = await accessToken(expectedHash, requestedMode);
      return new Response(null, {
        status: 303,
        headers: {
          location: nextPath,
          "cache-control": "no-store",
          "set-cookie": accessCookie(requestedMode, token, url.protocol === "https:")
        }
      });
    }
    return page(loginPage(nextPath, { selectedMode: requestedMode, rejected: true }), 401);
  }

  const mode = await resolveAccessMode(request.headers.get("cookie"), editHash, readHash);
  if (mode) return { mode };
  if (request.method !== "GET" && request.method !== "HEAD") return page("需要密码", 401);
  if (wantsDocument(request, url)) return page(loginPage(safeNext(`${url.pathname}${url.search}`)), 200);
  return page("需要密码", 401);
}
