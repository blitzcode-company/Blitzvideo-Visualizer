import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Comentario } from '../clases/comentario';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators'; 



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

  editarComentario(idComentario: number, mensaje: string, usuario_id: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/comentarios/${idComentario}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, { mensaje, usuario_id }, httpOptions);  
  }

  eliminarComentario(idComentario: number, usuario_id: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/comentarios/${idComentario}`;  // URL para eliminar comentario por ID
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      }),
      body: { usuario_id }  // Pasar usuario_id en el cuerpo de la solicitud
    };
    return this.http.delete(url, httpOptions).pipe(
      catchError(error => {
        console.error('Error en el servicio de eliminación de comentario:', error);
        return throwError(error);
      })
    );
  }

  getEstadoMeGusta(idComentario: number, idUsuario: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/comentarios/${idComentario}/me-gusta?userId=${idUsuario}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };
    return this.http.get<any>(url, httpOptions);
  }

  darMeGusta(idComentario: number, usuarioId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/comentarios/${idComentario}/me-gusta`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };
    const body = { usuario_id: usuarioId };
    return this.http.post(url, body, httpOptions);
  }
  
  quitarMeGusta(idMeGusta: number, usuarioId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/videos/comentarios/me-gusta/${idMeGusta}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };
    const body = { usuario_id: usuarioId };
    return this.http.delete(url, { body, ...httpOptions });
  }
}
