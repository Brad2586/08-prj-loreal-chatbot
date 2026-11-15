const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendButton = document.getElementById("sendBtn");

// Replace this example with your class Worker URL; it keeps the API key out of the browser.
const workerUrl = "https://loreal-chatbot.your-subdomain.workers.dev/";
const conversationMessages = [
  {
    role: "system",
    content:
      "You are a helpful L'Oréal beauty assistant. Answer questions about L'Oréal products, beauty, skincare, makeup, haircare, fragrance, routines, and recommendations. If a question is unrelated to these topics, politely explain that you specialize in L'Oréal and beauty-related help, then invite the user to ask about a product or routine. Do not answer the unrelated question.",
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

    if (!response.ok) {
      throw new Error(data.error?.message || `Request failed (${response.status})`);
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
