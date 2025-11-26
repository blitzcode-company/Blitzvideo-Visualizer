import { Component, HostListener ,OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, AfterViewChecked,  ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { StatusService } from '../../servicios/status.service';
import { Observable, Subscription } from 'rxjs';
import { Streams } from '../../clases/streams';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { ConfirmacionDesuscribirModalComponent } from '../confirmacion-desuscribir-modal/confirmacion-desuscribir-modal.component';
import { ReportesService } from '../../servicios/reportes.service';
import { ModalReporteVideoComponent } from '../modal-reporte-video/modal-reporte-video.component';
import { StreamService } from '../../servicios/stream.service';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { ChatDeStreamComponent } from '../chat-de-stream/chat-de-stream.component';
import { ChatstreamService } from '../../servicios/chatstream.service';
import { HttpClient } from '@angular/common/http';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { ModocineService } from '../../servicios/modocine.service';

@Component({
  selector: 'app-ver-stream',
  templateUrl: './ver-stream.component.html',
  styleUrl: './ver-stream.component.css',

})

export class VerStreamComponent implements OnInit, OnDestroy,  AfterViewInit, AfterViewChecked{

  puntuacionSeleccionada: number | null = null;
  cargando: boolean = false;
  streamId: number = 0;
  canalId: any;
  userId: any;
  streams = new Streams();
  stream: Streams = new Streams(); 
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
  notificacionesActivas: boolean = false;
  showToggleLink = false;
  mensaje: string = '';
  viewerSub: any;
  sidebarVisible: boolean = false;
  private sidebarSubscription!: Subscription;
  sidebarCollapsed = false;
  sidebarCollapsed$: Observable<boolean>;
  viewersCount: number = 0;
  @ViewChild('descripcion') descripcionElement!: ElementRef; 
  private streamEventsSub: Subscription | undefined;
  streamActivo:any
  heartbeatInterval: any;
  viewerId!: string | number;

  private cinemaModeSubscription!: Subscription;


  constructor(
    private route: ActivatedRoute,
    private streamService: StreamService,
    private suscripcionService: SuscripcionesService,
    private chatService:ChatstreamService,
    private authService: AuthService,
    private notificacionesService: NotificacionesService,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
    private httpClient: HttpClient,
    private router: Router,
    private cinemaModeService: ModocineService,
    public status: StatusService,
    private usuarioGlobal: UsuarioGlobalService,
    private chatstreamService: ChatstreamService,
    public dialog: MatDialog,
    private reporteService: ReportesService
  ) {
    this.sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  }

ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.streamId = params['id'];
    this.mostrarStream();

    this.obtenerUsuario(); 
    this.obtenerUsuarioConCanal();

   this.isCinemaMode = this.cinemaModeService.getCinemaModeValue();
    this.cinemaModeService.getCinemaMode().subscribe(enabled => {
      this.isCinemaMode = enabled;
    });
    
    const storedCinemaMode = localStorage.getItem('cinemaMode');
    this.isCinemaMode = storedCinemaMode ? JSON.parse(storedCinemaMode) : false;

    setTimeout(() => {
      this.setViewerId();         
      this.startHeartbeat();       
      this.marcarEntrada();      

      this.chatService.startListening(this.streamId);

      this.streamEventsSub = this.chatService.getStreamEvents()
          .subscribe(event => {
            console.log("[COMPONENT EVENT]", event); 
            if (event.type === 'viewer_count') {
              this.viewersCount = event.count;
            }
          });

    }, 200); 
  });

  this.mostrarSidebar();
  setTimeout(() => this.verificarSuscripcion(), 200);
  this.checkDescriptionHeight();
}


marcarEntrada() {
  this.streamService.entrarView(this.streamId).subscribe((res: any) => {
    console.log("Entró viewer:", res);
  });
}

  ngOnDestroy() {
  if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.streamEventsSub) {
      this.streamEventsSub.unsubscribe();
    }

      if (this.streamId) {
      this.streamService.salirView(this.streamId)
        .subscribe(res => console.log('Salió viewer:', res));
    }

    this.streamService.salirView(this.stream.id).subscribe();
  }


  ngOnChanges() {
    if (this.stream?.descripcion) {
      setTimeout(() => {
        this.checkDescriptionHeight();
        this.cdr.detectChanges();
      }, 200);
    }

    if (this.viewerSub) {
      this.viewerSub.unsubscribe();
    }
  }

    generateAnonId(): string {
    let anonId = localStorage.getItem('anon_viewer_id');
    if (!anonId) {
      anonId = crypto.randomUUID();
      localStorage.setItem('anon_viewer_id', anonId);
    }
    return anonId;
  }

  setViewerId() {
  const userId = this.usuario?.id;
    if (userId) {
      this.viewerId = userId;
    } else {
      this.viewerId = this.generateAnonId();
    }
  }
    
startHeartbeat() {
  this.heartbeatInterval = setInterval(() => {
    this.streamService.heartbeat(this.streamId, this.viewerId)
      .subscribe({
        next: (res) => {
          console.log(res)
          this.viewersCount 

        },
        error: err => console.error('Heartbeat error:', err)
      });
  }, 8000);
}

  private scheduleDescriptionHeightCheck(): void {
    if (!this.descripcionElement) {
      console.warn('descripcionElement no disponible aún');
      return;
    }

    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.checkDescriptionHeight();
        });
      });
    }, 100);
  }




toggleExpand(event: Event): void {
  event.preventDefault();
  event.stopPropagation();

  const element = this.descripcionElement.nativeElement;

  if (!this.isExpanded) {
    const fullHeight = element.scrollHeight;
    
    element.style.height = `${fullHeight}px`;
  } else {
    element.style.height = `${element.scrollHeight}px`;
    void element.offsetHeight; 
    element.style.height = '150px';
  }

  this.isExpanded = !this.isExpanded;
  this.cdr.detectChanges();
}

checkDescriptionHeight(): void {
  if (!this.descripcionElement?.nativeElement || !this.stream?.descripcion) {
    this.showToggleLink = false;
    this.isExpanded = false;
    return;
  }

  const element = this.descripcionElement.nativeElement;
  
  const originalHeight = element.style.height;
  element.style.height = 'auto';
  const scrollHeight = element.scrollHeight;
  element.style.height = originalHeight || '150px';

  this.showToggleLink = scrollHeight > 180; 
  this.isExpanded = !this.showToggleLink;

  console.log('[DESCRIPCIÓN] scrollHeight:', scrollHeight, 'showToggleLink:', this.showToggleLink);

  this.cdr.detectChanges();
}

  checkContentOverflow() {
    if (this.descripcionElement) {
      const element = this.descripcionElement.nativeElement;
      this.isContentOverflowing = element.scrollHeight > element.clientHeight;
    }
  }

   private mostrarSidebar(): void {
    this.usuarioGlobal.setSidebarVisible(false);
    this.sidebarSubscription = this.usuarioGlobal.sidebarCollapsed$.subscribe(visible => {
      this.sidebarVisible = visible;
      this.cdr.detectChanges();
    });
  }

  toggleSidebar(): void {
    this.usuarioGlobal.toggleSidebar();
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



  
  viewers:any


  obtenerUsuario(): void {
    this.usuarioGlobal.usuario$.subscribe(res => {
      this.usuario = res;
  
      if (this.usuario) {
        this.userId = this.usuario.id;
        this.obtenerUsuarioConCanal();
        this.verificarSuscripcion();
      }
    });
  
    this.authService.mostrarUserLogueado().subscribe();
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


   handleCinemaMode(isCinemaMode: boolean) {
    console.log('Iniciando handleCinemaMode, isCinemaMode:', isCinemaMode);
    this.isCinemaMode = isCinemaMode;
    this.cinemaModeService.setCinemaMode(isCinemaMode);
    console.log('CinemaMode guardado en servicio:', isCinemaMode);
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
    this.streamService.obtenerInformacionStreams(this.streamId).subscribe(
      (res) => {
        console.log(res)
        this.stream = res.transmision || {};
        this.errorMessage = ''; 
        this.canalId = this.stream.canal_id;




          setTimeout(() => {
            this.scheduleDescriptionHeightCheck(); 
          }, 150);

        this.isBlocked = false;
        this.streamUrl = res.url_hls;
        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();
        this.obtenerDatosDelCanal();
        this.listarNumeroDeSuscriptores(this.canalId);
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

      this.notificacionesActivas = true;

        this.cdr.detectChanges();
      },
      error => this.handleError(error)
    );
  }

  listarNumeroDeSuscriptores(canalId: number) {
    this.suscripcionService.listarNumeroDeSuscriptores(canalId).subscribe(res => {
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
            this.notificacionesActivas = false; 
            this.cdr.detectChanges();
          },
          error => this.handleError(error)
        );
      }
    });
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
        console.log(response)
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

  private handleError(error: any): void {
    if (error.status === 409) {
      this.mensaje = 'Ya estás suscrito a este canal.';
    } else {
      this.mensaje = error.error.message || 'Ha ocurrido un error inesperado.';
    }
  }
  
}
