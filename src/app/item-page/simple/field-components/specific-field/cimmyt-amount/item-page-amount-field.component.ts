import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../../../core/shared/item.model';
import { MetadataUriValuesComponent } from '../../../../field-components/metadata-uri-values/metadata-uri-values.component';
import { ItemPageFieldComponent } from '../item-page-field.component';
import {
  TranslateModule,
} from '@ngx-translate/core';

@Component({
  selector: 'ds-item-page-amount-field',
  templateUrl: './item-page-amount-field.component.html',
  styleUrls: ['./item-page-amount-field.component.scss'],
  imports: [
    MetadataUriValuesComponent, CommonModule,TranslateModule,
  ],
  standalone: true,
})
/**
 * This component can be used to represent any uri on a simple item page.
 * It expects 4 parameters: The item, a separator, the metadata keys and an i18n key
 */
export class ItemPageAmountFieldComponent extends ItemPageFieldComponent{

  /**
   * The item to display metadata for
   */
  @Input() item: Item;

  /**
   * Separator string between multiple values of the metadata fields defined
   * @type {string}
   */
  @Input() separator: string;

  /**
   * Fields (schema.element.qualifier) used to render their values.
   */
   fields: string[]= [
    'cimmyt.amount', 
    'cimmyt.currency',
  ];

  /**
   * Label i18n key for the rendered metadata
   */
  @Input() label: string;
  
  amountFieldValue: string;
  ngOnInit() {
    this.amountFieldValue = this.createValues();
  }

  /**
   * Create values for the amount field
   */
  createValues(): string {
    const amount = this.item?.allMetadata('cimmyt.amount') ?? [];
    const currency = this.item?.allMetadata('cimmyt.currency') ?? [];
    if ((currency.length > 0) && (amount.length > 0) && (currency.length === amount.length)) {
      return `${amount[0].value} ${currency[0].value}`;
    }
    return null;
  }
}
