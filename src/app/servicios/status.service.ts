import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service'; 
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  public isLoggedIn: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private cookie: CookieService,
    private authService: AuthService
  ) {
    if (this.cookie.check('accessToken')) {
      this.isLoggedIn = true;
    }

    // Sincronizar con authService.usuario$
    this.subscription.add(
      this.authService.usuario$.subscribe(user => {
        this.isLoggedIn = !!user;
      })
    );
  }

  // Limpieza de suscripciones
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}