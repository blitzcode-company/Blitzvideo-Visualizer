import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-lista-de-reproduccion',
  templateUrl: './lista-de-reproduccion.component.html',
  styleUrls: ['./lista-de-reproduccion.component.css']
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
  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService,
    private titleService: Title,
    public status:StatusService,
    private usuarioGlobal: UsuarioGlobalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,

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
          this.obtenerListasDeReproduccion(this.userId); 
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

  obtenerListasDeReproduccion(userId: number) {
    this.playlistService.obtenerListasDeReproduccion(userId).subscribe(
      listas => {
        this.listas = listas.map(lista => ({
          ...lista,
          imagen: this.obtenerMiniaturaDelUltimoVideo(lista.videos)
        }));
      },
      error => {
        console.error('Error al obtener listas de reproducción', error);
      }
    );
  }


  borrarPlaylist(playlistId: number): void {
    if (confirm('¿Estás seguro de que deseas borrar esta playlist?')) {
      this.playlistService.borrarPlaylist(playlistId).subscribe(
        response => {
          this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
          this.obtenerListasDeReproduccion(this.userId); 
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
        this.obtenerListasDeReproduccion(this.userId); 
      },
      error => {
        console.error('Error al modificar la playlist:', error);
        this.snackBar.open('Error al modificar la playlist.', 'Cerrar', { duration: 3000 });
      }
    );
  }


  abrirModalEditar(playlist: any): void {
    const dialogRef = this.dialog.open(ModalEditarlistaComponent, {
      data: { playlist },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerListasDeReproduccion(this.userId); 
      }
    });
  }

 
  
  private obtenerMiniaturaDelUltimoVideo(videos: any[]): string {
    if (videos.length > 0) {
      const ultimoVideo = videos[videos.length - 1];
      return ultimoVideo.miniatura || 'assets/images/miniaturaDefault.png';
    }
    return 'assets/images/miniaturaDefault.png';
  }
}
