import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PuntuacionesService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cookie: CookieService) {}

  obtenerPuntuacionActual(videoId: number, userId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    const url = `${this.apiUrl}api/v1/videos/${videoId}/puntuacion/${userId}`;
    return this.http.get(url, httpOptions);
  }

  puntuar(videoId: number, userId: number, valora: number): Observable<any> {
    const body = { user_id: userId, valora: valora };
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    const url = `${this.apiUrl}api/v1/videos/${videoId}/puntuacion`;
    return this.http.post(url, body, httpOptions);
  }

  editarPuntuacion(idPuntua: number, valora: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/puntuacion/${idPuntua}`;
    const body = { valora: valora };
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.post(url, body, httpOptions);
  }

  quitarPuntuacion(videoId: number, userId: number, valora: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/${videoId}/puntuacion`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      }),
      body: { user_id: userId, valora: valora }
    };
    return this.http.delete(url, httpOptions);
  }
}