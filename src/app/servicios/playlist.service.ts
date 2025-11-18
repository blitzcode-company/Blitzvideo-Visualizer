import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Playlist } from '../clases/playlist';
import { Videos } from '../clases/videos';


interface PlaylistResponse {
  message: string;
  data: {
    playlists: Playlist[];
  };
}



@Injectable({
  providedIn: 'root'
})


export class PlaylistService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cookie: CookieService) {}

  obtenerListasDeReproduccion(userId: number): Observable<Playlist[]> {
    const url = `${this.apiUrl}api/v1/playlists/${userId}/playlists`;
    return this.http.get<PlaylistResponse>(url).pipe(
      map(response => response.data.playlists.map(data => new Playlist(data)))
    );
  }

  obtenerSiguienteVideo(playlistId: number, videoId: number) {
    const url = `${this.apiUrl}api/v1/playlists/${playlistId}/siguiente/${videoId}`;
    console.log('URL GENERADA:', url); 
    return this.http.get(url);
  }

  actualizarOrdenVideos(playlistId: number, orden: any[]) {
    const url = `${this.apiUrl}api/v1/playlists/${playlistId}/orden`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(url, { orden }, httpOptions);
  }


guardarPlaylist(playlistId: number, userId: number) {
  const url = `${this.apiUrl}api/v1/playlists/${playlistId}/guardar`;
  const body = { user_id: userId };
  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
      'Content-Type': 'application/json'
    })
  };
  return this.http.post(url, body, httpOptions);
}

estaGuardada(playlistId: number, userId: number) {
  const url = `${this.apiUrl}api/v1/playlists/${playlistId}/guardada`;
  const params = new HttpParams().set('user_id', userId.toString());
  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': 'Bearer ' + this.cookie.get('accessToken')
    }),
    params
  };
  return this.http.get<{ guardada: boolean }>(url, httpOptions);
}

  obtenerPlaylistsGuardadasDeUsuario(userId: number) {
    const url = `${this.apiUrl}api/v1/playlists/${userId}/playlists-guardadas`;
    return this.http.get(url);
  }

  

 obtenerPlaylistConVideos(playlistId: number, videoId: number, fromPlaylist: boolean): Observable<any> {
    const url = `${this.apiUrl}api/v1/playlists/${playlistId}/videos`;
    const params = new HttpParams()
      .set('video_id', videoId.toString())
      .set('fromPlaylist', fromPlaylist.toString());

    return this.http.get<any>(url, { params }).pipe(
      map(response => ({
        ...response,
        data: {
          playlist: new Playlist({
            ...response.data.playlist,
            videos: response.data.videos,
          }),
        }
      }))
    );
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

  quitarPlaylistGuardada(playlistId: number, userId: number) {
  const url = `${this.apiUrl}api/v1/playlists/${playlistId}/guardar`;
  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': 'Bearer ' + this.cookie.get('accessToken')
    }),
    body: { user_id: userId } // <-- aquí envías el body en DELETE
  };
    return this.http.delete(url, httpOptions);
  }
}
