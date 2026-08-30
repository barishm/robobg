package com.robobg.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Consumables")
public class Consumable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    @Column(precision = 10, scale = 2)
    private BigDecimal price;
    private BigDecimal promoPrice;

    @ManyToMany
    @JoinTable(
            name = "robot_consumables",
            joinColumns = @JoinColumn(name = "consumable_id"),
            inverseJoinColumns = @JoinColumn(name = "robot_id")
    )
    @OrderColumn(name = "robot_order")
    private List<Robot> compatibleRobots = new ArrayList<>();


    @ElementCollection
    @CollectionTable(name = "consumable_images", joinColumns = @JoinColumn(name = "consumable_id"))
    @Column(name = "image_path")
    @OrderColumn(name = "image_order")
    private List<String> images = new ArrayList<>();

}
