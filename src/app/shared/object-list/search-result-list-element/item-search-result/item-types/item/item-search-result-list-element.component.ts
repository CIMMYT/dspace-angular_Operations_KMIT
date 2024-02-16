import { Component } from '@angular/core';
import { listableObjectComponent } from '../../../../../object-collection/shared/listable-object/listable-object.decorator';
import { ViewMode } from '../../../../../../core/shared/view-mode.model';
import { ItemSearchResult } from '../../../../../object-collection/shared/item-search-result.model';
import { SearchResultListElementComponent } from '../../../search-result-list-element.component';
import { Item } from '../../../../../../core/shared/item.model';
import { getItemPageRoute } from '../../../../../../item-page/item-page-routing-paths';

@listableObjectComponent('PublicationSearchResult', ViewMode.ListElement)
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement)
@Component({
  selector: 'ds-item-search-result-list-element',
  styleUrls: ['./item-search-result-list-element.component.scss'],
  templateUrl: './item-search-result-list-element.component.html'
})
/**
 * The component for displaying a list element for an item search result of the type Publication
 */
export class ItemSearchResultListElementComponent extends SearchResultListElementComponent<ItemSearchResult, Item> {
  /**
   * Route to the item's page
   */
  itemPageRoute: string;

  ngOnInit(): void {
    super.ngOnInit();
    this.showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    this.itemPageRoute = getItemPageRoute(this.dso);
    this.loadExternalScripts(['https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js', 'https://badge.dimensions.ai/badge.js']);
  }

  loadExternalScripts(scriptUrls: string[]): void {
    const loadScript = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      });
    };
  
    const loadAllScripts = async () => {
      for (const url of scriptUrls) {
        await loadScript(url);
      }
    };
  
    loadAllScripts().then(() => {
      console.log('Todos los scripts se han cargado correctamente.');
      // Puedes realizar acciones adicionales aquí después de cargar todos los scripts
    }).catch((error) => {
      console.error('Se produjo un error al cargar los scripts:', error);
    });
  }
    
}
