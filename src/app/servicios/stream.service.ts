import { Injectable } from '@angular/core';
import { Observable, throwError, of} from 'rxjs';
import { catchError, delay, retryWhen, take } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Streams } from '../clases/streams';


@Injectable({
  providedIn: 'root'
})
export class StreamService {

  private apiUrl = environment.apiUrl;
  constructor(private httpClient: HttpClient, private cookie:CookieService) { }

  listarStreams():Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiUrl}api/v1/streams/`;
    return this.httpClient.get<Streams>(url, httpOptions);
  }

  obtenerInformacionStreams(idStream: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiUrl}api/v1/streams/${idStream}`;
    return this.httpClient.get(url, httpOptions).pipe(
      catchError(error => {
        if (error.status === 403) {
          return throwError('El stream está bloqueado y no se puede acceder.');
        }
        return throwError(error);
      })
    );
  
  }

  heartbeat(streamId: number | string, viewerId: string | number) {
    return this.httpClient.get(`${this.apiUrl}api/v1/streams/${streamId}/heartbeat`, {
      params: { user_id: viewerId }
    });
  }

    entrarView(streamId: number) {
    const url = `${this.apiUrl}api/v1/streams/${streamId}/entrar`;

    return this.httpClient.post(url, {});
    }

    salirView(streamId: number) {
      const url = `${this.apiUrl}api/v1/streams/${streamId}/salir`;

      return this.httpClient.post(url, {});
    }

  obtenerInformacionRTMP(idCanal: any, userId: number): Observable<any> {
    const params = new HttpParams().set('user_id', userId.toString());
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.cookie.get('accessToken')
        }),
        params: params
    };
    const url = `${this.apiUrl}api/v1/streams/canal/${idCanal}`;
    return this.httpClient.get<any>(url, httpOptions);
}

}
