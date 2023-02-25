import { Hono } from "hono";

const app = new Hono();

// 外部サイトにも飛ばせる
app.get("/example", () => {
	return fetch("https://example.com");
});

app.get("/api/cache", async (c) => {
	const cache = caches.default;

	const cacheRes = await cache.match("http://localhost:3000/api/cache");
	if (cacheRes) {
		return cacheRes;
	}

	let res = await fetch("http://localhost:3000/api/cache", {
		headers: c.req.headers,
		body: c.req.body,
		// cf: { cacheTtl: 30 }, 本番ではこれを使ったりする。使える条件が色いろあるらしい
	});
	res = res.clone();
	res.headers.set("Cache-Control", "s-maxage=30");

	cache.put("http://localhost:3000/api/cache", res.clone());

	return res;
});

// ABテスト
app.get("/ab/page", async (c) => {
	const url = new URL(c.req.url);
	url.port = "3000";

	const abPath = c.req.cookie("ab");
	if (abPath != null) {
		url.pathname = abPath;
	} else {
		url.pathname = Math.random() < 0.5 ? "/ab/page-a" : "/ab/page-b";
	}

	let res = await fetch(url, { headers: c.req.headers, body: c.req.body });
	res = res.clone();
	res.headers.set("Set-Cookie", `ab=${url.pathname}`);

	return res;
});

app.all("*", (c) => {
	const url = new URL(c.req.url);
	url.port = "3000"; // ここで、workersに来たものを、Next.jsに渡している. 8787 -> 3000
	return fetch(url, { headers: c.req.headers, body: c.req.body });
});

export default app;
