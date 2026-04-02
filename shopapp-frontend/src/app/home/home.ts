import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { ProductService } from '../service/product.service';
import { CategoryService } from '../service/category.service';
import { BannerService } from '../service/banner.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  banners = signal<any[]>([]);
  activeBanner = signal<any>(null);
  currentIndex = signal<number>(0);
  bannerInterval: any;
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  keyword = signal<string>('');
  categoryId = signal<number>(0);

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private bannerService = inject(BannerService);

  ngOnInit() {
    this.loadCategories();
    this.loadBanners();
    this.route.queryParams.subscribe(params => {
      const keyword = params['keyword'] || '';
      const categoryId = Number(params['category_id']) || 0;
      this.keyword.set(keyword);
      this.categoryId.set(categoryId);
      this.currentPage.set(0);
      this.getProducts();
    });
  }

  ngOnDestroy() {
    this.stopBannerTimer();
  }

  loadBanners() {
    this.bannerService.getActiveBanners().subscribe({
      next: (res) => {
        this.banners.set(res);
        if (res.length > 0) {
          this.activeBanner.set(res[0]);
          this.startBannerTimer();
        } else {
          this.setFallbackBanner();
        }
      },
      error: (err) => {
        console.error("Lỗi khi tải banner từ server", err);
        this.setFallbackBanner();
      }
    });
  }

  private setFallbackBanner() {
    const fallback = {
      title: 'Khung hình gắn kết',
      sub_title: 'Chuyên cung cấp các loại khung ảnh cao cấp từ gỗ sồi...',
      image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=2000'
    };
    this.banners.set([fallback]);
    this.activeBanner.set(fallback);
  }

  loadCategories() {
    this.categoryService.getCategories(0, 100).subscribe({
      next: (res) => {
        this.categories.set(res.categories || res);
      }
    });
  }

  startBannerTimer() {
    this.stopBannerTimer();
    if (this.banners().length > 1) {
      this.bannerInterval = setInterval(() => {
        this.nextBanner();
      }, 5000);
    }
  }

  stopBannerTimer() {
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
  }

  nextBanner() {
    const nextIdx = (this.currentIndex() + 1) % this.banners().length;
    this.currentIndex.set(nextIdx);
    this.activeBanner.set(this.banners()[nextIdx]);
  }

  setBanner(idx: number) {
    this.currentIndex.set(idx);
    this.activeBanner.set(this.banners()[idx]);
    this.startBannerTimer();
  }

  selectCategory(id: number) {
    this.router.navigate(['/home'], {
      queryParams: { ...this.route.snapshot.queryParams, category_id: id },
      queryParamsHandling: 'merge'
    });
  }

  getProducts() {
    this.productService.getProducts(this.keyword(), this.categoryId(), this.currentPage(), 16)
      .subscribe({
        next: (response) => {
          this.products.set(response.products);
          this.totalPages.set(response.totalPages);
        },
        error: (error) => {
          console.error("Lỗi khi tải sản phẩm", error);
        }
      });
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.getProducts();
    }
  }

  getPagesArray(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxPages = 5;
    let start = Math.max(0, current - Math.floor(maxPages / 2));
    let end = Math.min(total, start + maxPages);

    if (end - start < maxPages) {
      start = Math.max(0, end - maxPages);
    }

    const pages = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToDetail(productId: number) {
    this.router.navigate(['/products', productId]);
  }

  getImageUrl(thumbnail: string | null): string {
    if (!thumbnail || thumbnail === "") return 'https://via.placeholder.com/300x300?text=No+Image';
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) return thumbnail;
    return `${environment.apiBaseUrl}/products/images/${thumbnail}`;
  }
}
