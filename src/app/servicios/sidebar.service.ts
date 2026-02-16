import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarCollapsedSubject: BehaviorSubject<boolean>;
  public sidebarCollapsed$: Observable<boolean>;

  constructor() {
    const savedState = localStorage.getItem('sidebarCollapsed') === 'true';
    this.sidebarCollapsedSubject = new BehaviorSubject<boolean>(savedState);
    this.sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();
  }

  toggleSidebar(): void {
    const newState = !this.sidebarCollapsedSubject.value;
    this.sidebarCollapsedSubject.next(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  }

  getSidebarState(): boolean {
    return this.sidebarCollapsedSubject.value;
  }

  setSidebarState(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }
}
