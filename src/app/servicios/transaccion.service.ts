import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {

  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient, private cookie:CookieService) { }

  registrarPlan(userId: number, plan: string, metodoDePago: string, suscripcionId: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
      })
    };
    
    const data = {
      user_id: userId,
      plan: plan,
      metodo_de_pago: metodoDePago,
      suscripcion_id: suscripcionId
    };

    return this.http.post(`${this.apiUrl}api/v1/transaccion/plan`, data, httpOptions);
  }

  listarPlan(userId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
      })
    };
    return this.http.get(`${this.apiUrl}api/v1/transaccion/plan/usuario/${userId}`, httpOptions);
  }

  bajaPlan(userId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
      })
    };
    return this.http.delete(`${this.apiUrl}api/v1/transaccion/plan/usuario/${userId}`, httpOptions);
  }

}
