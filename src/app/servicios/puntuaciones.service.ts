import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class PuntuacionesService {
  private url = 'http://localhost:8001/api/v1/videos';

  constructor(private http: HttpClient, private cookie:CookieService) { }

  puntuar(videoId: number, userId: number, valora: number): Observable<any> {
    const url = `${this.url}/${videoId}/puntuar`;
    const body = { user_id: userId, valora: valora };
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken') 
      })
    }
    return this.http.post(url, body, httpOptions);
  }

  editarPuntuacion(idPuntua: number, valora: number): Observable<any> {
    const url = `${this.url}/puntuar/${idPuntua}`;
    const body = { valora: valora };
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    }
    return this.http.post(url, body, httpOptions);
  }

  quitarPuntuacion(idPuntua: number): Observable<any> {
    const url = `${this.url}/puntuar/${idPuntua}`;
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken') 
      })
    }
    return this.http.delete(url, httpOptions);
  }
}
