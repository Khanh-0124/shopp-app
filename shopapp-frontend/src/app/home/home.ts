import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { ProductService } from '../service/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  products = signal<any[]>([]);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  keyword = signal<string>('');
  categoryId = signal<number>(0);

  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const keyword = params['keyword'] || '';
      this.keyword.set(keyword);
      this.currentPage.set(0);
      this.getProducts();
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
    return `http://localhost:8088/api/v1/products/images/${thumbnail}`;
  }
}
