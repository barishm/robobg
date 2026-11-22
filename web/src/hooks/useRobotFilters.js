import { useEffect, useState } from 'react';

const useRobotFilters = (data, filterOptions, isLoading) => {
  const [filteredRobots, setFilteredRobots] = useState([]);

  useEffect(() => {
    if (!isLoading && Array.isArray(data)) {
      const { Model, Brands } = filterOptions;

      const filtered = data.filter((robot) => {
        return (
          (!Model || robot.model.toLowerCase().includes(Model.toLowerCase())) &&
          (Brands.length === 0 || Brands.includes(robot.brand))
        );
      });
      // "One of bests" robots come first, ordered by their bests number
      // (1, 2, 3...); the rest keep their order after them (sort is stable).
      const byBests = (a, b) => {
        if (a.bests == null && b.bests == null) return 0;
        if (a.bests == null) return 1;
        if (b.bests == null) return -1;
        return a.bests - b.bests;
      };
      const sorted = [...filtered].sort(byBests);

      setFilteredRobots(sorted);
    }
  }, [data, isLoading, filterOptions]);

  return filteredRobots;
};

export default useRobotFilters;
