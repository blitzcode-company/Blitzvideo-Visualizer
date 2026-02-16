import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanalService } from '../../../servicios/canal.service';
import { AuthService } from '../../../servicios/auth.service';
import { Videos } from '../../../clases/videos';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { SuscripcionesService } from '../../../servicios/suscripciones.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalReportarUsuarioComponent } from '../../modales/modal-reportar-usuario/modal-reportar-usuario.component';
import { NotificacionesService } from '../../../servicios/notificaciones.service';
import { StatusService } from '../../../servicios/status.service';
import { UsuarioGlobalService } from '../../../servicios/usuario-global.service';
import { PlaylistService } from '../../../servicios/playlist.service';
import { take, filter } from 'rxjs';

@Component({
  selector: 'app-playlist-del-canal',
  templateUrl: './playlist-del-canal.component.html',
  styleUrl: './playlist-del-canal.component.css'
})
export class PlaylistDelCanalComponent {

 usuario: any;
  usuarioCanal:any;
  canal: any = {};
  canalId: any;
  canalNombre: any;
  userId: any;
  mensaje: string = '';
  videos: Videos[] = [];
  public suscrito: string = '';
  cargando: boolean = true;
  numeroDeSuscriptores: any;
  ultimoVideo: any;
  videosGeneral: any;
  notificacionesActivas: boolean = false;
  serverIp = environment.serverIp;
  cargandoNotificacion: boolean = false;
  usuarioConCanal: any;
  idCanal: any;
  canales: any[] = [];
  isMobile = false;
  descripcionLarga = false;
  descripcionExpandida = false;
  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  sidebarVisible: boolean = true;
  tieneContenido: boolean = true;
  playlists: any = { creadas: [], guardadas: [] };


  constructor(
    private canalService: CanalService,
    private route: ActivatedRoute, 
    private usuarioGlobal: UsuarioGlobalService,
    private titleService: Title,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService,
    private notificacionesService: NotificacionesService,
    private playlistsService: PlaylistService,
    public dialog: MatDialog,
    public status: StatusService

  ) {}

  ngOnInit() {
    this.canalId = this.route.snapshot.params['id'];

    this.canal = {};
    this.videos = [];
    this.ultimoVideo = null;
    this.cargando = true;

    this.obtenerCanal(this.canalId);
    this.obtenerUsuario();
    this.checkMobile();

  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 767;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
  }


  obtenerEstadoDeNotificaciones() {
    this.notificacionesService.obtenerEstado(this.canalId, this.userId).subscribe({
      next: (res: any) => this.notificacionesActivas = res.notificaciones,
      error: () => this.notificacionesActivas = false 
    });
  
  }
  
  toggleNotificaciones(): void {
    this.cargandoNotificacion = true;
    this.notificacionesService.cambiarEstado(this.canalId, this.userId, !this.notificacionesActivas).subscribe({
      next: () => {
        this.notificacionesActivas = !this.notificacionesActivas;
        this.cargandoNotificacion = false;
      },
      error: () => this.cargandoNotificacion = false
    });
  }

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      if (this.usuario) { 
        this.userId = this.usuario.id;
        this.obtenerEstadoDeNotificaciones();
        
        this.verificarSuscripcion();
      } 
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }

  toggleSuscripcion(): void {
    const action = this.suscrito === 'suscrito' ? this.anularSuscripcion.bind(this) : this.suscribirse.bind(this);
    action();
  }

  suscribirse(): void {
    this.suscripcionService.suscribirse(this.usuario.id, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción exitosa';
        this.suscrito = 'suscrito'; 
        this.notificacionesService.cambiarEstado(this.canalId, this.usuario.id, true).subscribe(() => {
          this.notificacionesActivas = true;
        });
      },
      error => this.handleError(error)
    );
  }

  anularSuscripcion(): void {
    this.suscripcionService.anularSuscripcion(this.usuario.id, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción anulada';
        this.suscrito = 'desuscrito'; 
        this.notificacionesService.cambiarEstado(this.canalId, this.usuario.id, false).subscribe(() => {
          this.notificacionesActivas = false;
        });
      },
      error => this.handleError(error)
    );
  }

  verificarSuscripcion(): void {
    if (!this.userId || !this.canalId) {
      return; 
    }

    this.suscripcionService.verificarSuscripcion(this.userId, this.canalId).subscribe(
      response => {
        switch (response.estado) {
          case 'propietario':
            this.suscrito = 'propietario';
            break;
          case 'suscrito':
            this.suscrito = 'suscrito';
            this.notificacionesActivas = true;
            break;
          case 'desuscrito':
            this.suscrito = 'desuscrito';
            this.notificacionesActivas = false;
            break;
          default:
            console.warn('Estado desconocido:', response.estado);
        }
      },
      error => {
        if (error.status === 404) {
          console.warn('No se encontró la suscripción.');
          this.suscrito = 'desuscrito';
        } else {
          console.error('Error al verificar la suscripción:', error);
        }
      }
    );
}

  obtenerCanal(canalId: number) {
    this.cargando = true;
  
    this.canalService.obtenerCanalPorId(canalId).subscribe({
      next: (canalData: any) => {
        console.log('Datos del canal:', canalData);
        this.canal = canalData.canal;
        this.canalNombre = canalData.canal.nombre;
        this.usuarioCanal = canalData.canal.user;
        this.canalId = canalData.canal.id;
        this.setTitle(this.canal.nombre);

        this.obtenerEstadoDeNotificaciones();
        this.listarNumeroDeSuscriptores(canalId);

    this.usuarioGlobal.usuario$
      .pipe(take(1)) 
      .subscribe((usuario: any) => {

        const userId = usuario ? usuario.id : null;
          this.playlistsService
            .obtenerListasDeReproduccionDelCanal(canalId, userId)
            .subscribe({
              next: (data: any) => {
                this.playlists = data.playlists;
                this.cargando = false;
                console.log("Usuario recibido:", usuario);
                console.log("User ID:", userId);
              },
              error: (err) => { 
                console.log(err);
                this.cargando = false;
              }
            });
        });
      }
      
      ,
      error: (error) => {
        console.error('Error al obtener el canal:', error);
        this.canal = {};
        this.canalNombre = '';
        this.usuario = {};
        this.cargando = false;
      }
    });
  }

    openReportModal() {
    const dialogRef = this.dialog.open(ModalReportarUsuarioComponent, {
      width: '400px',
      data: {
        id_reportado: this.canal.user_id , 
        id_reportante: this.usuario.id 
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.handleReportSubmitted(response);
      }
    });
  }

    handleReportSubmitted(response: any) {
    console.log('Reporte enviado exitosamente:', response);
    this.dialog.closeAll(); 
  }
  
  onImageError(event: any) {
    event.target.src = 'assets/images/video-default.png';
  }

  
  listarNumeroDeSuscriptores(canalId:number) {
    this.suscripcionService.listarNumeroDeSuscriptores(canalId).subscribe(res => {
      this.numeroDeSuscriptores = res;
    });
  }

    setTitle(canalNombre: string) {
    this.titleService.setTitle(`Listas de reproducción de ${canalNombre} - BlitzVideo`);
  }

    private handleError(error: any): void {
    this.mensaje = error.error.message || 'Ha ocurrido un error inesperado.';
  }


}
