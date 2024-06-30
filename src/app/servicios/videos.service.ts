import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Videos } from '../clases/videos';
import { CookieService } from 'ngx-cookie-service';
import moment from 'moment'; 

@Injectable({
  providedIn: 'root'
})
export class VideosService {

  
  private api = 'http://localhost:8001/api/v1/videos/'
  private apiVisita = 'http://localhost:8001/api/v1/usuario'
  private apiVisitaInvitado = 'http://localhost:8001/api/v1/invitado'


  constructor(private httpClient: HttpClient, private cookie:CookieService) { }

  listarVideos():Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.api}`;
    return this.httpClient.get<Videos>(url, httpOptions);
  }

  obtenerInformacionVideo(idVideo: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }

    const url = `${this.api}${idVideo}`;
    return this.httpClient.get(url, httpOptions);
  }


  subirVideo(idVideo:any, video:Videos): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'multipart/form-data',
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    }
    const url = `${this.api}${idVideo}/info`;
    return this.httpClient.post(url, httpOptions); 
   }

   eliminarVideo(idVideo: any): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken') 
      })
    }
    const url = `${this.api}${idVideo}`;
    return this.httpClient.delete(url, httpOptions);
  }

  editarVideo(idVideo: string, video: Videos): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    }

    const url = `${this.api}editar/${idVideo}`;
    return this.httpClient.post(url, video, httpOptions);
  }


  listarVideosPorNombre(nombre:any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }

    const url = `${this.api}nombre/${nombre}`;
    return this.httpClient.get<any[]>(url, httpOptions);
  }

  
  contarVisita(idVideo: any, userId: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken') 
      })
    }
    const url = `${this.apiVisita}/${userId}/visita/${idVideo}`;
    

    return this.httpClient.get(url, httpOptions);

  }

  contarVisitaInvitado(idVideo: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
      })
    }
    const url = `${this.apiVisitaInvitado}/visita/${idVideo}`;
    

    return this.httpClient.get(url, httpOptions);

  }

}
