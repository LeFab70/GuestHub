import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { FakeDataService } from './fake-data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private fakeDataService: FakeDataService) {}

  // Simulate API delay
  private delay = 500;

  getAllUsers(): Observable<User[]> {
    return of(this.fakeDataService.getUsers()).pipe(delay(this.delay));
  }

  getUserById(id: number): Observable<User | undefined> {
    return of(this.fakeDataService.getUserById(id)).pipe(delay(this.delay));
  }

  getUserByEmail(email: string): Observable<User | undefined> {
    return of(this.fakeDataService.getUserByEmail(email)).pipe(delay(this.delay));
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    return of(this.fakeDataService.getUsersByRole(role)).pipe(delay(this.delay));
  }

  getUsersByDepartment(department: string): Observable<User[]> {
    return of(this.fakeDataService.getUsersByDepartment(department)).pipe(delay(this.delay));
  }

  getActiveUsers(): Observable<User[]> {
    return of(this.fakeDataService.getActiveUsers()).pipe(delay(this.delay));
  }

  searchUsers(name: string): Observable<User[]> {
    return of(this.fakeDataService.searchUsers(name)).pipe(delay(this.delay));
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Observable<User> {
    return of(this.fakeDataService.createUser(user)).pipe(delay(this.delay));
  }

  updateUser(id: number, updates: Partial<User>): Observable<User | undefined> {
    return of(this.fakeDataService.updateUser(id, updates)).pipe(delay(this.delay));
  }

  deleteUser(id: number): Observable<boolean> {
    return of(this.fakeDataService.deleteUser(id)).pipe(delay(this.delay));
  }

  deactivateUser(id: number): Observable<User | undefined> {
    return of(this.fakeDataService.updateUser(id, { isActive: false })).pipe(delay(this.delay));
  }

  activateUser(id: number): Observable<User | undefined> {
    return of(this.fakeDataService.updateUser(id, { isActive: true })).pipe(delay(this.delay));
  }
}
