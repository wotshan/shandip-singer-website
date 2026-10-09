import { createRequire } from "module";
import fs from "fs";

const require = createRequire(import.meta.url);
const WebSocket = require("/tmp/wsinstall/node_modules/ws");

const PORT = 9222;
const TARGET = process.env.TARGET_URL || "http://localhost:3000/";
const OUT = "/workspace/shots_intro";
const W = 1440;
const H = 900;

async function getJSON(path) {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`);
  return r.json();
}

let list;
for (let i = 0; i < 60; i++) {
  try {
    list = await getJSON("/json/list");
    if (Array.isArray(list) && list.length) break;
  } catch (e) {}
  await new Promise((r) => setTimeout(r, 200));
}
if (!list || !list.length) {
  console.error("no devtools targets");
  process.exit(1);
}
let page = list.find((t) => t.type === "page");
if (!page) {
  page = await getJSON("/json/new?about:blank").catch(() => null);
}
if (!page || !page.webSocketDebuggerUrl) {
  console.error("no page target");
  process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl, {
  perMessageDeflate: false,
  maxPayload: 256 * 1024 * 1024,
});

let id = 0;
const pending = new Map();
const eventHandlers = new Map();

ws.on("message", (data) => {
  const m = JSON.parse(data.toString());
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error)));
    else p.resolve(m.result);
  } else if (m.method && eventHandlers.has(m.method)) {
    for (const h of eventHandlers.get(m.method)) h(m.params);
  }
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}

function once(method) {
  return new Promise((resolve) => {
    const h = (params) => {
      eventHandlers.get(method).delete(h);
      resolve(params);
    };
    if (!eventHandlers.has(method)) eventHandlers.set(method, new Set());
    eventHandlers.get(method).add(h);
  });
}

await new Promise((resolve, reject) => {
  ws.on("open", resolve);
  ws.on("error", reject);
});

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: false,
});

// Optional: verify the new CSS actually shipped to this page bundle.
const cssProbe = async (label) => {
  const res = await send("Runtime.evaluate", {
    expression: `(() => {
      const s = document.styleSheets;
      for (const sheet of s) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.cssText && rule.cssText.includes('intro-mark-in 1.6s')) return 'NEW(1.6s)';
            if (rule.cssText && rule.cssText.includes('intro-mark-in 1.1s')) return 'OLD(1.1s)';
          }
        } catch (e) {}
      }
      return 'UNKNOWN';
    })()`,
    returnByValue: true,
  });
  console.log(`[css ${label}]`, res.result?.value);
};

const loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: TARGET });
await loaded;

const t0 = Date.now();
await cssProbe("post-load");

const FRAMES = [
  ["f1_300ms", 300],
  ["f2_1000ms", 1000],
  ["f3_1800ms", 1800],
  ["f4_2600ms", 2600],
  ["f5_3300ms", 3300],
  ["f6_4500ms", 4500],
];

for (const [label, at] of FRAMES) {
  const wait = at - (Date.now() - t0);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${OUT}/${label}.png`, Buffer.from(data, "base64"));
  const overlay = await send("Runtime.evaluate", {
    expression: `!!document.querySelector('.intro-overlay')`,
    returnByValue: true,
  });
  console.log(`captured ${label} @ ${Date.now() - t0}ms  overlayPresent=${overlay.result?.value}`);
}

ws.close();
process.exit(0);
