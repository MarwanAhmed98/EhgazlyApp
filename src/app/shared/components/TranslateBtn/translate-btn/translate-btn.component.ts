import { Component, inject, OnInit } from '@angular/core';
import { TranslateService } from '../../../../core/services/translate/translate.service';


@Component({
  selector: 'app-translate-btn',
  imports: [],
  templateUrl: './translate-btn.component.html',
  styleUrl: './translate-btn.component.scss'
})
export class TranslateBtnComponent implements OnInit {
  private readonly pageTranslator = inject(TranslateService);

  isTranslating = false;
  isArabic = false;
  ngOnInit(): void {
    this.isArabic = localStorage.getItem('lang') === 'ar';
    if (this.isArabic) {
      document.dir = 'rtl';
      this.autoTranslatePage();
    }
  }
  async toggleTranslation() {
    if (this.isArabic) {
      localStorage.setItem('lang', 'en');
      document.dir = 'ltr';
      window.location.reload();
      return;
    }

    this.isTranslating = true;
    await this.pageTranslator.translatePage();
    document.dir = 'rtl';
    localStorage.setItem('lang', 'ar');
    this.isArabic = true;
    this.isTranslating = false;
  }
  private async autoTranslatePage() {
    this.isTranslating = true;
    await new Promise(resolve => setTimeout(resolve, 800));
    await this.pageTranslator.translatePage();
    this.isTranslating = false;
  }
}
