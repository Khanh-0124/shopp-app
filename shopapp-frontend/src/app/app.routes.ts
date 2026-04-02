import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { Home } from './home/home';
import { UserAccountComponent } from './user-account/user-account';
import { DetailProductComponent } from './detail-product/detail-product';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout';
import { AdminProductsComponent } from './admin/admin-products/admin-products';
import { AdminProductFormComponent } from './admin/admin-product-form/admin-product-form';
import { AdminCategoriesComponent } from './admin/admin-categories/admin-categories';
import { AdminBannersComponent } from './admin/admin-banners/admin-banners';
import { adminGuard } from './guards/admin.guard';
import { OrderComponent } from './order/order';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'account', component: UserAccountComponent },
    { path: 'products/:id', component: DetailProductComponent },
    { path: 'order', component: OrderComponent },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },
            { path: 'products', component: AdminProductsComponent },
            { path: 'products/add', component: AdminProductFormComponent },
            { path: 'products/edit/:id', component: AdminProductFormComponent },
            { path: 'categories', component: AdminCategoriesComponent },
            { path: 'banners', component: AdminBannersComponent }
        ]
    }
];
