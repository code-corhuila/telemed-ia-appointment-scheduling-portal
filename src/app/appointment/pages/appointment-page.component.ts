import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { AppointmentApiService } from '../data/appointment-api.service';
import type { Appointment } from '../model/appointment';
import type { ApiError } from '../model/api-error';
import { JsonPipe } from '@angular/common';

interface ViewModel {
  readonly loading: boolean;
  readonly error: ApiError | string | null;
  readonly appointments: Appointment[];
}

/**
 * Placeholder page for the current block.
 *
 * It only proves that AppointmentApiService can make HTTP calls. Real
 * screens land in the next block.
 */
@Component({
  selector: 'app-appointment-page',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <section class="state">
      <h2>Portal de Citas</h2>

      @if (vm().loading) {
        <p>Cargando citas del paciente 1…</p>
      } @else if (vm().error; as err) {
        <div class="state state--error">
          <p>
            No fue posible cargar las citas. Es esperado si no hay sesión
            activa o el API no está corriendo.
          </p>
          <pre>{{ err | json }}</pre>
        </div>
      } @else if (vm().appointments.length === 0) {
        <p class="state state--empty">No hay citas para el paciente 1.</p>
      } @else {
        <p>El servicio respondió con {{ vm().appointments.length }} cita(s).</p>
        <ul>
          @for (a of vm().appointments; track a.id) {
            <li>#{{ a.id }} — {{ a.status }} — {{ a.start }}</li>
          }
        </ul>
      }

      <button type="button" (click)="reload()" [disabled]="vm().loading">
        Reintentar
      </button>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentPageComponent implements OnInit {
  private readonly api = inject(AppointmentApiService);

  protected readonly vm = signal<ViewModel>({
    loading: true,
    error: null,
    appointments: [],
  });

  ngOnInit(): void {
    this.load();
  }

  protected reload(): void {
    this.load();
  }

  private load(): void {
    this.vm.set({ loading: true, error: null, appointments: [] });
    this.api.listByPatient(1).subscribe({
      next: (page) =>
        this.vm.set({
          loading: false,
          error: null,
          appointments: page.data,
        }),
      error: (err) =>
        this.vm.set({
          loading: false,
          error: err?.error ?? err?.message ?? 'unknown error',
          appointments: [],
        }),
    });
  }
}
