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

@Component({
  selector: 'app-appointment-reschedule-page',
  standalone: true,
  imports: [
    RouterLink,
    AppointmentRescheduleFormComponent,
  ],
  templateUrl: './appointment-reschedule-page.component.html',
  styleUrl: './appointment-reschedule-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentReschedulePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AppointmentApiService);

  private readonly devPatientId = 1;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly appointment = signal<Appointment | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.error.set('El identificador de la cita no es válido.');
      return;
    }

    this.loadAppointment(id);
  }

  private loadAppointment(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.listByPatient(this.devPatientId).subscribe({
      next: (page) => {
        const found = page.data.find(
          (appointment) => appointment.id === id,
        );

        if (!found) {
          this.appointment.set(null);
          this.error.set(
            'No se encontró la cita o no pertenece al paciente actual.',
          );
          this.loading.set(false);
          return;
        }

        this.appointment.set(found);
        this.loading.set(false);
      },
      error: (err) => {
        this.appointment.set(null);
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