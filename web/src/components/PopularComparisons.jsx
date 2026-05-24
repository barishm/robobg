import { useGetAllMostComparesQuery, useDeleteMostComparesMutation } from "src/app/services/mostComparesApiSlice";
import Loading from "src/components/Loading";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { compareMultipleRobots } from "src/utils/utils";
import CreateMostCompared from "src/features/cms-feature/components/CreateMostCompared";
import { useTranslation } from "react-i18next";

const PopularComparisons = () => {
  const navigate = useNavigate();
  const { role, accessToken } = useSelector((state) => state.auth);
  const lang = useSelector((state) => state.language.lang);
  const { t } = useTranslation()

  const { data, isLoading, isError } = useGetAllMostComparesQuery();
  const [deleteMC] = useDeleteMostComparesMutation();

  const handleComparisonClick = (id1, id2, id3) => {
    const ids = [id1, id2, id3].filter(Boolean);
    compareMultipleRobots(ids, navigate);
  };

  const handleDelete = async (e, id) => {
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    e.preventDefault();
    e.stopPropagation();

    console.log("Delete button clicked for ID:", id);

    try {
      await deleteMC({ id, accessToken });
      console.log("Delete successful");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const isAdminOrMod = role === "ADMIN" || role === "MODERATOR";

  return (
    <div
      className="mx-3 mx-md-0"
      style={{
        marginTop: "40px",
        marginBottom: "50px",
        textAlign: "center",
      }}
    >
      <CreateMostCompared />
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <></>
      ) : (
        <>
          {data?.length > 0 && (
            <h4 className="mb-3">
              {lang === "en" ? <>Popular Comparisons</> : <>Популярни сравнения</>}
            </h4>
          )}
          {isAdminOrMod && (
            <button
              type="button"
              className="btn btn-primary btn-sm mb-2"
              data-bs-toggle="modal"
              data-bs-target="#createMostCompared"
            >
              {t("addComparison")}
            </button>
          )}
          <div>
            {data.map((item) => (
              <div
                key={item.id}
                className="card p-4 mt-3 position-relative"
                style={{
                  minHeight: "50px",
                  maxWidth: "450px",
                  margin: "15px auto",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "rgb(238, 239, 241)",
                  borderRadius: "8px",
                  transition: "background-color 0.2s ease",
                }}
                onClick={() => handleComparisonClick(item.robot1?.id, item.robot2?.id, item.robot3?.id)}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgb(230, 231, 233)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgb(238, 239, 241)")}
              >
                {isAdminOrMod && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "10px",
                      background: "none",
                      border: "none",
                      padding: "0",
                      color: "#999",
                      fontSize: "20px",
                      lineHeight: "1",
                      zIndex: 10,
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#000")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "#999")}
                  >
                    &times;
                  </button>
                )}

                <h6 className="card-title m-0">
                  {item.robot1?.model} <span style={{ color: "gray" }}>vs.</span> {item.robot2?.model}
                  {item.robot3 && (
                    <>
                      {" "}
                      <span style={{ color: "gray" }}>vs.</span> {item.robot3?.model}
                    </>
                  )}
                </h6>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PopularComparisons;