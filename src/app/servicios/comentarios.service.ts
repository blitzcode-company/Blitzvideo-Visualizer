import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {

  private urlComentarios = 'http://localhost:8001/api/v1/videos'



  constructor(private http: HttpClient) { }

  traerComentariosDelVideo(idVideo: any): Observable<any> {
    const url = `${this.urlComentarios}/${idVideo}/comentarios`
    return this.http.get<any[]>(url)
  }

  crearComentario(idVideo: any, comentario:any): Observable<any> {
    const url = `${this.urlComentarios}/${idVideo}/comentarios`
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + localStorage.getItem("accessToken") 

      })
    }

    return this.http.post<any[]>(url, comentario, httpOptions)
  }

  responderComentario(idComentario: any, respuesta:any): Observable<any> {
    const url = `${this.urlComentarios}/comentarios/respuesta/${idComentario}`
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + localStorage.getItem("accessToken") 

      })
    }
    return this.http.post(url, respuesta, httpOptions)
  }

  editarComentario(idComentario: any, respuesta:any): Observable<any> {
    const url = `${this.urlComentarios}/comentarios/${idComentario}`
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + localStorage.getItem("accessToken") 

      })
    }
    return this.http.post(url, respuesta, httpOptions)
  }


 


}
