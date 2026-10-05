import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AppointmentApiService } from '../data/appointment-api.service';
import type { Appointment } from '../model/appointment';
import type { ApiError } from '../model/api-error';

function futureStart(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  if (!value) return null;
  return new Date(value).getTime() > Date.now() ? null : { pastDate: true };
}

@Component({
  selector: 'app-appointment-reschedule-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h3>Reprogramar cita #{{ appointment.id }}</h3>

      <div class="field">
        <label for="newStart">Nuevo inicio</label>
        <input id="newStart" type="datetime-local" formControlName="start" />
        @if (form.controls.start.touched && form.controls.start.hasError('pastDate')) {
          <span class="error">La fecha de inicio debe ser futura.</span>
        }
      </div>

      <div class="field">
        <label for="newEnd">Nuevo fin</label>
        <input id="newEnd" type="datetime-local" formControlName="end" />
        @if (form.controls.end.touched && form.controls.end.invalid) {
          <span class="error">La fecha de fin es obligatoria.</span>
        }
      </div>

      @if (serverError(); as err) {
        <div class="state state--error">
          <p>{{ err.message }}</p>
          @if (err.traceId) { <p class="small">Referencia: {{ err.traceId }}</p> }
        </div>
      }

      <div class="actions">
        <button type="submit" [disabled]="submitting() || form.invalid">
          {{ submitting() ? 'Guardando…' : 'Reprogramar' }}
        </button>
        <button type="button" (click)="cancel.emit()" [disabled]="submitting()">
          Cancelar
        </button>
      </div>
    </form>
  `,
  styles: [
    `.actions { display: flex; gap: 0.5rem; }
     .small { font-size: 0.75rem; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentRescheduleFormComponent {
  @Input({ required: true }) appointment!: Appointment;
  @Output() readonly rescheduled = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AppointmentApiService);

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<ApiError | null>(null);

  protected readonly form = this.fb.group({
    start: this.fb.control<string | null>(null, [Validators.required, futureStart]),
    end: this.fb.control<string | null>(null, [Validators.required]),
  });

  protected submit(): void {
    if (this.form.invalid || this.submitting()) return;

    const raw = this.form.getRawValue();
    if (!raw.start || !raw.end) return;

    this.submitting.set(true);
    this.serverError.set(null);

    this.api
      .reschedule(this.appointment.id, {
        start: new Date(raw.start).toISOString(),
        end: new Date(raw.end).toISOString(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.rescheduled.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          const apiError: ApiError = err?.error ?? {
            status: 0,
            code: 'UNKNOWN',
            message: err?.message ?? 'Unexpected error',
          };
          this.serverError.set(apiError);
        },
      });
  }
}
