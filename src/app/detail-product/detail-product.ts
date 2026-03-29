import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header";
import { FooterComponent } from "../footer/footer";
import { ProductService } from '../service/product.service';

@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './detail-product.html',
  styleUrl: './detail-product.scss',
})
export class DetailProductComponent implements OnInit {
  product = signal<any>(null);
  currentImageIndex = signal<number>(0);
  quantity = signal<number>(1);
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(Number(id)).subscribe({
        next: (response) => {
          this.product.set(response);
          document.body.scrollTop = 0; // Scroll to top
        },
        error: (err) => {
          console.error('Lỗi khi tải chi tiết sản phẩm', err);
        }
      });
    }
  }

  getImageUrl(imageName: string | null): string {
    if (!imageName || imageName === "") return 'https://via.placeholder.com/800x800?text=No+Image';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
    return `http://localhost:8088/api/v1/products/images/${imageName}`;
  }

  getProductImages() {
    const defaultImg = this.product()?.thumbnail || '';
    const images = this.product()?.product_images || [];
    if (images.length === 0) return [defaultImg];
    return images.map((img: any) => img.image_url);
  }

  setCurrentImage(index: number) {
    this.currentImageIndex.set(index);
  }

  increaseQuantity() {
    this.quantity.update(q => q + 1);
  }

  decreaseQuantity() {
    this.quantity.update(q => (q > 1 ? q - 1 : 1));
  }

  addToCart() {
    alert(`Đã thêm ${this.quantity()} sản phẩm vào giỏ hàng!`);
    // Will implement cart logic later if needed
  }
  
  buyNow() {
    this.addToCart();
    // this.router.navigate(['/cart']); // redirect to cart later
  }
}
