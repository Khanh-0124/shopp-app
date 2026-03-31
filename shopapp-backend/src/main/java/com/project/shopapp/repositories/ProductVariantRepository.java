package com.project.shopapp.repositories;

import com.project.shopapp.models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductId(Long productId);
    void deleteByProductId(Long productId);
}
