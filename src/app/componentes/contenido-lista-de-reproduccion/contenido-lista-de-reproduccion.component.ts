import { Component } from '@angular/core';
import { PlaylistService } from '../../servicios/playlist.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contenido-lista-de-reproduccion',
  templateUrl: './contenido-lista-de-reproduccion.component.html',
  styleUrl: './contenido-lista-de-reproduccion.component.css'
})
export class ContenidoListaDeReproduccionComponent {

  playlistId: any;
  playlist: any;
  videos: any[] = [];
  serverIp = environment.serverIp;

  constructor(private playlistService: PlaylistService, private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.playlistId = this.route.snapshot.params['id'];
    this.obtenerPlaylistConVideos();
  }

  obtenerPlaylistConVideos(): void {
    this.playlistService.obtenerPlaylistConVideos(this.playlistId).subscribe(data => {
      console.log('Datos recibidos en el componente:', data); 
      this.playlist = data.playlist;
      this.videos = data.videos;
    }, error => {
      console.error('Error al obtener la playlist con videos', error);
    });
  }
}
