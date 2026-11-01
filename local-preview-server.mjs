import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authorize, stampAccessMode } from "./functions/access-gate.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const requestedPort = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
let activePort = requestedPort;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf"
};

async function sitePassword() {
  try {
    const text = await fs.readFile(path.join(root, ".dev.vars"), "utf8");
    const line = text.split(/\n/).find((entry) => entry.startsWith("SITE_PASSWORD="));
    return line ? line.slice("SITE_PASSWORD=".length).trim() : "";
  } catch {
    return "";
  }
}

function readRawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

async function serveStatic(request, response, url) {
  const password = await sitePassword();
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  const hasBody = request.method === "POST";
  const webRequest = new Request(url, {
    method: request.method,
    headers,
    body: hasBody ? await readRawBody(request) : undefined
  });
  const decision = await authorize(webRequest, password);
  if (decision instanceof Response) {
    const body = Buffer.from(await decision.arrayBuffer());
    response.writeHead(decision.status, Object.fromEntries(decision.headers));
    response.end(request.method === "HEAD" ? undefined : body);
    return;
  }

  if (!["GET", "HEAD"].includes(request.method || "GET")) {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8", allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }
  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.resolve(root, `.${requested}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  try {
    const file = await fs.readFile(filePath);
    const isHtml = path.extname(filePath) === ".html";
    const body = isHtml ? Buffer.from(stampAccessMode(file.toString("utf8"), decision.mode)) : file;
    response.writeHead(200, {
      "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${activePort}`);
    await serveStatic(request, response, url);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Local preview server failed: ${error.message}`);
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && !process.env.PORT && activePort < requestedPort + 20) {
    activePort += 1;
    server.listen(activePort, host);
    return;
  }
  throw error;
});

server.listen(activePort, host, () => {
  console.log(`Travel plan local preview: http://${host}:${activePort}/`);
  console.log("Local preview only. Travel info and the ledger both require SITE_PASSWORD from .dev.vars.");
});
