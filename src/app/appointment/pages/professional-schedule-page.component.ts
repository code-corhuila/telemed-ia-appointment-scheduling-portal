import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AppointmentApiService } from '../data/appointment-api.service';
import type { Appointment } from '../model/appointment';

import {
  currentUserId,
  currentUserName,
  patientName,
} from '../data/appointment-user-display';

@Component({
  selector: 'app-professional-schedule-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
  ],
  templateUrl: './professional-schedule-page.component.html',
  styleUrl: './professional-schedule-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalSchedulePageComponent
  implements OnInit
{
  private readonly api =
    inject(AppointmentApiService);

  private readonly professionalId =
    currentUserId() ?? 2;

  /**
   * Nombre que se muestra en el encabezado
   * de la agenda profesional.
   */
  protected readonly professionalName =
    currentUserName();

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal<string | null>(null);

  protected readonly appointments =
    signal<Appointment[]>([]);

  /**
   * Cantidad de citas correspondientes
   * al día actual.
   */
  protected readonly todayCount =
    computed(() => {
      const now = new Date();

      return this.appointments().filter(
        (appointment) => {
          const date = new Date(
            appointment.start,
          );

          return (
            date.getFullYear() ===
              now.getFullYear() &&
            date.getMonth() ===
              now.getMonth() &&
            date.getDate() ===
              now.getDate()
          );
        },
      ).length;
    });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .listByProfessional(
        this.professionalId,
      )
      .subscribe({
        next: (page) => {
          this.appointments.set(
            page.data,
          );

          this.loading.set(false);
        },

        error: (err) => {
          this.appointments.set([]);

          this.error.set(
            err?.error?.message ??
              err?.message ??
              'No fue posible cargar la agenda.',
          );

          this.loading.set(false);
        },
      });
  }

  /**
   * Convierte el ID técnico del paciente
   * en el nombre que se presenta en pantalla.
   *
   * El ID sigue siendo utilizado internamente
   * por el contrato del API.
   */
  protected patientDisplayName(
    patientId: number,
  ): string {
    return patientName(patientId);
  }

  protected statusLabel(
    status: string,
  ): string {
    const map: Record<string, string> = {
      CONFIRMED: 'CONFIRMADA',
      RESCHEDULED: 'REPROGRAMADA',
      COMPLETED: 'COMPLETADA',
      CANCELLED: 'CANCELADA',
      NO_SHOW: 'NO ASISTIÓ',
    };

    return map[status] ?? status;
  }
}