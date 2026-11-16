# Project 8: L'Oréal Chatbot

L’Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.

## 🚀 Launch via GitHub Codespaces

1. In the GitHub repo, click the **Code** button and select **Open with Codespaces → New codespace**.
2. Once your codespace is ready, open the `index.html` file via the live preview.

## ☁️ Cloudflare Note

When deploying through Cloudflare, make sure your API request body (in `script.js`) includes a `messages` array and handle the response by extracting `data.choices[0].message.content`.

The chat keeps its messages in `conversationMessages` and sends the full conversation with each request, so the assistant can remember details such as a name or earlier questions during follow-up messages. The preview shows each turn in a conversation with separate user and assistant message bubbles. This history only lasts while the page is open; refreshing the page starts a new conversation.

### Update the Cloudflare Worker

Changing the files in this repository does not update the Worker already hosted by Cloudflare. Deploy the updated Worker code for chat requests to work.

If you edit the Worker in the Cloudflare dashboard, replace its script with `RESOURCE_cloudflare-worker.js`, make sure its `OPENAI_API_KEY` secret is configured, then save and deploy it.

To deploy from this repository with Wrangler:

1. Authenticate Wrangler with `npx wrangler login`.
2. Add the API key as a Worker secret with `npx wrangler secret put OPENAI_API_KEY`, or add it in the Cloudflare dashboard. Do not put the key in a project file.
3. Run `npx wrangler deploy --keep-vars`. This deploys `src/index.js` as configured in `wrangler.toml` and serves the website files.
4. `script.js` is configured to call `https://loreal.bradleyjosephleon.workers.dev/`. Update that URL only if Wrangler deploys to a different Worker address.

The asset directory is the project root because this project does not have a separate `dist/` build folder. `.assetsignore` keeps source files, documentation, and local secret files out of the deployed website.

Enjoy building your L’Oréal beauty assistant! 💄
