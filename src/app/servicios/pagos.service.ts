import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private http: HttpClient, private cookie:CookieService) { }

  private apiUrl = environment.pagosApi;


  procesarPago(token: string, nombre: string, email: string, direccion: any, userId: any): Observable<any> {
    const url = `${this.apiUrl}api/v1/stripe/procesar-pago`;
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
      })
    };
    const body = {
      stripeToken: token,
      nombre: nombre,
      email: email,
      direccion: direccion,
      user_id: userId,
      accessToken: this.cookie.get('accessToken')
    };
    return this.http.post(url, body, httpOptions); 
}

}
