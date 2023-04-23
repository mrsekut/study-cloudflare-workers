import { Hono } from "hono";

const app = new Hono();

// ISRを再実装したもの
app.get("/isr_todos", async (c) => {
	const request = new Request(
		"https://todo-nextjs-b5lmrttwpa-an.a.run.app/todos",
		{ headers: c.req.headers }
	);

	const cache = caches.default;
	let response = await cache.match(request);

	if (response) {
		const expires = response.headers.get("expires");

		// expiresが切れている場合はcacheを更新する.
		if (expires && new Date(expires) < new Date()) {
			createCache(c.executionCtx.waitUntil, request);
		}

		return response; // 1個古いやつを返している
	}

	// cacheがない場合
	response = await fetch(request);
	response = new Response(response.body, response);
	response.headers.set("Cache-Control", "max-age=300000"); // とても長いTTLを設定しておく

	const expiresDate = new Date();
	expiresDate.setMinutes(expiresDate.getMinutes() + 1); // 1分後にcacheを更新する.
	response.headers.set("expires", expiresDate.toUTCString());

	c.executionCtx.waitUntil(cache.put(request, response.clone()));

	return new Response("test");
});

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

const createCache = async (
	waitUntil: (promise: Promise<unknown>) => void,
	request: Request
) => {
	const cache = caches.default;
	let response = await fetch(request);

	// cacheの保存期間を指定する
	response = new Response(response.body, response);
	response.headers.set("Cache-Control", "max-age=3000000"); // とても長いTTLを設定しておく

	// cacheの有効期限を指定する
	const expiresDate = new Date();
	expiresDate.setMinutes(expiresDate.getMinutes() + 1); // 1分後にcacheを更新する.
	response.headers.set("expires", expiresDate.toUTCString());

	waitUntil(cache.put(request, response.clone()));
};
