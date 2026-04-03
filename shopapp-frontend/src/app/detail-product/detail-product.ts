import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header";
import { FooterComponent } from "../footer/footer";
import { ProductService } from '../service/product.service';
import { OrderListService } from '../service/order-list.service';
import { ToastService } from '../service/toast.service';
import { environment } from '../../environments/environment';

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
          console.log('>>> [DEBUG] DATA GỐC:', response);
          
          // Chuẩn hóa dữ liệu Attributes để HTML luôn đọc được .name và .values
          if (response.attributes) {
            response.attributes = response.attributes.map((attr: any) => ({
              name: attr.name || attr.attribute_name || 'Phân loại',
              values: attr.values || attr.attribute_values || []
            }));
          }

          // Chuẩn hóa has_variants
          response.has_variants = response.has_variants || response.hasVariants || (response.attributes && response.attributes.length > 0);
          
          this.product.set(response);
          this.calculateInitialPrice(response);
          
          // --- LOGIC CỨU HỘ ---
          if (response.has_variants && (!response.attributes || response.attributes.length === 0) && response.variants && response.variants.length > 0) {
              const reconstructedAttrs: any[] = [];
              const numAttrs = response.variants[0].combination.length;
              for (let i = 0; i < numAttrs; i++) {
                  const values = Array.from(new Set(response.variants.map((v: any) => v.combination[i])));
                  reconstructedAttrs.push({ name: `Lựa chọn ${i + 1}`, values: values });
              }
              response.attributes = reconstructedAttrs;
          }
          
          console.log('>>> [DEBUG] DATA SAU CHUẨN HÓA:', response);
          document.body.scrollTop = 0;
        },
        error: (err) => {
          console.error('!!! [ERROR] Lỗi khi tải chi tiết sản phẩm:', err);
        }
      });
    }
  }

  calculateInitialPrice(product: any) {
    const hasVariants = product.has_variants || product.hasVariants;
    console.log('>>> [DEBUG] calculateInitialPrice - hasVariants:', hasVariants);
    
    if (hasVariants && product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => v.price).filter((p: any) => p > 0);
      console.log('>>> [DEBUG] calculateInitialPrice - Variants prices:', prices);
      if (prices.length > 0) {
        this.minPrice.set(Math.min(...prices));
      } else {
        this.minPrice.set(product.price);
      }
    } else {
      this.minPrice.set(product.price);
    }
    console.log('>>> [DEBUG] calculateInitialPrice - Final minPrice:', this.minPrice());
  }

  selectAttribute(groupName: string, value: string) {
    console.log(`>>> [DEBUG] selectAttribute: ${groupName} = ${value}`);
    this.selectedAttributes[groupName] = value;
    this.findMatchingVariant();
  }

  findMatchingVariant() {
    const product = this.product();
    if (!product || !product.has_variants || !product.variants) return;

    // Check if all attribute groups have a selection
    const allGroupsSelected = product.attributes.every((attr: any) => this.selectedAttributes[attr.name]);
    console.log('>>> [DEBUG] findMatchingVariant - allGroupsSelected:', allGroupsSelected);
    console.log('>>> [DEBUG] current selectedAttributes:', this.selectedAttributes);

    if (allGroupsSelected) {
      // Find variant where combination matches all selected attributes
      const matchingVariant = product.variants.find((v: any) => {
        return product.attributes.every((attr: any, index: number) => {
          return v.combination[index] === this.selectedAttributes[attr.name];
        });
      });
      console.log('>>> [DEBUG] findMatchingVariant - matchingVariant found:', matchingVariant);
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
    const price = variant ? variant.price : this.minPrice();
    // console.log('>>> [DEBUG] getDisplayPrice:', price);
    return price;
  }

  getImageUrl(imageName: string | null): string {
    if (!imageName || imageName === "") return 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&h=800&auto=format&fit=crop';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
    return `${environment.apiBaseUrl}/products/images/${imageName}`;
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
