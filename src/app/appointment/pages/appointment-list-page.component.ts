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
import type {
  Appointment,
  AppointmentStatus,
} from '../model/appointment';
import type { ApiError } from '../model/api-error';
import { AppointmentCreateFormComponent } from '../components/appointment-create-form.component';
import { AppointmentRescheduleFormComponent } from '../components/appointment-reschedule-form.component';
import { AppointmentCancelFormComponent } from '../components/appointment-cancel-form.component';
import {
  currentUserId,
  patientName,
  professionalName,
} from '../data/appointment-user-display';

type Action =
  | 'none'
  | 'create'
  | 'reschedule'
  | 'cancel';

type FilterTab = 'ALL' | AppointmentStatus;

interface VM {
  readonly loading: boolean;
  readonly error: ApiError | null;
  readonly appointments: Appointment[];
  readonly action: Action;
  readonly selected: Appointment | null;
  readonly tab: FilterTab;
}

@Component({
  selector: 'app-appointment-list-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    AppointmentCreateFormComponent,
    AppointmentRescheduleFormComponent,
    AppointmentCancelFormComponent,
  ],
  templateUrl:
    './appointment-list-page.component.html',
  styleUrl:
    './appointment-list-page.component.css',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class AppointmentListPageComponent
  implements OnInit
{
  private readonly api =
    inject(AppointmentApiService);

  private readonly patientId =
    currentUserId() ?? 1;

  protected readonly vm = signal<VM>({
    loading: true,
    error: null,
    appointments: [],
    action: 'none',
    selected: null,
    tab: 'ALL',
  });

  protected readonly tabs: {
    key: FilterTab;
    label: string;
  }[] = [
    {
      key: 'ALL',
      label: 'Todas',
    },
    {
      key: 'CONFIRMED',
      label: 'Confirmadas',
    },
    {
      key: 'RESCHEDULED',
      label: 'Reprogramadas',
    },
    {
      key: 'COMPLETED',
      label: 'Completadas',
    },
    {
      key: 'CANCELLED',
      label: 'Canceladas',
    },
  ];

  protected readonly filteredAppointments =
    computed(() => {
      const s = this.vm();

      if (s.tab === 'ALL') {
        return s.appointments;
      }

      return s.appointments.filter(
        (appointment) =>
          appointment.status === s.tab,
      );
    });

  protected readonly tabCounts =
    computed(() => {
      const list =
        this.vm().appointments;

      return {
        ALL: list.length,
        CONFIRMED: list.filter(
          (a) => a.status === 'CONFIRMED',
        ).length,
        RESCHEDULED: list.filter(
          (a) => a.status === 'RESCHEDULED',
        ).length,
        COMPLETED: list.filter(
          (a) => a.status === 'COMPLETED',
        ).length,
        CANCELLED: list.filter(
          (a) => a.status === 'CANCELLED',
        ).length,
        NO_SHOW: list.filter(
          (a) => a.status === 'NO_SHOW',
        ).length,
      } as Record<FilterTab, number>;
    });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.vm.update((s) => ({
      ...s,
      loading: true,
      error: null,
    }));

    this.api
      .listByPatient(this.patientId)
      .subscribe({
        next: (page) =>
          this.vm.update((s) => ({
            ...s,
            loading: false,
            error: null,
            appointments: page.data,
          })),

        error: (err) => {
          const apiError: ApiError =
            err?.error ?? {
              status: 0,
              code: 'UNKNOWN',
              message:
                err?.message ??
                'Unexpected error',
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

  protected setTab(
    tab: FilterTab,
  ): void {
    this.vm.update((s) => ({
      ...s,
      tab,
    }));
  }

  protected startCreate(): void {
    this.vm.update((s) => ({
      ...s,
      action: 'create',
      selected: null,
    }));
  }

  protected startReschedule(
    appointment: Appointment,
  ): void {
    this.vm.update((s) => ({
      ...s,
      action: 'reschedule',
      selected: appointment,
    }));
  }

  protected startCancel(
    appointment: Appointment,
  ): void {
    this.vm.update((s) => ({
      ...s,
      action: 'cancel',
      selected: appointment,
    }));
  }

  protected closeAction(): void {
    this.vm.update((s) => ({
      ...s,
      action: 'none',
      selected: null,
    }));
  }

  protected onActionCompleted(): void {
    this.vm.update((s) => ({
      ...s,
      action: 'none',
      selected: null,
    }));

    this.load();
  }

  protected professionalDisplayName(
    professionalId: number,
  ): string {
    return professionalName(
      professionalId,
    );
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

  protected statusIcon(
    status: string,
  ): string {
    const map: Record<
      string,
      string
    > = {
      CONFIRMED: '👤',
      RESCHEDULED: '👤',
      COMPLETED: '👤',
      CANCELLED: '👤',
      NO_SHOW: '👤',
    };

    return map[status] ?? '👤';
  }
}
