import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Appointment, AppointmentStatus } from '../model/appointment';

@Component({
  selector: 'app-status-change-dialog',
  standalone: true,
  templateUrl: './status-change-dialog.component.html',
  styleUrl: './status-change-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChangeDialogComponent {
  readonly appointment = input.required<Appointment>();
  readonly busy = input(false);

  readonly confirm = output<AppointmentStatus>();
  readonly close = output<void>();

  protected readonly options: readonly AppointmentStatus[] = [
    'COMPLETED',
    'NO_SHOW',
    'CANCELLED',
  ];

  protected choose(status: AppointmentStatus): void {
    if (this.busy()) return;
    this.confirm.emit(status);
  }

  protected dismiss(): void {
    if (this.busy()) return;
    this.close.emit();
  }
}