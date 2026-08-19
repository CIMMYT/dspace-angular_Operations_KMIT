/**
 * Patrón oficial recomendado por Crossref para DOIs modernos:
 * prefijo `10.` + 4-9 dígitos + `/` + sufijo con caracteres seguros.
 *
 * Seguridad: además del escaping automático que Angular aplica a los bindings
 * de atributo ([attr.data-doi]), validamos el CONTENIDO del DOI antes de
 * entregarlo a los scripts de terceros. Altmetric y Dimensions construyen URLs
 * y HTML de popovers a partir de ese valor fuera del control de Angular, por lo
 * que un metadato `dc.identifier.doi` contaminado (repositorios con
 * autoarchivo/importación masiva) no debe llegar jamás a esos scripts.
 * Un valor que no cumpla el patrón simplemente no renderiza badge.
 */
const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;

/**
 * Prefijos habituales con los que se captura el DOI en los metadatos.
 */
const DOI_PREFIXES = [
  'https://doi.org/',
  'http://doi.org/',
  'https://dx.doi.org/',
  'http://dx.doi.org/',
  'doi:',
];

/**
 * Normaliza y valida un DOI proveniente de metadatos.
 *
 * @param raw valor crudo del metadato (puede venir como URL completa o con prefijo `doi:`)
 * @returns el DOI limpio (`10.xxxx/yyyy`) si es válido; `null` en cualquier otro caso.
 */
export function normalizeDoi(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') {
    return null;
  }

  let doi = raw.trim();
  const lower = doi.toLowerCase();
  for (const prefix of DOI_PREFIXES) {
    if (lower.startsWith(prefix)) {
      doi = doi.substring(prefix.length);
      break;
    }
  }

  return DOI_REGEX.test(doi) ? doi : null;
}
