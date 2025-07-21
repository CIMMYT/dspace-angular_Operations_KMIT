import { Component } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ds-base-home-news',
  styleUrls: ['./home-news.component.scss'],
  templateUrl: './home-news.component.html',
  imports: [NgbCarouselModule],
  standalone: true,
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent {
}
