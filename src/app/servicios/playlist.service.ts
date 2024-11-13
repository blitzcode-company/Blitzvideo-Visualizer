import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cookie: CookieService) {}

  obtenerListasDeReproduccion(userId: number): Observable<any[]> {
    const url = `${this.apiUrl}api/v1/playlists/${userId}/playlists`;
    
    return this.http.get<any>(url).pipe(
      map(response => response.playlists || []) 
    );
  }

  obtenerPlaylistConVideos(playlistId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/playlists/${playlistId}`;
    return this.http.get<any>(url);
  }

  crearLista(nombre: string, acceso: boolean, userId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/playlists`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.post(url, { nombre, acceso, user_id: userId }, httpOptions);
  }

  quitarVideoDePlaylist(playlistId: number, videoId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/playlists/${playlistId}/videos`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      }),
      body: { video_id: videoId } 
    };

    return this.http.delete(url, httpOptions);
  }

  borrarPlaylist(playlistId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/playlists/${playlistId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.delete(url, httpOptions);
  }

  modificarPlaylist(playlistId: number, nombre: string, acceso: boolean): Observable<any> {
    const url = `${this.apiUrl}api/v1/playlists/${playlistId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.put(url, { nombre, acceso }, httpOptions);
  }

  agregarVideoALista(playlistId: number, videoId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/playlists/${playlistId}/videos`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.post(url, { video_ids: [videoId] }, httpOptions);
  }
}
