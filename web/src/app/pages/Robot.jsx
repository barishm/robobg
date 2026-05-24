import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import RobotDetails from "src/features/robot-page-feature/RobotDetails";
import QnA from "src/features/robot-page-feature/QnA";
import ConsumableTab from "src/features/consumable-page-feature/ConsumableTab";
import {
  useGetRobotByIdQuery,
  useGetAllRobotsQuery,
  useDeleteRobotMutation
} from "src/app/services/robotApiSlice";
import Loading from "src/components/Loading";
import { useSelector } from "react-redux";
import { compareMultipleRobots } from "src/utils/utils";
import { PhotoView } from 'react-photo-view';
import { NO_IMAGE } from 'src/constants';
import 'react-photo-view/dist/react-photo-view.css';
import { useTranslation } from "react-i18next";
import { REMOVE_BORDER_AT } from "src/constants";
import DeletePopup from "src/features/cms-feature/components/DeletePopup";
import RobotForm from "src/features/cms-feature/components/RobotForm";
import UploadRobotImage from "src/features/cms-feature/components/UploadRobotImage";

const Robot = () => {
  const { t } = useTranslation()
  const [Tab, setTab] = useState("Specs");
  const lang = useSelector((state) => state.language.lang);


  const { id } = useParams();
  const [Model, setModel] = useState("");
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetRobotByIdQuery({ id });
  const { data: allModels, isLoading: allModelsIsLoading } =
    useGetAllRobotsQuery();

  const { role } = useSelector((state) => state.auth);

  const compare = (e) => {
    const newModel = e.target.value;
    setModel(newModel);
    const foundItem = allModels.find((item) => item.model === newModel);

    if (foundItem && foundItem.id !== data.id) {
      let id = data.id;
      let id2 = foundItem.id;
      compareMultipleRobots([id, id2], navigate);
    }
    setModel("");
  };
  const changeTab = (tabName) => {
    setTab(tabName);
  };

  const [screenSize, setScreenSize] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      {error ? (
        <>Oh no, there was an error</>
      ) : isLoading ? (
        <Loading />
      ) : data ? (
        <>
          <DeletePopup
            id={data.id}
            deleteMutationHook={useDeleteRobotMutation}
            message={"ARE YOU SURE YOU WANT TO DELETE THIS ROBOT?"}
            modalId={"DeleteRobotModal"}
          />

          <RobotForm action="U" id={data.id} />
          <UploadRobotImage RobotId={data.id} />

          <div
            className="container my-4"
          >
            {/* CENTER EVERYTHING */}
            <div className="row justify-content-center">
              <div
                className="col-12"
                style={{ maxWidth: "900px" }}
              >
                {/* 🔥 BREADCRUMBS */}
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a
                      onClick={() => navigate("/robots")}
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                    >
                      {t("vacuumRobots")}
                    </a>
                  </li>
                  <li className="breadcrumb-item active">
                    {data.model}
                  </li>
                </ol>

                {/* CARD */}
                <div
                  className={
                    screenSize > REMOVE_BORDER_AT
                      ? "container mt-4 card pt-5 px-5 pb-3"
                      : "container-fluid px-2"
                  }
                  style={{ position: "relative" }}
                >
                  {/* ADMIN BUTTONS */}
                  {(role === "ADMIN" || role === "MODERATOR") && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        zIndex: 10,
                      }}
                    >
                      <button
                        className="btn btn-light btn-sm me-1"
                        value={data.id}
                        onClick={(e) => setRobotId(e.currentTarget.value)}
                        data-bs-toggle="modal"
                        data-bs-target="#uploadImage"
                      >
                        <img
                          src="/images/image.png"
                          className="img-fluid"
                          style={{ maxHeight: "1.3rem" }}
                          alt="Upload"
                        />
                      </button>

                      <button
                        className="btn btn-sm btn-primary me-1"
                        data-bs-toggle="modal"
                        data-bs-target="#update"
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#DeleteRobotModal"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="row">
                    <div className="col-8 col-md-4 mb-4">
                      <PhotoView src={data.image}>
                        <img
                          className="mt-4 ms-4 rounded-3"
                          style={{ maxWidth: "200px", height: "auto" }}
                          src={data.image || NO_IMAGE}
                        />
                      </PhotoView>
                    </div>

                    <div className="col-12 col-md-8 mt-2 p-4">
                      <h3 className="fw-border mb-3">{data.model}</h3>
                      <h6 className="ms-1 mb-2 mt-3">
                        Brand: {data.brand}
                      </h6>

                      {/* ACTIONS */}
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: "20px", marginBottom: "10px" }}
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseExample"
                      >
                        {t("Compare")}
                      </button>

                      <button
                        type="button"
                        className="btn btn-warning dropdown-toggle ms-4"
                        style={{ marginTop: "20px", marginBottom: "10px" }}
                        data-bs-toggle="dropdown"
                      >
                        {lang === "en"
                          ? "Check price"
                          : "Проверка на цена"}
                      </button>

                      <ul className="dropdown-menu">
                        {data.purchaseLinks && data.purchaseLinks.length > 0 ? (
                          data.purchaseLinks.map((purchaseLink) => (
                            <li key={purchaseLink.id}>
                              <a
                                className="dropdown-item"
                                target="_blank"
                                href={purchaseLink.link}
                                rel="noreferrer"
                              >
                                {purchaseLink.name}
                              </a>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span className="dropdown-item disabled text-muted" aria-disabled="true">
                              {t("noOffersAvailable")}
                            </span>
                          </li>
                        )}
                      </ul>

                      {/* COMPARE */}
                      <div className="collapse" id="collapseExample">
                        <input
                          className="form-control"
                          value={Model}
                          style={{ maxWidth: "241px" }}
                          name="Model"
                          list="datalistOptions"
                          onChange={compare}
                          placeholder="Choose robot from the list"
                        />

                        {allModelsIsLoading ? (
                          <>Loading...</>
                        ) : (
                          <datalist id="datalistOptions">
                            {allModels
                              .slice()
                              .sort((a, b) =>
                                a.model.localeCompare(b.model)
                              )
                              .map((item) => (
                                <option
                                  key={item.id}
                                  value={item.model}
                                />
                              ))}
                          </datalist>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TABS */}
                  <div className="row mt-5 p-2">
                    <ul className="nav nav-tabs">
                      <li className="nav-item">
                        <a
                          className={`nav-link ${Tab === "Specs" ? "active" : ""
                            }`}
                          style={{ color: "black", cursor: "pointer" }}
                          onClick={() => changeTab("Specs")}
                        >
                          {lang === "en"
                            ? "Specs"
                            : "Спецификации"}
                        </a>
                      </li>

                      <li className="nav-item">
                        <a
                          className={`nav-link ${Tab === "Q&A" ? "active" : ""
                            }`}
                          style={{ color: "black", cursor: "pointer" }}
                          onClick={() => changeTab("Q&A")}
                        >
                          {lang === "en" ? "Q&A" : "В&О"}
                        </a>
                      </li>

                      <li className="nav-item">
                        <a
                          className={`nav-link ${Tab === "Consumables"
                            ? "active"
                            : ""
                            }`}
                          style={{ color: "black", cursor: "pointer" }}
                          onClick={() => changeTab("Consumables")}
                        >
                          {lang === "en"
                            ? "Consumables"
                            : "Консумативи"}
                        </a>
                      </li>
                    </ul>

                    {Tab === "Specs" ? (
                      <RobotDetails robot={data} />
                    ) : Tab === "Q&A" ? (
                      <QnA Id={id} />
                    ) : Tab === "Consumables" ? (
                      <ConsumableTab robot={data} />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
export default Robot;
