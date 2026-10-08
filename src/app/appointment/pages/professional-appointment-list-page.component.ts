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
import {
  Appointment,
  AppointmentStatus,
} from '../model/appointment';
import { ApiError } from '../model/api-error';
import {
  currentUserId,
  patientName,
} from '../data/appointment-user-display';
import { StatusChangeDialogComponent } from '../components/status-change-dialog.component';

@Component({
  selector:
    'app-professional-appointment-list-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    StatusChangeDialogComponent,
  ],
  templateUrl:
    './professional-appointment-list-page.component.html',
  styleUrl:
    './professional-appointment-list-page.component.css',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class ProfessionalAppointmentListPageComponent
  implements OnInit
{
  private readonly api =
    inject(AppointmentApiService);

  private readonly professionalId =
    currentUserId() ?? 2;

  readonly loading = signal(true);
  readonly appointments =
    signal<Appointment[]>([]);
  readonly error =
    signal<ApiError | null>(null);
  readonly selected =
    signal<Appointment | null>(null);
  readonly updating = signal(false);

  readonly confirmedCount =
    computed(
      () =>
        this.appointments().filter(
          (appointment) =>
            appointment.status ===
            'CONFIRMED',
        ).length,
    );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
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

        error: (err: ApiError) => {
          this.error.set(err);
          this.loading.set(false);
        },
      });
  }

  openStatusDialog(
    appointment: Appointment,
  ): void {
    this.selected.set(
      appointment,
    );
  }

  closeDialog(): void {
    this.selected.set(null);
  }

  confirmStatusChange(
    status: AppointmentStatus,
  ): void {
    const current =
      this.selected();

    if (!current) {
      return;
    }

    this.updating.set(true);

    this.api
      .updateStatus(
        current.id,
        status,
      )
      .subscribe({
        next: (updated) => {
          this.appointments.update(
            (list) =>
              list.map((appointment) =>
                appointment.id ===
                updated.id
                  ? updated
                  : appointment,
              ),
          );

          this.updating.set(false);
          this.selected.set(null);
        },

        error: (err: ApiError) => {
          this.error.set(err);
          this.updating.set(false);
        },
      });
  }

  protected patientDisplayName(
    patientId: number,
  ): string {
    return patientName(patientId);
  }

  protected statusLabel(
    status: string,
  ): string {
    const map: Record<
      string,
      string
    > = {
      CONFIRMED: 'CONFIRMADA',
      RESCHEDULED: 'REPROGRAMADA',
      COMPLETED: 'COMPLETADA',
      CANCELLED: 'CANCELADA',
      NO_SHOW: 'NO ASISTIÓ',
    };

    return map[status] ?? status;
  }
}