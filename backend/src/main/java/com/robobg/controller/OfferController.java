package com.robobg.controller;

import com.robobg.dtos.OfferDTO.OfferCategoryDTO;
import com.robobg.dtos.OfferDTO.OfferDTO;
import com.robobg.dtos.OfferDTO.OfferPageDTO;
import com.robobg.exceptions.EntityNotFoundException;
import com.robobg.service.OfferService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/offers")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @GetMapping
    public OfferPageDTO getOffers(@RequestParam(value = "page", defaultValue = "0") int page,
                                  @RequestParam(value = "size", defaultValue = "10") int size,
                                  // ?category=Dog&category=Cat (or Dog,Cat): offers with any of them
                                  @RequestParam(value = "category", required = false) List<String> categories) {
        return offerService.getOffers(page, size, categories);
    }

    @GetMapping("/categories")
    public List<OfferCategoryDTO> getCategories() {
        return offerService.getCategories();
    }

    @GetMapping("/{id}")
    public OfferDTO getOfferById(@PathVariable Long id) throws EntityNotFoundException {
        return offerService.getOfferById(id);
    }
}
