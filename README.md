Welcome to the Cloudflare Workshop!

Steps to complete step 4:

1) Add your workflow configuration to your `wrangler.jsonc`

```
"workflows": [
    {
        "name": "rag",
        "binding": "RAG_WORKFLOW",
        "class_name": "RAGWorkflow"
    }
]
```
2) In `src/index.js` add the following code to create your first workflow:

```
import { WorkflowEntrypoint } from "cloudflare:workers";

export class RAGWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    await step.do('example step', async () => {
      console.log("Hello World!")
    })
  }
}
```

3) Add the following line to your `app.get(/)` function to trigger your workflow: `c.env.RAG_WORKFLOW.create({ params: "test" })`
4) Deploy your workflow by runing `npx wrangler deploy` in terminal
5) Test your workflow by running `npx wrangler dev --remote` in one terminal window, and `npx wrangler tail` in another window. Load your app and see the console.log in the terminal where you're running `npx wrangler tail`
6) Update your workflow in `src/index.js` to store information for our vector database:

```
export class RAGWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
        const env = this.env
        const { text } = event.payload

        const record = await step.do(`create database record`, async () => {
        const query = "INSERT INTO notes (text) VALUES (?) RETURNING *"

        const { results } = await env.DB.prepare(query)
            .bind(text)
            .run()

        const record = results[0]
        if (!record) throw new Error("Failed to create note")
        return record;
        })

        const embedding = await step.do(`generate embedding`, async () => {
        const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: text })
        const values = embeddings.data[0]
        if (!values) throw new Error("Failed to generate vector embedding")
        return values
        })

        await step.do(`insert vector`, async () => {
        return env.VECTORIZE.upsert([
            {
            id: record.id.toString(),
            values: embedding,
            }
        ]);
        })
    }
}
```

7) In `src/index.js` add a new route that lets us store information:

```
app.get('/notes', async (c) => {
	const { text } = await c.req.query();
	if (!text) return c.text("Missing text", 400);
	await c.env.RAG_WORKFLOW.create({ params: { text } })
	return c.text("Created note", 201);
})
```

8) Run `npx wrangler dev --remote` and test storing by browsing to http://localhost:8787/notes?text=Fruity loops is the best pizza topping

9) Browse to `http://localhost:8787/` and validate that our LLM is not telling us that Fruity Loops is the best pizza topping

10) Update our `app.get('/')` function to use query our vector database and pass appropriate data to our LLM:

```
app.get('/', async (c) => {
	const question = c.req.query('text') || "What pizza topping is the best?"

	if (!c.env.VECTORIZE) {
		return c.text('Vector index not configured', 500);
	}

	const embeddings = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: question })
	const vectors = embeddings.data[0]

	try {
		const vectorQuery = await c.env.VECTORIZE.query(vectors, { topK: 1 });
		let vecId;
		if (vectorQuery.matches && vectorQuery.matches.length > 0 && vectorQuery.matches[0]) {
			vecId = vectorQuery.matches[0].id;
		}

		let notes = []
		if (vecId) {
			const query = `SELECT * FROM notes WHERE id = ?`
			const { results } = await c.env.DB.prepare(query).bind(vecId).all()
			if (results) notes = results.map(vec => vec.text)
		}

		const contextMessage = notes.length
			? `Context:\n${notes.map(note => `- ${note}`).join("\n")}`
			: ""

		const systemPrompt = `When answering the question or responding, use the context provided, if it is provided and relevant.`


		const { response: answer } = await c.env.AI.run(
			'@cf/meta/llama-3.3-70b-instruct-fp8-fast',
			{
			messages: [
				...(notes.length ? [{ role: 'system', content: contextMessage }] : []),
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: question }
			]
			}
		)

		return c.text(answer);
	} catch (error) {
		return c.text(error.message, 500);
	}
});
```

11) Reload the homepage and confirm that our LLM now shows us that fruity loops is the best pizza topping



Our agenda:

~~🌐 Quick overview of the Cloudflare Developer Platform~~

~~⚡ Create a Cloudflare Worker~~

~~🔧 Integrate the Hono framework~~

~~🤖 Add Cloudflare Workers AI for AI Inference~~

~~🔍 Adding Embeddings using Cloudflare D1 and Vectorize~~

~~📝 Creating a Workflow to intake notes~~

~~🔎 Query our vector database on the front-end~~

💻 Adding Anthropic Claude

---

💻 A quick intro to the Cloudflare Agents framework (time permitting)




