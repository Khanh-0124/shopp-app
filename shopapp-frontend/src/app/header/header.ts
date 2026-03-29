import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  keyword = signal<string>('');
  private userService = inject(UserService);
  private router = inject(Router);

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
}
