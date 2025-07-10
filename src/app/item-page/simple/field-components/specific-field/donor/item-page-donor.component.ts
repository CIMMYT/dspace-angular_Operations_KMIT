import { Component, Input } from '@angular/core';

import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';
import { MetadataValue } from '../../../../../core/shared/metadata.models';


@Component({
  selector: 'ds-item-page-donor',
  templateUrl: './item-page-donor.component.html'
})
/**
 * This component can be used to represent any uri on a simple item page.
 * It expects 4 parameters: The item, a separator, the metadata keys and an i18n key
 */
export class ItemPageDonorComponent extends ItemPageFieldComponent {

  /**
   * The item to display metadata for
   */
  @Input() item: Item;

  validateMetadataContent(): boolean {
   return (this.item.allMetadataValues(['dc.relation.funderName']).length) > 0;
  }

}

