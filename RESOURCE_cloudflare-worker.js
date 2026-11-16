export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: 'Send a POST with JSON: { "messages": [...] }',
        }),
        { status: 405, headers: corsHeaders },
      );
    }

    let userInput;
    try {
      userInput = await request.json();
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Body must be valid JSON with messages" }),
        { status: 400, headers: corsHeaders },
      );
    }

    if (!userInput?.messages) {
      return new Response(
        JSON.stringify({ error: "Need messages array in body" }),
        { status: 400, headers: corsHeaders },
      );
    }

    if (!env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Add OPENAI_API_KEY secret in Settings" }),
        { status: 500, headers: corsHeaders },
      );
    }

    let response;
    try {
      response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: userInput.messages,
            max_tokens: 1000,
          }),
        },
      );
    } catch {
      return new Response(
        JSON.stringify({
          error: { message: "The Worker could not reach Groq." },
        }),
        { status: 502, headers: corsHeaders },
      );
    }

    const responseHeaders = new Headers(response.headers);
    for (const [name, value] of Object.entries(corsHeaders)) {
      responseHeaders.set(name, value);
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  },
};
