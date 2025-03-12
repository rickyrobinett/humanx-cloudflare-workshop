import { Hono } from "hono";
const app = new Hono();

app.get("/", async (c) => {
	const answer = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
		messages: [
			{
				role: "user",
				content: "What is the capital of the moon?",
			},
		],
	});

	return c.text(answer.response);
});

export default app;