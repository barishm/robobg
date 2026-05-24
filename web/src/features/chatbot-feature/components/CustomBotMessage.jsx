import React from "react";
import { CONTACT_MESSAGE_RESPONSE } from "src/constants";
import { useNavigate } from "react-router-dom";

const CustomBotMessage = ({ message }) => {
  const navigate = useNavigate();
  const isContactMessage = message === CONTACT_MESSAGE_RESPONSE;
  const isLoader = message === "Loader";

  if (isLoader) {
    return (
      <div
        className="react-chatbot-kit-chat-bot-message"
        style={{ backgroundColor: "#454d55" }}
      >
        <div className="chatbot-loader">
          <div className="chatbot-loader-dot"></div>
          <div className="chatbot-loader-dot"></div>
          <div className="chatbot-loader-dot"></div>
        </div>
        <div
          className="react-chatbot-kit-chat-bot-message-arrow"
          style={{ borderRightColor: "#454d55" }}
        />
      </div>
    );
  }

  if (isContactMessage) {
    return (
      <div
        className="react-chatbot-kit-chat-bot-message"
        style={{ backgroundColor: "#454d55" }}
      >
        <span>
          Моля свържете се с екипа на{" "}
          <a href="mailto:support@example.com" style={{ color: "#82cfff" }}>
            support@example.com
          </a>{" "}
          или чрез формата за контакт{" "}
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              navigate("/contact");
            }}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#82cfff" }}
          >
            тук
          </a>{" "}
          за повече информация.
        </span>
        <div
          className="react-chatbot-kit-chat-bot-message-arrow"
          style={{ borderRightColor: "#454d55" }}
        />
      </div>
    );
  }

  // Default rendering for all other bot messages
  return (
    <div
      className="react-chatbot-kit-chat-bot-message"
      style={{ backgroundColor: "#454d55" }}
    >
      <span>
        {" "}
        {message.split("\n").map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </span>
      <div
        className="react-chatbot-kit-chat-bot-message-arrow"
        style={{ borderRightColor: "#454d55" }}
      />
    </div>
  );
};

export default CustomBotMessage;
