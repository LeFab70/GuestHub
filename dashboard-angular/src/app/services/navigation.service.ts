import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private activeTabSubject = new BehaviorSubject<string>('overview');
  public activeTab$ = this.activeTabSubject.asObservable();

  setActiveTab(tab: string) {
    this.activeTabSubject.next(tab);
  }

  getActiveTab(): string {
    return this.activeTabSubject.value;
  }
}
