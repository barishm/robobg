

const Pagination = ({ Page, setPage, isLast }) => {

    
  const nextPage = () => {
    if (!isLast) {
      setPage(Page + 1);
    }
  };
  const prevPage = () => {
    if (Page !== 0) {
      setPage(Page - 1);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <nav aria-label="Page navigation example">
        <ul className="pagination">
          <li className={Page === 0 ? "page-item disabled" : "page-item"}>
            <a
              className="page-link bg-light"
              href="#"
              aria-label="Previous"
              onClick={prevPage}
            >
              <span aria-hidden="true" style={{ color: "black" }}>
                &laquo;
              </span>
            </a>
          </li>
          <li className="page-item">
            <span className="page-link bg-light" href="#" style={{ color: "black" }}>
              {Page + 1}
            </span>
          </li>
          <li className={isLast ? "page-item disabled" : "page-item"}>
            <a
              className="page-link bg-light"
              href="#"
              aria-label="Next"
              onClick={nextPage}
            >
              <span aria-hidden="true" style={{ color: "black" }}>
                &raquo;
              </span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};
export default Pagination;
