import React from "react";
import { ChatbotService } from "src/app/services/ChatbotService";
import { CONTACT_MESSAGE_RESPONSE } from "src/constants";
import { act } from "react";

const MessageParser = ({ children, actions }) => {
  const parse = async (message) => {
    if (actions.isLoading()) {
      return;
    }

    try {
      actions.addBotMessage("Loader");
      const state = actions.getState();

      const response = await ChatbotService.sendMessage(
        "23",
        state.messages,
        message
      );

      actions.removeLoader();

      const lastBotMessage = response.messages
        ?.filter((msg) => msg.role === "assistant")
        ?.pop()?.content;

      actions.addBotMessage(lastBotMessage || CONTACT_MESSAGE_RESPONSE);
    } catch (error) {
      console.error("AI error:", error);
      actions.removeLoader();
      actions.addBotMessage(CONTACT_MESSAGE_RESPONSE);
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions,
        });
      })}
    </div>
  );
};

export default MessageParser;
