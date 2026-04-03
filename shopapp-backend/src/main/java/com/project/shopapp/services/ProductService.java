package com.project.shopapp.services;

import com.project.shopapp.dtos.ProductDTO;
import com.project.shopapp.dtos.ProductImageDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.exceptions.InvalidParamException;
import com.project.shopapp.models.Category;
import com.project.shopapp.models.Product;
import com.project.shopapp.models.ProductImage;
import com.project.shopapp.models.*;
import com.project.shopapp.repositories.*;
import com.project.shopapp.responses.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService implements IProductService{
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductAttributeRepository attributeRepository;
    private final ProductAttributeValueRepository attributeValueRepository;
    private final ProductVariantRepository variantRepository;

    @Override
    @Transactional
    public Product createProduct(ProductDTO productDTO) throws DataNotFoundException {
        Category existingCategory = categoryRepository
                .findById(productDTO.getCategoryId())
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find category with id: "+productDTO.getCategoryId()));

        Product newProduct = Product.builder()
                .name(productDTO.getName())
                .price(productDTO.getPrice())
                .thumbnail(productDTO.getThumbnail())
                .description(productDTO.getDescription())
                .category(existingCategory)
                .hasVariants(productDTO.getHasVariants())
                .build();
        Product savedProduct = productRepository.save(newProduct);
        
        if (Boolean.TRUE.equals(productDTO.getHasVariants())) {
            saveVariants(savedProduct, productDTO);
        }
        
        return savedProduct;
    }

    private void saveVariants(Product product, ProductDTO productDTO) {
        if (productDTO.getAttributeGroups() == null || productDTO.getVariants() == null) {
            System.out.println("DEBUG: Missing attributes or variants in DTO, skipping saveVariants.");
            return;
        }

        // 1. Lưu Attributes và Values
        java.util.Map<String, ProductAttributeValue> valueMap = new java.util.HashMap<>();
        
        for (ProductDTO.AttributeGroupDTO groupDTO : productDTO.getAttributeGroups()) {
            if (groupDTO.getName() == null || groupDTO.getName().trim().isEmpty()) continue;
            
            ProductAttribute attribute = ProductAttribute.builder()
                    .product(product)
                    .name(groupDTO.getName())
                    .build();
            attribute = attributeRepository.save(attribute);

            for (String value : groupDTO.getValues()) {
                if (value == null || value.trim().isEmpty()) continue;
                
                ProductAttributeValue attributeValue = ProductAttributeValue.builder()
                        .attribute(attribute)
                        .value(value)
                        .build();
                attributeValue = attributeValueRepository.save(attributeValue);
                valueMap.put(groupDTO.getName() + "|" + value, attributeValue);
            }
        }

        // 2. Lưu Variants
        for (ProductDTO.VariantDTO variantDTO : productDTO.getVariants()) {
            ProductVariant variant = ProductVariant.builder()
                    .product(product)
                    .price(variantDTO.getPrice())
                    .stockQuantity(variantDTO.getStock())
                    .sku(variantDTO.getSku())
                    .build();
            
            java.util.List<ProductAttributeValue> variantValues = new java.util.ArrayList<>();
            if (variantDTO.getCombination() != null) {
                for (int i = 0; i < variantDTO.getCombination().size(); i++) {
                    String valName = variantDTO.getCombination().get(i);
                    if (i < productDTO.getAttributeGroups().size()) {
                        String groupName = productDTO.getAttributeGroups().get(i).getName();
                        ProductAttributeValue av = valueMap.get(groupName + "|" + valName);
                        if (av != null) variantValues.add(av);
                    }
                }
            }
            variant.setAttributeValues(variantValues);
            variantRepository.save(variant);
        }
        System.out.println("DEBUG: saveVariants completed for product ID: " + product.getId());
    }

    @Override
    public Product getProductById(long productId) throws Exception {
        Optional<Product> optionalProduct = productRepository.getDetailProduct(productId);
        if(optionalProduct.isPresent()) {
            return optionalProduct.get();
        }
        throw new DataNotFoundException("Cannot find product with id =" + productId);
    }

    public ProductResponse getProductResponseById(long productId) throws Exception {
        Product product = getProductById(productId);
        ProductResponse response = ProductResponse.fromProduct(product);
        
        System.out.println("DEBUG: Fetching details for Product ID: " + productId);
        System.out.println("DEBUG: Product hasVariants in DB: " + product.getHasVariants());

        if (Boolean.TRUE.equals(product.getHasVariants())) {
            List<ProductResponse.ProductAttributeResponse> attrs = mapAttributes(productId);
            List<ProductResponse.ProductVariantResponse> variants = mapVariants(productId);
            
            System.out.println("DEBUG: Found Attributes count: " + attrs.size());
            System.out.println("DEBUG: Found Variants count: " + variants.size());

            response.setAttributes(attrs);
            response.setVariants(variants);
            
            // Fallback: Nếu attributes bị rỗng nhưng có variants, hãy thử lấy attributes từ name của variant (nếu có)
            if (attrs.isEmpty() && !variants.isEmpty()) {
                System.out.println("DEBUG: Attributes empty but variants exist. Something is wrong in DB mapping.");
            }
        }
        return response;
    }
    @Override
    public List<Product> findProductsByIds(List<Long> productIds) {
        return productRepository.findProductsByIds(productIds);
    }


    @Override
    public Page<ProductResponse> getAllProducts(String keyword,
                                                Long categoryId, PageRequest pageRequest) {
        Page<Product> productsPage;
        productsPage = productRepository.searchProducts(categoryId, keyword, pageRequest);
        return productsPage.map(product -> {
            ProductResponse response = ProductResponse.fromProduct(product);
            if (Boolean.TRUE.equals(product.getHasVariants())) {
                // Map variants to response
                response.setAttributes(mapAttributes(product.getId()));
                response.setVariants(mapVariants(product.getId()));
            }
            return response;
        });
    }

    private List<ProductResponse.ProductAttributeResponse> mapAttributes(Long productId) {
        return attributeRepository.findByProductId(productId).stream()
                .map(attr -> ProductResponse.ProductAttributeResponse.builder()
                        .name(attr.getName())
                        .values(attr.getAttributeValues().stream().map(ProductAttributeValue::getValue).toList())
                        .build())
                .toList();
    }

    private List<ProductResponse.ProductVariantResponse> mapVariants(Long productId) {
        return variantRepository.findByProductId(productId).stream()
                .map(v -> ProductResponse.ProductVariantResponse.builder()
                        .combination(v.getAttributeValues().stream().map(ProductAttributeValue::getValue).toList())
                        .price(v.getPrice())
                        .stock(v.getStockQuantity())
                        .sku(v.getSku())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public Product updateProduct(
            long id,
            ProductDTO productDTO
    )
            throws Exception {
        Product existingProduct = getProductById(id);
        if(existingProduct != null) {
            Category existingCategory = categoryRepository
                    .findById(productDTO.getCategoryId())
                    .orElseThrow(() ->
                            new DataNotFoundException(
                                    "Cannot find category with id: "+productDTO.getCategoryId()));
            existingProduct.setName(productDTO.getName());
            existingProduct.setCategory(existingCategory);
            existingProduct.setPrice(productDTO.getPrice());
            existingProduct.setDescription(productDTO.getDescription());
            existingProduct.setThumbnail(productDTO.getThumbnail());
            existingProduct.setHasVariants(productDTO.getHasVariants());
            
            // Handle variants update: Delete old and save new (Simple approach)
            if (Boolean.TRUE.equals(existingProduct.getHasVariants())) {
                variantRepository.deleteByProductId(id);
                attributeRepository.deleteByProductId(id);
            }
            
            Product savedProduct = productRepository.save(existingProduct);
            if (Boolean.TRUE.equals(productDTO.getHasVariants()) && productDTO.getAttributeGroups() != null) {
                saveVariants(savedProduct, productDTO);
            }
            return savedProduct;
        }
        return null;

    }

    @Override
    @Transactional
    public void deleteProduct(long id) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        optionalProduct.ifPresent(productRepository::delete);
    }

    @Override
    public boolean existsByName(String name) {
        return productRepository.existsByName(name);
    }
    @Override
    @Transactional
    public ProductImage createProductImage(
            Long productId,
            ProductImageDTO productImageDTO) throws Exception {
        Product existingProduct = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find product with id: "+productImageDTO.getProductId()));
        ProductImage newProductImage = ProductImage.builder()
                .product(existingProduct)
                .imageUrl(productImageDTO.getImageUrl())
                .build();
        //Ko cho insert quá 5 ảnh cho 1 sản phẩm
        int size = productImageRepository.findByProductId(productId).size();
        if(size >= ProductImage.MAXIMUM_IMAGES_PER_PRODUCT) {
            throw new InvalidParamException(
                    "Number of images must be <= "
                    +ProductImage.MAXIMUM_IMAGES_PER_PRODUCT);
        }
        return productImageRepository.save(newProductImage);
    }

    @Override
    @Transactional
    public void deleteProductImage(long id) {
        Optional<ProductImage> productImage = productImageRepository.findById(id);
        productImage.ifPresent(img -> {
            // Xóa record trong DB
            productImageRepository.delete(img);
            // Có thể xóa file trong uploads nếu muốn (demo này tạm bỏ qua để tránh lỗi path)
        });
    }

    @Override
    @Transactional
    public void deleteAllProducts() {
        productRepository.deleteAll();
    }
}
