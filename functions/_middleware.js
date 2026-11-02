import { authorize, stampAccessMode } from "./access-gate.js";

export async function onRequest(context) {
  const decision = await authorize(context.request, context.env.SITE_PASSWORD || "");
  if (decision instanceof Response) return decision;
  if (decision.mode !== "edit" && context.request.method !== "GET" && context.request.method !== "HEAD") {
    return new Response(JSON.stringify({ error: "read-only" }), {
      status: 403,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "private, no-store",
        "vary": "Cookie"
      }
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("cache-control", "private, no-store");
  headers.set("vary", "Cookie");
  const type = headers.get("content-type") || "";
  const pathname = new URL(context.request.url).pathname;
  const looksHtml = type.includes("text/html")
    || ((pathname === "/" || pathname.endsWith(".html")) && !type.includes("javascript") && !type.includes("json"));
  if (!looksHtml) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  const html = stampAccessMode(await response.text(), decision.mode);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
