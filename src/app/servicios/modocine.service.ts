import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ModocineService {

  private cinemaModeSubject: BehaviorSubject<boolean>;
  private storageKey = 'cinemaMode';

  constructor() {
    const storedCinemaMode = localStorage.getItem(this.storageKey);
    const initialCinemaMode = storedCinemaMode ? JSON.parse(storedCinemaMode) : false;
    this.cinemaModeSubject = new BehaviorSubject<boolean>(initialCinemaMode);
  }

  getCinemaMode(): Observable<boolean> {
    return this.cinemaModeSubject.asObservable();
  }

  getCinemaModeValue(): boolean {
    const value = this.cinemaModeSubject.getValue();
    return value;
  }

  setCinemaMode(enabled: boolean): void {
    localStorage.setItem(this.storageKey, JSON.stringify(enabled));
    this.cinemaModeSubject.next(enabled);
  }
  
}
