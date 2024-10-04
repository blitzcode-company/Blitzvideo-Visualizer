import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SuscripcionesService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cookie: CookieService) {}

  suscribirse(userId: number, canalId: number): Observable<any> {
    const body = { user_id: userId }
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    const url = `${this.apiUrl}api/v1/canal/${canalId}/suscripcion`;
    return this.http.post<any>(url, body, httpOptions);
}

anularSuscripcion(userId: number, canalId: number): Observable<any> {
  const url = `${this.apiUrl}api/v1/canal/${canalId}/suscripcion`;
  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': 'Bearer ' + this.cookie.get('accessToken')
    })
  };
  return this.http.delete<any>(url, { ...httpOptions, params: { user_id: userId.toString() } });
}

verificarSuscripcion(userId: number, canalId: number): Observable<any> {
  const url = `${this.apiUrl}api/v1/canal/${canalId}/suscripcion`; 
  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': 'Bearer ' + this.cookie.get('accessToken')
    }),
    params: { user_id: userId.toString()}
  };
  return this.http.get<any>(url, httpOptions);
}

listarSuscripciones(userId: number): Observable<any> {
  const url = `${this.apiUrl}api/v1/canal/usuario/${userId}/suscripciones`; 
  return this.http.get<any[]>(url);

}

listarNumeroDeSuscriptores(canalId: number): Observable<any> {
  const url = `${this.apiUrl}api/v1/canal/${canalId}/suscripciones/count`; 
  return this.http.get<any[]>(url);

}

}
