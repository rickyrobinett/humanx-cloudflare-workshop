Welcome to the Cloudflare Workshop!

Steps to complete step 3:

1) Update `wrangler.jsonc` to add your AI binding

```
"ai": {
    "binding": "AI"
}
```

2) Update `src/index.js` by replacing your `app.get` function with the following code:

```
app.get("/", async (c) => {
	const answer = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
		messages: [
			{
				role: "user",
				content: "Tell me about Shin Lim.",
			},
		],
	});

	return c.text(answer.response);
});
```

3) Run `npx wrangler dev --remote`
4) Press `b` to open your app in the browser
5) Create a new vector database by running the following command in your terminal: `npx wrangler vectorize create vector-index --dimensions=768 --metric=cosine`
6) Add the configuration details for your new Vector index in your `wrangler.jsonc` file.
7) Create a new D1 database by running the following command in your terminal: `npx wrangler d1 create database`
8) Add the configuration details for your new D1 database in your `wrangler.jsonc` file.
9) Create a notes table in your D1 database by running the following command in your terminal: `npx wrangler d1 execute database --remote --command "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)"`
10) Add a note to your D1 database by running the following command in your terminal: `npx wrangler d1 execute database --remote --command "INSERT INTO notes (text) VALUES ('The best pizza topping is pepperoni')"`

Our agenda:

~~🌐 Quick overview of the Cloudflare Developer Platform~~

~~⚡ Create a Cloudflare Worker~~

~~🔧 Integrate the Hono framework~~

~~🤖 Add Cloudflare Workers AI for AI Inference~~

~~🔍 Adding Embeddings using Cloudflare D1 and Vectorize~~

📝 Creating a Workflow to intake notes

🔎 Query our vector database on the front-end

💻 Adding Anthropic Claude

---

💻 A quick intro to the Cloudflare Agents framework (time permitting)




