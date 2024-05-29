import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Videos } from '../clases/videos';


@Injectable({
  providedIn: 'root'
})
export class VideosService {

  
  private api = 'http://localhost:8001/api/v1/videos/'

  constructor(private httpClient: HttpClient) { }

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
          'Authorization' : 'Bearer ' + localStorage.getItem("accessToken") 
      })
    }
    const url = `${this.api}${idVideo}/info`;
    return this.httpClient.post(url, httpOptions); 
   }

   eliminarVideo(idVideo: any): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + localStorage.getItem("accessToken") 
      })
    }
    const url = `${this.api}${idVideo}`;
    return this.httpClient.delete(url, httpOptions);
  }

  editarVideo(idVideo: string, video: Videos): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + localStorage.getItem("accessToken") 
      })
    }

    const url = `${this.api}editar/${idVideo}`;
    return this.httpClient.post(url, video, httpOptions);
  }


  listarVideosPorNombre(nombre:any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + localStorage.getItem("accessToken") 
      })
    }

    const url = `${this.api}buscar/${nombre}`;
    return this.httpClient.get(url, httpOptions);
  }

}
