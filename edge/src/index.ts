import { Hono } from "hono";

const app = new Hono();

app.all("*", (c) => {
	const url = new URL(c.req.url);
	url.port = "3000"; // ここで、workersに来たものを、Next.jsに渡している. 8787 -> 3000
	return fetch(url, { headers: c.req.headers, body: c.req.body });
});

export default app;
