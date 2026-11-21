package com.robobg.repository;

import com.robobg.dtos.OfferDTO.OfferCategoryDTO;
import com.robobg.entity.OfferCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OfferCategoryRepository extends JpaRepository<OfferCategory, Long> {

    List<OfferCategory> findByNormalizedNameIn(Collection<String> normalizedNames);

    @Query("select new com.robobg.dtos.OfferDTO.OfferCategoryDTO(c.name, count(o)) " +
            "from Offer o join o.categories c " +
            "group by c.id, c.name " +
            "order by count(o) desc, lower(c.name)")
    List<OfferCategoryDTO> findAllWithOfferCounts();

    // Removes categories that no offer uses anymore
    @Modifying(flushAutomatically = true)
    @Query("delete from OfferCategory c where not exists " +
            "(select o.id from Offer o join o.categories oc where oc.id = c.id)")
    int deleteUnused();
}
