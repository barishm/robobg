import CompareTable from "src/features/compare-robots-feature/CompareTable";
import CompareForm from "src/features/compare-robots-feature/CompareForm";
import AddRobotDropdown from "src/features/compare-robots-feature/AddRobotDropdown";
import PopularComparisons from "src/components/PopularComparisons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLazyGetRobotByIdQuery } from "src/app/services/robotApiSlice";
import { getRobotIdsFromUrl, addIdToUrl, removeIdFromUrl } from "src/utils/utils";
import { useTranslation } from "react-i18next";

const Compare = () => {
  const { t } = useTranslation()
  const [robots, setRobots] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [triggerGetRobot] = useLazyGetRobotByIdQuery();

  useEffect(() => {
    const fetchRobots = async () => {
      const ids = getRobotIdsFromUrl(location.search);

      if (ids.length === 0) {
        setRobots([]);
        return;
      }

      try {
        // Get current robot IDs
        const currentRobotIds = robots.map((robot) => robot.id);

        // Only fetch robots that aren't already in state
        const idsToAdd = ids.filter((id) => !currentRobotIds.includes(id));

        if (idsToAdd.length > 0) {
          const robotPromises = idsToAdd.map((id) => triggerGetRobot({ id }).unwrap());
          const newRobotsData = await Promise.all(robotPromises);
          const validNewRobots = newRobotsData.filter(Boolean);

          // Add new robots to existing ones
          setRobots([...robots, ...validNewRobots]);
        }

        // Remove robots that are no longer in URL
        const idsToRemove = currentRobotIds.filter((id) => !ids.includes(id));
        if (idsToRemove.length > 0) {
          setRobots(robots.filter((robot) => !idsToRemove.includes(robot.id)));
        }
      } catch (error) {
        console.error("Error fetching robots:", error);
      }
    };

    fetchRobots();
  }, [location.search, triggerGetRobot, robots]);

  const handleAddRobot = (robot) => {
    // Add robot to state immediately (we already have the data!)
    setRobots([...robots, robot]);
    // Then update URL
    addIdToUrl(location.search, robot.id, navigate);
  };

  const handleDeleteRobot = (id) => {
    removeIdFromUrl(location.search, id, navigate);
  };
  

  return (
    <div>
      {robots.length === 0 ? (
        <div>
          <CompareForm />
          <PopularComparisons />
        </div>
      ) : (
        <>
          <AddRobotDropdown robots={robots} onAddRobot={handleAddRobot} />
          <CompareTable robots={robots} onDeleteRobot={handleDeleteRobot} />
        </>
      )}
    </div>
  );
};
export default Compare;
