package com.project.shopapp.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "product_id",
        foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT) // Tránh lỗi FK errno 150
    )
    private Product product;

    private Float price;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    private String sku;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "variant_attribute_values",
        joinColumns = @JoinColumn(
            name = "variant_id",
            foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT)
        ),
        inverseJoinColumns = @JoinColumn(
            name = "attribute_value_id",
            foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT)
        )
    )
    private List<ProductAttributeValue> attributeValues;
}
