import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cookie: CookieService) { }

  crearReporteVideo(data: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.post(`${this.apiUrl}api/v1/reporte/`, data, httpOptions);
  }

  crearReporteUsuario(data: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.post(`${this.apiUrl}api/v1/reporte/usuario`, data, httpOptions);
  }

  crearReporteComentario(data: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.post(`${this.apiUrl}api/v1/reporte/comentario`, data, httpOptions);
  }

}
