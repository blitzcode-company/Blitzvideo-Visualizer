import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingBarService {
  private progress = new BehaviorSubject<number>(0);
  public progress$ = this.progress.asObservable();

  start() {
    this.progress.next(0);
    let value = 0;
    const interval = setInterval(() => {
      if (value < 70) value += 5 + Math.random() * 10;
      else if (value < 90) value += 0.5 + Math.random();
      else clearInterval(interval);
      this.progress.next(Math.min(value, 90));
    }, 150);
  }

  complete() {
    this.progress.next(100);
    setTimeout(() => this.progress.next(0), 400);
  }
}