import React from "react";
import { disableChatInput, enableChatInput } from "src/features/chatbot-feature/utils/chatUtils";
import {
  CONTACT_MESSAGE,
  CHOOSE_ROBOT_MESSAGE,
  ROBOT_ISSUE_MESSAGE,
  ROBOT_MAINTENANCE_MESSAGE,
  ROBOBG_SERVICES_MESSAGE,
  CONTACT_MESSAGE_RESPONSE,
  CHOOSE_ROBOT_MESSAGE_RESPONSE,
  ROBOT_ISSUE_MESSAGE_RESPONSE,
  ROBOT_MAINTENANCE_MESSAGE_RESPONSE
} from 'src/constants';


let interactionStarted = false;

const ActionProvider = ({
  createChatBotMessage,
  setState,
  children,
  state,
}) => {
  const sendUserAndBotMessage = async  (userText, botText) => {
    addUserMessage(userText);

    addLoader();

    await simulateDelay();

    removeLoader();

    addBotMessage(botText);
  };

  const handleChooseRobot = async () => {
    await sendUserAndBotMessage(CHOOSE_ROBOT_MESSAGE, CHOOSE_ROBOT_MESSAGE_RESPONSE);

    enableChatInput();
  };

  const handleRobotIssue = async () => {
    await sendUserAndBotMessage(ROBOT_ISSUE_MESSAGE, ROBOT_ISSUE_MESSAGE_RESPONSE);
    enableChatInput();
  };

  const handleMaintenance = async () => {
    await sendUserAndBotMessage(
      ROBOT_MAINTENANCE_MESSAGE,
      ROBOT_MAINTENANCE_MESSAGE_RESPONSE
    );
    enableChatInput();
  };

  const handleMaintenanceServices = async () => {
    await sendUserAndBotMessage(ROBOBG_SERVICES_MESSAGE, CONTACT_MESSAGE_RESPONSE);
  };

  const handleContactTeam = async () => {
    await sendUserAndBotMessage(CONTACT_MESSAGE, CONTACT_MESSAGE_RESPONSE);
  };

  const getState = () => state;

  const addLoader = () => {
    addBotMessage("Loader");
  };

  const isLoading = () => {
    return state.messages.some(msg => msg.message === "Loader");
  };

  const removeLoader = () => {
    setState((prev) => {
      const messages = [...prev.messages];
      if (
        messages.length &&
        messages[messages.length - 1].message === "Loader"
      ) {
        messages.pop();
      }
      return {
        ...prev,
        messages,
      };
    });
  };

  const simulateDelay = () => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const addBotMessage = (text) => {
    const botMessage = createChatBotMessage(text);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const addUserMessage = (text) => {
    const userMessage = createChatBotMessage(text, { type: "user" });
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));
  };

  const hasStartedInteraction = () => interactionStarted;

  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          actions: {
            handleChooseRobot,
            handleRobotIssue,
            handleMaintenance,
            handleContactTeam,
            handleMaintenanceServices,
            addBotMessage,
            getState,
            hasStartedInteraction,
            isLoading, 
            removeLoader,
            deleteMessages: (count = 1) => {
              setState((prev) => ({
                ...prev,
                messages: prev.messages.slice(0, -count),
              }));
            },
          },
        })
      )}
    </div>
  );
};

export default ActionProvider;
