import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoplayService {

  private readonly storageKey = 'autoplay';
  private autoplaySubject: BehaviorSubject<boolean>;

  constructor() {
    const storedValue = localStorage.getItem(this.storageKey);
    const initialValue = storedValue ? JSON.parse(storedValue) : false;
    this.autoplaySubject = new BehaviorSubject<boolean>(initialValue);
  }

  getAutoplay(): Observable<boolean> {
    return this.autoplaySubject.asObservable();
  }

  getAutoplayValue(): boolean {
    return this.autoplaySubject.getValue();
  }

  setAutoplay(enabled: boolean): void {
    console.log('Guardando autoplay:', enabled);
    localStorage.setItem(this.storageKey, JSON.stringify(enabled));
    this.autoplaySubject.next(enabled);
  }
}
