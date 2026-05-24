import { useState, useMemo } from "react";

const usePagination = (data = [], itemsPerPage = 12) => {
  const [page, setPage] = useState(0);

  const paginatedData = useMemo(() => {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, page, itemsPerPage]);

  const isLast = useMemo(() => {
    return (page + 1) * itemsPerPage >= data.length;
  }, [page, itemsPerPage, data.length]);

  return {
    page,
    setPage,
    paginatedData,
    isLast
  };
};

export default usePagination;