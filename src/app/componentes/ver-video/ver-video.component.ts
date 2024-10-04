import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
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
import { CrearListaReproduccionComponent } from '../crear-lista-reproduccion/crear-lista-reproduccion.component';
import { SuscripcionesService } from '../../servicios/suscripciones.service';


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
  video: any;
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
  public suscrito: boolean = false;
  mensaje: string = '';
  numeroDeSuscriptores: any;

  @ViewChild('descripcion', { static: true }) descripcionElement: ElementRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideosService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService,
    private titleService: Title,
    private puntuarService: PuntuacionesService,
    public status: StatusService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.videoId = this.route.snapshot.params['id'];
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
      this.userId = this.usuario.id
      this.obtenerPuntuacionActual();  
      this.verificarSuscripcion();

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

  mostrarVideo(): void {
    this.videoService.obtenerInformacionVideo(this.videoId).subscribe(res => {
      this.video = res;
      console.log(this.video)
      if (this.video && this.video.created_at) {
        const fecha = new Date(this.video.created_at);
        if (!isNaN(fecha.getTime())) {
          this.video.created_at = this.convertirFechaALineaDeTexto(fecha);
        }
      }

      if (this.video && this.video.titulo) {
        this.titleService.setTitle(this.video.titulo + ' - BlitzVideo');
      }
      
      this.videoId = this.video.id;
      this.canalId = this.video.canal_id

      this.listarNumeroDeSuscriptores();
    });
  }

  puntuar(valora: number): void {
    if (!this.usuario || !this.usuario.id) {
      window.location.href = `${this.serverIp}:3002/#/`; 
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
          console.log(response.message);
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

  abrirModalCrearLista(): void {
    const dialogRef = this.dialog.open(CrearListaReproduccionComponent, {
      width: '500px',
      data: { videoId: this.videoId } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Lista creada o video agregado');
      }
    });
  }
  
  
  suscribirse(): void {
    this.suscripcionService.suscribirse(this.userId, this.canalId).subscribe(
      response => {
        this.mensaje = 'Suscripción exitosa';
        this.suscrito = true; 
      },
      error => this.handleError(error)
    );
  }

  listarNumeroDeSuscriptores() {
    this.suscripcionService.listarNumeroDeSuscriptores(this.canalId).subscribe(res => {
      this.numeroDeSuscriptores = res;
      console.log(this.numeroDeSuscriptores)
    });
  }
  

  anularSuscripcion(): void {
    this.suscripcionService.anularSuscripcion(this.userId, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción anulada';
        this.suscrito = false; 
      },
      error => this.handleError(error)
    );
  }

  
  toggleSuscripcion(): void {
    if (this.suscrito) {
      this.anularSuscripcion(); 
    } else {
      this.suscribirse(); 
    }
  }

  verificarSuscripcion(): void {
    this.suscripcionService.verificarSuscripcion(this.userId, this.canalId).subscribe(
      response => {
        this.suscrito = response.suscrito; 
      },
      error => {
        if (error.status === 404) {
          this.suscrito = false; 
          console.warn('El usuario no está suscrito a este canal.');
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
