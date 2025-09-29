import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Guest, IdType } from '../models/guest.model';
import { FakeDataService } from './fake-data.service';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  
  constructor(private fakeDataService: FakeDataService) {}

  // Simulate API delay
  private delay = 500;

  getAllGuests(): Observable<Guest[]> {
    return of(this.fakeDataService.getGuests()).pipe(delay(this.delay));
  }

  getGuestById(id: number): Observable<Guest | undefined> {
    return of(this.fakeDataService.getGuestById(id)).pipe(delay(this.delay));
  }

  getGuestByEmail(email: string): Observable<Guest | undefined> {
    return of(this.fakeDataService.getGuestByEmail(email)).pipe(delay(this.delay));
  }

  getGuestsByCompany(company: string): Observable<Guest[]> {
    return of(this.fakeDataService.getGuestsByCompany(company)).pipe(delay(this.delay));
  }

  getBlacklistedGuests(): Observable<Guest[]> {
    return of(this.fakeDataService.getBlacklistedGuests()).pipe(delay(this.delay));
  }

  getNotBlacklistedGuests(): Observable<Guest[]> {
    return of(this.fakeDataService.getNotBlacklistedGuests()).pipe(delay(this.delay));
  }

  searchGuests(name: string): Observable<Guest[]> {
    return of(this.fakeDataService.searchGuests(name)).pipe(delay(this.delay));
  }

  getGuestByIdNumber(idNumber: string): Observable<Guest | undefined> {
    return of(this.fakeDataService.getGuestByIdNumber(idNumber)).pipe(delay(this.delay));
  }

  createGuest(guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Observable<Guest> {
    return of(this.fakeDataService.createGuest(guest)).pipe(delay(this.delay));
  }

  updateGuest(id: number, updates: Partial<Guest>): Observable<Guest | undefined> {
    return of(this.fakeDataService.updateGuest(id, updates)).pipe(delay(this.delay));
  }

  deleteGuest(id: number): Observable<boolean> {
    return of(this.fakeDataService.deleteGuest(id)).pipe(delay(this.delay));
  }

  blacklistGuest(id: number): Observable<Guest | undefined> {
    return of(this.fakeDataService.updateGuest(id, { isBlacklisted: true })).pipe(delay(this.delay));
  }

  unblacklistGuest(id: number): Observable<Guest | undefined> {
    return of(this.fakeDataService.updateGuest(id, { isBlacklisted: false })).pipe(delay(this.delay));
  }
}
