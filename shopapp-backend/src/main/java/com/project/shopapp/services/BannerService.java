package com.project.shopapp.services;

import com.project.shopapp.dtos.BannerDTO;
import com.project.shopapp.models.Banner;
import com.project.shopapp.repositories.BannerRepository;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService implements IBannerService {
    private final BannerRepository bannerRepository;

    @Override
    @Transactional
    public Banner createBanner(BannerDTO bannerDTO) {
        Banner newBanner = Banner.builder()
                .title(bannerDTO.getTitle())
                .subTitle(bannerDTO.getSubTitle())
                .imageUrl(bannerDTO.getImageUrl())
                .link(bannerDTO.getLink())
                .active(bannerDTO.isActive())
                .build();
        return bannerRepository.save(newBanner);
    }

    @Override
    public Banner getBannerById(long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
    }

    @Override
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    @Override
    public List<Banner> getActiveBanners() {
        return bannerRepository.findByActiveTrue();
    }

    @Override
    @Transactional
    public Banner updateBanner(long id, BannerDTO bannerDTO) {
        Banner existingBanner = getBannerById(id);
        existingBanner.setTitle(bannerDTO.getTitle());
        existingBanner.setSubTitle(bannerDTO.getSubTitle());
        existingBanner.setImageUrl(bannerDTO.getImageUrl());
        existingBanner.setLink(bannerDTO.getLink());
        existingBanner.setActive(bannerDTO.isActive());
        return bannerRepository.save(existingBanner);
    }

    @Override
    @Transactional
    public void deleteBanner(long id) {
        bannerRepository.deleteById(id);
    }
}
