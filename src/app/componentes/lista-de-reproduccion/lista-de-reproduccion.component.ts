import { Component, OnInit, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import { PlaylistService } from '../../servicios/playlist.service';
import { AuthService } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { StatusService } from '../../servicios/status.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalEditarlistaComponent } from '../modal-editarlista/modal-editarlista.component';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { Videos } from '../../clases/videos';
import { CrearListaComponent } from '../crear-lista/crear-lista.component';
import { EstadoPlaylistService } from '../../servicios/estado-playlist.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-lista-de-reproduccion',
  templateUrl: './lista-de-reproduccion.component.html',
  styleUrls: ['./lista-de-reproduccion.component.css'],
})
export class ListaDeReproduccionComponent implements OnInit, OnDestroy {

  userId: any;
  listas: any[] = [];
  usuarioSubscription: Subscription | undefined;
  serverIp = environment.serverIp;
  usuario: any;
  canales: any;
  showMenuIndex: number | null = null; 
  usuarioConCanal:any;
  idCanal:any;
  loading = true;

  pestana: 'creadas' | 'guardadas' = 'creadas';
  listasCreadas: any[] = [];
  listasGuardadas: any[] = [];
  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,

    private titleService: Title,
    public status:StatusService,
    private usuarioGlobal: UsuarioGlobalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private playlistState: EstadoPlaylistService,

    private suscripcionService: SuscripcionesService,
  ) {}

  ngOnInit() {
    this.obtenerUsuario();
    this.titleService.setTitle('Listas de reproduccion - BlitzVideo');

  }

  ngOnDestroy() {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      if (this.usuario) {
        this.userId = this.usuario.id; 
  
        if (this.userId) {
          this.cargarListas(this.userId); 
        }
      } 
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }

  toggleMenu(index: number): void {
    this.showMenuIndex = this.showMenuIndex === index ? null : index;
  }


  onImageError(event: any) {
    event.target.src = 'assets/images/video-default.png';
  }
  

quitarDeGuardadas(playlistId: number): void {
  this.playlistService.quitarPlaylistGuardada(playlistId, this.userId).subscribe({
    next: () => {
      this.snackBar.open('Quitada de guardadas', 'OK', { duration: 3000 });
      this.cargarListas(this.userId);
    },
    error: () => {
      this.snackBar.open('Error', 'Cerrar', { duration: 4000 });
    }
  });
}

cargarListas(userId: number): void {
  this.loading = true;

  this.playlistService.obtenerListasDeReproduccion(userId).subscribe({
    next: (listas: any[]) => {
      this.listasCreadas = this.procesarListas(listas);
      this.actualizarLista();
    }
  });

  this.playlistService.obtenerPlaylistsGuardadasDeUsuario(userId).subscribe({
    next: (res: any) => {
      this.listasGuardadas = this.procesarListas(res.data.playlists);
      this.actualizarLista();
    }
  });
}

procesarListas(listas: any[]): any[] {
  return listas.map(lista => ({
    ...lista,
    videos: lista.videos || [],
    imagenesMosaico: this.obtenerMosaicoVideos(lista.videos)
  }));
}

actualizarLista(): void {
  this.listas = this.pestana === 'creadas' ? this.listasCreadas : this.listasGuardadas;
  this.loading = false;
}

  obtenerMosaicoVideos(videos: Videos[]): string[] {
    if (!videos?.length) return Array(4).fill('assets/images/cover-default.png');
    return videos
      .slice(0, 4)
      .map(v => v.miniatura || 'assets/images/cover-default.png');
  }


  borrarPlaylist(playlistId: number): void {
    if (confirm('¿Estás seguro de que deseas borrar esta playlist?')) {
      this.playlistService.borrarPlaylist(playlistId).subscribe(
        response => {
          this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
          this.cargarListas(this.userId); 
        },
        error => {
          console.error('Error al borrar la playlist:', error);
          this.snackBar.open('Error al borrar la playlist.', 'Cerrar', { duration: 3000 });
        }
      );
    }
  }

  modificarPlaylist(playlistId: number, nuevoNombre: string, nuevoAcceso: boolean): void {
    this.playlistService.modificarPlaylist(playlistId, nuevoNombre, nuevoAcceso).subscribe(
      response => {
        this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
        this.cargarListas(this.userId); 
      },
      error => {
        console.error('Error al modificar la playlist:', error);
        this.snackBar.open('Error al modificar la playlist.', 'Cerrar', { duration: 3000 });
      }
    );
  }

  verPlaylist(playlistId: number): void {
    this.playlistService.obtenerPlaylistConVideos(playlistId, 0, false).subscribe({
      next: (response) => {
        const playlist = response.data.playlist;
        const videos = response.data.playlist.videos ?? [];

        this.playlistState.establecerPlaylist({
          id: playlist.id,
          nombre: playlist.nombre,
          videos: videos
        });
  
        this.router.navigate(['/playlists', playlistId]);
      },
      error: (err) => {
        console.error('Error al cargar playlist:', err);
        this.snackBar.open('Error al abrir playlist', 'Cerrar', { duration: 3000 });
      }
    });
  }


  abrirModalEditar(playlist: any): void {
    const dialogRef = this.dialog.open(ModalEditarlistaComponent, {
      data: { playlist },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarListas(this.userId); 
      }
    });
  }

  abrirModalCrear(videoId?: number): void {
    const dialogRef = this.dialog.open(CrearListaComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { videoId } 
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarListas(this.userId); 
      }
    });
  }
 
  
  private obtenerMiniaturaDelUltimoVideo(videos: any[]): string {
    if (videos.length > 0) {
      const ultimoVideo = videos[videos.length - 1];
      return ultimoVideo.miniatura || 'assets/images/cover-default.png';
    }
    return 'assets/images/cover-default.png';
  }
}
