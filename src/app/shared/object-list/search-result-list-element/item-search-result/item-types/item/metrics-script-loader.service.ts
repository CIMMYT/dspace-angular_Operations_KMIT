import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  inject,
  Injectable,
  PLATFORM_ID,
} from '@angular/core';
import {
  Observable,
  of,
  ReplaySubject,
} from 'rxjs';

/**
 * Allow-list ESTÁTICA e INMUTABLE de scripts de terceros permitidos.
 *
 * Seguridad: los componentes NUNCA pasan URLs — solo claves de este mapa.
 * Esto elimina cualquier vector de inyección de scripts arbitrarios (XSS via
 * script injection), ya que las URLs no pueden provenir de datos dinámicos
 * (metadatos, query params, etc.). `Object.freeze` evita mutaciones en runtime.
 */
const TRUSTED_SCRIPTS = Object.freeze({
  altmetric: 'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js',
  dimensions: 'https://badge.dimensions.ai/badge.js',
} as const);

export type TrustedScriptKey = keyof typeof TRUSTED_SCRIPTS;

/**
 * Funciones de re-inicialización que exponen los vendors sobre `window`.
 * Ambos scripts escanean el DOM UNA sola vez al cargarse; en una SPA como
 * DSpace-Angular, los elementos de lista se renderizan DESPUÉS de esa carga
 * (navegación, paginación, nuevos resultados de búsqueda), por lo que hay que
 * pedirles explícitamente que re-escaneen. Esta era la causa principal de la
 * "visualización intermitente".
 */
const VENDOR_REFRESH: Record<TrustedScriptKey, (win: any) => void> = {
  altmetric: (win) => win?._altmetric_embed_init?.(),
  dimensions: (win) => win?.__dimensions_embed?.addBadges?.(),
};

/**
 * Servicio singleton (providedIn: 'root') que carga scripts de métricas de
 * terceros de forma segura para SSR:
 *
 * 1. En el SERVIDOR no hace absolutamente nada (`isPlatformBrowser` === false):
 *    devuelve `of(false)` de inmediato, sin tocar `document` ni bloquear el
 *    render de Universal.
 * 2. En el NAVEGADOR carga cada script UNA sola vez, sin importar cuántos
 *    badges existan en la página (antes se inyectaba un <script> por cada
 *    instancia del componente: 20 resultados = 20 copias de embed.js, con las
 *    condiciones de carrera que eso implica).
 * 3. Cachea el resultado en un ReplaySubject(1): los suscriptores tardíos
 *    reciben el estado inmediatamente.
 * 4. Usa el token DOCUMENT inyectado (nunca el global `document`), como exige
 *    Angular para código compatible con SSR.
 */
@Injectable({ providedIn: 'root' })
export class MetricsScriptLoaderService {

  private readonly document = inject(DOCUMENT);

  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Cache de cargas en curso/completadas, por clave de script.
   */
  private readonly loaded = new Map<TrustedScriptKey, Observable<boolean>>();

  /**
   * Coalescencia de peticiones de re-escaneo: si 20 badges piden refresh en el
   * mismo ciclo, el vendor solo re-escanea el DOM una vez.
   */
  private readonly refreshQueued = new Set<TrustedScriptKey>();

  /**
   * Carga (una sola vez) el script identificado por `key`.
   *
   * @returns Observable que emite `true` cuando el script cargó correctamente,
   *          `false` si falló o si estamos en el servidor. Nunca lanza error
   *          (los badges son decorativos: un fallo del CDN no debe romper la UI).
   */
  load(key: TrustedScriptKey): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    const cached = this.loaded.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result$ = new ReplaySubject<boolean>(1);
    const result: Observable<boolean> = result$.asObservable();
    this.loaded.set(key, result);

    const src = TRUSTED_SCRIPTS[key];

    // Defensa extra: si el script ya existe en el DOM (p. ej. inyectado por
    // una versión anterior del tema o por otro plugin), no lo duplicamos.
    const existing = this.document.querySelector(`script[src="${src}"]`);
    if (existing !== null) {
      result$.next(true);
      result$.complete();
      return result;
    }

    const script: HTMLScriptElement = this.document.createElement('script');
    // La URL proviene EXCLUSIVAMENTE de la constante congelada TRUSTED_SCRIPTS.
    script.src = src;
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-ds-metrics', key);
    script.onload = () => {
      result$.next(true);
      result$.complete();
    };
    script.onerror = () => {
      console.warn(`[MetricsScriptLoader] No se pudo cargar el script de métricas '${key}' (${src})`);
      result$.next(false);
      result$.complete();
    };

    this.document.head.appendChild(script);

    return result;
  }

  /**
   * Pide al vendor que re-escanee el DOM en busca de nuevos placeholders de
   * badge. Es seguro llamarlo múltiples veces: las llamadas del mismo ciclo se
   * coalescen en un solo re-escaneo por vendor.
   */
  refresh(key: TrustedScriptKey): void {
    if (!this.isBrowser || this.refreshQueued.has(key)) {
      return;
    }
    this.refreshQueued.add(key);
    queueMicrotask(() => {
      this.refreshQueued.delete(key);
      try {
        VENDOR_REFRESH[key](this.document.defaultView);
      } catch (e) {
        // Un fallo del script de terceros jamás debe tumbar la aplicación.
        console.warn(`[MetricsScriptLoader] Error al refrescar badges '${key}'`, e);
      }
    });
  }
}
