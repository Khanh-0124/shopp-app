package com.project.shopapp.services;

import com.project.shopapp.dtos.BannerDTO;
import com.project.shopapp.models.Banner;
import java.util.List;

public interface IBannerService {
    Banner createBanner(BannerDTO bannerDTO);
    Banner getBannerById(long id);
    List<Banner> getAllBanners();
    List<Banner> getActiveBanners();
    Banner updateBanner(long id, BannerDTO bannerDTO);
    void deleteBanner(long id);
}
