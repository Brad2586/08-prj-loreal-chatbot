export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const jsonResponse = (body, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Let browsers check CORS before sending a chat request.
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve the website for requests that are not chatbot API calls.
    if (request.method !== "POST") {
      return env.ASSETS.fetch(request);
    }

    let userInput;
    try {
      userInput = await request.json();
    } catch {
      return jsonResponse({ error: { message: "The request body must be valid JSON." } }, 400);
    }

    if (!Array.isArray(userInput?.messages) || userInput.messages.length === 0) {
      return jsonResponse(
        { error: { message: "The request must include a messages array." } },
        400,
      );
    }

    // Read the API key from the Worker secret, never from a browser file.
    if (!env.OPENAI_API_KEY) {
      return jsonResponse(
        { error: { message: "OPENAI_API_KEY is not configured in this Worker." } },
        500,
      );
    }

    let openAIResponse;
    try {
      openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: userInput.messages,
          max_completion_tokens: 300,
        }),
      });
    } catch {
      return jsonResponse({ error: { message: "The Worker could not reach OpenAI." } }, 502);
    }

    // Add CORS headers to the API response so the website can read it.
    const responseHeaders = new Headers(openAIResponse.headers);
    for (const [name, value] of Object.entries(corsHeaders)) {
      responseHeaders.set(name, value);
    }

    return new Response(openAIResponse.body, {
      status: openAIResponse.status,
      headers: responseHeaders,
    });
  },
};
