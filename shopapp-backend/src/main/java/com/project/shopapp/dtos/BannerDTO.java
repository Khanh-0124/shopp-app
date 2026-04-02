package com.project.shopapp.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BannerDTO {
    private String title;

    @JsonProperty("sub_title")
    private String subTitle;

    @JsonProperty("image_url")
    private String imageUrl;

    private String link;

    private boolean active;
}
