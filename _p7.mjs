const { fetch: handler } = await import("./dist/vercel/index.js");
for (const [label, url, body] of [
  ["trpcmw (real trpcServer)", "https://x/_debug/trpcmw/ping", '{"json":null}'],
  ["trpclike (plain route)",   "https://x/_debug/trpclike", null],
  ["mw (plain middleware)",    "https://x/_debug/mw/x", null],
  ["admin.login (real app)",   "https://x/trpc/admin.login", '{"json":{"username":"shanislive","password":"Vasu6291"}}'],
]) {
  const res = await handler(new Request(url, body ? {method:"POST", headers:{"content-type":"application/json"}, body} : {}));
  console.log(label.padEnd(28), res.status, "| set-cookie:", res.headers.getSetCookie().length);
}
