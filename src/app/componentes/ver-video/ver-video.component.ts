import { Component, HostListener, OnInit, OnDestroy, EventEmitter,ElementRef, ViewChild, QueryList, AfterViewInit, AfterViewChecked, Input, Output, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Overlay } from '@angular/cdk/overlay';
import { VideosService } from '../../servicios/videos.service';
import { AuthService } from '../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../servicios/puntuaciones.service';
import { StatusService } from '../../servicios/status.service';
import { Observable, Subscription, take, filter, fromEvent, } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { ReproductorVideoComponent } from '../reproductor-video/reproductor-video.component';
import { Usuario } from '../../clases/usuario';
import { NavigationEnd } from '@angular/router';
import { combineLatest } from 'rxjs';
import { AutoplayService } from '../../servicios/autoplay.service';


@Component({
  selector: 'app-ver-video',
  templateUrl: './ver-video.component.html',
  styleUrls: ['./ver-video.component.css']
})
export class VerVideoComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  puntuacionSeleccionada: number | null = null;
  videoId: number = 0;
  canalId: number = 0;
  userId: number = 0;
  videos = new Videos();
  video: Videos = new Videos();
  comentario: string = '';
  usuario: Usuario = new Usuario();
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
  idDelCanalDelUsuario: number = 0;
  usuarioConCanal: any;
  idCanal: number = 0;
  canales: any;
  modoCine: boolean = false;
 
  mostrarVideosRecomendados: boolean = false; 
  videosRecomendadosListos: boolean = false;  
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
  playlistId: any;
  fromPlaylist: boolean = false;
  videoIdPlaylist: any;
  videoUrlPlaylist: any;
  notificacionesActivas: boolean = false;
  cargando: boolean = false;
  public videoPublicidadUrl: string | null = null;
  sidebarVisible: boolean = false;

  videosRecomendadosColumnaLateral: any[] = [];   
  videosRecomendadosPantallaFinal: any[] = [];   
  mostrarColumnaLateral: boolean = false;     
  videosPantallaFinalListos: boolean = false;
  mostrarEndScreen: boolean = false;
  @Output() autoplayFinish = new EventEmitter<void>();
  @ViewChild(ReproductorVideoComponent) reproductor!: ReproductorVideoComponent;

  modoGuardado: any;
  nombrePlaylist: any;
  sidebarCollapsed = false;
  duracionFormateada: string = '';
  duracionFormateadaPlaylist: string = '';
  sidebarCollapsed$: Observable<boolean>;
  forceSidebarClosed: boolean = true;
  isAutoplayEnabled = false;
  miniaturaUrl: string = '';

  autoplayActivado = false;
  private autoplaySub!: Subscription;


  private sidebarSubscription!: Subscription;
  private cinemaModeSubscription!: Subscription;
  private zoomSubscription!: Subscription;


  @ViewChild('descripcion') descripcionElement!: ElementRef;

  @ViewChild('videoWrapper', { static: false }) videoWrapper!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideosService,
    private autoplayService: AutoplayService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService,
    private titleService: Title,
    private router: Router,
    private overlay: Overlay,
    private usuarioGlobal: UsuarioGlobalService,
    private puntuarService: PuntuacionesService,
    private playlistService: PlaylistService,
    public status: StatusService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private reporteService: ReportesService,
    private cinemaModeService: ModocineService,
    private renderer: Renderer2,
    private notificacionesService: NotificacionesService
  ) {

    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          const id = +this.route.snapshot.paramMap.get('id')!;
          if (id && id !== this.videoId) {
            this.videoId = id;
            this.videoIdPlaylist = id;
            this.mostrarVideo(); 
          }
        }
      });


    this.sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  }

highlightCommentId: number | null = null;

ngOnInit(): void {

const idComentario = localStorage.getItem('scrollToCommentId');
  if (idComentario) {
    this.highlightCommentId = +idComentario;
    console.log('Resaltando comentario (desde localStorage):', this.highlightCommentId);
  }
    
    this.route.paramMap.subscribe((params: ParamMap) => {
    this.videoId = Number(params.get('id'));
    this.playlistId = Number(params.get('playlistId'));


    this.videoIdPlaylist = this.videoId;

      this.fromPlaylist = !!this.playlistId;

    console.log('🟢 Video ID:', this.videoId, 'Playlist ID:', this.playlistId, 'fromPlaylist:', this.fromPlaylist);

    this.mostrarVideo();

    if (this.fromPlaylist) {
      this.obtenerVideosDePlaylist();
    }

      this.autoplayService.getAutoplay().subscribe(enabled => {
      console.log('UI: Autoplay estado:', enabled);
    });

   
      });

  

    this.isCinemaMode = this.cinemaModeService.getCinemaModeValue();
    this.cinemaModeService.getCinemaMode().subscribe(enabled => {
      this.isCinemaMode = enabled;
    });
    

    this.usuarioGlobal.usuarioConCanal$.subscribe(uc => {
      this.usuarioConCanal = uc;
      this.cdr.detectChanges();
    });



    this.obtenerEstadoDeNotificaciones();
    this.obtenerIdDePlaylist();
    this.obtenerUsuario();
    this.mostrarSidebar();
    this.verificarEdicionVideo();
      this.scrollToCurrentVideo();

    this.checkDescriptionHeight(); 
    this.mostrarColumnaLateral = false;
    this.videosPantallaFinalListos = false;
    this.mostrarEndScreen = false; 

    setTimeout(() => this.verificarSuscripcion(), 100);

    const storedCinemaMode = localStorage.getItem('cinemaMode');
    this.isCinemaMode = storedCinemaMode ? JSON.parse(storedCinemaMode) : false;
    this.cdr.detectChanges();

    setTimeout(() => {
    this.cdr.detectChanges();
      }, 500);
  }

  puedeEditar(video: any): boolean {
    if (!this.usuarioConCanal || !this.usuarioConCanal.canales) return false;
    return this.usuarioConCanal.canales.id === video.canal_id;
  }

  get puedeEditarVideo(): boolean {
    return !!this.usuarioConCanal?.canales && !!this.video && this.usuarioConCanal.canales.id === this.video.canal_id;
  }

  comentarioIdParaIr: number | null = null;

  ngAfterViewInit(): void {

  }

  ngAfterViewChecked(): void {
  }

  ngOnChanges() {
    if (this.video?.descripcion) {
      setTimeout(() => {
        this.checkDescriptionHeight();
        this.cdr.detectChanges();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.sidebarSubscription?.unsubscribe();
    this.cinemaModeSubscription?.unsubscribe();
    if (this.autoplaySub) this.autoplaySub.unsubscribe();

    this.zoomSubscription?.unsubscribe();
    this.fromPlaylist = false;
  }



  videoTerminado: boolean = false;

  get videosRecomendadosParaReproductor(): any[] {
    this.mostrarEndScreen = this.videoTerminado && !this.reproduciendoPublicidad;  
    return this.mostrarEndScreen ? this.videosRecomendadosPantallaFinal : [];
  }

 @ViewChild('reproductorVideo') reproductorVideo!: ReproductorVideoComponent;

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

    puntuaciones: any = {
      puntuacion_1: 0,
      puntuacion_2: 0,
      puntuacion_3: 0,
      puntuacion_4: 0,
      puntuacion_5: 0
    };

    totalVotos: number = 0;



  obtenerEstadoDeNotificaciones() {
    if (!this.userId || !this.canalId) {
      console.log('[Notificaciones] userId o canalId no definidos, se retrasa la llamada');
      return;
    }
    this.notificacionesService.obtenerEstado(this.canalId, this.userId).subscribe({
      next: (res: any) => this.notificacionesActivas = res.notificaciones,
      error: () => this.notificacionesActivas = false
    });
  }

 toggleNotificaciones(): void {
  this.cargando = true;
  this.notificacionesService.cambiarEstado(this.canalId, this.userId, !this.notificacionesActivas).subscribe({
    next: () => {
      this.notificacionesActivas = !this.notificacionesActivas;
      this.cargando = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.cargando = false;
      this.cdr.detectChanges();
    }
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
  }

  reloadPage(event: Event) {
    event.preventDefault();
    const target = event.currentTarget as HTMLAnchorElement;
    window.location.href = target.href;
  }

  obtenerUsuario(): void {
    this.usuarioGlobal.usuario$.subscribe(res => {
      this.usuario = res;
      console.log(res)
      if (this.usuario) {
        this.userId = this.usuario.id;
        this.obtenerEstadoDeNotificaciones();
        this.obtenerPuntuacionActual();
        this.verificarSuscripcion();
        this.visitar(this.userId);
      } else {
        this.visitar();
      }
    });
    this.authService.mostrarUserLogueado().subscribe();
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
  if (!this.descripcionElement?.nativeElement || !this.video?.descripcion) {
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

  obtenerVideosRelacionados(videoId: number) {
    console.log('[DEBUG] Cargando recomendados... Columna:', this.mostrarColumnaLateral);
    this.videoService.listarVideosRelacionados(videoId).subscribe(
      (res: any[]) => {
        const videosConDuracion = res.map(video => ({
          ...video,
          duracionFormateada: this.convertirDuracion(video.duracion)
        }));
        
        this.videosRecomendadosColumnaLateral = videosConDuracion; 
        this.videosRecomendadosPantallaFinal = videosConDuracion; 
        
        console.log('[Recomendados] Cargados:', videosConDuracion.length);
      },
      error => {
        console.error('Error al obtener videos relacionados:', error);
        this.videosRecomendadosColumnaLateral = [];
        this.videosRecomendadosPantallaFinal  = [];
      }
    );
  }

  private verificarEdicionVideo(): void {
    this.usuarioGlobal.usuarioConCanal$.pipe(
      filter(uc => uc !== null),
      take(1)
    ).subscribe(uc => {
      this.usuarioConCanal = uc;
      this.cdr.detectChanges();
    });
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



  publicidadCargando: boolean = false; 


  cargarPublicidad(): void {
  if (this.publicidadCargando) {
    console.log('[PUBLICIDAD] Ya cargando, ignorando...');
    return;
  }
  
  this.publicidadCargando = true;
  this.mostrarEndScreen = false;
  console.log('[PUBLICIDAD] Iniciando...');
  
  this.videoService.obtenerPublicidad().subscribe(
    (data) => {
      this.publicidad = data;
      this.reproduciendoPublicidad = true;
      this.videoPublicidadUrl = this.publicidad.link;
      this.nombrePublicidad = this.publicidad.titulo;
      this.publicidadDuracionRestante = this.publicidad.duracion;
      this.mostrarBotonSaltar = false;
      
      let intervalo: any;
      
      setTimeout(() => {
        intervalo = setInterval(() => {
          if (this.publicidadDuracionRestante > 0) {
            this.publicidadDuracionRestante--;
          } else {
            clearInterval(intervalo);
            this.reproduciendoPublicidad = false;
            this.finalizarPublicidad();
          }
        }, 1000);
        
        setTimeout(() => {
          this.mostrarBotonSaltar = true;
          this.cdr.detectChanges(); 
        }, 5000); 

      }, 500);
    },
    error => {
      console.error('Error al cargar publicidad:', error);
      this.publicidadCargando = false;
    }
  );
}

  finalizarPublicidad(): void {
    this.reproduciendoPublicidad = false;
    this.videoPublicidadUrl = null;
    this.mostrarColumnaLateral = false;      
    this.videosPantallaFinalListos= false;       
    
    this.videoService.obtenerInformacionVideo(this.videoId).subscribe(
      (res) => {
        this.video = res;
        this.canalId = this.video.canal_id;
        
        if (this.video?.error?.code === 403) {
          this.isBlocked = true;
          this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
          this.mostrarColumnaLateral = true;  
          return;
        }
        
        this.isBlocked = false;


      if (this.reproductor) {
        this.reproductor.cambiarVideoSinMutear(this.video.link);
      }
        
        if (this.videoUrl !== this.video.link) {
          this.videoUrl = this.video.link;
        }
        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();
        
        setTimeout(() => {
          this.mostrarColumnaLateral = true;
          this.obtenerVideosRelacionados(this.videoId);
          this.listarNumeroDeSuscriptores(this.canalId);
          
          setTimeout(() => {
            const lateral = document.querySelector('.columnaLateral') as HTMLElement;
            if (lateral) lateral.classList.add('mostrar');
          }, 50);
          
          this.cdr.detectChanges();
          this.publicidadCargando = false;
        }, 800);
      },
      error => {
        this.isBlocked = false;
        this.errorMessage = this.obtenerMensajeDeError(error);
        this.mostrarColumnaLateral = true;
      }
    );
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
    this.publicidadCargando = false;
  }

  openReportModal() {
    const dialogRef = this.dialog.open(ModalReporteVideoComponent, {
      width: '400px',
      data: { videoId: this.videoId, userId: this.userId }
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

    calcularTotalVotos() {
    this.totalVotos =
      this.video.puntuacion_1 +
      this.video.puntuacion_2 +
      this.video.puntuacion_3 +
      this.video.puntuacion_4 +
      this.video.puntuacion_5;
  }


  mostrarVideo(): void {
    this.mostrarColumnaLateral = false;      
    this.videosPantallaFinalListos = false;     
    

    this.videoService.obtenerInformacionVideo(this.videoId).subscribe(
      (res) => {
        this.video = new Videos(res);
        console.log(res)
        this.cdr.detectChanges();
        this.errorMessage = '';
        this.canalId = this.video.canal_id;
        
        if (this.video?.error?.code === 403) {
          this.isBlocked = true;
          this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
          this.mostrarColumnaLateral = true;
          return;
        }
        
        if (this.playlistId) {
          this.obtenerVideosDePlaylist();
        }

        if (!this.fromPlaylist) {
          this.videosDePlaylist = [];
        }
        
        this.isBlocked = false;
        this.videoUrl = this.video.link;
        this.miniaturaUrl = this.video.miniatura;
        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();
        this.calcularTotalVotos();

        this.cdr.detectChanges(); // Primero aseguramos que el DOM se actualice

          setTimeout(() => {
            this.scheduleDescriptionHeightCheck(); // Usar función segura
          }, 150);
        
        setTimeout(() => {
          this.mostrarColumnaLateral = true;
          this.obtenerVideosRelacionados(this.videoId);
          this.listarNumeroDeSuscriptores(this.canalId);
          if (this.canalId) {
            this.obtenerEstadoDeNotificaciones();
          }
          this.cdr.detectChanges();
        }, 300);
      },
      error => {
        this.isBlocked = false;
        this.errorMessage = this.obtenerMensajeDeError(error);
        this.mostrarColumnaLateral = true;
      }
    );
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

  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }

  terminarVideo(): void {
    console.log('[END-SCREEN] Video terminado!');
    this.videoTerminado = true;  
    
    if (this.reproduciendoPublicidad) {
      this.finalizarPublicidad();
    } else {
      this.mostrarEndScreen = true; 
      setTimeout(() => this.siguienteVideo(), 500);  
    }
    
  }
  
  onVideoTerminado(): void {
    console.log('[VerVideo] Video terminado → buscando siguiente en playlist');
      const autoplayActivo = this.autoplayService.getAutoplayValue();

    if (!this.fromPlaylist || !this.playlistId) {
      console.log('No es playlist → no autoplay');
      this.terminarVideo();
      return;
    }
    
    if (this.autoplayService.getAutoplayValue()) {
        console.log('Autoplay activado → siguiente video');
        this.siguienteVideo();
      } else {
        console.log('Autoplay desactivado → mostrar end screen');
        this.mostrarEndScreen = true;
      }

  }


  cargarSiguienteVideoDePlaylist(): void {
    if (!this.playlistId || !this.videoId) return;
  
    this.cargando = true;
  
    this.playlistService.obtenerSiguienteVideo(this.playlistId, this.videoId).subscribe({
      next: (response: any) => {
        this.cargando = false;
  
        if (response.success && response.data) {
          const siguiente = response.data;
  
          this.videoUrl = siguiente.link; 
  
          this.videoId = siguiente.id;
          this.videoIdPlaylist = siguiente.id;
  
          this.video = { ...this.video, ...siguiente };
          this.actualizarTituloDePagina();
  
          this.canalId = siguiente.canal_id;
          this.listarNumeroDeSuscriptores(this.canalId);
  
          this.cdr.detectChanges();
  
          setTimeout(() => {
            const videoElement = document.querySelector('video') as HTMLVideoElement;
            if (videoElement) {
              videoElement.play().catch(err => {
                console.warn('Autoplay bloqueado (política del navegador):', err);
              });
            }
          }, 300);
  
        } else {
          console.log('No hay más videos:', response.message);
          this.terminarVideo(); 
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al obtener siguiente video:', err);
        this.terminarVideo();
      }
    });
  }

  
obtenerVideosDePlaylist(): void {
  this.playlistService.obtenerPlaylistConVideos(this.playlistId, this.videoId, this.fromPlaylist)
    .subscribe({
      next: (res) => {
        if (!res?.data?.playlist || !res.data.playlist.videos?.length) {
          console.warn('Playlist no encontrada o vacía, redirigiendo al video solo');
          this.router.navigate(['/video', this.videoId]);
          return;
        }

        const playlist = res.data.playlist;

        // APLICAMOS EL FORMATEO DE DURACIÓN A CADA VIDEO
        this.videosDePlaylist = playlist.videos.map((v: any) => ({
          ...new Videos(v), // si tu clase Videos ya tiene lógica, la mantenemos
          duracionFormateadaPlaylist: this.convertirDuracion(v.duracion)
        }));

        this.nombrePlaylist = playlist.nombre;

        console.log('Playlist cargada correctamente');
        console.log('Nombre playlist:', this.nombrePlaylist);
        console.log('Videos con duración formateada:', this.videosDePlaylist);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar playlist:', err);
        this.router.navigate(['/video', this.videoId]);
      }
    });
}

  @ViewChild('videoItem') videoItems!: QueryList<ElementRef>;


  scrollToCurrentVideo(): void {
    setTimeout(() => {
      const currentItem = this.videoItems.find(
        el => +el.nativeElement.querySelector('.video-link')?.href.split('/').slice(-3, -2)[0] === this.videoIdPlaylist
      );
      if (currentItem) {
        currentItem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  }

  siguienteVideoDatos: any = null;

  siguienteVideo(): void {

    if (!this.autoplayService.getAutoplayValue()) {
        console.log('Autoplay desactivado → no avanzar');
        this.mostrarEndScreen = true;
        return;
      }

    if (!this.playlistId || !this.videoId) {
      console.warn('⚠️ No hay playlist o video actual definidos');
      this.mostrarEndScreen = true;
      return;
    }


    this.playlistService.obtenerSiguienteVideo(this.playlistId, this.videoId)
      .subscribe({
        next: (res: any) => { 
          console.log('Respuesta del backend:', res);
                this.siguienteVideoDatos = {
                  id: res.id,
                  titulo: res.titulo,
                  miniatura: res.miniatura,
                };

          if (res?.data?.id) {
            const siguienteId = res.data.id;
            console.log('🎬 Siguiente video ID:', siguienteId);
            
            this.router.navigate(['/video', siguienteId, 'playlist', this.playlistId]);
          } else {
            console.log('📁 No hay más videos en la playlist');
            this.mostrarEndScreen = true;
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener siguiente video:', err);
          this.mostrarEndScreen = true;
        }
      });
  }


  get videosParaMostrar(): Videos[] {
    return this.videosDePlaylist.filter(video => video.id !== this.videoIdPlaylist);
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

  visitar(userId?: number, progresoSegundos: number = 0, completado: boolean = false): void {
    const esInvitado = !this.usuario;
    const contadorClave = esInvitado ? 'contadorVideosInvitado' : `contadorVideos_${userId}`;
    let contadorTotal = this.cargarContador(contadorClave) || 0;

    const visitaObservable: Observable<any> = esInvitado
      ? this.videoService.contarVisitaInvitado(this.videoId, progresoSegundos, completado)
      : userId
        ? this.videoService.contarVisita(this.videoId, userId!, progresoSegundos, completado)
        : null as any;


    if (!visitaObservable) {
      console.error('[Visitar] Usuario no autenticado y sin ID válido.');
      return;
    }
    visitaObservable.pipe(take(1)).subscribe({
      next: (res) => {
        console.log('[Visitar] Respuesta del servicio:', res);
        contadorTotal++;
        this.guardarContador(contadorClave, contadorTotal);
        console.log(`[Visitar] Contador total actualizado: ${contadorTotal}`);
        if (contadorTotal >= 3 && (!this.usuario || this.usuario.premium !== 1)) {
          console.log('[Visitar] Contador límite alcanzado, cargando publicidad...');
          this.guardarContador(contadorClave, 0);
          this.cargarPublicidad();
        }
      },
      error: (err) => {
        console.error('[Visitar] Error al contar visita:', err);
      }
    });
    if (esInvitado) {
      const claveVideoSesion = `videoVisitado_${this.videoId}`;
      if (!sessionStorage.getItem(claveVideoSesion)) {
        sessionStorage.setItem(claveVideoSesion, '1');
        console.log(`[Visitar] Invitado marcado como visitante del video ${this.videoId}`);
      }
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
            this.notificacionesActivas = false; // ← seguro
            this.cdr.detectChanges();
          },
          error => this.handleError(error)
        );
      }
    });
  }

  agregarAVideoALista(): void {
    const dialogRef = this.dialog.open(AgregarListaComponent, {
      data: { videoId: this.videoId },
      autoFocus: false,
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop()
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