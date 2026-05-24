import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Loading from "src/components/Loading";
import { useSelector } from "react-redux";
import { useGetConsumableByIdQuery } from "src/app/services/consumableApiSlice";
import { PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { NO_IMAGE } from 'src/constants';
import {
  useDeleteConsumableMutation,
} from 'src/app/services/consumableApiSlice';
import DeletePopup from "src/features/cms-feature/components/DeletePopup";
import ConsumableForm from "src/features/cms-feature/components/ConsumableForm";
import UploadConsumableImages from "src/features/cms-feature/components/UploadConsumableImages";
import { REMOVE_BORDER_AT } from "src/constants";
import { useTranslation } from "react-i18next";

const Consumable = () => {
  const { t } = useTranslation()
  const [Tab, setTab] = useState("Specs");
  const lang = useSelector((state) => state.language.lang);
  const { role } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [selectedConsumableToUpdate, setSelectedConsumableToUpdate] = useState(null);
  const [consumableId, setConsumableId] = useState(null);

  const { id } = useParams();
  const { data, isLoading, error } = useGetConsumableByIdQuery({ id });

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
      <DeletePopup
        id={consumableId}
        deleteMutationHook={useDeleteConsumableMutation}
        message={"ARE YOU SURE YOU WANT TO DELETE THIS CONSUMABLE?"}
        modalId={"DeleteConsumableModal"}
      />

      <ConsumableForm modalId="update" consumable={selectedConsumableToUpdate} />
      <UploadConsumableImages consumable={consumableId} />

      {error ? (
        <>Oh no, there was an error</>
      ) : isLoading ? (
        <Loading />
      ) : data ? (
        <div
          className="container my-4"
        >
          <div className="row justify-content-center">
            <div
              className="col-12"
              style={{
                maxWidth: "900px",
              }}
            >
              {/* BREADCRUMB */}
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a
                    onClick={() => navigate(`/consumables`)}
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                  >
                    {t("consumables")}
                  </a>
                </li>
                <li className="breadcrumb-item active">{data.title}</li>
              </ol>

              {/* CARD */}
              <div
                className={
                  screenSize > REMOVE_BORDER_AT
                    ? "container mt-4 card pt-5 px-5"
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
                      onClick={(e) =>
                        setConsumableId(e.currentTarget.value)
                      }
                      data-bs-toggle="modal"
                      data-bs-target="#uploadConsumableImage"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src="/images/image-gallery.png"
                        className="img-fluid"
                        style={{ maxHeight: "1.3rem" }}
                        alt="Upload"
                      />
                    </button>

                    <button
                      className="btn btn-sm btn-primary me-1"
                      value={data.id}
                      onClick={() => {
                        setSelectedConsumableToUpdate(data);
                      }}
                      data-bs-toggle="modal"
                      data-bs-target="#update"
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      value={data.id}
                      onClick={(e) => {
                        setConsumableId(e.target.value);
                      }}
                      data-bs-toggle="modal"
                      data-bs-target="#DeleteConsumableModal"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* MAIN CONTENT */}
                <div className="row">
                  {/* CAROUSEL */}
                  <div className="col-8 col-md-4 mb-4">
                    <div
                      id="carouselExampleIndicators"
                      className="carousel slide"
                      data-bs-ride="carousel"
                    >
                      {data.images && data.images.length > 0 && (
                        <div className="carousel-indicators">
                          {data.images.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              data-bs-target="#carouselExampleIndicators"
                              data-bs-slide-to={index}
                              className={index === 0 ? "active" : ""}
                            ></button>
                          ))}
                        </div>
                      )}

                      <div className="carousel-inner rounded-3">
                        {data.images && data.images.length > 0 ? (
                          data.images.map((imageSrc, index) => (
                            <div
                              className={`carousel-item ${index === 0 ? "active" : ""
                                }`}
                              key={index}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  width: "100%",
                                  paddingTop: "100%",
                                }}
                              >
                                <PhotoView src={imageSrc}>
                                  <img
                                    src={imageSrc || NO_IMAGE}
                                    alt={`Slide ${index + 1}`}
                                    style={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </PhotoView>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="carousel-item active">
                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                paddingTop: "100%",
                              }}
                            >
                              <img
                                src={NO_IMAGE}
                                alt="No image available"
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {data.images && data.images.length > 1 && (
                        <>
                          <button
                            className="carousel-control-prev"
                            type="button"
                            data-bs-target="#carouselExampleIndicators"
                            data-bs-slide="prev"
                          >
                            <span className="carousel-control-prev-icon"></span>
                          </button>
                          <button
                            className="carousel-control-next"
                            type="button"
                            data-bs-target="#carouselExampleIndicators"
                            data-bs-slide="next"
                          >
                            <span className="carousel-control-next-icon"></span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="col-12 col-md-8 mt-2 p-4">
                    <h3 className="fw-border mb-3">{data.title}</h3>
                    <h5 className="fw-light mb-3">{data.description}</h5>
                    <h5 className="fw-border mb-3 text-danger">
                      {data.price} EUR
                    </h5>
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
                          ? "Compatibility"
                          : "Съвместимост"}
                      </a>
                    </li>
                  </ul>
                </div>

                <ul className="list-unstyled mt-3">
                  {data.robots.map((robot, index) => (
                    <li
                      key={robot.id}
                      onClick={() => navigate(`/robots/${robot.id}`)}
                      className="d-flex align-items-center py-2"
                      style={{
                        cursor: "pointer",
                        borderBottom:
                          index !== data.robots.length - 1 ? "1px solid #dee2e6" : "none",
                      }}
                    >
                      <img
                        src={robot.image || NO_IMAGE}
                        alt={robot.model}
                        className="rounded"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          marginRight: "12px",
                        }}
                      />

                      <span style={{ color: "black" }}>
                        {robot.model}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default Consumable;
