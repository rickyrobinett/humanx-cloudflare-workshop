import { Hono } from "hono";
import { WorkflowEntrypoint } from "cloudflare:workers";

const app = new Hono();
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
			'llama-3.3-70b-instruct-fp8-fast',
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

app.onError((err, c) => {
	return c.text(err);
});
  

app.get('/notes', async (c) => {
	const { text } = await c.req.query();
	if (!text) return c.text("Missing text", 400);
	await c.env.RAG_WORKFLOW.create({ params: { text } })
	return c.text("Created note", 201);
})

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

export default app;