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
    <form
      class="appointment-form"
      [formGroup]="form"
      (ngSubmit)="submit()"
      novalidate
    >
      <section class="form-card">
        <header class="form-header">
          <div class="form-header__icon form-header__icon--danger">⚠️</div>

          <div>
            <p class="eyebrow">GESTIÓN DE CITAS</p>
            <h2 class="form-title">Cancelar cita</h2>
            <p class="form-subtitle">
              Confirma la cancelación de la cita #{{ appointment.id }}.
            </p>
          </div>
        </header>

        <div class="appointment-summary">
          <div class="appointment-summary__label">Cita seleccionada</div>
          <div class="appointment-summary__value">
            Cita #{{ appointment.id }}
          </div>
        </div>

        <div class="step">
          <div class="step__number">1</div>

          <div class="step__content">
            <h3 class="step__title">Motivo de cancelación</h3>
            <p class="step__subtitle">
              Indica el motivo para registrar la cancelación.
            </p>

            <div class="field">
              <label for="reason">Motivo</label>

              <textarea
                id="reason"
                class="input input--textarea"
                formControlName="reason"
                maxlength="500"
                rows="5"
                placeholder="Escribe el motivo de la cancelación..."
              ></textarea>

              <div class="field-meta">
                <span
                  class="error"
                  [class.error--hidden]="
                    !(
                      form.controls.reason.touched &&
                      form.controls.reason.invalid
                    )
                  "
                >
                  El motivo es obligatorio.
                </span>

                <span class="counter">
                  {{ form.controls.reason.value.length }}/500
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="warning-banner">
          <span class="warning-banner__icon">!</span>

          <div>
            <strong>Esta acción cambiará el estado de la cita.</strong>
            <p>
              La cancelación se registrará en el historial de la cita.
            </p>
          </div>
        </div>

        @if (serverError(); as err) {
          <div class="state state--error server-error">
            <strong>No fue posible cancelar la cita.</strong>
            <p>{{ err.message }}</p>

            @if (err.traceId) {
              <p class="small">
                Referencia: {{ err.traceId }}
              </p>
            }
          </div>
        }

        <div class="actions">
          <button
            type="submit"
            class="btn btn--danger-outline actions__primary"
            [disabled]="submitting() || form.invalid"
          >
            {{ submitting() ? 'Cancelando…' : 'Confirmar cancelación' }}
          </button>

          <button
            type="button"
            class="btn btn--ghost actions__secondary"
            (click)="cancel.emit()"
            [disabled]="submitting()"
          >
            Volver
          </button>
        </div>
      </section>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .appointment-form {
        width: 100%;
      }

      .form-card {
        width: 100%;
        max-width: 720px;
        margin: 0 auto;
        padding: 2rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        box-shadow: var(--shadow-card);
      }

      .form-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding-bottom: 1.75rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--color-border-soft);
      }

      .form-header__icon {
        width: 52px;
        height: 52px;
        flex: 0 0 52px;
        display: grid;
        place-items: center;
        border-radius: 16px;
        background: var(--color-danger-bg);
        font-size: 1.25rem;
      }

      .eyebrow {
        margin: 0 0 0.25rem;
        color: var(--color-muted);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
      }

      .form-title {
        margin: 0;
        color: var(--color-text);
        font-size: 1.55rem;
        font-weight: 750;
        letter-spacing: -0.03em;
      }

      .form-subtitle {
        margin: 0.35rem 0 0;
        color: var(--color-muted);
        font-size: 0.9rem;
      }

      .appointment-summary {
        padding: 1rem 1.1rem;
        margin-bottom: 1.5rem;
        border: 1px solid var(--color-border-soft);
        border-radius: var(--radius-md);
        background: var(--color-bg-soft);
      }

      .appointment-summary__label {
        margin-bottom: 0.25rem;
        color: var(--color-muted);
        font-size: 0.75rem;
        font-weight: 650;
      }

      .appointment-summary__value {
        color: var(--color-text);
        font-size: 0.95rem;
        font-weight: 750;
      }

      .step {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1rem;
      }

      .step__number {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--color-primary);
        color: #fff;
        font-size: 0.85rem;
        font-weight: 750;
      }

      .step__title {
        margin: 0;
        color: var(--color-text);
        font-size: 1.05rem;
        font-weight: 750;
      }

      .step__subtitle {
        margin: 0.2rem 0 1rem;
        color: var(--color-muted-soft);
        font-size: 0.85rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .field label {
        color: var(--color-text);
        font-size: 0.85rem;
        font-weight: 650;
      }

      .input {
        width: 100%;
        padding: 0.8rem 0.9rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        outline: none;
        background: var(--color-surface);
        color: var(--color-text);
        font: inherit;
        font-size: 0.9rem;
        resize: vertical;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgb(44 107 237 / 10%);
      }

      .input--textarea {
        min-height: 125px;
      }

      .field-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .error {
        color: var(--color-danger-text);
        font-size: 0.78rem;
        font-weight: 600;
      }

      .error--hidden {
        visibility: hidden;
      }

      .counter {
        color: var(--color-muted-soft);
        font-size: 0.75rem;
      }

      .warning-banner {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin: 1.5rem 0;
        padding: 1rem 1.1rem;
        border: 1px solid #f5ddb2;
        border-radius: var(--radius-md);
        background: var(--color-warning-bg);
        color: var(--color-warning-text);
      }

      .warning-banner__icon {
        width: 22px;
        height: 22px;
        flex: 0 0 22px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: rgb(180 83 9 / 12%);
        font-size: 0.75rem;
        font-weight: 800;
      }

      .warning-banner strong {
        display: block;
        margin-bottom: 0.2rem;
        font-size: 0.82rem;
      }

      .warning-banner p {
        margin: 0;
        font-size: 0.8rem;
        line-height: 1.5;
      }

      .server-error {
        margin-bottom: 1.5rem;
      }

      .server-error strong {
        display: block;
        margin-bottom: 0.25rem;
      }

      .server-error p {
        margin: 0.2rem 0 0;
      }

      .small {
        font-size: 0.75rem;
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .actions__primary,
      .actions__secondary {
        width: 100%;
        min-height: 48px;
      }

      @media (max-width: 700px) {
        .form-card {
          padding: 1.25rem;
        }

        .form-header {
          padding-bottom: 1.25rem;
          margin-bottom: 1.25rem;
        }
      }
    `,
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