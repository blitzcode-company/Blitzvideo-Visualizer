import { Component, HostListener ,OnInit, ElementRef, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideosService } from '../../servicios/videos.service';
import { AuthService } from '../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../servicios/puntuaciones.service';
import { StatusService } from '../../servicios/status.service';
import { Observable } from 'rxjs';
import { Videos } from '../../clases/videos';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CrearListaComponent } from '../crear-lista/crear-lista.component';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { ConfirmacionDesuscribirModalComponent } from '../confirmacion-desuscribir-modal/confirmacion-desuscribir-modal.component';
import { AgregarListaComponent } from '../agregar-lista/agregar-lista.component';
import { ReportesService } from '../../servicios/reportes.service';
import { ModalReporteVideoComponent } from '../modal-reporte-video/modal-reporte-video.component';

@Component({
  selector: 'app-ver-video',
  templateUrl: './ver-video.component.html',
  styleUrls: ['./ver-video.component.css']
})
export class VerVideoComponent implements OnInit, AfterViewInit, AfterViewChecked {
  puntuacionSeleccionada: number | null = null;
  videoId: any;
  canalId: any;
  userId: any;
  videos = new Videos();
  video: any = {}; 
  comentario: any;
  usuario: any;
  visitaRealizada: boolean = false;
  visitaRealizadaInvitado: boolean = false;
  public loggedIn: boolean = false;
  puntuacionActual: any = {};
  valorPuntuacion: number | null = null; 
  serverIp = environment.serverIp;
  isExpanded = false;
  isContentOverflowing = false;
  isCinemaMode = false;
  public suscrito: string = '';
    mensaje: string = '';
  idDelCanalDelUsuario:any
  usuarioConCanal: any;
  puedeEditarVideo: boolean = false;
  numeroDeSuscriptores: any;
  errorMessage: string = '';
  isBlocked: boolean = false;
  dropdownVisible: boolean = false;




  @ViewChild('descripcion', { static: true }) descripcionElement: ElementRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideosService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService,
    private titleService: Title,
    private puntuarService: PuntuacionesService,
    public status: StatusService,
    public dialog: MatDialog,
    private reporteService: ReportesService
  ) {}

  ngOnInit(): void {
    this.videoId = this.route.snapshot.params['id'];
    this.obtenerUsuarioConCanal();
    this.mostrarVideo();
    this.obtenerUsuario();
    this.visitar();
    this.verificarSuscripcion();
    this.listarNumeroDeSuscriptores();

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkContentOverflow();
    }, 0);
  }

  ngAfterViewChecked(): void {
    this.checkContentOverflow();
  }

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
  
      if (this.usuario) {
        this.userId = this.usuario.id;
        this.obtenerUsuarioConCanal();
        this.obtenerPuntuacionActual();
        this.verificarSuscripcion();
      }
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }

 
  toggleCinemaMode() {
    this.isCinemaMode = !this.isCinemaMode;
  }

  toggleExpand(event: MouseEvent) {
    event.preventDefault();
    this.isExpanded = !this.isExpanded;
    setTimeout(() => this.checkContentOverflow(), 0);
  }


  checkContentOverflow() {
    if (this.descripcionElement) {
      const element = this.descripcionElement.nativeElement;
      this.isContentOverflowing = element.scrollHeight > element.clientHeight;
    }
  }

  obtenerUsuarioConCanal(): void {
    if (this.userId !== undefined) {
      this.authService.obtenerCanalDelUsuario(this.userId).subscribe(
        (res: any) => {
          this.usuarioConCanal = res; 
  
          if (this.usuarioConCanal && this.usuarioConCanal.canales) {
            this.idDelCanalDelUsuario = this.usuarioConCanal.canales.id;
            this.puedeEditarVideo = true;  
          } else {
            this.puedeEditarVideo = false; 
          }
  
          this.mostrarVideo();
        },
        (error) => {
          console.error('Error al obtener el canal del usuario:', error);
          this.puedeEditarVideo = false;
          this.mostrarVideo(); 
        }
      );
    } else {
      this.puedeEditarVideo = false; 
      this.mostrarVideo();
    }
  }


  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.options')) {
      this.dropdownVisible = false;
    }
  }
  
  envioReportar(formData: any) {
    this.reporteService.crearReporteVideo(formData).subscribe(
      response => {
        console.log('Reporte enviado exitosamente:', response);
      },
      error => {
        console.error('Error al enviar el reporte:', error);
      }
    );
  }


  
  openReportModal() {
    const dialogRef = this.dialog.open(ModalReporteVideoComponent, {
      width: '400px',
      data: {
        videoId: this.videoId,
        userId: this.userId
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.handleReportSubmitted(response);
      }
    });
    this.dropdownVisible = false; 
  }

  handleReportSubmitted(response: any) {
    console.log('Reporte enviado exitosamente:', response);
    this.dialog.closeAll(); 
  }

  mostrarVideo(): void {
    this.videoService.obtenerInformacionVideo(this.videoId).subscribe(
      res => {
        this.video = res;
        this.errorMessage = ''; 
  
        if (this.video?.error?.code === 403) {
          this.isBlocked = true;
          this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
          console.error(this.errorMessage);
          return; 
        }
  
        this.isBlocked = false;
        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();
        this.obtenerDatosDelCanal();
  
        this.listarNumeroDeSuscriptores();
      },
      error => {
        this.isBlocked = false; 
        this.errorMessage = this.obtenerMensajeDeError(error);
        console.error('Error al obtener información del video:', error);
      }
    );
  }
  
  private procesarFechaDeCreacion(): void {
    if (this.video?.created_at) {
      const fecha = new Date(this.video.created_at);
      if (!isNaN(fecha.getTime())) {
        this.video.created_at = this.convertirFechaALineaDeTexto(fecha);
      }
    }
  }
  
  private actualizarTituloDePagina(): void {
    if (this.video?.titulo) {
      this.titleService.setTitle(this.video.titulo + ' - BlitzVideo');
    }
  }
  
  private obtenerDatosDelCanal(): void {
    this.videoId = this.video.id;
    this.canalId = this.video.canal_id;
  
    this.puedeEditarVideo = this.canalId === this.idDelCanalDelUsuario;
  }
  
  private obtenerMensajeDeError(error: any): string {
    return error?.error?.message || error?.message || 'Error desconocido: ' + JSON.stringify(error);
  }



  puntuar(valora: number): void {
    if (!this.usuario || !this.usuario.id) {
      window.location.href = `${this.serverIp}3002/#/`; 
    }

    if (this.puntuacionSeleccionada === valora) {
      this.eliminarPuntuacion();
    } else {
      this.valorPuntuacion = valora;
      this.puntuacionSeleccionada = valora;  
      this.crearActualizarPuntuacion();  
    }
  }

  obtenerPuntuacionActual(): void {
    this.puntuarService.obtenerPuntuacionActual(this.videoId, this.usuario.id).subscribe(
      response => {
        this.puntuacionActual = response;
        this.puntuacionSeleccionada = this.puntuacionActual.valora; 
      },
      error => {
        if (error.status === 404) {
          console.warn('El usuario no ha dado una valoración para este video.');
          this.puntuacionSeleccionada = null; 
        } else {
          console.error('Error al obtener la puntuación actual:', error);
        }
      }
    );
  }

  eliminarPuntuacion(): void {
    if (this.valorPuntuacion === null) {
      console.error('No se ha seleccionado un valor de puntuación para eliminar.');
      return;
    }

    this.puntuarService.quitarPuntuacion(this.videoId, this.usuario.id, this.valorPuntuacion).subscribe(
      response => {
        this.puntuacionActual = null;
        this.valorPuntuacion = null; 
        this.puntuacionSeleccionada = null;  
      },
      error => {
        console.error('Error al eliminar la puntuación:', error.error.message);
      }
    );
  }

  crearActualizarPuntuacion(): void {
    if (this.valorPuntuacion === null) {
      console.error('No se ha seleccionado un valor de puntuación para crear o actualizar.');
      return;
    }

    this.puntuarService.puntuar(this.videoId, this.usuario.id, this.valorPuntuacion).subscribe(
      response => {
        this.obtenerPuntuacionActual();  
      },
      error => {
        console.error('Error al crear o actualizar la puntuación:', error.error.message);
      }
    );
  }

  visitar(): void {
    const esInvitado = !this.usuario;
    if ((esInvitado && !this.visitaRealizadaInvitado) || (!esInvitado && !this.visitaRealizada)) {
      let visitaObservable: Observable<any>;

      if (esInvitado) {
        visitaObservable = this.videoService.contarVisitaInvitado(this.videoId);
        this.visitaRealizadaInvitado = true;
      } else {
        if (this.usuario && this.usuario.id) {
          visitaObservable = this.videoService.contarVisita(this.videoId, this.usuario.id);
          this.visitaRealizada = true;
        } else {
          console.error('Usuario no está autenticado o no tiene un ID válido.');
          return;
        }
      }

      visitaObservable.subscribe(
        response => {
        },
        error => {
          console.error('Error al contar visita:', error);
        }
      );
    }
  }

  convertirFechaALineaDeTexto(fecha: Date): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia} de ${mes} de ${año}`;
  }

  
  
  suscribirse(): void {
    if (!this.usuario || !this.usuario.id) {
      window.location.href = `${this.serverIp}3002/#/`;
      return;
    }
    
    this.suscripcionService.suscribirse(this.userId, this.canalId).subscribe(
      response => {
        
        this.mensaje = 'Suscripción exitosa';
        this.suscrito = 'suscrito'; 
      },
      error => this.handleError(error)
    );
  }

  listarNumeroDeSuscriptores() {
    this.suscripcionService.listarNumeroDeSuscriptores(this.canalId).subscribe(res => {
      this.numeroDeSuscriptores = res;
    });
  }
  

  anularSuscripcion(): void {
    const dialogRef = this.dialog.open(ConfirmacionDesuscribirModalComponent);
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this.suscripcionService.anularSuscripcion(this.userId, this.canalId).subscribe(
                () => {
                    this.mensaje = 'Suscripción anulada';
                    this.suscrito = 'desuscrito'; 
                },
                error => this.handleError(error)
            );
        }
    });
}

  
  agregarAVideoALista(): void {
    const dialogRef = this.dialog.open(AgregarListaComponent, {
      data: { videoId: this.videoId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });

    this.dropdownVisible = false; 

  }



  crearLista(): void {
    const dialogRef = this.dialog.open(CrearListaComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.agregarAVideoALista();
      }
    });
  }

  toggleSuscripcion(): void {

    

    if (this.suscrito) {
      this.anularSuscripcion(); 
    } else {
      this.suscribirse(); 
    }
  }

  
  verificarSuscripcion(): void {
    if (!this.userId || !this.canalId) {
      return; 
    }

    this.suscripcionService.verificarSuscripcion(this.userId, this.canalId).subscribe(
      response => {
        const estado: 'propietario' | 'suscrito' | 'desuscrito' = response.estado;

        const acciones: {
          propietario: () => void;
          suscrito: () => void;
          desuscrito: () => void;
        } = {
          propietario: () => {
            this.suscrito = 'propietario';
          },
          suscrito: () => {
            this.suscrito = 'suscrito';
          },
          desuscrito: () => {
            this.suscrito = 'desuscrito'; 
          }
        };

        (acciones[estado] || (() => {
          console.warn('Estado desconocido:', estado);
        }))();

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

  private handleError(error: any): void {
    if (error.status === 409) {
      this.mensaje = 'Ya estás suscrito a este canal.';
    } else {
      this.mensaje = error.error.message || 'Ha ocurrido un error inesperado.';
    }
  }
  
}