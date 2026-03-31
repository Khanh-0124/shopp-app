import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserService } from '../service/user.service';
import { OrderListService } from '../service/order-list.service';
import { ProductService } from '../service/product.service';
import { CategoryService } from '../service/category.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit {
  keyword = signal<string>('');
  searchSuggestions = signal<any[]>([]);
  categories = signal<any[]>([]);
  private searchSubject = new Subject<string>();

  private userService = inject(UserService);
  private router = inject(Router);
  public orderListService = inject(OrderListService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  totalOrderItems = this.orderListService.totalQuantity;

  ngOnInit() {
    this.categoryService.getCategories().subscribe(cats => {
      this.categories.set(cats);
    });
  }

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) return of({ products: [] });
        return this.productService.getProducts(term, 0, 0, 5);
      })
    ).subscribe((response: any) => {
      this.searchSuggestions.set(response.products || []);
    });
  }

  onKeywordChange(newVal: string) {
    this.keyword.set(newVal);
    this.searchSubject.next(newVal);
    if (!newVal) this.searchSuggestions.set([]);
  }

  selectSuggestion(product: any) {
    this.keyword.set(product.name);
    this.searchSuggestions.set([]);
    this.router.navigate(['/products', product.id]);
  }

  onSearch() {
    this.router.navigate(['/home'], {
      queryParams: { keyword: this.keyword() },
      queryParamsHandling: 'merge'
    });
  }

  navigateToProfile() {
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/account']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  get isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  isCategoryActive(): boolean {
    const url = this.router.url;
    return url.includes('category_id=');
  }

  getImageUrl(avatarName: string | null): string {
    if (!avatarName || avatarName === "") return 'https://via.placeholder.com/300x300?text=No+Image';
    if (avatarName.startsWith('http://') || avatarName.startsWith('https://')) return avatarName;
    return `${environment.apiBaseUrl}/products/images/${avatarName}`;
  }
}
