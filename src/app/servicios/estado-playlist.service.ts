import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EstadoPlaylistService {

  private playlistActual: any = null;

  establecerPlaylist(playlist: any) {
    this.playlistActual = playlist;
    sessionStorage.setItem('playlistActual', JSON.stringify(playlist));
  }

  obtenerPlaylist() {
    if (!this.playlistActual) {
      const data = sessionStorage.getItem('playlistActual');
      this.playlistActual = data ? JSON.parse(data) : null;
    }
    return this.playlistActual;
  }

  borrar() {
    this.playlistActual = null;
    sessionStorage.removeItem('playlistActual');
  }

}
