import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header";
import { FooterComponent } from "../footer/footer";

@Component({
  selector: 'app-order-confirm',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './order-confirm.html',
  styleUrl: './order-confirm.scss',
})
export class OrderConfirmComponent {

}
