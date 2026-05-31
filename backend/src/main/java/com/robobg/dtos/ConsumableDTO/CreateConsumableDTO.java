package com.robobg.dtos.ConsumableDTO;

import lombok.Data;

import java.util.List;

@Data
public class CreateConsumableDTO {
    private Long id;
    private String title;
    private String description;
    private String price;
    private String promoPrice;
    private List<Long> robotIds;
}
