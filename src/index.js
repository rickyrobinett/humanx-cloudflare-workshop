import { Hono } from "hono";
const app = new Hono();

app.get("/", async (c) => {
	const answer = await c.env.AI.run("llama-3.3-70b-instruct-fp8-fast", {
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