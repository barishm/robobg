
export const ChatbotService = {
  async sendMessage(sessionId, messageHistory, userMessage) {
    const messages = [
      ...messageHistory.map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.message || msg.text,
      })),
      { role: 'user', content: userMessage },
    ];

    const requestBody = {
      sessionId,
      messages,
    };

    const response = await fetch("https://api.barishm.com/v1/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error("Chatbot API error:", response.statusText);
      throw new Error("Failed to get chatbot response");
    }

    const result = await response.json();

    return result;
  },
};

