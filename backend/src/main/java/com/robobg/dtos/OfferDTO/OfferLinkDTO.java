package com.robobg.dtos.OfferDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferLinkDTO {
    private String url;
    private String title;
    private String image;
}
