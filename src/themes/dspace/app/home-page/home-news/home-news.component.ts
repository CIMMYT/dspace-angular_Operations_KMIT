import { Component } from '@angular/core';

import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { SharedModule } from 'primeng/api'; // Necesario para pTemplate

@Component({
  selector: 'ds-themed-home-news',
  styleUrls: ['./home-news.component.scss'],
  templateUrl: './home-news.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    CarouselModule,
    SharedModule, 
  ],
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent extends BaseComponent {

  background: string[] = ['1.jpg', '2.jpg', '3.jpg', '4.jpg'];

  get backgrounds(): string[] {
    return this.background;
  }
}

