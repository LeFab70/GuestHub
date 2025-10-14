import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private refreshTrigger = new BehaviorSubject<boolean>(false);
  public refresh$ = this.refreshTrigger.asObservable();

  // Auto-refresh every 30 seconds
  private autoRefresh$ = interval(30000).pipe(
    startWith(0),
    switchMap(() => this.refreshTrigger.asObservable())
  );

  constructor() {
    // Start auto-refresh
    this.autoRefresh$.subscribe(() => {
      this.triggerRefresh();
    });
  }

  triggerRefresh() {
    this.refreshTrigger.next(true);
  }

  // Method to refresh specific data
  refreshEmployees() {
    this.triggerRefresh();
  }

  refreshDepartments() {
    this.triggerRefresh();
  }

  refreshVisitors() {
    this.triggerRefresh();
  }

  refreshVisits() {
    this.triggerRefresh();
  }

  refreshUsers() {
    this.triggerRefresh();
  }

  refreshBadges() {
    this.triggerRefresh();
  }
}
