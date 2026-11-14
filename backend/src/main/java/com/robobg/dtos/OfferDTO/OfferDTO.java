package com.robobg.dtos.OfferDTO;

import lombok.Data;

import java.time.Instant;

@Data
public class OfferDTO {
    private Long id;
    private String text;
    private OfferLinkDTO link;
    private OfferAuthorDTO author;
    private Instant createdAt;
}
