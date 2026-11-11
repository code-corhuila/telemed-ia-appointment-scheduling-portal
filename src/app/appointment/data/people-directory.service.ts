import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay, tap, throwError } from 'rxjs';

import type { ProfessionalListItem, ProfessionalOption } from '../model/people';
import { AppointmentApiService } from './appointment-api.service';

const NAMES_PER_CALL = 50;

const SPECIALTIES: Readonly<Record<string, string>> = {
  GENERAL_PRACTITIONER: 'Medicina General',
};

/**
 * Real names for the account ids that appointments carry. Names are cached in a
 * signal, so a template that asks for a name re-renders when it arrives. A failed
 * lookup is not an error for the page: it keeps the generic label.
 */
@Injectable({ providedIn: 'root' })
export class PeopleDirectoryService {
  private readonly api = inject(AppointmentApiService);

  private readonly names = signal<ReadonlyMap<string, string>>(new Map());
  private professionalsRequest: Observable<readonly ProfessionalOption[]> | null = null;

  /** Active professionals a patient can book, by account id. */
  professionals(): Observable<readonly ProfessionalOption[]> {
    if (this.professionalsRequest === null) {
      this.professionalsRequest = this.api.listProfessionals().pipe(
        // Every name is kept (past appointments may be with an inactive professional);
        // only active professionals are offered for a new appointment.
        tap((page) => this.remember(page.data.map((item) => [item.identityUserId, toOption(item).name]))),
        map((page) => page.data.filter((item) => item.status === 'ACTIVE').map(toOption)),
        catchError((error: unknown) => {
          this.professionalsRequest = null; // the next call tries again
          return throwError(() => error);
        }),
        shareReplay(1),
      );
    }
    return this.professionalsRequest;
  }

  /** Loads the names of the professionals of these appointments (patient views). */
  resolveProfessionals(): void {
    this.professionals()
      .pipe(catchError(() => of([])))
      .subscribe();
  }

  /** Loads the names of these patients (professional views, identity DEC-013). */
  resolvePatients(patientIds: readonly string[]): void {
    const known = this.names();
    const missing = [...new Set(patientIds)].filter((id) => !known.has(id));
    if (missing.length === 0) {
      return;
    }

    const calls = chunks(missing, NAMES_PER_CALL).map((ids) =>
      this.api.lookupAccountNames(ids).pipe(
        map((answer) => answer.data),
        catchError(() => of([])),
      ),
    );

    forkJoin(calls).subscribe((answers) =>
      this.remember(answers.flat().map((name) => [name.id, name.fullName])),
    );
  }

  professionalName(professionalId: string): string {
    return this.names().get(professionalId) ?? 'Profesional';
  }

  patientName(patientId: string): string {
    return this.names().get(patientId) ?? 'Paciente';
  }

  private remember(entries: readonly (readonly [string, string])[]): void {
    if (entries.length === 0) {
      return;
    }
    this.names.update((current) => new Map([...current, ...entries]));
  }
}

function toOption(item: ProfessionalListItem): ProfessionalOption {
  return {
    id: item.identityUserId,
    name: item.fullName ?? 'Profesional',
    specialty: SPECIALTIES[item.professionalType] ?? 'Medicina General',
  };
}

function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    result.push(items.slice(start, start + size));
  }
  return result;
}
