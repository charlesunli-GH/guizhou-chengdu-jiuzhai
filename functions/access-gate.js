const COOKIE_NAME = "trip_access";
const SCOPE = "trip-access-v1";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const EMBEDDED_EDIT_PASSWORD_SHA256 = "b1ffa8caccfbdbc47089aa2cf2502e269245fb53741726bef5dd0160b5bed9c4";
const EMBEDDED_READ_PASSWORD_SHA256 = "35f5a105db17f70c35cf485352f1539d23ff4d6d879e375be987f97004b59128";

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

function loginPage(nextPath, rejected) {
  const message = rejected ? "密码不正确，请再试一次。" : "可编辑密码可以修改内容，只读密码只能查看。进入后页面会显示当前状态。";
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex">
  <title>请输入密码</title>
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
    button {
      min-height: 48px; border: 0; border-radius: 12px; color: #fff; background: #287b90;
      font: inherit; font-weight: 750; cursor: pointer;
    }
    .error { color: #9a3d32; }
  </style>
</head>
<body>
  <form method="post" action="/__unlock">
    <h1>请输入密码</h1>
    <p class="${rejected ? "error" : ""}">${message}</p>
    <input type="hidden" name="next" value="${escapeHtml(nextPath)}">
    <label>密码<input type="password" name="password" autocomplete="current-password" required autofocus></label>
    <button type="submit">进入</button>
  </form>
  <script>
    const next = document.querySelector('[name="next"]');
    if (next && location.hash && !next.value.includes("#")) next.value += location.hash;
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

async function modeForPassword(given, editHash, readHash) {
  if (await passwordMatches(given, editHash)) return "edit";
  if (await passwordMatches(given, readHash)) return "read";
  return "";
}

function accessCookie(mode, token, secure) {
  return `${COOKIE_NAME}=${encodeURIComponent(`${mode}.${token}`)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure ? "; Secure" : ""}`;
}

export async function authorize(request, editPassword = "") {
  const url = new URL(request.url);
  const { editHash, readHash } = await accessHashes(editPassword);
  if (!editHash || !readHash) return page("站点密码尚未配置。", 503);

  if (request.method === "POST" && url.pathname === "/__unlock") {
    const form = await request.formData();
    const nextPath = safeNext(form.get("next"));
    const mode = await modeForPassword(String(form.get("password") || ""), editHash, readHash);
    if (mode) {
      const token = await accessToken(mode === "edit" ? editHash : readHash, mode);
      return new Response(null, {
        status: 303,
        headers: {
          location: nextPath,
          "cache-control": "no-store",
          "set-cookie": accessCookie(mode, token, url.protocol === "https:")
        }
      });
    }
    return page(loginPage(nextPath, true), 401);
  }

  const mode = await resolveAccessMode(request.headers.get("cookie"), editHash, readHash);
  if (mode) return { mode };
  if (request.method !== "GET" && request.method !== "HEAD") return page("需要密码", 401);
  if (wantsDocument(request, url)) return page(loginPage(safeNext(`${url.pathname}${url.search}`), false), 200);
  return page("需要密码", 401);
}
