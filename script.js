const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendButton = document.getElementById("sendBtn");

// Use your class Cloudflare Worker URL here. The API key stays in the Worker.
const workerUrl = "https://loreal.bradleyjosephleon.workers.dev/";
const conversationMessages = [
  {
    role: "system",
    content:
      "You are a helpful L'Oréal beauty assistant. Use the full conversation history to make natural follow-up responses. Remember details the user shares, such as their name, preferences, and past questions, and refer to them when relevant. Never guess details the user has not shared. Answer questions about L'Oréal products, beauty, skincare, makeup, haircare, fragrance, routines, and recommendations. If a question is unrelated to these topics, politely explain that you specialize in L'Oréal and beauty-related help, then invite the user to ask about a product or routine. Do not answer the unrelated question. " +
      "Format every reply for a simple chat window using plain text only. Do not use markdown: no headings, no bold asterisks, no tables, no horizontal rules, and no code fences. Use short paragraphs. For routines, use a simple numbered list like: 1) Step — product name. Brief reason. Keep responses concise unless the user asks for more detail.",
  },
];

// Add messages as text so user input is displayed safely.
function addMessage(text, sender) {
  const message = document.createElement("p");
  message.className = `msg ${sender}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return message;
}

addMessage("👋 Hello! How can I help you today?", "ai");

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) {
    return;
  }

  addMessage(message, "user");
  userInput.value = "";
  conversationMessages.push({ role: "user", content: message });

  const loadingMessage = addMessage("Thinking...", "ai");
  userInput.disabled = true;
  sendButton.disabled = true;

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationMessages }),
    });
    const data = await response.json();
    const apiError =
      typeof data.error === "string" ? data.error : data.error?.message;

    if (!response.ok) {
      throw new Error(apiError || `Request failed (${response.status})`);
    }

    // Show an API error even if the Worker accidentally returned it with status 200.
    if (apiError) {
      throw new Error(apiError);
    }

    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string") {
      throw new Error("The response did not contain a chatbot message.");
    }

    conversationMessages.push({ role: "assistant", content: reply });
    loadingMessage.textContent = reply;
  } catch (error) {
    conversationMessages.pop();
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    loadingMessage.textContent = `Sorry, I couldn't get a response. ${errorMessage}`;
  } finally {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
});
