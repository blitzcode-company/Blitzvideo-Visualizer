import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanalService } from '../../servicios/canal.service';
import { AuthService } from '../../servicios/auth.service';
import { Videos } from '../../clases/videos';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalReportarUsuarioComponent } from '../modal-reportar-usuario/modal-reportar-usuario.component';
import { NotificacionesService } from '../../servicios/notificaciones.service';


@Component({
  selector: 'app-ver-canal',
  templateUrl: './ver-canal.component.html',
  styleUrls: ['./ver-canal.component.css']
})
export class VerCanalComponent implements OnInit {
  
  usuario: any;
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


  constructor(
    private canalService: CanalService,
    private route: ActivatedRoute, 
    private titleService: Title,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService,
    private notificacionesService: NotificacionesService,
    public dialog: MatDialog,

  ) {}

  ngOnInit() {
    this.canalId = this.route.snapshot.params['id'];
    this.obtenerCanal();
    this.obtenerUsuario();
    this.listarNumeroDeSuscriptores(); 
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
    this.suscripcionService.verificarSuscripcion(this.usuario.id, this.canalId).subscribe(
      response => {
        this.suscrito = response.estado;
        console.log(response.estado);
  
        if (this.suscrito === 'suscrito') {
          this.notificacionesService.cambiarEstado(this.canalId, this.usuario.id, true).subscribe(() => {
            this.notificacionesActivas = true;
          });
        } else {
          this.notificacionesActivas = false;
        }
      },
      error => {
        if (error.status === 404) {
          console.warn('No se encontró la suscripción.');
          this.suscrito = 'desuscrito';
          this.notificacionesActivas = false;
        } else {
          console.error('Error al verificar la suscripción:', error);
        }
      }
    );
  }

  obtenerCanal() {
    this.canalService.listarVideosDeCanal(this.canalId).subscribe(
      (res: any) => {
        console.log('Datos del canal:', res); 

         if (res.length > 0) {
          this.canal = res[0].canal;
          this.canalNombre = this.canal.nombre;
          this.usuario = this.canal.user;
          this.canalId = this.canal.id
          this.obtenerEstadoDeNotificaciones();

          console.log('Canal:', this.canal);
          console.log('Usuario:', this.usuario);

          this.videosGeneral =  res.map((videoData: any) => {
            return {
              ...videoData,
              duracionFormateada: this.convertirDuracion(videoData.duracion)
            };
          });
  
          this.videos = this.videosGeneral.slice(0, 3);
  
          this.ultimoVideo = this.videosGeneral.reduce((prev: any, current: any) => 
            (prev.id > current.id) ? prev : current
          );
  
          if (this.ultimoVideo) {
            this.ultimoVideo.indice = this.videos.findIndex(video => video.id === this.ultimoVideo.id) + 1;
          }
  
          this.setTitle(this.canal.nombre);
        } else {
          console.error('No se encontraron videos para este canal');
        }
      },
      error => {
        console.error('Error al obtener el canal:', error);
        this.cargando = false;
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
  
  
  listarNumeroDeSuscriptores() {
    this.suscripcionService.listarNumeroDeSuscriptores(this.canalId).subscribe(res => {
      this.numeroDeSuscriptores = res;
    });
  }

  setTitle(canalNombre: string) {
    this.titleService.setTitle(`${canalNombre} - BlitzVideo`);
  }

  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }

  private handleError(error: any): void {
    this.mensaje = error.error.message || 'Ha ocurrido un error inesperado.';
  }
}