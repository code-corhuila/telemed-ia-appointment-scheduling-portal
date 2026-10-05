import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentApiService } from '../data/appointment-api.service';
import type { Appointment } from '../model/appointment';
import type { ApiError } from '../model/api-error';

@Component({
  selector: 'app-appointment-cancel-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h3>Cancelar cita #{{ appointment.id }}</h3>

      <div class="field">
        <label for="reason">Motivo</label>
        <input id="reason" type="text" formControlName="reason" maxlength="500" />
        @if (form.controls.reason.touched && form.controls.reason.invalid) {
          <span class="error">El motivo es obligatorio.</span>
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
          {{ submitting() ? 'Cancelando…' : 'Confirmar cancelación' }}
        </button>
        <button type="button" (click)="cancel.emit()" [disabled]="submitting()">
          Volver
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
export class AppointmentCancelFormComponent {
  @Input({ required: true }) appointment!: Appointment;
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AppointmentApiService);

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<ApiError | null>(null);

  protected readonly form = this.fb.group({
    reason: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });

  protected submit(): void {
    if (this.form.invalid || this.submitting()) return;

    const reason = this.form.controls.reason.value.trim();
    if (!reason) return;

    this.submitting.set(true);
    this.serverError.set(null);

    this.api.cancel(this.appointment.id, reason).subscribe({
      next: () => {
        this.submitting.set(false);
        this.cancelled.emit();
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
