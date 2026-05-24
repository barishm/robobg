// Disable input
export const disableChatInput = () => {
    const input = document.querySelector('.react-chatbot-kit-chat-input');
    const sendButton = document.querySelector('.react-chatbot-kit-chat-btn-send');
    if (input) {
        input.disabled = true;
        input.style.opacity = 0.5;
    }

    if (sendButton) {
        sendButton.disabled = true;
        sendButton.style.opacity = 0.5;
    }
};

// Enable input
export const enableChatInput = () => {
    const input = document.querySelector('.react-chatbot-kit-chat-input');
    const sendButton = document.querySelector('.react-chatbot-kit-chat-btn-send');
    if (input) {
        input.disabled = false;
        input.style.opacity = 1;
        input.style.cursor = 'text';
    }

    if (sendButton) {
        sendButton.disabled = false;
        sendButton.style.opacity = 1;
    }
};