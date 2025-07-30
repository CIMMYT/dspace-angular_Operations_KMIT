import { Component, Input } from '@angular/core';

import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';
import { MetadataValue } from '../../../../../core/shared/metadata.models';


@Component({
  selector: 'ds-item-page-uri-linktext',
  templateUrl: './item-page-uri-linktext.component.html'
})
/**
 * This component can be used to represent any uri on a simple item page.
 * It expects 4 parameters: The item, a separator, the metadata keys and an i18n key
 */
export class ItemPageUriLinktextComponent extends ItemPageFieldComponent {

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
  @Input() fields: string[];

  /**
   * Label i18n key for the rendered metadata
   */
  @Input() label: string;

  /**
   * Text to replace the links
  */
  @Input() linktext: string;

   /**
   * Fields (schema.element.qualifier) used to render their values.
   */
  @Input() url: string;

   concatURIS(metadataArray: MetadataValue[], urlString: string): MetadataValue[] {
    const newMatadataArray: MetadataValue[] = [];
    for (let metadataElement of metadataArray) {
      let newMetadataElement: MetadataValue = new MetadataValue();
      newMetadataElement.value = urlString + metadataElement.value;
      newMatadataArray.push(newMetadataElement);
    }
    return newMatadataArray;
  }

}

