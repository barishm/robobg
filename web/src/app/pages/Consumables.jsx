import { useGetAllConsumablesQuery } from "src/app/services/consumableApiSlice";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Loading from "src/components/Loading";
import Error from "src/components/Error";
import Pagination from "src/components/Pagination";
import PopularComparisons from "src/components/PopularComparisons";
import ConsumableFilters from "src/features/consumables-page-feature/ConsumableFilters";
import { useNavigate, useSearchParams } from 'react-router-dom';
import usePagination from "src/hooks/usePagination";
import { NO_IMAGE, DEFAULT_ENTITIES_PER_PAGE } from "src/constants";
import ConsumableForm from "src/features/cms-feature/components/ConsumableForm";
import { useTranslation } from "react-i18next";

const Consumables = () => {
  const { t } = useTranslation()
  const lang = useSelector((state) => state.language.lang);
  const [filterByModels, setFilterByModels] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data = [], isLoading, isError } = useGetAllConsumablesQuery();
  const [filteredConsumables, setFilteredConsumables] = useState([]);
  const { role } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const modelsParam = searchParams.get("models");
    if (modelsParam) {
      const modelsFromURL = modelsParam.split(",");
      setFilterByModels(modelsFromURL);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && Array.isArray(data)) {
      if (filterByModels.length === 0) {
        setFilteredConsumables(data);
      } else {
        const filtered = data.filter(consumable =>
          consumable.robots.some(robot => filterByModels.includes(robot.model))
        );
        setFilteredConsumables(filtered);
      }
    }
  }, [data, isLoading, filterByModels]);

  const {
    page,
    setPage,
    paginatedData: paginatedEntities,
    isLast
  } = usePagination(filteredConsumables, DEFAULT_ENTITIES_PER_PAGE);

  const details = (id) => navigate('/consumables/' + id);
  const handleFilterChange = (selectedModels) => {
    setFilterByModels(selectedModels);

    if (selectedModels.length > 0) {
      searchParams.set("models", selectedModels.join(","));
    } else {
      searchParams.delete("models");
    }
    setSearchParams(searchParams);
  };

  if (isError) return <Error />;

  return (
    <section className="mt-4">
      <ConsumableForm modalId="create" />
      <div className="container d-flex">
        <div className="col-12 col-md-12 col-lg-9">
          <h3
            className="fw-bolder"
            style={{ marginTop: "10px", textAlign: "center" }}
          >
            {lang === "en" ? "All consumables" : "Всички консумативи"}
            <br />

            <button
              className="btn btn-primary mt-3 d-lg-none me-2"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasExample"
            >
              <i className="fa-solid fa-filter fa-sm"></i>&nbsp;
              {lang === "en" ? "Filters" : "Филтри"}
            </button>

            {(role === "ADMIN" || role === "MODERATOR") && (
              <button
                className="btn btn-success mt-3"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#create"
              >
                <i className="fa-solid fa-plus fa-sm"></i>&nbsp;
                {lang === "en" ? "Create" : "Създай"}
              </button>
            )}
          </h3>
{isLoading ? (
  <Loading />
) : paginatedEntities ? (
  <div className="row mt-4">
    {paginatedEntities.map((item) => {
      // Calculate discount percentage if promoPrice exists
      let discountPercentage = 0;
      if (item.promoPrice && item.price) {
        const original = parseFloat(item.price);
        const promo = parseFloat(item.promoPrice);
        if (original > 0) {
          discountPercentage = Math.round(((original - promo) / original) * 100);
        }
      }

      return (
        <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 mb-3" key={item.id}>
          {/* Added position-relative to stack the badge correctly */}
          <div className="card bg-body-tertiary rounded position-relative h-100">
            
            {/* Promo Badge in the top right corner */}
            {item.promoPrice && discountPercentage > 0 && (
              <span className="badge bg-danger position-absolute top-0 end-0 m-2">
                -{discountPercentage}%
              </span>
            )}

            <img
              className="rounded-top"
              value={item.id}
              style={{ cursor: "pointer" }}
              onClick={() => details(item.id)}
              src={item.images[0] || NO_IMAGE}
              alt="..."
            />
            <div className="card-body">
              <div className="text-center">
                <h5
                  className="fw-bolder"
                  onClick={() => details(item.id)}
                  value={item.id}
                  style={{ cursor: "pointer" }}
                >
                  {item.title}
                </h5>
              </div>
            </div>
            <div className="card-footer mb-2 border-top-0 bg-transparent d-flex justify-content-evenly">
              <div className="btn-group text-center flex-column align-items-center">
                {item.promoPrice ? (
                  <>
                    {/* Scratched original price */}
                    <span className="text-muted text-decoration-line-through small">
                      {item.price} {"EUR"}
                    </span>
                    {/* Promo price in blue font */}
                    <h5 className="text-primary fw-bold m-0">
                      {item.promoPrice} {"EUR"}
                    </h5>
                  </>
                ) : (
                  /* Standard price layout if no promo exists */
                  <h5 className="text-danger m-0">
                    {item.price} {"EUR"}
                  </h5>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
) : null}
          {filteredConsumables.length > DEFAULT_ENTITIES_PER_PAGE && (
            <Pagination Page={page} setPage={setPage} isLast={isLast} />
          )}
        </div>
        <div className="col-12 col-md-12 col-lg-3" style={{ marginTop: "48px", padding: "20px" }}>
          <ConsumableFilters onFilterChange={handleFilterChange} selectedModels={filterByModels} />
          <div className="d-none d-lg-block">
            <PopularComparisons />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consumables;
