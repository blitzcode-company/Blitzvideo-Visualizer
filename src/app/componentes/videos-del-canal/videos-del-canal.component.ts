import { Component, OnInit} from '@angular/core';
import { CanalService } from '../../servicios/canal.service';
import { ActivatedRoute } from '@angular/router';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { AuthService } from '../../servicios/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalReportarUsuarioComponent } from '../modal-reportar-usuario/modal-reportar-usuario.component';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { Title } from '@angular/platform-browser';
import { StatusService } from '../../servicios/status.service';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';

@Component({
  selector: 'app-videos-del-canal',
  templateUrl: './videos-del-canal.component.html',
  styleUrl: './videos-del-canal.component.css'
})
export class VideosDelCanalComponent {

  usuario:any;
  usuarioCanal:any;

  canal:any;
  canalId:any;
  mensaje: string = '';
  public suscrito: string = '';
  cargando: boolean = true;

  videos:any;
  canalNombre:any
  userId:any;
  numeroDeSuscriptores:any;
  notificacionesActivas: boolean = false;
  cargandoNotificacion: boolean = false;
  usuarioConCanal: any;
  idCanal: any;
  canales: any[] = [];


  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  sidebarVisible: boolean = true;



  ngOnInit() {
    this.canalId = this.route.snapshot.params['id'];
    this.obtenerCanal();
    this.obtenerUsuario();

  }
  constructor(private canalService: CanalService, 
              private route: ActivatedRoute,
              private notificacionesService: NotificacionesService,
              private authService:AuthService,
              private titleService: Title,
              private usuarioGlobal: UsuarioGlobalService,
              private suscripcionService: SuscripcionesService,
              public dialog: MatDialog,
              public status: StatusService

  ){}


  obtenerEstadoDeNotificaciones() {
    this.notificacionesService.obtenerEstado(this.canalId, this.userId).subscribe({
      next: (res: any) => this.notificacionesActivas = res.notificaciones,
      error: () => this.notificacionesActivas = false 
    });
  
  }


  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
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
        this.verificarSuscripcion();
      } 
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }

  obtenerCanal() {
    this.canalService.listarVideosDeCanal(this.canalId).subscribe(
      (res: any) => {
        console.log('Datos del canal:', res); 

        if (res.length > 0) {
          this.canal = res[0].canal;
          this.canalNombre = this.canal.nombre;
          this.canalId = this.canal.id
          this.usuarioCanal = this.canal.user;  
          this.setTitle(this.canal.nombre);


          this.listarNumeroDeSuscriptores(this.canalId); 


          this.videos = res.map((videoData: any) => {
            return {
              ...videoData,
              duracionFormateada: this.convertirDuracion(videoData.duracion)
            };
          });

          this.userId = this.canal.user_id;  
        } else {
          console.error('No se encontraron videos para este canal');
        }
      },
      error => {
        console.error('Error al obtener el canal:', error);
      }
    );
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

  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
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
      },
      error => this.handleError(error)
    );
  }

  anularSuscripcion(): void {
    this.suscripcionService.anularSuscripcion(this.usuario.id, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción anulada';
        this.suscrito = 'desuscrito'; 
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
onImageError(event: any) {
  event.target.src = 'assets/images/video-default.png';
}


  listarNumeroDeSuscriptores(canalId:number) {
    this.suscripcionService.listarNumeroDeSuscriptores(canalId).subscribe(res => {
      this.numeroDeSuscriptores = res;
    });
  }

  setTitle(canalNombre: string) {
    this.titleService.setTitle(`${canalNombre} - BlitzVideo`);
  }

  private handleError(error: any): void {
    this.mensaje = error.error.message || 'Ha ocurrido un error inesperado.';
  }

}
