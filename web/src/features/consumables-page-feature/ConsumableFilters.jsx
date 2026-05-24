import { useSelector } from "react-redux";
import { useState } from "react";
import { useGetAllConsumablesQuery } from "src/app/services/consumableApiSlice";

const ConsumableFilters = ({ onFilterChange, selectedModels = [] }) => {
  const lang = useSelector((state) => state.language.lang);
  const [selectedModelInput, setSelectedModelInput] = useState("");
  const { data = [], isLoading, isError } = useGetAllConsumablesQuery();

  const models = data
    .map((consumable) => consumable.robots)
    .flat()
    .map((robot) => robot.model);

  const uniqueModels = [...new Set(models)];

  const handleModelChange = (e) => {
    const model = e.target.value.trim();
    if (!model) return;

    if (!selectedModels.includes(model)) {
      onFilterChange([...selectedModels, model]);
    }

    setSelectedModelInput("");
  };

  const handleInputChange = (e) => {
    setSelectedModelInput(e.target.value);
  };

  const removeModel = (modelToRemove) => {
    const updated = selectedModels.filter((model) => model !== modelToRemove);
    onFilterChange(updated);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading consumables</div>;

  const filterLabel = lang === "en" ? "Filters" : "Филтри";
  const selectLabel = lang === "en" ? "Select Model" : "Изберете модел";
  const placeholder = lang === "en" ? "Type to search..." : "Търсете...";

  const renderInputSection = (
    <div className="form-group mb-3">
      <label htmlFor="modelSelectInput" className="form-label">
        {selectLabel}
      </label>
      <input
        className="form-control"
        list="datalistOptions"
        id="modelSelectInput"
        placeholder={placeholder}
        value={selectedModelInput}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedModelInput(value);
          if (
            uniqueModels.includes(value) &&
            !selectedModels.includes(value) &&
            selectedModels.length < 5
          ) {
            onFilterChange([...selectedModels, value]);
            setSelectedModelInput("");
          }
        }}
      />
      <datalist id="datalistOptions">
        {[...uniqueModels]
          .sort((a, b) => a.localeCompare(b))
          .map((model, index) => (
            <option key={index} value={model}>
              {model}
            </option>
          ))}
      </datalist>

      {selectedModels.length > 0 && (
        <div className="mt-3 d-flex flex-wrap gap-2">
          {selectedModels.map((model) => (
            <span
              key={model}
              className="badge bg-secondary d-flex align-items-center"
              style={{ fontSize: "0.9rem" }}
            >
              {model}
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                aria-label="Remove"
                style={{ fontSize: "0.6rem" }}
                onClick={() => removeModel(model)}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Offcanvas */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasExampleLabel">
            {filterLabel}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          {renderInputSection}
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

      {/* Desktop Card */}
      <div className="card d-none d-lg-block">
        <div className="card-header p-3">
          <h5 style={{ marginBottom: "0px" }}>
            <i className="fa-solid fa-filter fa-sm"></i> {filterLabel}
          </h5>
        </div>
        <div className="card-body p-4 h-400" style={{ height: "auto" }}>
          {renderInputSection}
        </div>
      </div>
    </>
  );
};

export default ConsumableFilters;
