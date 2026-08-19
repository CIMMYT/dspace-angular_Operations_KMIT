import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { normalizeDoi } from '../doi.util';
import { MetricsScriptLoaderService } from '../metrics-script-loader.service';

/**
 * Estilos de badge soportados por Dimensions (allow-list cerrada).
 * `null` = sin atributo data-style (estilo por defecto del vendor), que es el
 * comportamiento del componente original en la rama *ngSwitchDefault.
 */
const BADGE_STYLES = Object.freeze({
  'circle': 'small_circle',
  'rectangle': 'small_rectangle',
  'default': null,
} as const);

export type DimensionsBadgeType = keyof typeof BADGE_STYLES;

/**
 * Badge de citas de Dimensions para un DOI.
 *
 * Mismo patrón SSR-safe que AltmetricComponent (ver documentación allí):
 * standalone, ngSkipHydration, carga del script solo en navegador vía
 * afterNextRender + MetricsScriptLoaderService, y re-escaneo explícito con
 * __dimensions_embed.addBadges() para badges renderizados tras la carga
 * inicial (causa raíz de la intermitencia en la versión 7.6).
 *
 * Uso:
 *   <ds-dimensions-badge [uniqueDoi]="dso.firstMetadataValue('dc.identifier.doi')" type="circle" />
 */
@Component({
  selector: 'ds-dimensions-badge',
  templateUrl: './citations.component.html',
  styleUrls: ['./citations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { ngSkipHydration: 'true' },
})
export class CitationsComponent {

  /**
   * DOI de la publicación (acepta valor crudo del metadato).
   */
  uniqueDoi = input<string | null | undefined>(null);

  /**
   * Variante visual: 'circle' | 'rectangle' | 'default'.
   */
  type = input<string>('default');

  private readonly scripts = inject(MetricsScriptLoaderService);

  private readonly destroyRef = inject(DestroyRef);

  /**
   * DOI validado y normalizado. `null` => no se renderiza nada.
   */
  protected readonly doi = computed(() => normalizeDoi(this.uniqueDoi()));

  /**
   * Valor seguro para `data-style` (o null para omitir el atributo).
   */
  protected readonly badgeStyle = computed(() => {
    const requested = this.type();
    return BADGE_STYLES[requested as DimensionsBadgeType] ?? BADGE_STYLES.default;
  });

  /**
   * Solo la variante por defecto oculta el badge cuando hay cero citas
   * (comportamiento idéntico al componente original de 7.6).
   */
  protected readonly hideZeroCitations = computed(() =>
    this.badgeStyle() === null ? 'true' : null,
  );

  /**
   * `true` cuando badge.js terminó de cargar en el navegador.
   */
  private readonly scriptReady = signal(false);

  constructor() {
    afterNextRender(() => {
      this.scripts.load('dimensions')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((loaded: boolean) => this.scriptReady.set(loaded));
    });

    effect(() => {
      if (this.scriptReady() && this.doi() !== null) {
        this.scripts.refresh('dimensions');
      }
    });
  }
}
