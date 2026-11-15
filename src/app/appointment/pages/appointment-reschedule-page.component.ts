import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { AppointmentApiService } from '../data/appointment-api.service';
import type { Appointment } from '../model/appointment';
import { AppointmentRescheduleFormComponent } from '../components/appointment-reschedule-form.component';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-appointment-reschedule-page',
  standalone: true,
  imports: [
    RouterLink,
    AppointmentRescheduleFormComponent,
  ],
  templateUrl: './appointment-reschedule-page.component.html',
  styleUrls: ['../appointment-theme.css', './appointment-reschedule-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentReschedulePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AppointmentApiService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly appointment = signal<Appointment | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    if (!UUID_PATTERN.test(id)) {
      this.loading.set(false);
      this.error.set('El identificador de la cita no es válido.');
      return;
    }

    this.loadAppointment(id);
  }

  private loadAppointment(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    // The API checks that the appointment belongs to the signed-in user.
    this.api.getById(id).subscribe({
      next: (appointment) => {
        this.appointment.set(appointment);
        this.loading.set(false);
      },
      error: (err) => {
        this.appointment.set(null);
        if (err?.status === 403 || err?.status === 404) {
          this.error.set('No se encontró la cita o no pertenece al paciente actual.');
          this.loading.set(false);
          return;
        }
        this.error.set(
          err?.error?.message ??
            err?.message ??
            'No fue posible cargar la cita.',
        );
        this.loading.set(false);
      },
    });
  }

  protected onRescheduled(): void {
    void this.router.navigate(['/appointment']);
  }

  protected goBack(): void {
    void this.router.navigate(['/appointment']);
  }
}