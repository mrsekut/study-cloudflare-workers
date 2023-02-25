import { Hono } from "hono";

const app = new Hono();

// ABテスト
app.get("/ab/page", (c) => {
	const url = new URL(c.req.url);
	url.port = "3000";
	url.pathname = Math.random() < 0.5 ? "/ab/page-a" : "/ab/page-b"; // 特定のユーザのみpage-aに飛ばす
	return fetch(url, { headers: c.req.headers, body: c.req.body });
});

app.all("*", (c) => {
	const url = new URL(c.req.url);
	url.port = "3000"; // ここで、workersに来たものを、Next.jsに渡している. 8787 -> 3000
	return fetch(url, { headers: c.req.headers, body: c.req.body });
});

export default app;
