package com.project.shopapp.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "banners")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Banner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "sub_title", length = 500)
    private String subTitle;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "link", length = 255)
    private String link;

    @Column(name = "active")
    private boolean active;
}
