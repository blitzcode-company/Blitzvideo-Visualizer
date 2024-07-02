import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Videos } from '../clases/videos';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideosService {

  private apiUrl = environment.apiUrl;
  constructor(private httpClient: HttpClient, private cookie:CookieService) { }

  listarVideos():Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiUrl}api/v1/videos/`;
    return this.httpClient.get<Videos>(url, httpOptions);
  }

  obtenerInformacionVideo(idVideo: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiUrl}api/v1/videos/${idVideo}`;
    return this.httpClient.get(url, httpOptions);
  }

  listarVideosPorNombre(nombre:any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiUrl}api/v1/videos/nombre/${nombre}`;
    return this.httpClient.get<any[]>(url, httpOptions);
  }

  
  contarVisita(idVideo: any, userId: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken') 
      })
    }
    const url = `${this.apiUrl}api/v1/usuario/${userId}/visita/${idVideo}`;
    return this.httpClient.get(url, httpOptions);
  }

  contarVisitaInvitado(idVideo: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiUrl}api/v1/invitado/visita/${idVideo}`;
    return this.httpClient.get(url, httpOptions);
  }

}
