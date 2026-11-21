import { useTranslation } from 'react-i18next';
import { useGetOfferCategoriesQuery } from 'src/app/services/offerApiSlice';
import { categoryColor } from 'src/features/home-page-feature/categoryColors';

const sameCategory = (a, b) => a.toLowerCase() === b.toLowerCase();

// Checkbox list of all offer categories (hashtags) with their offer counts.
// Shown as a card on the right on large screens and in an offcanvas (opened
// by the Filters button) on small ones, like the All Robots filters.
const OfferCategoryFilters = ({ selected, onChange }) => {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useGetOfferCategoriesQuery();

  // A selected category from the URL that no offer uses anymore still shows,
  // so it can be unchecked.
  const missing = selected
    .filter((name) => !categories.some((category) => sameCategory(category.name, name)))
    .map((name) => ({ name, count: 0 }));
  const options = [...categories, ...missing];

  const isChecked = (name) => selected.some((value) => sameCategory(value, name));

  const toggle = (name, checked) => {
    onChange(checked ? [...selected, name] : selected.filter((value) => !sameCategory(value, name)));
  };

  const renderList = (idPrefix) => (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <label className="form-label mb-0">{t('categories')}</label>
        {selected.length > 0 && (
          <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => onChange([])}>
            {t('clearAll')}
          </button>
        )}
      </div>
      <div className="card p-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
        {isLoading ? (
          <span className="text-muted small">…</span>
        ) : options.length === 0 ? (
          <span className="text-muted small">{t('noCategoriesYet')}</span>
        ) : (
          options.map((category) => {
            const id = `${idPrefix}-${category.name}`;
            return (
              <div className="form-check" key={category.name}>
                <input
                  id={id}
                  type="checkbox"
                  className="form-check-input"
                  checked={isChecked(category.name)}
                  onChange={(e) => toggle(category.name, e.target.checked)}
                />
                <label className="form-check-label text-break" htmlFor={id}>
                  <span className="fw-semibold" style={{ color: categoryColor(category.name) }}>
                    #{category.name}
                  </span>{' '}
                  <span style={{ color: 'grey' }}>({category.count})</span>
                </label>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="offerFilters" aria-labelledby="offerFiltersLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offerFiltersLabel">
            {t('filters')}
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {renderList('offerCategoryM')}
          <button type="button" className="btn btn-primary mt-3" data-bs-dismiss="offcanvas">
            {t('apply')}
          </button>
        </div>
      </div>
      <div className="card d-none d-lg-block">
        <div className="card-header p-3">
          <h5 style={{ marginBottom: '0px' }}>
            <i className="fa-solid fa-filter fa-sm"></i> {t('filters')}
          </h5>
        </div>
        <div className="card-body p-4">{renderList('offerCategory')}</div>
      </div>
    </>
  );
};

export default OfferCategoryFilters;
