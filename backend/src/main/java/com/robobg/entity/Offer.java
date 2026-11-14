package com.robobg.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String text;

    @Column(name = "link_url", length = 2048)
    private String linkUrl;

    @Column(name = "link_title")
    private String linkTitle;

    // File name inside the files folder, like Robot.image
    @Column(name = "link_image")
    private String linkImage;

    // Stored in UTC
    @Column(name = "create_time")
    private LocalDateTime createTime;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;
}
