import { Component, HostListener ,OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideosService } from '../../servicios/videos.service';
import { AuthService } from '../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../servicios/puntuaciones.service';
import { StatusService } from '../../servicios/status.service';
import { Observable } from 'rxjs';
import { Streams } from '../../clases/streams';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CrearListaComponent } from '../crear-lista/crear-lista.component';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { ConfirmacionDesuscribirModalComponent } from '../confirmacion-desuscribir-modal/confirmacion-desuscribir-modal.component';
import { AgregarListaComponent } from '../agregar-lista/agregar-lista.component';
import { ReportesService } from '../../servicios/reportes.service';
import { ModalReporteVideoComponent } from '../modal-reporte-video/modal-reporte-video.component';
import { PlaylistService } from '../../servicios/playlist.service';
import { StreamService } from '../../servicios/stream.service';

@Component({
  selector: 'app-ver-stream',
  templateUrl: './ver-stream.component.html',
  styleUrl: './ver-stream.component.css'
})

export class VerStreamComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked{

  puntuacionSeleccionada: number | null = null;
  streamId: any;
  canalId: any;
  userId: any;
  streams = new Streams();
  stream: any = {}; 
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
  public isCinemaMode = false; 
  public suscrito: string = '';
  mensaje: string = '';
  idDelCanalDelUsuario:any
  usuarioConCanal: any;
  puedeEditarVideo: boolean = false;
  numeroDeSuscriptores: any;
  errorMessage: string = '';
  isBlocked: boolean = false;
  dropdownVisible: boolean = false;
  publicidad: any = null; 
  reproduciendoPublicidad: boolean = false; 
  contadorVideos: number = 0;
  streamUrl: any;
  publicidadDuracionRestante!: number; 
  mostrarBotonSaltar: boolean = false; 
  nombrePublicidad: any;
  videosDePlaylist: any[] = [];
  playlistId:any;
  fromPlaylist: boolean = false; 
  videoIdPlaylist:any 
  videoUrlPlaylist:any
  public videoPublicidadUrl: string | null = null;
  isPlayerReady = false;

  @ViewChild('descripcion', { static: true }) descripcionElement: ElementRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private streamService: StreamService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService,
    private titleService: Title,
    private router: Router,
    public status: StatusService,
    public dialog: MatDialog,
    private reporteService: ReportesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.streamId = params['id'];
      this.mostrarStream();
    });  
    this.obtenerIdDePlaylist();
    this.obtenerUsuarioConCanal();
    this.obtenerUsuario();
    this.verificarSuscripcion();
    this.listarNumeroDeSuscriptores();
  }
  ngOnDestroy(): void {
    this.fromPlaylist = false;
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
        this.verificarSuscripcion();
      }
    });
  
    this.authService.mostrarUserLogueado().subscribe();
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
  
          this.mostrarStream();
        },
        (error) => {
          console.error('Error al obtener el canal del usuario:', error);
          this.puedeEditarVideo = false;
          this.mostrarStream(); 
        }
      );
    } else {
      this.puedeEditarVideo = false; 
      this.mostrarStream();
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

  

  finalizarPublicidad(): void {
    this.reproduciendoPublicidad = false; 
    this.videoPublicidadUrl = null; 

    this.mostrarStream(); 
  }

  handleCinemaMode(isCinema: boolean): void {
    this.isCinemaMode = isCinema;  
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
        streamId: this.streamId,
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

  mostrarStream(): void {
    this.streamService.obtenerInformacionStreams(7).subscribe(
      (res) => {
        this.stream = res.transmision || {};
        this.errorMessage = ''; 

    
        if (this.stream?.error?.code === 403) {
          this.isBlocked = true;
          this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
          console.error(this.errorMessage);
          return; 
        }
  
        if (this.playlistId) {
          console.log(this.playlistId)
        }

        this.isBlocked = false;
        this.streamUrl = res.url_hls;
        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();
        this.obtenerDatosDelCanal();
        this.listarNumeroDeSuscriptores();
      },
      (error) => {
        this.isBlocked = false; 
        this.errorMessage = this.obtenerMensajeDeError(error);
        console.error('Error al obtener información del video:', error);
      }
    );
  }
  
  private procesarFechaDeCreacion(): void {
    if (this.stream?.created_at) {
      const fecha = new Date(this.stream.created_at);
      if (!isNaN(fecha.getTime())) {
        this.stream.created_at = this.convertirFechaALineaDeTexto(fecha);
      }
    }
  }
  
  private actualizarTituloDePagina(): void {
    if (this.stream?.titulo) {
      this.titleService.setTitle(this.stream.titulo + ' - BlitzVideo');
    }
  }
  
  private obtenerDatosDelCanal(): void {
    this.streamId = this.stream.id;
    this.canalId = this.stream.canal_id;
  
    this.puedeEditarVideo = this.canalId === this.idDelCanalDelUsuario;
  }
  
  private obtenerMensajeDeError(error: any): string {
    return error?.error?.message || error?.message || 'Error desconocido: ' + JSON.stringify(error);
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
