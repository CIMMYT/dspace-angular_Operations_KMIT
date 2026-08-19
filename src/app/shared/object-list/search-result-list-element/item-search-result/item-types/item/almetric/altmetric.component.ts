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
 * Variantes de badge soportadas. Mapa cerrado (allow-list): el valor que se
 * escribe en el atributo `data-badge-type` SIEMPRE sale de esta constante,
 * nunca del input crudo. Cualquier valor desconocido cae en 'default' ('1',
 * el donut pequeño), preservando el comportamiento del componente original.
 */
const BADGE_TYPES = Object.freeze({
  'donut': 'donut',
  'bar': 'bar',
  'medium-donut': 'medium-donut',
  'default': '1',
} as const);

export type AltmetricBadgeType = keyof typeof BADGE_TYPES;

/**
 * Badge de Altmetric para un DOI.
 *
 * Compatible con DSpace 9.3 (Angular 20 / RxJS 7.8):
 * - Componente standalone (los NgModules ya no existen en DSpace 9.x).
 * - `ngSkipHydration` en el host: el script de Altmetric REEMPLAZA el
 *   contenido del placeholder por su propio DOM (iframe/svg del donut). Si la
 *   hidratación de Angular (activa en DSpace 9 vía provideClientHydration)
 *   intentara reconciliar ese subárbol mutado por un tercero, se producirían
 *   errores NG05xx y el "parpadeo"/desaparición intermitente de los badges.
 *   Con skip-hydration, Angular ignora este subárbol y el vendor es libre de
 *   mutarlo.
 * - Toda interacción con el DOM/scripts ocurre en `afterNextRender`, que
 *   Angular garantiza que SOLO se ejecuta en el navegador (nunca en SSR).
 *
 * Uso:
 *   <ds-altmetric-badge [uniqueDoi]="dso.firstMetadataValue('dc.identifier.doi')" type="donut" />
 */
@Component({
  selector: 'ds-altmetric-badge',
  templateUrl: './altmetric.component.html',
  styleUrls: ['./altmetric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { ngSkipHydration: 'true' },
})
export class AltmetricComponent {

  /**
   * DOI de la publicación. Acepta el valor crudo del metadato
   * (`10.x/y`, `https://doi.org/10.x/y` o `doi:10.x/y`).
   */
  uniqueDoi = input<string | null | undefined>(null);

  /**
   * Variante visual del badge: 'donut' | 'bar' | 'medium-donut' | 'default'.
   */
  type = input<string>('default');

  private readonly scripts = inject(MetricsScriptLoaderService);

  private readonly destroyRef = inject(DestroyRef);

  /**
   * DOI validado y normalizado. `null` => no se renderiza nada.
   */
  protected readonly doi = computed(() => normalizeDoi(this.uniqueDoi()));

  /**
   * Valor seguro para `data-badge-type`, resuelto contra la allow-list.
   */
  protected readonly badgeType = computed(() => {
    const requested = this.type();
    return BADGE_TYPES[requested as AltmetricBadgeType] ?? BADGE_TYPES.default;
  });

  /**
   * `true` cuando embed.js terminó de cargar en el navegador.
   */
  private readonly scriptReady = signal(false);

  constructor() {
    // afterNextRender: SOLO navegador, y con el DOM del componente ya pintado.
    // Es el reemplazo correcto del `document.createElement` en ngOnInit del
    // código original, que se ejecutaba también durante el SSR.
    afterNextRender(() => {
      this.scripts.load('altmetric')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((loaded: boolean) => this.scriptReady.set(loaded));
    });

    // Cuando (a) el script está listo y (b) hay un DOI válido renderizado,
    // pedimos al vendor que re-escanee el DOM. Cubre tanto la primera carga
    // como badges creados después (paginación, cambio de resultados) y
    // cambios dinámicos del input. En el servidor scriptReady nunca es true,
    // así que el effect es inocuo durante el SSR.
    effect(() => {
      if (this.scriptReady() && this.doi() !== null) {
        this.scripts.refresh('altmetric');
      }
    });
  }
}
