import { Hono } from "hono";

const app = new Hono();

app.get("/todos", async (c) => {
	const request = new Request(
		"https://todo-nextjs-b5lmrttwpa-an.a.run.app/todos",
		{ headers: c.req.headers }
	);

	const cache = caches.default; // workerのやつ.
	let response = await cache.match(request); // reqにcacheがあるかどうかを確認し、あれば取り出す

	if (response) {
		return response;
	}

	// cacheがない場合
	response = await fetch(request);
	response = new Response(response.body, response); // responseをcloneする. (headerを書き換えるため)
	response.headers.set("Cache-Control", "max-age=30"); // 30秒間cacheする.
	c.executionCtx.waitUntil(cache.put(request, response.clone())); // 非同期でcacheにresponseを保存する. (resを返しつつ、非同期で保存)

	return response;
});

app.all("*", (c) => {
	const url = new URL(c.req.url);
	const requestUrl = new URL("https://todo-nextjs-b5lmrttwpa-an.a.run.app");
	requestUrl.pathname = url.pathname;

	return fetch(requestUrl, { headers: c.req.headers });
});

export default app;
