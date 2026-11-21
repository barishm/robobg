import { useTranslation } from "react-i18next";

// How many numbered pages to show around the current one, between the
// "Newest" (first page) and the last page buttons.
const WINDOW_SIZE = 3;

// Every state is a shade of grey: light grey buttons, a darker grey selected
// page and pale grey disabled buttons (Bootstrap's pagination CSS variables).
const GREY_THEME = {
  "--bs-pagination-color": "#212529",
  "--bs-pagination-bg": "#f8f9fa",
  "--bs-pagination-border-color": "#dee2e6",
  "--bs-pagination-hover-color": "#212529",
  "--bs-pagination-hover-bg": "#e9ecef",
  "--bs-pagination-hover-border-color": "#dee2e6",
  "--bs-pagination-focus-color": "#212529",
  "--bs-pagination-focus-bg": "#e9ecef",
  "--bs-pagination-focus-box-shadow": "0 0 0 0.25rem rgba(108, 117, 125, 0.25)",
  "--bs-pagination-active-color": "#fff",
  "--bs-pagination-active-bg": "#6c757d",
  "--bs-pagination-active-border-color": "#6c757d",
  "--bs-pagination-disabled-color": "#adb5bd",
  "--bs-pagination-disabled-bg": "#f1f3f5",
  "--bs-pagination-disabled-border-color": "#dee2e6",
};

// [Newest] [2] [3] [4] … [Last] [Next]
// "Newest" is page 1. The numbered window follows the current page, and "…"
// marks skipped pages. Page is 0-based.
const Pagination =({ Page, setPage, totalPages }) => {
  const { t } = useTranslation();

  if (!totalPages || totalPages <= 1) return null;

  const lastIndex = totalPages - 1;
  const isLast = Page >= lastIndex;

  // Window of page indexes between the first (0) and the last page
  let windowStart = Math.max(1, Page - Math.floor(WINDOW_SIZE / 2));
  let windowEnd = Math.min(lastIndex - 1, windowStart + WINDOW_SIZE - 1);
  windowStart = Math.max(1, Math.min(windowStart, windowEnd - WINDOW_SIZE + 1));
  const windowPages = [];
  for (let i = windowStart; i <= windowEnd; i++) windowPages.push(i);

  // preventDefault keeps href="#" from adding a "#" history entry; scrolling
  // to the top is what following "#" used to do.
  const goTo = (e, index) => {
    e.preventDefault();
    if (index === Page || index < 0 || index > lastIndex) return;
    setPage(index);
    window.scrollTo({ top: 0 });
  };

  const pageItem = (index, label) => {
    const active = index === Page;
    return (
      <li key={index} className={active ? "page-item active" : "page-item"} aria-current={active ? "page" : undefined}>
        <a
          className="page-link"
          href="#"
          onClick={(e) => goTo(e, index)}
        >
          {label}
        </a>
      </li>
    );
  };

  const ellipsis = (key) => (
    <li key={key} className="page-item disabled">
      <span className="page-link">…</span>
    </li>
  );

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <nav aria-label="Pagination">
        <ul className="pagination flex-wrap justify-content-center" style={GREY_THEME}>
          {pageItem(0, t("newest"))}
          {windowStart > 1 && ellipsis("start-gap")}
          {windowPages.map((index) => pageItem(index, index + 1))}
          {windowEnd < lastIndex - 1 && ellipsis("end-gap")}
          {pageItem(lastIndex, lastIndex + 1)}
          <li className={isLast ? "page-item disabled" : "page-item"}>
            <a
              className="page-link"
              href="#"
              aria-disabled={isLast}
              onClick={(e) => goTo(e, Page + 1)}
            >
              {t("next")}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};
export default Pagination;
