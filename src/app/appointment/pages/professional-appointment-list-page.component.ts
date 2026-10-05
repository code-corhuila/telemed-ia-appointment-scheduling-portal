import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppointmentApiService } from '../data/appointment-api.service';
import { Appointment, AppointmentStatus } from '../model/appointment';
import { ApiError } from '../model/api-error';
import { StatusChangeDialogComponent } from '../components/status-change-dialog.component';

@Component({
  selector: 'app-professional-appointment-list-page',
  standalone: true,
  imports: [DatePipe, StatusChangeDialogComponent],
  templateUrl: './professional-appointment-list-page.component.html',
  styleUrl: './professional-appointment-list-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalAppointmentListPageComponent implements OnInit {
  private readonly api = inject(AppointmentApiService);

  // TODO: replace with the professional id from the session/JWT once
  // identity-and-access exposes it. Same temporary pattern used by the
  // patient page (hardcoded patient/1).
  private readonly professionalId = 2;

  readonly loading = signal(true);
  readonly appointments = signal<Appointment[]>([]);
  readonly error = signal<ApiError | null>(null);
  readonly selected = signal<Appointment | null>(null);
  readonly updating = signal(false);

  readonly confirmedCount = computed(
    () => this.appointments().filter((a) => a.status === 'CONFIRMED').length,
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listByProfessional(this.professionalId).subscribe({
      next: (page) => {
        this.appointments.set(page.data);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  openStatusDialog(appointment: Appointment): void {
    this.selected.set(appointment);
  }

  closeDialog(): void {
    this.selected.set(null);
  }

  confirmStatusChange(status: AppointmentStatus): void {
    const current = this.selected();
    if (!current) return;
    this.updating.set(true);
    this.api.updateStatus(current.id, status).subscribe({
      next: (updated) => {
        this.appointments.update((list) =>
          list.map((a) => (a.id === updated.id ? updated : a)),
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
}