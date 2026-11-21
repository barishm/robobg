package com.robobg.dtos.OfferDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// A category (hashtag, without the "#") and how many offers use it
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferCategoryDTO {
    private String name;
    private long count;
}
