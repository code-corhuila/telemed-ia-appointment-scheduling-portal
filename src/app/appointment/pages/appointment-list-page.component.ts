import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppointmentApiService } from '../data/appointment-api.service';
import type { Appointment } from '../model/appointment';
import type { ApiError } from '../model/api-error';
import { AppointmentCreateFormComponent } from '../components/appointment-create-form.component';
import { AppointmentRescheduleFormComponent } from '../components/appointment-reschedule-form.component';
import { AppointmentCancelFormComponent } from '../components/appointment-cancel-form.component';

type Action = 'none' | 'create' | 'reschedule' | 'cancel';

interface VM {
  readonly loading: boolean;
  readonly error: ApiError | null;
  readonly appointments: Appointment[];
  readonly action: Action;
  readonly selected: Appointment | null;
}

@Component({
  selector: 'app-appointment-list-page',
  standalone: true,
  imports: [
    DatePipe,
    AppointmentCreateFormComponent,
    AppointmentRescheduleFormComponent,
    AppointmentCancelFormComponent,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <h2>Mis citas</h2>
        <button type="button" (click)="startCreate()" [disabled]="vm().action !== 'none'">
          Nueva cita
        </button>
      </header>

      @if (vm().action === 'create') {
        <app-appointment-create-form
          (created)="onActionCompleted()"
          (cancel)="closeAction()"
        />
      } @else if (vm().action === 'reschedule' && vm().selected; as appt) {
        <app-appointment-reschedule-form
          [appointment]="appt"
          (rescheduled)="onActionCompleted()"
          (cancel)="closeAction()"
        />
      } @else if (vm().action === 'cancel' && vm().selected; as appt) {
        <app-appointment-cancel-form
          [appointment]="appt"
          (cancelled)="onActionCompleted()"
          (cancel)="closeAction()"
        />
      } @else if (vm().loading) {
        <div class="state">
          <p>Cargando citas…</p>
        </div>
      } @else if (vm().error; as err) {
        <div class="state state--error" role="alert">
          <p>{{ err.message }}</p>
          @if (err.traceId) { <p class="small">Referencia: {{ err.traceId }}</p> }
          <button type="button" (click)="load()">Reintentar</button>
        </div>
      } @else if (vm().appointments.length === 0) {
        <div class="state state--empty">
          <p>Aún no tienes citas.</p>
          <button type="button" (click)="startCreate()">Crear la primera</button>
        </div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Profesional</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (a of vm().appointments; track a.id) {
              <tr>
                <td>{{ a.id }}</td>
                <td>{{ a.professionalId }}</td>
                <td>{{ a.start | date: 'short' }}</td>
                <td>{{ a.end | date: 'short' }}</td>
                <td>{{ a.status }}</td>
                <td class="actions">
                  @if (canReschedule(a)) {
                    <button type="button" (click)="startReschedule(a)">Reprogramar</button>
                  }
                  @if (canCancel(a)) {
                    <button type="button" (click)="startCancel(a)">Cancelar</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
        <p class="small">Total: {{ vm().appointments.length }}</p>
      }
    </section>
  `,
  styles: [
    `.page { max-width: 900px; }
     .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
     .actions { display: flex; gap: 0.25rem; }
     .small { font-size: 0.75rem; color: var(--color-muted); }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentListPageComponent implements OnInit {
  private readonly api = inject(AppointmentApiService);

  /**
   * DEV ONLY. In the real system the patient id comes from the
   * authenticated session. This constant will be replaced by the shell's
   * session when integration lands.
   */
  private readonly devPatientId = 1;

  protected readonly vm = signal<VM>({
    loading: true,
    error: null,
    appointments: [],
    action: 'none',
    selected: null,
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.vm.update((s) => ({ ...s, loading: true, error: null }));
    this.api.listByPatient(this.devPatientId).subscribe({
      next: (page) =>
        this.vm.update((s) => ({
          ...s,
          loading: false,
          error: null,
          appointments: page.data,
        })),
      error: (err) => {
        const apiError: ApiError = err?.error ?? {
          status: 0,
          code: 'UNKNOWN',
          message: err?.message ?? 'Unexpected error',
        };
        this.vm.update((s) => ({
          ...s,
          loading: false,
          error: apiError,
          appointments: [],
        }));
      },
    });
  }

  protected canReschedule(a: Appointment): boolean {
    return a.status === 'CONFIRMED' || a.status === 'RESCHEDULED';
  }

  protected canCancel(a: Appointment): boolean {
    return a.status !== 'COMPLETED' && a.status !== 'CANCELLED';
  }

  protected startCreate(): void {
    this.vm.update((s) => ({ ...s, action: 'create', selected: null }));
  }

  protected startReschedule(a: Appointment): void {
    this.vm.update((s) => ({ ...s, action: 'reschedule', selected: a }));
  }

  protected startCancel(a: Appointment): void {
    this.vm.update((s) => ({ ...s, action: 'cancel', selected: a }));
  }

  protected closeAction(): void {
    this.vm.update((s) => ({ ...s, action: 'none', selected: null }));
  }

  protected onActionCompleted(): void {
    this.vm.update((s) => ({ ...s, action: 'none', selected: null }));
    this.load();
  }
}
