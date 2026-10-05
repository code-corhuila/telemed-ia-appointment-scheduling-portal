import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-appointment-page',
  standalone: true,
  template: `
    <section class="state">
      <h2>Portal de Citas</h2>
      <p>En construcción. Bloque 1 completado: proyecto Angular 21 con Native Federation.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentPageComponent {}
