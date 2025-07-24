import { Component } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';

@Component({
  selector: 'ds-themed-home-news',
  styleUrls: ['./home-news.component.scss'],
  templateUrl: './home-news.component.html',
  imports: [NgbCarouselModule],
  standalone: true,
})


/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent extends BaseComponent {
  images: string[] = [
    'assets/dspace/images/wheat.jpg',
    'assets/dspace/images/maize.jpg',
    'assets/dspace/images/wheat-2.jpg',
    'assets/dspace/images/maize-2.jpg',
  ];
  showNavigationArrows = false;
	showNavigationIndicators = false;
}

