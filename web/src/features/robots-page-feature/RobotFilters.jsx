import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

// All Robots filters: model name and brand. Shown as a card on large screens
// and in an offcanvas (opened by the Filters button) on small ones.
const RobotFilters = ({
  Model,
  setPage,
  setModel,
  setBrands,
  Brands,
  availableBrands,
}) => {
  const lang = useSelector((state) => state.language.lang);
  const { t } = useTranslation();

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    if (checked) {
      setBrands((prev) => [...prev, value]);
    } else {
      setBrands((prev) => prev.filter((brand) => brand !== value));
    }
    setPage(0);
  };

  // idSuffix keeps input ids unique between the offcanvas and the card
  const renderFilters = (idSuffix) => (
    <form id={`filters${idSuffix}`} onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor={`id_title${idSuffix}`} className="form-label">
          {t("byModelName")}
        </label>
        <input
          type="text"
          name="title"
          value={Model}
          onChange={(e) => {
            setModel(e.target.value);
            setPage(0);
          }}
          className="textinput textInput form-control"
          id={`id_title${idSuffix}`}
        ></input>
      </div>
      <div className="mt-3">
        <label className="form-label">{t("brand")}</label>
        <div className="card p-2" style={{ maxHeight: "195px", overflowY: "auto" }}>
          {availableBrands.map((item) => {
            const id = `brand${idSuffix}-${item.id}`;
            return (
              <div className="form-check" key={item.id}>
                <input
                  id={id}
                  type="checkbox"
                  className="form-check-input"
                  name="brand_name"
                  checked={Brands.includes(item.brand)}
                  value={item.brand}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor={id} className="form-check-label">
                  {item.brand} <span style={{ color: "grey" }}>({item.count})</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );

  return (
    <>
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasExampleLabel">
            {lang === "en" ? "Filters" : "Филтри"}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          {renderFilters("M")}
          <button
            type="button"
            className="btn btn-primary mt-3"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          >
            {lang === "en" ? "Apply" : "Приложи"}
          </button>
        </div>
      </div>
      <div className="card d-none d-lg-block">
        <div className="card-header p-3">
          <h5 style={{ marginBottom: "0px" }}>
            <i className="fa-solid fa-filter fa-sm"></i>{" "}
            {lang === "en" ? "Filters" : "Филтри"}
          </h5>
        </div>
        <div className="card-body p-4">{renderFilters("")}</div>
      </div>
    </>
  );
};

export default RobotFilters;
