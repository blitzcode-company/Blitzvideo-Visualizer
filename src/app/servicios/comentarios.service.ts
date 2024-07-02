import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comentario } from '../clases/comentario';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ComentariosService {

  private apiUrl = environment.apiUrl
  constructor(private http: HttpClient, private cookie:CookieService) { }

  traerComentariosDelVideo(idVideo: any): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/${idVideo}/comentarios`
    return this.http.get<any[]>(url)
  }

  crearComentario(idVideo: any, comentario:any): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/${idVideo}/comentarios`
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    }
    return this.http.post<any[]>(url, comentario, httpOptions)
  }

  responderComentario(idComentario: any, respuesta:any): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/comentarios/respuesta/${idComentario}`
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken') 

      })
    }
    return this.http.post(url, respuesta, httpOptions)
  }

  editarComentario(idComentario: any, respuesta:any): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/comentarios/${idComentario}`
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    }
    return this.http.post(url, respuesta, httpOptions)
  }

}
