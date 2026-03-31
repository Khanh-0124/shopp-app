import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header";
import { FooterComponent } from "../footer/footer";
import { ProductService } from '../service/product.service';
import { OrderListService } from '../service/order-list.service';
import { ToastService } from '../service/toast.service';

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
  
  // Variation state
  selectedAttributes: { [key: string]: string } = {};
  selectedVariant = signal<any>(null);
  minPrice = signal<number>(0);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private orderListService = inject(OrderListService);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(Number(id)).subscribe({
        next: (response) => {
          console.log('--- DEBUG: FULL PRODUCT DATA FROM API ---');
          console.log(response);
          console.log('-----------------------------------------');
          this.product.set(response);
          this.calculateInitialPrice(response);
          document.body.scrollTop = 0; // Scroll to top
        },
        error: (err) => {
          console.error('Lỗi khi tải chi tiết sản phẩm', err);
        }
      });
    }
  }

  calculateInitialPrice(product: any) {
    const hasVariants = product.has_variants || product.hasVariants;
    console.log('Calculating price. Has Variants:', hasVariants, 'Variants Count:', product.variants?.length);
    
    if (hasVariants && product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => v.price).filter((p: any) => p > 0);
      if (prices.length > 0) {
        this.minPrice.set(Math.min(...prices));
      } else {
        this.minPrice.set(product.price);
      }
    } else {
      this.minPrice.set(product.price);
    }
  }

  selectAttribute(groupName: string, value: string) {
    this.selectedAttributes[groupName] = value;
    this.findMatchingVariant();
  }

  findMatchingVariant() {
    const product = this.product();
    if (!product || !product.has_variants || !product.variants) return;

    // Check if all attribute groups have a selection
    const allGroupsSelected = product.attributes.every((attr: any) => this.selectedAttributes[attr.name]);
    
    if (allGroupsSelected) {
      // Find variant where combination matches all selected attributes
      const matchingVariant = product.variants.find((v: any) => {
        return product.attributes.every((attr: any, index: number) => {
          return v.combination[index] === this.selectedAttributes[attr.name];
        });
      });
      this.selectedVariant.set(matchingVariant || null);
    } else {
      this.selectedVariant.set(null);
    }
  }

  isAttributeSelected(groupName: string, value: string): boolean {
    return this.selectedAttributes[groupName] === value;
  }

  getDisplayPrice(): number {
    const variant = this.selectedVariant();
    return variant ? variant.price : this.minPrice();
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
    const product = this.product();
    if (!product) return;

    if (product.has_variants && !this.selectedVariant()) {
      this.toastService.warning('Vui lòng chọn đầy đủ phân loại (Màu sắc, Size...) trước khi mua!');
      return;
    }

    const itemToOrder = {
      ...product,
      price: this.getDisplayPrice(),
      selectedVariant: this.selectedVariant() ? {
          combination: this.selectedVariant().combination,
          sku: this.selectedVariant().sku
      } : null
    };

    this.orderListService.addToOrder(itemToOrder, this.quantity());
    this.toastService.success(`Đã thêm ${this.quantity()} sản phẩm vào đơn hàng!`);
  }
  
  buyNow() {
    const product = this.product();
    if (product.has_variants && !this.selectedVariant()) {
      this.toastService.warning('Vui lòng chọn đầy đủ phân loại (Màu sắc, Size...)!');
      return;
    }
    this.addToCart();
    this.router.navigate(['/order']);
  }
}
