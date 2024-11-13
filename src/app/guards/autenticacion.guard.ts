import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

export const autenticacionGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);
  const serverIp = environment.serverIp;


  if (cookieService.get("accessToken") === '') {
    window.location.href = `${serverIp}3002/`;
    return false;
  }
  return true;
}