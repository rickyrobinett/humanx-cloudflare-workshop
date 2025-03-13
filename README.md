Welcome to the Cloudflare Workshop!

Steps to complete step 5:

1) Run `npm install @anthropic-ai/sdk` in your terminal
2) Update your `app.get(/)` in `src/index.js` with the following code:

```
app.get('/', async (c) => {
	// ... Existing code

			const systemPrompt = `When answering the question or responding, use the context provided, if it is provided and relevant.`

			let modelUsed = ""
			let response = null
		  
			if (c.env.ANTHROPIC_API_KEY) {
			  const anthropic = new Anthropic({
				apiKey: c.env.ANTHROPIC_API_KEY
			  })
		  
			  const model = "claude-3-5-sonnet-latest"
			  modelUsed = model
		  
			  const message = await anthropic.messages.create({
				max_tokens: 1024,
				model,
				messages: [
				  { role: 'user', content: question }
				],
				system: [systemPrompt, notes ? contextMessage : ''].join(" ")
			  })
		  
			  response = {
				response: message.content.map(content => content.text).join("\n")
			  }
			} else {
			  const model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
			  modelUsed = model
		  
			  response = await c.env.AI.run(
				model,
				{
				  messages: [
					...(notes.length ? [{ role: 'system', content: contextMessage }] : []),
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: question }
				  ]
				}
			  )
			}
		  
			if (response) {
			  c.header('x-model-used', modelUsed)
			  return c.text(response.response)
			} else {
			  return c.text("We were unable to generate output", 500)
			}
	// ... Existing code
});
```
3) Create an Anthropic API key on the Anthropic website: https://console.anthropic.com/settings/keys
4) Set your Anthropic key by running the following code in terminal: `npx wrangler secret put ANTHROPIC_API_KEY`
5) Run your app with `npx wrangler dev --remote`

Our agenda:

~~🌐 Quick overview of the Cloudflare Developer Platform~~

~~⚡ Create a Cloudflare Worker~~

~~🔧 Integrate the Hono framework~~

~~🤖 Add Cloudflare Workers AI for AI Inference~~

~~🔍 Adding Embeddings using Cloudflare D1 and Vectorize~~

~~📝 Creating a Workflow to intake notes~~

~~🔎 Query our vector database on the front-end~~

~~💻 Adding Anthropic Claude~~

---

💻 A quick intro to the Cloudflare Agents framework (time permitting)




