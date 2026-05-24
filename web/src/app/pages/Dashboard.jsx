import ManageUsers from "src/features/cms-feature/components/ManageUsers";
import LatestQuestions from "src/features/cms-feature/components/LatestQuestions";
const Dashboard = ({ dashboardsActiveComponent }) => {

  const renderActiveComponent = () => {
    switch (dashboardsActiveComponent) {
      case "Manage Users":
        return <ManageUsers />;
      case "Latest Questions":
        return <LatestQuestions />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col">{renderActiveComponent()}</div>
      </div>
    </div>
  );
};
export default Dashboard;
