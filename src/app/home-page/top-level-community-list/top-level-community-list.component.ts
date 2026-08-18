import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Subscription,
} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  APP_CONFIG,
  AppConfig,
} from 'src/config/app-config.interface';

import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import {
  SortDirection,
  SortOptions,
} from '../../core/cache/models/sort-options.model';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginationService } from '../../core/pagination/pagination.service';
import { Collection } from '../../core/shared/collection.model';
import { fadeInOut } from '../../shared/animations/fade';
import { hasValue } from '../../shared/empty.util';
import { ErrorComponent } from '../../shared/error/error.component';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { VarDirective } from '../../shared/utils/var.directive';

import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';


/**
 * this component renders the Collection list shown on the home page as a carousel
 */
@Component({
  selector: 'ds-base-top-level-community-list',
  styleUrls: ['./top-level-community-list.component.scss'],
  templateUrl: './top-level-community-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  imports: [
    AsyncPipe,
    ErrorComponent,
    RouterLink,
    ThemedLoadingComponent,
    TranslateModule,
    VarDirective,
    CarouselModule,
    ButtonModule,
  ],
})

export class TopLevelCommunityListComponent implements OnInit, OnDestroy {
  /**
   * A list of remote data objects of all collections
   */
  collectionsRD$: BehaviorSubject<RemoteData<PaginatedList<Collection>>> = new BehaviorSubject<RemoteData<PaginatedList<Collection>>>({} as any);

  /**
   * The pagination configuration. Each "page" is one slide of the carousel.
   */
  config: PaginationComponentOptions;

  /**
   * The pagination id
   */
  pageId = 'tl';

  /**
   * The sorting configuration for the collection list
   */
  sortConfig: SortOptions;

  /**
   * The subscription to the observable for the current page.
   */
  currentPageSubscription: Subscription;

  /**
   * Cache for the dot indicators, so the template doesn't rebuild the array on every change detection cycle
   */
  private pageNumbersCache: number[] = [];


  responsiveOptions: any[] | undefined;

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    public dsoNameService: DSONameService,
    private collectionDataService: CollectionDataService,
    private paginationService: PaginationService,
  ) {
    this.config = new PaginationComponentOptions();
    this.config.id = this.pageId;
    this.config.pageSize = appConfig.homePage.topLevelCommunityList.pageSize;
    this.config.currentPage = 1;
    this.sortConfig = new SortOptions('dc.title', SortDirection.ASC);
  }

  ngOnInit() {
    this.initPage();
    this.responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];
  }

  /**
   * Update the list of collections
   */
  initPage() {
    const pagination$ = this.paginationService.getCurrentPagination(this.config.id, this.config);
    const sort$ = this.paginationService.getCurrentSort(this.config.id, this.sortConfig);

    this.currentPageSubscription = observableCombineLatest([pagination$, sort$]).pipe(
      switchMap(([currentPagination, currentSort]) => {
        return this.collectionDataService.findAll({
          currentPage: currentPagination.currentPage,
          elementsPerPage: currentPagination.pageSize,
          sort: { field: currentSort.field, direction: currentSort.direction },
        });
      }),
    ).subscribe((results) => {
      this.collectionsRD$.next(results);
    });
  }

  /**
   * Move the carousel to the given page. Out of range values are ignored so the
   * arrows can stay in the DOM (and keep their position) while disabled.
   */
  goToPage(page: number, totalPages: number) {
    if (page < 1 || page > totalPages) {
      return;
    }
    this.paginationService.updateRoute(this.config.id, { page }, {}, true);
  }

  /**
   * Returns [1..totalPages] for the dot indicators, reusing the previous array
   * when the amount of pages didn't change (OnPush friendly)
   */
  pageNumbers(totalPages: number): number[] {
    if (this.pageNumbersCache.length !== totalPages) {
      this.pageNumbersCache = Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    return this.pageNumbersCache;
  }

  /**
   * Unsubscribe the collection list subscription if it exists
   */
  private unsubscribe() {
    if (hasValue(this.currentPageSubscription)) {
      this.currentPageSubscription.unsubscribe();
    }
  }

  /**
   * Clean up subscriptions when the component is destroyed
   */
  ngOnDestroy() {
    this.unsubscribe();
    this.paginationService.clearPagination(this.config.id);
  }

}
