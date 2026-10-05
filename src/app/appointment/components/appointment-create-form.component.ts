import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
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
import type { ApiError } from '../model/api-error';

function futureStart(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  if (!value) return null;
  return new Date(value).getTime() > Date.now() ? null : { pastDate: true };
}

@Component({
  selector: 'app-appointment-create-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h3>Nueva cita</h3>

      <div class="field">
        <label for="patientId">ID del paciente</label>
        <input id="patientId" type="number" formControlName="patientId" min="1" />
        @if (form.controls.patientId.touched && form.controls.patientId.invalid) {
          <span class="error">Debe ser un número positivo.</span>
        }
      </div>

      <div class="field">
        <label for="professionalId">ID del profesional</label>
        <input id="professionalId" type="number" formControlName="professionalId" min="1" />
        @if (form.controls.professionalId.touched && form.controls.professionalId.invalid) {
          <span class="error">Debe ser un número positivo.</span>
        }
      </div>

      <div class="field">
        <label for="start">Inicio</label>
        <input id="start" type="datetime-local" formControlName="start" />
        @if (form.controls.start.touched && form.controls.start.hasError('pastDate')) {
          <span class="error">La fecha de inicio debe ser futura.</span>
        }
      </div>

      <div class="field">
        <label for="end">Fin</label>
        <input id="end" type="datetime-local" formControlName="end" />
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
          {{ submitting() ? 'Guardando…' : 'Crear cita' }}
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
export class AppointmentCreateFormComponent {
  @Output() readonly created = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AppointmentApiService);

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<ApiError | null>(null);

  /**
   * A single Idempotency-Key per intent. If the user clicks "Crear cita"
   * once and the network retries, the same key is sent. A new key is
   * generated every time the form is opened (component is recreated).
   */
  private readonly idempotencyKey = crypto.randomUUID();

  protected readonly form = this.fb.group({
    patientId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    professionalId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    start: this.fb.control<string | null>(null, [Validators.required, futureStart]),
    end: this.fb.control<string | null>(null, [Validators.required]),
  });

  protected submit(): void {
    if (this.form.invalid || this.submitting()) return;

    const raw = this.form.getRawValue();
    if (raw.patientId === null || raw.professionalId === null || !raw.start || !raw.end) {
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    this.api
      .create(
        {
          patientId: raw.patientId,
          professionalId: raw.professionalId,
          start: new Date(raw.start).toISOString(),
          end: new Date(raw.end).toISOString(),
        },
        this.idempotencyKey,
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.created.emit();
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
