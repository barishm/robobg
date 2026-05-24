import { useEffect, useState } from 'react';

const useRobotFilters = (data, filterOptions, isLoading) => {
  const [filteredRobots, setFilteredRobots] = useState([]);

  useEffect(() => {
    if (!isLoading && Array.isArray(data)) {
      const {
        Model,
        Brands,
        StartYear,
        EndYear,
        MinDustbinCapacity,
        MaxDustbinCapacity,
        MinSuctionPower,
        MaxSuctionPower,
      } = filterOptions;

      const filtered = data.filter((robot) => {
        return (
          (!Model || robot.model.toLowerCase().includes(Model.toLowerCase())) &&
          (Brands.length === 0 || Brands.includes(robot.brand)) &&
          (!StartYear || robot.year >= StartYear) &&
          (!EndYear || robot.year <= EndYear) &&
          (!MinDustbinCapacity || robot.dustbinCapacity >= MinDustbinCapacity) &&
          (!MaxDustbinCapacity || robot.dustbinCapacity <= MaxDustbinCapacity) &&
          (!MinSuctionPower || robot.suctionPower >= MinSuctionPower) &&
          (!MaxSuctionPower || robot.suctionPower <= MaxSuctionPower)
        );
      });
      setFilteredRobots(filtered);
    }
  }, [data, isLoading, filterOptions]);

  return filteredRobots;
};

export default useRobotFilters;
