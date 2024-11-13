import { Injectable } from '@angular/core';
import { Observable, throwError, of} from 'rxjs';
import { catchError, delay, retryWhen, take } from 'rxjs/operators';
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
    return this.httpClient.get(url, httpOptions).pipe(
      catchError(error => {
        if (error.status === 403) {
          return throwError('El video está bloqueado y no se puede acceder.');
        }
        return throwError(error);
      })
    );
  
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
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cookie.get('accessToken') 
      })
    };
    const url = `${this.apiUrl}api/v1/usuario/${userId}/visita/${idVideo}`;
  
    return this.httpClient.get(url, httpOptions).pipe(
      retryWhen(errors =>
        errors.pipe(
          delay(1000),
          take(3) 
        )
      ),
      catchError(error => {
        if (error.status === 429) {
          console.error('Demasiadas solicitudes. Intenta más tarde.');
        }
        return of(null);
      })
    );
  }

  contarVisitaInvitado(idVideo: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = `${this.apiUrl}api/v1/invitado/visita/${idVideo}`;
  
    return this.httpClient.get(url, httpOptions).pipe(
      retryWhen(errors =>
        errors.pipe(
          delay(1000),
          take(3)
        )
      ),
      catchError(error => {
        if (error.status === 429) {
          console.error('Demasiadas solicitudes. Intenta más tarde.');
        }
        return of(null);
      })
    );
  }

}
