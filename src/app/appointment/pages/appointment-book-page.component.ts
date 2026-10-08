import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppointmentCreateFormComponent } from '../components/appointment-create-form.component';

@Component({
  selector: 'app-appointment-book-page',
  standalone: true,
  imports: [
    RouterLink,
    AppointmentCreateFormComponent,
  ],
  templateUrl: './appointment-book-page.component.html',
  styleUrl: './appointment-book-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentBookPageComponent {
  private readonly router = inject(Router);

  protected onCreated(): void {
    void this.router.navigate(['/appointment']);
  }

  protected goBack(): void {
    void this.router.navigate(['/appointment']);
  }
}