import { Injectable } from '@angular/core';
import { Observable, throwError, of} from 'rxjs';
import { catchError, delay, retryWhen, take, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
    const url = `${this.apiUrl}api/v1/videos`;
    return this.httpClient.get<Videos>(url, httpOptions);
  }

  listarVideosPersonalizados(userId:any):Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization': 'Bearer ' + this.cookie.get('accessToken') 

      })
    }
    const url = `${this.apiUrl}api/v1/videos/usuario/${userId}`;
    return this.httpClient.get<Videos>(url, httpOptions);
  }

  listarVideosPorEtiqueta(etiquetaId:any):Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',

      })
    }
    const url = `${this.apiUrl}api/v1/videos/${etiquetaId}/videos/`;
    return this.httpClient.get<Videos>(url, httpOptions);
  }



obtenerInformacionVideo(idVideo: any, canalId?: number): Observable<any> {
  let params = new HttpParams();

  if (canalId) {
    params = params.set('canal_id', canalId.toString());
  }

  const url = `${this.apiUrl}api/v1/videos/${idVideo}`;

  return this.httpClient.get(url, { params }).pipe(
    catchError(error => {
      if (error.status === 403) {
        const mensaje = error.error?.error || 'Acceso restringido.';
        return throwError(() => mensaje);
      }
      return throwError(() => error);
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
  

    listarVideosPorTendencias():Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiUrl}api/v1/videos/tendencia/semana`;
    return this.httpClient.get<Videos>(url, httpOptions);
  }


    listarVideosMasVistos():Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiUrl}api/v1/videos/masvistos`;
    return this.httpClient.get<Videos>(url, httpOptions);
  }


  listarVideosRelacionados(idVideo: any) {
    const url = `${this.apiUrl}api/v1/videos/${idVideo}/relacionados`;


    return this.httpClient.get<any[]>(url);

}


  obtenerPublicidad(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}api/v1/publicidad/`);
  }

  
  contarVisita(idVideo: number, userId: number, progresoSegundos: number = 0, completado: boolean = false): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cookie.get('accessToken') 
      })
    };
    const body = {
      progreso_segundos: progresoSegundos,
      completado: completado
    };
    const url = `${this.apiUrl}api/v1/usuario/${userId}/visita/${idVideo}`;
    console.log('[contarVisita] Calling authenticated endpoint with:', {
      url: url,
      userId: userId,
      idVideo: idVideo,
      hasToken: !!this.cookie.get('accessToken')
    });
  
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



  contarVisitaInvitado(idVideo: number, progresoSegundos: number = 0, completado: boolean = false):Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = `${this.apiUrl}api/v1/invitado/visita/${idVideo}`;
    console.log('[contarVisitaInvitado] Calling guest endpoint with:', {
      url: url,
      idVideo: idVideo
    });
  
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

enviarProgreso(userId: number, videoId: number, segundosVistos: number, duracion?: number): Observable<any> {
  const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cookie.get('accessToken') 
      })
    };

  const payload = {
    user_id: userId,
    video_id: videoId,
    segundos_vistos: segundosVistos,
    duracion
  };

  console.log('[VideosService] Payload exacto antes de enviar:', payload);

  return this.httpClient.post(
    `${this.apiUrl}api/v1/usuario/visitas/progreso`,  
    payload,                        
    httpOptions
  ).pipe(
    tap(res => console.log('[VideosService] Respuesta backend:', res)),
    catchError(err => {
      console.error('[VideosService] Error HTTP:', err);
      return throwError(() => err);
    })
  );
}

obtenerProgresoAnterior(userId: number, videoId: number): Observable<{ progreso: number }> {
  const url = `${this.apiUrl}api/v1/usuario/visitas/progreso/${videoId}`;  // OK, ya tiene /{videoId}

  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.cookie.get('accessToken')
    })
  };

  console.log('[VideosService] Llamando GET progreso:', {
    fullUrl: url + `?user_id=${userId}`,
    videoId,
    userId
  });

  return this.httpClient.get<{ progreso: number }>(url, {
    params: { user_id: userId.toString() },
    headers: httpOptions.headers
  }).pipe(
    tap(res => console.log('[VideosService] Progreso recibido:', res.progreso)),
    catchError(err => {
      console.error('[VideosService] Error en GET progreso:', err);
      return of({ progreso: 0 });
    })
  );
}
}
