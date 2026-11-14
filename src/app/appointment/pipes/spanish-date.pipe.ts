import { Pipe, PipeTransform } from '@angular/core';

/**
 * Spanish (es-CO) dates without registering Angular locale data: Native Federation
 * drops the shared `@angular/common/locales/*` entries, so a LOCALE_ID in the shell or
 * here would break the remote. `Intl` ships with the browser.
 *
 * - `long`  → "jueves, 12 de noviembre de 2026"
 * - `month` → "nov"
 */
export type SpanishDateFormat = 'long' | 'month';

const FORMATS: Record<SpanishDateFormat, Intl.DateTimeFormat> = {
  long: new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  month: new Intl.DateTimeFormat('es-CO', { month: 'short' }),
};

@Pipe({ name: 'spanishDate', standalone: true })
export class SpanishDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: SpanishDateFormat): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return FORMATS[format].format(date).replace(/\.$/, '');
  }
}
