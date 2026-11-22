import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OffersFeed from 'src/features/home-page-feature/Offers';
import OfferCategoryFilters from 'src/features/offers-page-feature/OfferCategoryFilters';
import { categoryColor } from 'src/features/home-page-feature/categoryColors';

// All offers, filterable by category (hashtag). The selected categories live
// in the URL (/offers?category=Dog&category=Cat), so clicking a hashtag in an
// offer opens this page already filtered.
const Offers = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParams = searchParams.getAll('category').join('\n');
  const categories = useMemo(() => (categoryParams ? categoryParams.split('\n') : []), [categoryParams]);

  // Changing the filter starts again from the first page
  const setCategories = (next) => {
    setSearchParams((params) => {
      const updated = new URLSearchParams(params);
      updated.delete('category');
      updated.delete('page');
      next.forEach((category) => updated.append('category', category));
      return updated;
    });
  };

  const headerExtra = (
    <div className="text-center">
      <button
        className="btn btn-primary mt-2 mb-4 d-lg-none"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offerFilters"
        aria-controls="offerFilters"
      >
        <i className="fa-solid fa-filter fa-sm"></i>&nbsp; {t('filters')}
      </button>
      {categories.length > 0 && (
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-0 mt-lg-3 mb-4">
          {categories.map((category) => (
            <span
              key={category}
              className="badge rounded-pill d-inline-flex align-items-center text-white"
              style={{ backgroundColor: categoryColor(category) }}
            >
              #{category}
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                style={{ fontSize: '0.55rem' }}
                aria-label={`Remove #${category}`}
                onClick={() => setCategories(categories.filter((value) => value !== category))}
              ></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="mt-4">
      <div className="container d-flex">
        <div className="col-12 col-md-12 col-lg-9">
          <OffersFeed categories={categories} headerExtra={headerExtra} />
        </div>
        <div className="col-12 col-md-12 col-lg-3" style={{ marginTop: '48px', padding: '20px' }}>
          <OfferCategoryFilters selected={categories} onChange={setCategories} />
        </div>
      </div>
    </section>
  );
};

export default Offers;
