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
    <form
      class="appointment-form"
      [formGroup]="form"
      (ngSubmit)="submit()"
      novalidate
    >
      <section class="form-card">
        <header class="form-header">
          <div class="form-header__icon">📅</div>

          <div>
            <p class="eyebrow">GESTIÓN DE CITAS</p>
            <h2 class="form-title">Nueva cita</h2>
            <p class="form-subtitle">
              Completa los datos para agendar una nueva consulta.
            </p>
          </div>
        </header>

        <div class="step">
          <div class="step__number">1</div>

          <div class="step__content">
            <h3 class="step__title">Datos de la cita</h3>
            <p class="step__subtitle">
              Identifica al paciente y al profesional.
            </p>

            <div class="field-grid">
              <div class="field">
                <label for="patientId">ID del paciente</label>

                <input
                  id="patientId"
                  class="input"
                  type="number"
                  formControlName="patientId"
                  min="1"
                  placeholder="Ej. 101"
                />

                @if (
                  form.controls.patientId.touched &&
                  form.controls.patientId.invalid
                ) {
                  <span class="error">
                    Debe ser un número positivo.
                  </span>
                }
              </div>

              <div class="field">
                <label for="professionalId">ID del profesional</label>

                <input
                  id="professionalId"
                  class="input"
                  type="number"
                  formControlName="professionalId"
                  min="1"
                  placeholder="Ej. 201"
                />

                @if (
                  form.controls.professionalId.touched &&
                  form.controls.professionalId.invalid
                ) {
                  <span class="error">
                    Debe ser un número positivo.
                  </span>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="step">
          <div class="step__number">2</div>

          <div class="step__content">
            <h3 class="step__title">Horario</h3>
            <p class="step__subtitle">
              Selecciona una fecha y hora futura para la consulta.
            </p>

            <div class="field-grid">
              <div class="field">
                <label for="start">Inicio</label>

                <input
                  id="start"
                  class="input"
                  type="datetime-local"
                  formControlName="start"
                />

                @if (
                  form.controls.start.touched &&
                  form.controls.start.hasError('pastDate')
                ) {
                  <span class="error">
                    La fecha de inicio debe ser futura.
                  </span>
                }

                @if (
                  form.controls.start.touched &&
                  form.controls.start.hasError('required')
                ) {
                  <span class="error">
                    La fecha de inicio es obligatoria.
                  </span>
                }
              </div>

              <div class="field">
                <label for="end">Fin</label>

                <input
                  id="end"
                  class="input"
                  type="datetime-local"
                  formControlName="end"
                />

                @if (
                  form.controls.end.touched &&
                  form.controls.end.invalid
                ) {
                  <span class="error">
                    La fecha de fin es obligatoria.
                  </span>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="info-banner">
          <span class="info-banner__icon">ⓘ</span>

          <div>
            <strong>Ten en cuenta</strong>
            <p>
              Usa una fecha futura. El backend validará la disponibilidad del
              horario antes de crear la cita.
            </p>
          </div>
        </div>

        @if (serverError(); as err) {
          <div class="state state--error server-error">
            <strong>No fue posible crear la cita.</strong>
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
            class="btn btn--primary actions__primary"
            [disabled]="submitting() || form.invalid"
          >
            {{ submitting() ? 'Guardando…' : 'Crear cita' }}
          </button>

          <button
            type="button"
            class="btn btn--ghost actions__secondary"
            (click)="cancel.emit()"
            [disabled]="submitting()"
          >
            Cancelar
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
        max-width: 860px;
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
        margin-bottom: 1.75rem;
        border-bottom: 1px solid var(--color-border-soft);
      }

      .form-header__icon {
        width: 52px;
        height: 52px;
        flex: 0 0 52px;
        display: grid;
        place-items: center;
        border-radius: 16px;
        background: var(--color-primary-icon);
        font-size: 1.35rem;
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

      .step {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1rem;
        margin-bottom: 1.75rem;
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

      .step__content {
        min-width: 0;
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

      .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
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
        min-height: 46px;
        padding: 0.7rem 0.85rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        outline: none;
        background: var(--color-surface);
        color: var(--color-text);
        font: inherit;
        font-size: 0.9rem;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease,
          background 0.15s ease;
      }

      .input::placeholder {
        color: var(--color-muted-soft);
      }

      .input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgb(44 107 237 / 10%);
      }

      .error {
        color: var(--color-danger-text);
        font-size: 0.78rem;
        font-weight: 600;
      }

      .info-banner {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin: 0.5rem 0 1.5rem;
        padding: 1rem 1.1rem;
        border: 1px solid #dce7f7;
        border-radius: var(--radius-md);
        background: var(--color-primary-softer);
        color: var(--color-info-text);
      }

      .info-banner__icon {
        flex: 0 0 auto;
        font-size: 1rem;
        line-height: 1.35;
      }

      .info-banner strong {
        display: block;
        margin-bottom: 0.2rem;
        font-size: 0.82rem;
      }

      .info-banner p {
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
        padding-top: 0.5rem;
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

        .field-grid {
          grid-template-columns: 1fr;
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