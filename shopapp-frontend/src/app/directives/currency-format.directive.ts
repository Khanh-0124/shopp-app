import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appCurrencyFormat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyFormatDirective),
      multi: true
    }
  ]
})
export class CurrencyFormatDirective implements ControlValueAccessor {
  private onChange: any = () => {};
  private onTouched: any = () => {};

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // 1. Chuyển đổi giá trị hiển thị thành số thực để lưu vào biến
    const numericValue = this.parseValue(value);
    this.onChange(numericValue);

    // 2. Định dạng lại giá trị hiển thị trên Input
    this.formatInput(numericValue);
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
    const value = this.el.nativeElement.value;
    const numericValue = this.parseValue(value);
    this.formatInput(numericValue);
  }

  // Phương thức từ ControlValueAccessor: Đưa giá trị từ Code ra UI
  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      this.formatInput(Number(value));
    } else {
      this.el.nativeElement.value = '';
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  private formatInput(value: number | null) {
    if (value === null || isNaN(value)) {
      this.el.nativeElement.value = '';
      return;
    }

    // Định dạng theo chuẩn VN: 1.230.000,88
    const formatted = new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);

    this.el.nativeElement.value = formatted + ' đ';
  }

  private parseValue(value: string): number | null {
    if (!value) return null;

    // Loại bỏ dấu chấm (.) và hậu tố 'đ', chuyển dấu phẩy (,) thành dấu chấm (.) để parse float
    let cleanValue = value.replace(/\./g, '')
                          .replace(' đ', '')
                          .replace(',', '.');
    
    // Chỉ giữ lại số và dấu chấm thập phân
    cleanValue = cleanValue.replace(/[^0-9.]/g, '');
    
    const result = parseFloat(cleanValue);
    return isNaN(result) ? null : result;
  }
}
