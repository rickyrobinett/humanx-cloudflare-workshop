/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const answer = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
			messages: [
				{
					role: "user",
					content: "What is the capital of the moon?",
				},
			],
		});
		
		return new Response(answer.response);
	},
};
