package com.robobg.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// A hashtag used in at least one offer's text, e.g. "#Roborock".
// Categories are kept in sync with the offers' text: created when a hashtag
// first appears and removed when no offer uses it anymore.
@Entity
@Table(name = "offer_categories")
@Getter
@Setter
@NoArgsConstructor
public class OfferCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // As first written, without the "#"
    @Column(nullable = false, length = 100)
    private String name;

    // Lower-case name: #Dog and #dog are the same category
    @Column(name = "normalized_name", nullable = false, unique = true, length = 100)
    private String normalizedName;

    public OfferCategory(String name, String normalizedName) {
        this.name = name;
        this.normalizedName = normalizedName;
    }
}
