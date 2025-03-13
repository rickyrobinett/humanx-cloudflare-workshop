Welcome to the Cloudflare Workshop!

Steps to complete step 2:

1) Run `npm install hono` in terminal
2) Replace `src/index.js` with the following code:

```
import { Hono } from "hono";
const app = new Hono();

app.get("/", async (c) => {
  return c.text("Hello World");
});

export default app;
```

3) Run `npx wrangler dev --remote`
4) Press `b` to open your app in the browser

Our agenda:

~~🌐 Quick overview of the Cloudflare Developer Platform~~

~~⚡ Create a Cloudflare Worker~~

~~🔧 Integrate the Hono framework~~

🤖 Add Cloudflare Workers AI for AI Infernece

🔍 Adding Embeddings using Cloudflare D1 and Vectorize

📝 Creating a Workflow to intake notes

🔎 Query our vector database on the front-end

💻 Adding Anthropic Claude

---

💻 A quick intro to the Cloudflare Agents framework (time permitting)




