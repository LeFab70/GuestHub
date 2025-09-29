import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Visit, VisitStatus } from '../models/visit.model';
import { FakeDataService } from './fake-data.service';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  
  constructor(private fakeDataService: FakeDataService) {}

  // Simulate API delay
  private delay = 500;

  getAllVisits(): Observable<Visit[]> {
    return of(this.fakeDataService.getVisits()).pipe(delay(this.delay));
  }

  getVisitById(id: number): Observable<Visit | undefined> {
    return of(this.fakeDataService.getVisitById(id)).pipe(delay(this.delay));
  }

  getVisitsByGuest(guestId: number): Observable<Visit[]> {
    return of(this.fakeDataService.getVisitsByGuest(guestId)).pipe(delay(this.delay));
  }

  getVisitsByHost(hostId: number): Observable<Visit[]> {
    return of(this.fakeDataService.getVisitsByHost(hostId)).pipe(delay(this.delay));
  }

  getVisitsByStatus(status: VisitStatus): Observable<Visit[]> {
    return of(this.fakeDataService.getVisitsByStatus(status)).pipe(delay(this.delay));
  }

  getVisitsByDateRange(startDate: Date, endDate: Date): Observable<Visit[]> {
    return of(this.fakeDataService.getVisitsByDateRange(startDate, endDate)).pipe(delay(this.delay));
  }

  getGuestVisitsByDateRange(guestId: number, startDate: Date, endDate: Date): Observable<Visit[]> {
    return of(this.fakeDataService.getGuestVisitsByDateRange(guestId, startDate, endDate)).pipe(delay(this.delay));
  }

  getHostVisitsByDateRange(hostId: number, startDate: Date, endDate: Date): Observable<Visit[]> {
    return of(this.fakeDataService.getHostVisitsByDateRange(hostId, startDate, endDate)).pipe(delay(this.delay));
  }

  createVisit(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Observable<Visit> {
    return of(this.fakeDataService.createVisit(visit)).pipe(delay(this.delay));
  }

  updateVisit(id: number, updates: Partial<Visit>): Observable<Visit | undefined> {
    return of(this.fakeDataService.updateVisit(id, updates)).pipe(delay(this.delay));
  }

  deleteVisit(id: number): Observable<boolean> {
    return of(this.fakeDataService.deleteVisit(id)).pipe(delay(this.delay));
  }

  checkInVisit(id: number): Observable<Visit | undefined> {
    return of(this.fakeDataService.checkInVisit(id)).pipe(delay(this.delay));
  }

  checkOutVisit(id: number): Observable<Visit | undefined> {
    return of(this.fakeDataService.checkOutVisit(id)).pipe(delay(this.delay));
  }

  cancelVisit(id: number): Observable<Visit | undefined> {
    return of(this.fakeDataService.cancelVisit(id)).pipe(delay(this.delay));
  }

  markNoShow(id: number): Observable<Visit | undefined> {
    return of(this.fakeDataService.markNoShow(id)).pipe(delay(this.delay));
  }
}
