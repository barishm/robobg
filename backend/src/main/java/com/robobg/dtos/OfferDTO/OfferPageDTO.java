package com.robobg.dtos.OfferDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// One page of offers, newest first. page is 0-based.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferPageDTO {
    private List<OfferDTO> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
