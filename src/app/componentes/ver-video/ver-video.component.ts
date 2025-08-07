import { Component, HostListener ,OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, AfterViewChecked, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { VideosService } from '../../servicios/videos.service';
import { AuthService } from '../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../servicios/puntuaciones.service';
import { StatusService } from '../../servicios/status.service';
import { Observable, Subscription } from 'rxjs';
import { Videos } from '../../clases/videos';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CrearListaComponent } from '../crear-lista/crear-lista.component';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { ConfirmacionDesuscribirModalComponent } from '../confirmacion-desuscribir-modal/confirmacion-desuscribir-modal.component';
import { AgregarListaComponent } from '../agregar-lista/agregar-lista.component';
import { ReportesService } from '../../servicios/reportes.service';
import { ModalReporteVideoComponent } from '../modal-reporte-video/modal-reporte-video.component';
import { PlaylistService } from '../../servicios/playlist.service';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { ModocineService } from '../../servicios/modocine.service';

@Component({
  selector: 'app-ver-video',
  templateUrl: './ver-video.component.html',
  styleUrls: ['./ver-video.component.css']
})
export class VerVideoComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  
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
  showToggleLink = false;
  isContentOverflowing = false;
  public isCinemaMode = false; 
  public suscrito: string = '';
  mensaje: string = '';
  idDelCanalDelUsuario:any
  usuarioConCanal: any;
  idCanal:any;
  canales: any;
  modoCine: boolean = false;

  puedeEditarVideo: boolean = false;
  numeroDeSuscriptores: any;
  errorMessage: string = '';
  isBlocked: boolean = false;
  dropdownVisible: boolean = false;
  publicidad: any = null; 
  reproduciendoPublicidad: boolean = false; 
  contadorVideos: number = 0;
  videoUrl: any;
  publicidadDuracionRestante!: number; 
  mostrarBotonSaltar: boolean = false; 
  nombrePublicidad: any;
  videosDePlaylist: any[] = [];
  playlistId:any;
  fromPlaylist: boolean = false; 
  videoIdPlaylist:any 
  videoUrlPlaylist:any
  notificacionesActivas: boolean = false;
  cargando: boolean = false;
  public videoPublicidadUrl: string | null = null;
  sidebarVisible: boolean = false;
  videosRecomendados: any[] = [];
  modoGuardado: any;
  private cinemaModeSubscription!: Subscription;

  @ViewChild('descripcion') descripcionElement!: ElementRef; 


  constructor(
    private route: ActivatedRoute,
    private videoService: VideosService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService,
    private titleService: Title,
    private router: Router,
    private puntuarService: PuntuacionesService,
    private playlistService: PlaylistService,
    public status: StatusService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private reporteService: ReportesService,
    private cinemaModeService: ModocineService,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {

    this.cinemaModeSubscription = this.cinemaModeService.getCinemaMode().subscribe(enabled => {
      console.log('CinemaMode desde servicio en ngOnInit:', enabled);
      this.isCinemaMode = enabled;
      this.cdr.detectChanges();
    });

    this.route.params.subscribe(params => {
      this.videoId = params['id'];
      this.mostrarVideo();
    });  
    this.obtenerEstadoDeNotificaciones();
    this.obtenerIdDePlaylist();
    this.mostrarCanalesSuscritos();
    this.obtenerUsuarioConCanal();
    this.obtenerUsuario();
    this.visitar();
    this.checkDescriptionHeight();
    setTimeout(() => {
      this.verificarSuscripcion();
    }, 100);
    this.listarNumeroDeSuscriptores();
    const storedCinemaMode = localStorage.getItem('cinemaMode');
    this.isCinemaMode = storedCinemaMode ? JSON.parse(storedCinemaMode) : false;
    console.log('Modo Cine cargado desde localStorage:', this.isCinemaMode);
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkContentOverflow();
      this.cdr.detectChanges();
    }, 0);
    this.checkDescriptionHeight();
  }

  ngAfterViewChecked(): void {
    this.checkContentOverflow();
  }

  ngOnChanges() {
    if (this.video?.descripcion) {
      setTimeout(() => {
        this.checkDescriptionHeight();
        this.cdr.detectChanges();
      }, 200);
    }


  }

  ngOnDestroy(): void {
    this.fromPlaylist = false;
  }


obtenerEstadoDeNotificaciones() {
  this.notificacionesService.obtenerEstado(this.canalId, this.userId).subscribe({
    next: (res: any) => this.notificacionesActivas = res.notificaciones,
    error: () => this.notificacionesActivas = false 
  });

}

mostrarCanalesSuscritos() {
  this.suscripcionService.listarSuscripciones(this.userId).subscribe(
    suscripciones => {
      this.canales = suscripciones; 
    },
    error => {
      console.error('Error al obtener listas de suscripciones', error);
    }
  );
}

toggleNotificaciones(): void {
  this.cargando = true;
  this.notificacionesService.cambiarEstado(this.canalId, this.userId, !this.notificacionesActivas).subscribe({
    next: () => {
      this.notificacionesActivas = !this.notificacionesActivas;
      this.cargando = false;
    },
    error: () => this.cargando = false
  });
}

  obtenerIdDePlaylist() {
    const state = history.state as { playlistId: number };
    if (state && state.playlistId) {
      this.playlistId = state.playlistId;
      this.fromPlaylist = true;
      console.log('playlistId recibido desde history.state:', this.playlistId);
    } else {
      this.fromPlaylist = false; 
      console.log('No se pasó el estado a la navegación');
    }

    if (this.playlistId === undefined) {
      console.error('playlistId sigue siendo undefined');
    }
  }
  

  
  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
  
      if (this.usuario) {
        this.userId = this.usuario.id;
        this.obtenerEstadoDeNotificaciones();
        this.obtenerUsuarioConCanal();
        this.obtenerPuntuacionActual();
        this.mostrarCanalesSuscritos();
        this.verificarSuscripcion();
       
      }
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }

 
  toggleExpand(event: Event) {
    event.preventDefault();
    this.isExpanded = !this.isExpanded;
    this.cdr.detectChanges();
  }

  checkDescriptionHeight() {
    if (this.descripcionElement && this.video?.descripcion) {
      const descripcion = this.descripcionElement.nativeElement;
      const maxHeight = 150; 
      const scrollHeight = descripcion.scrollHeight;
      this.showToggleLink = scrollHeight > maxHeight + 20;
      if (!this.showToggleLink) {
        this.isExpanded = true;
      }
    } else {
      console.log('checkDescriptionHeight: Element or description not ready', {
        hasElement: !!this.descripcionElement,
        hasDescription: !!this.video?.descripcion
      });
      this.showToggleLink = false;
    }
    this.cdr.detectChanges();
  }

  checkContentOverflow() {
    if (this.descripcionElement) {
      const element = this.descripcionElement.nativeElement;
      this.isContentOverflowing = element.scrollHeight > element.clientHeight;
    }
  }

  obtenerVideosRelacionados() {
    this.videoService.listarVideosRelacionados(this.videoId).subscribe(
      (res: any) => {
        this.videosRecomendados = res; 
      },
      error => {
        console.error('Error al obtener videos relacionados:', error);
      }
    );
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

  onImageError(event: any) {
    event.target.src = 'assets/images/video-default.png';
  }



  cargarPublicidad(): void {
    this.videoService.obtenerPublicidad().subscribe(
      (data) => {
        this.publicidad = data;
        this.reproduciendoPublicidad = true;
        this.videoPublicidadUrl = this.publicidad.link;
        this.publicidadDuracionRestante = this.publicidad.duracion;
        this.nombrePublicidad = this.publicidad.titulo
        this.mostrarBotonSaltar = false;
  
        setTimeout(() => {
          this.mostrarBotonSaltar = true;
        }, 5000);
  
        const intervalo = setInterval(() => {
          if (this.publicidadDuracionRestante > 0) {
            this.publicidadDuracionRestante--;
          } else {
            clearInterval(intervalo); 
            this.reproduciendoPublicidad = false;
            this.finalizarPublicidad();
          }
        }, 1000);
      },
      (error) => {
        console.error('Error al cargar publicidad:', error);
      }
    );
  }

  finalizarPublicidad(): void {
    this.reproduciendoPublicidad = false; 
    this.videoPublicidadUrl = null; 

    this.mostrarVideo(); 
  }
  
  handleCinemaMode(event: boolean): void {
    console.log('Iniciando handleCinemaMode, isCinemaMode:', event);
    this.cinemaModeService.setCinemaMode(event);
    console.log('CinemaMode guardado en servicio:', event);
    this.cdr.detectChanges();
  }

  saltarPublicidad(): void {
    this.reproduciendoPublicidad = false;
    this.mostrarBotonSaltar = false;
    this.finalizarPublicidad();
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
      (res) => {
        console.log(res)
        this.video = res;
        this.errorMessage = ''; 
        this.canalId = this.video.canal_id; 
  
        if (this.video?.error?.code === 403) {
          this.isBlocked = true;
          this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
          return; 
        }
  
        if (this.playlistId) {
          console.log(this.playlistId)
          this.obtenerVideosDePlaylist();
        }

        this.isBlocked = false;
        this.videoUrl = this.video.link; 
        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();
        this.obtenerDatosDelCanal();
        this.obtenerVideosRelacionados()
        this.listarNumeroDeSuscriptores();

        if (this.canalId) {
          this.obtenerEstadoDeNotificaciones();
        }
      },
      (error) => {
        this.isBlocked = false; 
        this.errorMessage = this.obtenerMensajeDeError(error);
        console.error('Error al obtener información del video:', error);
      }
    );
  }
  
  obtenerVideosDePlaylist(): void {
    this.playlistService.obtenerPlaylistConVideos(this.playlistId, this.videoId, true).subscribe(
      (response) => {
        this.videosDePlaylist = response.data.videos;
        this.videoIdPlaylist = this.videosDePlaylist.length > 0 ? this.videosDePlaylist[0].id : null;
        console.log('Videos de la playlist:', this.videosDePlaylist);
      },
      (error) => {
        console.error('Error al obtener los videos de la playlist:', error);
      }
    );
  }

  siguienteVideo(): void {
    const indiceActual = this.videosDePlaylist.findIndex((video: Videos) => video.id === this.videoId);
    console.log('Índice actual:', indiceActual);
  
    if (indiceActual >= 0 && indiceActual < this.videosDePlaylist.length - 1) {
      const siguienteVideo = this.videosDePlaylist[indiceActual + 1];
      console.log('Siguiente video:', siguienteVideo);  
  
      if (siguienteVideo) {
        this.videoIdPlaylist = siguienteVideo.id; 
        console.log('Cargando siguiente video con id:', this.videoIdPlaylist);
  
        this.router.navigate(['/video', this.videoIdPlaylist], {
          state: { playlistId: this.playlistId }  
        });
      }
    } else {
      console.log('No hay más videos en la lista'); 
    }
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
    return error?.error?.message || error?.message || '' + JSON.stringify(error);
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
    const contadorClave = esInvitado ? 'contadorVideosInvitado' : `contadorVideos_${this.usuario?.id}`;
    let contadorVideos = this.cargarContador(contadorClave);
  
    console.log('Contador actual:', contadorVideos);

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
        (response) => {
          contadorVideos++;
          this.guardarContador(contadorClave, contadorVideos);
          console.log('Contador después de visita:', contadorVideos);
          if (contadorVideos >= 3) {
            this.guardarContador(contadorClave, 0); 
            this.cargarPublicidad();
          }
        },
        (error) => {
          console.error('Error al contar visita:', error);
        }
      );
    }
  }

  guardarContador(clave: string, valor: number): void {
    localStorage.setItem(clave, valor.toString());
  }
  
  cargarContador(clave: string): number {
    const valor = localStorage.getItem(clave);
    return valor ? parseInt(valor, 10) : 0; 
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
  
            this.notificacionesService.cambiarEstado(this.canalId, this.userId, true).subscribe(() => {
              this.notificacionesActivas = true;
            });
          },
          desuscrito: () => {
            this.suscrito = 'desuscrito';
  
            this.notificacionesService.cambiarEstado(this.canalId, this.userId, false).subscribe(() => {
              this.notificacionesActivas = false;
            });
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