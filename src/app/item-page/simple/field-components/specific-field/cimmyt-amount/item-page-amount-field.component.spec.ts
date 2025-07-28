import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { APP_CONFIG } from '../../../../../../config/app-config.interface';
import { environment } from '../../../../../../environments/environment';
import { BrowseService } from '../../../../../core/browse/browse.service';
import { BrowseDefinitionDataService } from '../../../../../core/browse/browse-definition-data.service';
import { BrowseDefinitionDataServiceStub } from '../../../../../shared/testing/browse-definition-data-service.stub';
import { BrowseServiceStub } from '../../../../../shared/testing/browse-service.stub';
import { TranslateLoaderMock } from '../../../../../shared/testing/translate-loader.mock';
import { MetadataUriValuesComponent } from '../../../../field-components/metadata-uri-values/metadata-uri-values.component';
import { mockItemWithMetadataFieldsAndValue } from '../item-page-field.component.spec';
import { ItemPageAmountFieldComponent } from './item-page-amount-field.component';

let comp: ItemPageAmountFieldComponent;
let fixture: ComponentFixture<ItemPageAmountFieldComponent>;

const mockField = 'dc.identifier.uri';
const mockValue = 'test value';
const mockLabel = 'test label';

describe('ItemPageAmountFieldComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock,
        },
      }), ItemPageAmountFieldComponent, MetadataUriValuesComponent],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
        { provide: BrowseDefinitionDataService, useValue: BrowseDefinitionDataServiceStub },
        { provide: BrowseService, useValue: BrowseServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemPageAmountFieldComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemPageAmountFieldComponent);
    comp = fixture.componentInstance;
    comp.item = mockItemWithMetadataFieldsAndValue([mockField], mockValue);
    comp.fields = [mockField];
    comp.label = mockLabel;
    fixture.detectChanges();
  }));

  it('should display display the correct metadata value', () => {
    expect(fixture.nativeElement.innerHTML).toContain(mockValue);
  });
});
