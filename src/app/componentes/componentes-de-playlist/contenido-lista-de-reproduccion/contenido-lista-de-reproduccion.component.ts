import { Component } from '@angular/core';
import { PlaylistService } from '../../../servicios/playlist.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { StatusService } from '../../../servicios/status.service';
import { AuthService } from '../../../servicios/auth.service';
import { SuscripcionesService } from '../../../servicios/suscripciones.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Playlist } from '../../../clases/playlist';
import { Videos } from '../../../clases/videos';
import { UsuarioGlobalService } from '../../../servicios/usuario-global.service';
import { EstadoPlaylistService } from '../../../servicios/estado-playlist.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';
import { take, filter, first } from 'rxjs';


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
  sidebarVisible: boolean = true;
  usuarioConCanal: any;
  hoveredIndex: number | null = null;
  menuOpenIndex: number | null = null;
  esMiPlaylist = false;
  idCanal: any;
  guardando = false;
  isDragging = false;
  isMobile = false;
  yaGuardada = false;
  error403 = false;
loading = true;

  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;

  private userSubscription: Subscription = new Subscription();

  constructor(
    private playlistService: PlaylistService, 
    private estadoPlaylist: EstadoPlaylistService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,

    private authService: AuthService,
    private usuarioGlobal: UsuarioGlobalService,
    private titleService: Title,
    private suscripcionService: SuscripcionesService,
    private snackBar: MatSnackBar,
    private router: Router,
    public status: StatusService
  ) {}

  ngOnInit(): void {
    this.playlistId = this.route.snapshot.params['id'];
    console.log('playlistId desde URL:', this.playlistId);  

this.usuarioGlobal.usuario$
  .pipe(take(2))
  .subscribe(usuario => {
    const userId = usuario ? usuario.id : null;
    this.cargarPlaylist(userId);
  });
    this.checkMobile();
  }


  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 767;
  }

  obtenerUsuario(): void {
    this.userSubscription = this.authService.usuario$.subscribe(res => {
      if (res) {
        this.usuario = res;
        this.userId = this.usuario.id;
        
      } 
      
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }


  drop(event: CdkDragDrop<Videos[]>) {
    if (!this.esMiPlaylist) return;
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.videos, event.previousIndex, event.currentIndex);

    const nuevoOrden = this.videos.map((v, i) => ({
      video_id: v.id,
      orden: i + 1
    }));

    this.playlistService.actualizarOrdenVideos(this.playlistId, nuevoOrden).subscribe({
      next: () => {
        this.snackBar.open('Orden actualizado', 'OK', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Error al guardar orden', 'Cerrar', { duration: 3000 });
      }
    });

    this.cdr.detectChanges();
  }



  guardarPlaylist(): void {
    if (!this.userId) return;

    this.guardando = true;

    this.playlistService.guardarPlaylist(this.playlist.id, this.userId).subscribe({
      next: () => {
        this.guardando = false;
        this.yaGuardada = true;
        this.snackBar.open('Guardada en tus listas', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.guardando = false;
        this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 4000 });
      }
    });
  }


  


  onImageError(event: any) {
    event.target.src = 'assets/images/video-default.png';
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }



  quitarVideo(playlistId: number, videoId: number): void {
    this.playlistService.quitarVideoDePlaylist(playlistId, videoId).subscribe(
      response => {
        this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
      },
      error => {
        console.error('Error al quitar video de la playlist:', error);
        this.snackBar.open('Error al quitar video de la playlist.', 'Cerrar', { duration: 3000 });
      }
    );
  }

  showActions(index: number): void {
      this.hoveredIndex = index;
    }

    hideActions(): void {
      this.hoveredIndex = null;
    }

    toggleMenu(index: number, event: Event): void {
      event.stopPropagation();
      this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
    }

    closeMenu(): void {
      this.menuOpenIndex = null;
    }

    quitarDeGuardadas(): void {
      this.guardando = true;

      this.playlistService.quitarPlaylistGuardada(this.playlist.id, this.userId).subscribe({
        next: () => {
          this.guardando = false;
          this.yaGuardada = false;
          this.snackBar.open('Quitada de tus listas', 'OK', { duration: 3000 });
        },
        error: () => {
          this.guardando = false;
          this.snackBar.open('Error', 'Cerrar', { duration: 4000 });
        }
      });
    }

    playlistNotFound: boolean = false;
private cargarPlaylist(userId: number | null): void {

  this.loading = true;
  this.error403 = false;
  this.playlist = null;
  this.videos = [];

  this.playlistService.obtenerPlaylistConVideos(
    this.playlistId,
    this.videoId || 0,
    this.fromPlaylist,
    userId
  ).subscribe({

    next: (data) => {

      this.loading = false;

      if (!data?.data?.playlist) {
        this.playlist = null;
        return;
      }

      this.playlist = new Playlist(data.data.playlist);
      this.videos = data.data.videos.map((v: any) => new Videos(v));

      this.esMiPlaylist = this.playlist.user_id === userId;

      if (!this.esMiPlaylist && userId) {
        this.playlistService.estaGuardada(this.playlist.id, userId).subscribe(res => {
          this.yaGuardada = res.guardada;
        });
      }

      if (!this.fromPlaylist && this.videos.length > 0) {
        this.videoId = this.videos[0].id;
      }

      this.titleService.setTitle(`${this.playlist.nombre} - BlitzVideo`);
    },

    error: (err) => {
      console.error('Error al cargar playlist:', err);

      this.loading = false; 

      if (err.status === 403) {
        this.error403 = true;
        this.playlist = null;
        this.videos = [];
        return;
      }
        if (err.status === 404) {
        this.playlistNotFound = true;
        this.playlist = null;
        this.videos = [];
        return;
      }

    }
  });
}


  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }

  verVideo(videoId: number, playlistId: number): void {
    const playlistData = {
      id: this.playlist.id,
      nombre: this.playlist.nombre,
      videos: this.videos.map(v => ({
        id: v.id,
        titulo: v.titulo,
        miniatura: v.miniatura,
        duracion: v.duracion,
        duracionFormateadaPlaylist: this.convertirDuracion(v.duracion)
      }))
    };
  
    this.estadoPlaylist.establecerPlaylist(playlistData);
    
    localStorage.setItem('currentPlaylistData', JSON.stringify(playlistData));
    localStorage.setItem('fromPlaylist', 'true');
    
    this.router.navigate(['/video', videoId, 'playlist', playlistId], {
      state: { 
        fromPlaylist: true,
        playlistId: this.playlist.id,
        playlistNombre: this.playlist.nombre
      }
    });
  }


}
