package com.project.shopapp.controllers;

import com.project.shopapp.dtos.BannerDTO;
import com.project.shopapp.models.Banner;
import com.project.shopapp.services.IBannerService;
import jakarta.validation.Valid;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/banners")
@RequiredArgsConstructor
public class BannerController {
    private final IBannerService bannerService;

    @PostMapping("")
    public ResponseEntity<?> createBanner(@Valid @RequestBody BannerDTO bannerDTO) {
        try {
            Banner banner = bannerService.createBanner(bannerDTO);
            return ResponseEntity.ok(banner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("")
    public ResponseEntity<List<Banner>> getAllBanners() {
        List<Banner> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(banners);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Banner>> getActiveBanners() {
        List<Banner> banners = bannerService.getActiveBanners();
        return ResponseEntity.ok(banners);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(
            @PathVariable long id,
            @Valid @RequestBody BannerDTO bannerDTO) {
        try {
            Banner banner = bannerService.updateBanner(id, bannerDTO);
            return ResponseEntity.ok(banner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable long id) {
        try {
            bannerService.deleteBanner(id);
            return ResponseEntity.ok("Banner deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
