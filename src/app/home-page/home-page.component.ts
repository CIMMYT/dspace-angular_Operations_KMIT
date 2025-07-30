import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Site } from '../core/shared/site.model';
import { environment } from '../../environments/environment';
import * as $ from 'jquery';
import 'owl.carousel';

@Component({
  selector: 'ds-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit {

  site$: Observable<Site>;
  recentSubmissionspageSize: number;
  constructor(
    private route: ActivatedRoute,
  ) {
    this.recentSubmissionspageSize = environment.homePage.recentSubmissions.pageSize;
  }

  ngOnInit(): void {
    this.site$ = this.route.data.pipe(
      map((data) => data.site as Site),
    );
    $('.owl-carousel-collections').owlCarousel({ 
      center: true,
      margin: 10,
      autoplay: true,
      autoplayTimeout: 6500,
      responsiveClass:true,
      responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:3,
            nav:true,
            loop: true,
        },
        1000:{
            items:5,
            nav:true,
            loop: true,
        }
      }
    });

    $('.owl-carousel-header').owlCarousel({
      loop: true,
      center: true,
      items: 1,
      autoplay: true,
      autoplayTimeout: 10000,
    });
  }
}
