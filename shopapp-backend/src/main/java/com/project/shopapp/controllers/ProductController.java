package com.project.shopapp.controllers;

import com.github.javafaker.Faker;
import com.project.shopapp.components.LocalizationUtils;
import com.project.shopapp.dtos.*;
import com.project.shopapp.models.Product;
import com.project.shopapp.models.ProductImage;
import com.project.shopapp.responses.ProductListResponse;
import com.project.shopapp.responses.ProductResponse;
import com.project.shopapp.services.IProductService;
import com.project.shopapp.utils.MessageKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {
    private final IProductService productService;
    private final LocalizationUtils localizationUtils;

    @PostMapping("")
    public ResponseEntity<?> createProduct(
            @Valid @RequestBody ProductDTO productDTO,
            BindingResult result
    ) {
        try {
            if(result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }
            Product newProduct = productService.createProduct(productDTO);
            
            if (productDTO.getImageUrls() != null && !productDTO.getImageUrls().isEmpty()) {
                for (String url : productDTO.getImageUrls()) {
                    productService.createProductImage(newProduct.getId(), 
                        ProductImageDTO.builder()
                            .productId(newProduct.getId())
                            .imageUrl(url)
                            .build());
                }
                if (newProduct.getThumbnail() == null || newProduct.getThumbnail().isEmpty()) {
                    newProduct.setThumbnail(productDTO.getImageUrls().get(0));
                    productService.updateProduct(newProduct.getId(), ProductDTO.builder()
                            .name(newProduct.getName())
                            .price(newProduct.getPrice())
                            .description(newProduct.getDescription())
                            .thumbnail(newProduct.getThumbnail())
                            .hasVariants(Boolean.TRUE.equals(newProduct.getHasVariants()))
                            .categoryId(newProduct.getCategory().getId())
                            .build());
                }
            }
            return ResponseEntity.ok(newProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "uploads/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImages(
            @PathVariable("id") Long productId,
            @ModelAttribute("files") List<MultipartFile> files
    ){
        try {
            Product existingProduct = productService.getProductById(productId);
            files = files == null ? new ArrayList<>() : files;
            if(files.size() > ProductImage.MAXIMUM_IMAGES_PER_PRODUCT) {
                return ResponseEntity.badRequest().body(localizationUtils.getLocalizedMessage(MessageKeys.UPLOAD_IMAGES_MAX_5));
            }
            List<ProductImage> productImages = new ArrayList<>();
            for (MultipartFile file : files) {
                if(file.getSize() == 0) continue;
                if(file.getSize() > 10 * 1024 * 1024) {
                    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(localizationUtils.getLocalizedMessage(MessageKeys.UPLOAD_IMAGES_FILE_LARGE));
                }
                if(!isImageFile(file)) {
                    return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(localizationUtils.getLocalizedMessage(MessageKeys.UPLOAD_IMAGES_FILE_MUST_BE_IMAGE));
                }
                String filename = storeFile(file);
                ProductImage productImage = productService.createProductImage(
                        existingProduct.getId(),
                        ProductImageDTO.builder().imageUrl(filename).build()
                );
                productImages.add(productImage);
            }
            if (productImages.size() > 0 && (existingProduct.getThumbnail() == null || existingProduct.getThumbnail().isEmpty())) {
                existingProduct.setThumbnail(productImages.get(0).getImageUrl());
                productService.updateProduct(productId, ProductDTO.builder()
                        .name(existingProduct.getName())
                        .price(existingProduct.getPrice())
                        .description(existingProduct.getDescription())
                        .thumbnail(existingProduct.getThumbnail())
                        .hasVariants(Boolean.TRUE.equals(existingProduct.getHasVariants()))
                        .categoryId(existingProduct.getCategory().getId())
                        .build());
            }
            return ResponseEntity.ok().body(productImages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/images/{imageName:.+}")
    public ResponseEntity<?> viewImage(@PathVariable String imageName) {
        try {
            // 1. Giải mã URL chuẩn
            String decodedImageName = java.net.URLDecoder.decode(imageName, java.nio.charset.StandardCharsets.UTF_8);
            java.nio.file.Path imagePath = java.nio.file.Paths.get("uploads/" + decodedImageName);
            org.springframework.core.io.UrlResource resource = new org.springframework.core.io.UrlResource(imagePath.toUri());

            if (resource.exists()) {
                return serveResource(decodedImageName, resource);
            }

            // 2. Fallback: Tìm kiếm theo Prefix (Vì Screenshot có thể lệch ký tự unicode khoảng trắng)
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
            try (java.util.stream.Stream<java.nio.file.Path> stream = java.nio.file.Files.list(uploadDir)) {
                java.util.Optional<java.nio.file.Path> matchedFile = stream
                    .filter(path -> path.getFileName().toString().startsWith(imageName.substring(0, Math.min(imageName.length(), 40))))
                    .findFirst();
                
                if (matchedFile.isPresent()) {
                    org.springframework.core.io.UrlResource fallbackRes = new org.springframework.core.io.UrlResource(matchedFile.get().toUri());
                    return serveResource(matchedFile.get().getFileName().toString(), fallbackRes);
                }
            }

            return org.springframework.http.ResponseEntity.notFound().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
    }

    private ResponseEntity<?> serveResource(String filename, org.springframework.core.io.UrlResource resource) {
        String contentType = "image/jpeg";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) contentType = "image/png";
        else if (lower.endsWith(".webp")) contentType = "image/webp";
        return org.springframework.http.ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(resource);
    }

    private String storeFile(MultipartFile file) throws IOException {
        String filename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String uniqueFilename = UUID.randomUUID().toString() + "_" + filename;
        java.nio.file.Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
        java.nio.file.Path destination = Paths.get(uploadDir.toString(), uniqueFilename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return uniqueFilename;
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    @GetMapping("")
    public ResponseEntity<ProductListResponse> getProducts(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0", name = "category_id") Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        PageRequest pageRequest = PageRequest.of(page, limit, Sort.by("id").ascending());
        Page<ProductResponse> productPage = productService.getAllProducts(keyword, categoryId, pageRequest);
        return ResponseEntity.ok(ProductListResponse.builder()
                        .products(productPage.getContent())
                        .totalPages(productPage.getTotalPages())
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable("id") Long productId) {
        try {
            ProductResponse response = productService.getProductResponseById(productId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/by-ids")
    public ResponseEntity<?> getProductsByIds(@RequestParam("ids") String ids) {
        try {
            List<Long> productIds = Arrays.stream(ids.split(","))
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
            List<Product> products = productService.findProductsByIds(productIds);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(String.format("Product with id = %d deleted successfully", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/images/{id}")
    public ResponseEntity<String> deleteProductImage(@PathVariable long id) {
        try {
            productService.deleteProductImage(id);
            return ResponseEntity.ok(String.format("Product image with id = %d deleted successfully", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteAllProducts() {
        try {
            productService.deleteAllProducts();
            return ResponseEntity.ok("All products deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable long id, @RequestBody ProductDTO productDTO) {
        try {
            Product product = productService.updateProduct(id, productDTO);
            if (productDTO.getImageUrls() != null && !productDTO.getImageUrls().isEmpty()) {
                for (String url : productDTO.getImageUrls()) {
                    productService.createProductImage(product.getId(), 
                        ProductImageDTO.builder().productId(product.getId()).imageUrl(url).build());
                }
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
