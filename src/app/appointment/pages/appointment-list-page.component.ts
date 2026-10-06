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
  templateUrl: './appointment-list-page.component.html',
  styleUrl: './appointment-list-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentListPageComponent implements OnInit {
  private readonly api = inject(AppointmentApiService);

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

  protected statusLabel(status: string): string {
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