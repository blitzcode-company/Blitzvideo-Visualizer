import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, Event as NavigationEvent } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-bar',
  standalone: false,
  templateUrl: './loading-bar.component.html',
  styleUrl: './loading-bar.component.css'
})
export class LoadingBarComponent {
  progress = 0;
  isBouncing = false;
  private interval: any;
  private routerSubscription: Subscription;

  constructor(private router: Router) {
    this.routerSubscription = this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationEnd) {
        this.startLoading();

        // Simula fin de carga rápido (puedes quitar esto si usas el interceptor HTTP)
        setTimeout(() => this.complete(), 400);
      }
    });
  }

startLoading() {
    this.progress = 0;
    this.isBouncing = false;
    clearInterval(this.interval);

    let step = 0;
    this.interval = setInterval(() => {
      if (step < 30) this.progress += 5 + Math.random() * 3;
      else if (step < 70) this.progress += 1 + Math.random();
      else if (step < 90) this.progress += 0.3;
      else clearInterval(this.interval);

      this.progress = Math.min(this.progress, 95); 
      step++;
    }, 100);
  }

complete() {
  clearInterval(this.interval);
  this.progress = 100;
  this.isBouncing = true;

  setTimeout(() => {
    const bar = document.querySelector('.loading-bar') as HTMLElement;
    if (bar) bar.classList.add('intenso');
  }, 100);

  setTimeout(() => {
    this.isBouncing = false;
    this.progress = 0;
  }, 650);
}
  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    clearInterval(this.interval);
  }



}
