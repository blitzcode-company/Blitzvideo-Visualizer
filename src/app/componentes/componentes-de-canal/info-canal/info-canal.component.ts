import { Component, HostListener } from '@angular/core';
import { CanalService } from '../../../servicios/canal.service';
import { ActivatedRoute } from '@angular/router';
import { UsuarioGlobalService } from '../../../servicios/usuario-global.service';
import { Title } from '@angular/platform-browser';
import { SuscripcionesService } from '../../../servicios/suscripciones.service';
import { AuthService } from '../../../servicios/auth.service';
import { NotificacionesService } from '../../../servicios/notificaciones.service';
import { MatDialog } from '@angular/material/dialog';
import { StatusService } from '../../../servicios/status.service';
import { Videos } from '../../../clases/videos';
import { ModalReportarUsuarioComponent } from '../../modales/modal-reportar-usuario/modal-reportar-usuario.component';


@Component({
  selector: 'app-info-canal',
  templateUrl: './info-canal.component.html',
  styleUrl: './info-canal.component.css'
})
export class InfoCanalComponent {


  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  sidebarVisible: boolean = true;
  usuario: any;
  mensaje: string = '';
  cargandoNotificacion: boolean = false;
  usuarioCanal:any;
  canal: any = {};
  canalId: any;
  canalNombre: any;
  userId: any;
  videos: Videos[] = [];
  ultimoVideo: any;
  cargando: boolean = true;
  numeroDeSuscriptores: any;
  isMobile = false;
  public suscrito: string = '';
  notificacionesActivas: boolean = false;
  videosGeneral: any;
  tieneContenido: boolean = true;
  stats: any;
enlacesCanal = [
  { texto: 'Twitter', url: 'https://twitter.com/tuusuario', icono: 'alternate_email' },
  { texto: 'Instagram', url: 'https://instagram.com/tuusuario', icono: 'camera_alt' },
  { texto: 'Discord', url: 'https://discord.gg/tuservidor', icono: 'discord' },
  { texto: 'Mi web', url: 'https://tuweb.com', icono: 'language' }
];
totalVistas: number = 123413;
totalVideos: number = 123413;
crecimiento30dias: number = 123413;


    constructor(
      private canalService: CanalService,
      private route: ActivatedRoute, 
      private usuarioGlobal: UsuarioGlobalService,
      private titleService: Title,
      private suscripcionService: SuscripcionesService,
      private authService: AuthService,
      private notificacionesService: NotificacionesService,
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

  checkMobile() {
    this.isMobile = window.innerWidth <= 767;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
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

obtenerEstadoDeNotificaciones() {
    this.notificacionesService.obtenerEstado(this.canalId, this.userId).subscribe({
      next: (res: any) => this.notificacionesActivas = res.notificaciones,
      error: () => this.notificacionesActivas = false 
    });
  
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


  obtenerCanal(canalId: number) {
    this.cargando = true;
  
    this.canalService.obtenerCanalPorId(canalId).subscribe({
      next: (canalData: any) => {
        console.log('Datos del canal:', canalData);
        this.canal = canalData.canal;
        this.canalNombre = canalData.canal.nombre;
        this.stats = canalData.stats
        this.usuarioCanal = canalData.canal.user;
        this.canalId = canalData.canal.id;
        this.setTitle(this.canal.nombre);

        this.obtenerEstadoDeNotificaciones();
        this.listarNumeroDeSuscriptores(canalId); 

      },
      error: (error) => {
        console.error('Error al obtener el canal:', error);
        this.canal = {};
        this.canalNombre = '';
        this.usuario = {};
        this.cargando = false;
      }
    });
  }

  toggleSuscripcion(): void {
    const action = this.suscrito === 'suscrito' ? this.anularSuscripcion.bind(this) : this.suscribirse.bind(this);
    action();
  }

  setTitle(canalNombre: string) {
    this.titleService.setTitle(`Sobre ${canalNombre} - BlitzVideo`);
  }

 convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }

  listarNumeroDeSuscriptores(canalId:number) {
    this.suscripcionService.listarNumeroDeSuscriptores(canalId).subscribe(res => {
      this.numeroDeSuscriptores = res;
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
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

  private handleError(error: any): void {
    this.mensaje = error.error.message || 'Ha ocurrido un error inesperado.';
  }

}
