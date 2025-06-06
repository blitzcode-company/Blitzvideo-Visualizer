import { Component } from '@angular/core';
import { PlaylistService } from '../../servicios/playlist.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { StatusService } from '../../servicios/status.service';
import { AuthService } from '../../servicios/auth.service';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-contenido-lista-de-reproduccion',
  templateUrl: './contenido-lista-de-reproduccion.component.html',
  styleUrls: ['./contenido-lista-de-reproduccion.component.css'] 
})
export class ContenidoListaDeReproduccionComponent {
  playlistId: any;
  userId: any;
  usuario: any;
  canales: any;
  playlist: any;
  videos: any[] = [];
  serverIp = environment.serverIp;
  fromPlaylist: boolean = false; 
  videoId: number | null = null; 

  private userSubscription: Subscription = new Subscription();

  constructor(
    private playlistService: PlaylistService, 
    private route: ActivatedRoute,
    private authService: AuthService,
    private titleService: Title,
    private suscripcionService: SuscripcionesService,
    private snackBar: MatSnackBar,
    private router: Router,
    public status: StatusService
  ) {}

  ngOnInit(): void {
    this.playlistId = this.route.snapshot.params['id'];
    console.log('playlistId desde URL:', this.playlistId);  
    this.obtenerPlaylistConVideos();
    this.obtenerUsuario();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  obtenerUsuario(): void {
    this.userSubscription = this.authService.usuario$.subscribe(res => {
      if (res) {
        this.usuario = res;
        this.userId = this.usuario.id;
        this.mostrarCanalesSuscritos();
      } 
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }

  quitarVideo(playlistId: number, videoId: number): void {
    this.playlistService.quitarVideoDePlaylist(playlistId, videoId).subscribe(
      response => {
        this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
        this.obtenerPlaylistConVideos();
      },
      error => {
        console.error('Error al quitar video de la playlist:', error);
        this.snackBar.open('Error al quitar video de la playlist.', 'Cerrar', { duration: 3000 });
      }
    );
  }

  mostrarCanalesSuscritos(): void {
    if (this.userId) {
      this.suscripcionService.listarSuscripciones(this.userId).subscribe(
        suscripciones => {
          this.canales = suscripciones.map((suscripcion: any) => suscripcion.canal);
        },
        error => {
          console.error('Error al obtener listas de suscripciones', error);
        }
      );
    } 
  }

  obtenerPlaylistConVideos(): void {
    this.playlistService.obtenerPlaylistConVideos(this.playlistId, this.videoId || 0, this.fromPlaylist).subscribe(data => {
      if (data) {
        this.playlist = data.playlist;
        this.videos = data.videos;

        if (data.videos) {
          this.videoId = data.videos.id;
        }

        this.titleService.setTitle(`${this.playlist?.nombre} - BlitzVideo`);
      } else {
        console.error('Los datos de la playlist son null o undefined');
      }
    }, error => {
      console.error('Error al obtener la playlist con videos', error);
    });
  }

  verVideo(videoId: number): void {
    // Verifica que playlistId está siendo enviado correctamente
    console.log('Enviando playlistId:', this.playlistId);

    this.router.navigate(['/video', videoId], {
      state: { playlistId: this.playlistId }  // Pasas el playlistId al estado
    });
  }


}
