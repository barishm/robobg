package com.robobg.repository;

import com.robobg.entity.Offer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface OfferRepository extends JpaRepository<Offer,Long> {

    // Offers with at least one of the given categories
    @Query(value = "select o from Offer o where exists " +
            "(select 1 from Offer o2 join o2.categories c where o2.id = o.id and c.normalizedName in :names)",
            countQuery = "select count(o) from Offer o where exists " +
            "(select 1 from Offer o2 join o2.categories c where o2.id = o.id and c.normalizedName in :names)")
    Page<Offer> findByAnyCategory(@Param("names") Collection<String> normalizedNames, Pageable pageable);
}
