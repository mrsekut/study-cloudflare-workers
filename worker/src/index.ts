import { Hono } from "hono";

const app = new Hono();

app.get("/todos", (c) => {
	return fetch("https://todo-nextjs-b5lmrttwpa-an.a.run.app/todos");
});

app.all("*", (c) => {
	return c.text("aa");
});

export default app;
