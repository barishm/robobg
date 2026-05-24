import { useNavigate } from "react-router-dom";
import { NO_IMAGE } from 'src/constants';
import { useTranslation } from "react-i18next";

const ConsumableTab = ({ robot }) => {

  const { t } = useTranslation()
  const navigate = useNavigate();

  return (
    <div className="mt-3">
      {robot?.consumables && robot.consumables.length > 0 ? (
        <ul className="list-unstyled">
          {robot.consumables.map((consumable, index) => (
            <li
              key={consumable.id}
              onClick={() => navigate(`/consumables/${consumable.id}`)}
              className="d-flex align-items-center py-2"
              style={{
                cursor: "pointer",
                borderBottom:
                  index !== robot.consumables.length - 1 ? "1px solid #dee2e6" : "none",
              }}
            >
              <img
                src={consumable.images[0] || NO_IMAGE}
                alt={consumable.title}
                className="rounded"
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  marginRight: "12px",
                }}
              />

              <span style={{ color: "black" }}>
                {consumable.title}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <h5>{t("noConsumablesAvailable")}</h5>
      )}
    </div>
  );
};

export default ConsumableTab;