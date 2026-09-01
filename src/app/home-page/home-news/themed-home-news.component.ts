import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { HomeNewsComponent } from './home-news.component';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'ds-home-news',
  templateUrl: '../../shared/theme-support/themed.component.html',
  imports: [
    ButtonModule,
    CarouselModule,
  ],
})

/**
 * Component to render the news section on the home page
 */
export class ThemedHomeNewsComponent extends ThemedComponent<HomeNewsComponent> {
  protected getComponentName(): string {
    return 'HomeNewsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/home-page/home-news/home-news.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./home-news.component`);
  }

  background: string[] = ['1.jpg', '2.jpg', '3.jpg', '4.jpg'];

  get backgrounds(): string[] {
    return this.background;
  }
}
