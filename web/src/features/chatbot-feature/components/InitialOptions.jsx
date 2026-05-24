import {
  CONTACT_MESSAGE,
  CHOOSE_ROBOT_MESSAGE,
  ROBOT_ISSUE_MESSAGE,
  ROBOT_MAINTENANCE_MESSAGE,
  ROBOBG_SERVICES_MESSAGE
} from "src/constants";

import "src/styles/chatbot.css";

const InitialOptions = ({ actionProvider }) => {
  const options = [
    { text: CHOOSE_ROBOT_MESSAGE, handler: actionProvider.handleChooseRobot },
    { text: ROBOT_ISSUE_MESSAGE, handler: actionProvider.handleRobotIssue },
    { text: ROBOT_MAINTENANCE_MESSAGE, handler: actionProvider.handleMaintenance },
    { text: CONTACT_MESSAGE, handler: actionProvider.handleContactTeam },
    { text: ROBOBG_SERVICES_MESSAGE, handler: actionProvider.handleMaintenanceServices },
  ];

  return (
    <div className="options-container">
      {options.map((option, index) => (
        <button
          key={index}
          className="option-button"
          onClick={option.handler}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};

export default InitialOptions;

