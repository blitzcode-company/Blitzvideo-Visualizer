import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { CookieService } from 'ngx-cookie-service';
import { environment } from './environments/environment';

declare const window: any;

export function initEcho(cookieService: CookieService): Echo<any> {
  const token = cookieService.get('accessToken');
  
  console.log('[ECHO] Token obtenido:', token ? 'Token presente' : 'NO HAY TOKEN');
  console.log('[ECHO] AuthEndpoint:', `${environment.apiUrl}broadcasting/auth`);
  
  Pusher.logToConsole = true;
  
  window.Pusher = Pusher;

  const echo = new Echo({
    broadcaster: 'pusher',
    key: 'blitzvideo-key',
    cluster: 'mt1',
    wsHost: '172.18.0.17',
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws'],
    authEndpoint: `${environment.apiUrl}broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    }
  });

  console.log('[ECHO] Echo instance created:', echo);
  console.log('[ECHO] Echo connector:', echo.connector);

  return echo;
}