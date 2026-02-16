import { Component, HostListener, OnInit, OnDestroy, EventEmitter,ElementRef, ViewChild, QueryList, AfterViewInit, AfterViewChecked, Input, Output, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Overlay } from '@angular/cdk/overlay';
import { VideosService } from '../../../servicios/videos.service';
import { AuthService } from '../../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../../servicios/puntuaciones.service';
import { StatusService } from '../../../servicios/status.service';
import { Observable, Subscription, take, filter, fromEvent, } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Videos } from '../../../clases/videos';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CrearListaComponent } from '../../componentes-de-playlist/crear-lista/crear-lista.component';
import { SuscripcionesService } from '../../../servicios/suscripciones.service';
import { ConfirmacionDesuscribirModalComponent } from '../../modales/confirmacion-desuscribir-modal/confirmacion-desuscribir-modal.component';
import { AgregarListaComponent } from '../../componentes-de-playlist/agregar-lista/agregar-lista.component';
import { ReportesService } from '../../../servicios/reportes.service';
import { ModalReporteVideoComponent } from '../../modales/modal-reporte-video/modal-reporte-video.component';
import { PlaylistService } from '../../../servicios/playlist.service';
import { NotificacionesService } from '../../../servicios/notificaciones.service';
import { ModocineService } from '../../../servicios/modocine.service';
import { UsuarioGlobalService } from '../../../servicios/usuario-global.service';
import { ReproductorVideoComponent } from '../reproductor-video/reproductor-video.component';
import { Usuario } from '../../../clases/usuario';
import { NavigationEnd } from '@angular/router';
import { combineLatest } from 'rxjs';
import { AutoplayService } from '../../../servicios/autoplay.service';


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
  video: Videos = new Videos();
  isLoading = true;
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
  private visitaContada: boolean = false;
  videosRecomendadosListos: boolean = false;  
  numeroDeSuscriptores: any;
  errorMessage: string = '';
  isBlocked: boolean = false;
  isNotFound: boolean = false;  
  private visitaYaContadaParaEsteVideo: boolean = false;
  dropdownVisible: boolean = false;
  dropdownVisibleLateral: number | null = null;
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
  hoverValor: number | null = null;
defaultAvatar = 'assets/images/user.svg';

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
  isMobile = false;
  commentsSheetOpen = false;
  isDragging = false;
  startY = 0;
  currentY = 0;
  deltaY = 0;
  totalComentarios = 0;

  private sidebarSubscription!: Subscription;
  private cinemaModeSubscription!: Subscription;
  private zoomSubscription!: Subscription;
  private routerEventsSubscription!: Subscription;
  private autoplaySubscription!: Subscription;
  private usuarioConCanalSubscription!: Subscription;
  private usuarioSubscription!: Subscription;

  private pendingTimeouts: number[] = [];
  private overlayComment!: HTMLElement;

  @ViewChild('descripcion') descripcionElement!: ElementRef;
  @ViewChild('commentsSheet') sheetRef!: ElementRef<HTMLElement>;
  @ViewChild('commentsOverlay') overlayRef!: ElementRef<HTMLElement>;
  @ViewChild('videoWrapper', { static: false }) videoWrapper!: ElementRef;
  @ViewChild('sheet', { static: false }) sheet!: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(): void {
    this.limpiarEstadoPlaylist();
  }


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

    this.routerEventsSubscription = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          const id = +this.route.snapshot.paramMap.get('id')!;
          
          if (id && id !== this.videoId) {
            const currentUrl = event.url;
            const hasPlaylistParam = currentUrl.includes('/playlist/');
            const wasFromPlaylist = this.fromPlaylist;
            
            if (wasFromPlaylist && !hasPlaylistParam) {
              console.log('🔄 Navegando fuera de playlist, limpiando estado...');
              this.limpiarEstadoPlaylist();
            }
            
            this.videoId = id;
            this.videoIdPlaylist = id;
            this.visitaContada = false;
            this.visitaYaContadaParaEsteVideo = false; 
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
    const newVideoId = Number(params.get('id'));
    const playlistIdFromParams = params.get('playlistId');
    
    console.log('📍 NAVEGACIÓN DETECTADA:', {
      videoAnterior: this.videoId,
      videoNuevo: newVideoId,
      playlistId: playlistIdFromParams,
      url: window.location.pathname,
      esNavegacionManual: this.videoId !== newVideoId
    });
    
    this.videoId = newVideoId;
    console.log('✅ VideoID actualizado a:', this.videoId);
    
    console.log('🔍 Parámetros de ruta completos:', {
      id: params.get('id'),
      playlistId: playlistIdFromParams,
      ruta: window.location.pathname,
      allParams: params.keys.map(key => ({ [key]: params.get(key) }))
    });

    const playlistIdNumber = playlistIdFromParams ? Number(playlistIdFromParams) : 0;
    
    if (playlistIdFromParams && playlistIdNumber > 0) {
      this.playlistId = playlistIdNumber;
      this.fromPlaylist = true;
      
      localStorage.setItem('fromPlaylist', 'true');
      localStorage.setItem('currentPlaylistId', this.playlistId.toString());
      
      this.siguienteVideoDisponible = true;
      
      console.log('✅ Playlist detectada desde URL - ID:', this.playlistId, 'Ruta:', window.location.pathname);
    } else {
      console.log('❌ No se encontró playlistId válido en URL, limpiando estado de playlist...');
      this.limpiarEstadoPlaylist();
    }

    this.videoIdPlaylist = this.videoId;

    console.log('🟢 Video ID:', this.videoId, 'Playlist ID:', this.playlistId, 'fromPlaylist:', this.fromPlaylist);

    this.mostrarVideo();

    if (this.fromPlaylist) {
        this.obtenerVideosDePlaylist();
    }

    this.autoplaySubscription = this.autoplayService.getAutoplay().subscribe(enabled => {
      console.log('UI: Autoplay estado:', enabled);
    });

    this.isCinemaMode = this.cinemaModeService.getCinemaModeValue();
    this.cinemaModeSubscription = this.cinemaModeService.getCinemaMode().subscribe(enabled => {
      this.isCinemaMode = enabled;
    });
    
    this.usuarioConCanalSubscription = this.usuarioGlobal.usuarioConCanal$.subscribe(uc => {
      this.usuarioConCanal = uc;
      this.cdr.detectChanges();
    });

    this.detectMobile();
    window.addEventListener('resize', () => this.detectMobile());

    this.obtenerEstadoDeNotificaciones();
    this.obtenerUsuario();
    this.mostrarSidebar();
    this.verificarEdicionVideo();
    this.scrollToCurrentVideo();

    this.checkDescriptionHeight(); 
    this.mostrarColumnaLateral = false;
    this.videosPantallaFinalListos = false;
    this.mostrarEndScreen = false; 

    this.scheduleTimeout(() => this.verificarSuscripcion(), 100);

    const storedCinemaMode = localStorage.getItem('cinemaMode');
    this.isCinemaMode = storedCinemaMode ? JSON.parse(storedCinemaMode) : false;
    this.cdr.detectChanges();

    this.scheduleTimeout(() => {
    this.cdr.detectChanges();
      }, 500);
  });
}



detectMobile() {
  this.isMobile = window.innerWidth <= 1024;
  
  // Desactivar modo cinema en responsive
  if (this.isMobile && this.isCinemaMode) {
    this.isCinemaMode = false;
    this.cinemaModeService.setCinemaMode(false);
  }
  
  if (!this.isMobile && this.commentsSheetOpen) {
    this.commentsSheetOpen = false;
    document.body.style.overflow = '';
    
    if (this.sheet?.nativeElement) {
      const el = this.sheet.nativeElement;
      el.style.transform = '';
      el.style.transition = '';
      el.classList.remove('open');
    }
  }
}

openCommentsSheet() {
  this.commentsSheetOpen = true;
  document.body.style.overflow = 'hidden';

  this.scheduleTimeout(() => {
    if (this.sheet?.nativeElement) {
      const el = this.sheet.nativeElement;

      el.style.transition = '';
      el.style.transform = 'translateY(0)';
      el.classList.add('open');
    }
  }, 20)
}

closeCommentsSheet() {
  this.commentsSheetOpen = false;
  document.body.style.overflow = '';

  requestAnimationFrame(() => {
    if (this.sheet?.nativeElement) {
      const el = this.sheet.nativeElement;

      el.classList.remove('open');
      el.style.transition = '';
      el.style.transform = 'translateY(100%)';
    }
  });
}
onTouchStart(e: TouchEvent) {
  const target = e.target as HTMLElement;
  
  if (!target.closest('.sheet-header')) return;

  const inner = this.sheet.nativeElement.querySelector('app-comentarios');
  if (inner && inner.scrollTop > 0) return;

  this.startY = e.touches[0].clientY;
  this.currentY = this.startY;
  this.isDragging = true;

  this.sheet.nativeElement.classList.remove('open');
  this.sheet.nativeElement.style.transition = 'none';
}

onTouchMove(evt: TouchEvent) {
  if (!this.isDragging) return;

  const currentY = evt.touches[0].clientY;
  let delta = currentY - this.startY;

  if (delta < 0) delta = 0;

  this.sheet.nativeElement.style.transform = `translateY(${delta}px)`;
}
onTouchEnd() {
  if (!this.isDragging) return;

  const sheetEl = this.sheet.nativeElement;
  sheetEl.style.transition = 'transform 0.3s ease';

  const match = sheetEl.style.transform.match(/translateY\(([\d.]+)px\)/);
  const delta = match ? Number(match[1]) : 0;

  if (delta > 120) {
  sheetEl.style.transform = `translateY(100%)`;

  this.scheduleTimeout(() => {
    this.closeCommentsSheet();

    sheetEl.style.transition = '';
    sheetEl.style.transform = '';
    sheetEl.classList.remove('open');
  }, 250)
}
  else {
    sheetEl.classList.add('open');
    sheetEl.style.transform = 'translateY(0)';
  }

  this.isDragging = false;
}

  puedeEditar(video: any): boolean {
    if (!this.usuarioConCanal || !this.usuarioConCanal.canales) return false;
    return this.usuarioConCanal.canales.id === video.canal_id;
  }

  get puedeEditarVideo(): boolean {
    return !!this.usuarioConCanal?.canales && !!this.video && this.usuarioConCanal.canales.id === this.video.canal_id;
  }

  comentarioIdParaIr: number | null = null;
  @ViewChild('videoPageWrapper') videoPageWrapper!: ElementRef;

  ngAfterViewInit() {
    this.overlayComment = document.querySelector('.comments-overlay') as HTMLElement;
    if (window.innerWidth > 1024) return;

    const wrapper = this.videoPageWrapper.nativeElement;
    let ticking = false;
    let lastScrollY = 0;

    const updatePlayer = () => {
      const scrollY = window.scrollY;
      const threshold = 120; 

      if (scrollY > threshold && scrollY > lastScrollY) { 
        this.scheduleTimeout(() => {
          wrapper.classList.add('sticky-header-player');
          wrapper.classList.remove('pre-active'); 
        }, 10) 
      } else if (scrollY < threshold) {
        wrapper.classList.remove('sticky-header-player');
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updatePlayer);
        ticking = true;
      }
    });

  }


  ngAfterViewChecked(): void {
  }

  ngOnChanges() {
    if (this.video?.descripcion) {
      this.scheduleTimeout(() => {
        this.checkDescriptionHeight();
        this.cdr.detectChanges();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.sidebarSubscription?.unsubscribe();
    this.cinemaModeSubscription?.unsubscribe();
    this.autoplaySubscription?.unsubscribe();
    this.zoomSubscription?.unsubscribe();
    this.routerEventsSubscription?.unsubscribe();
    this.usuarioConCanalSubscription?.unsubscribe();
    this.usuarioSubscription?.unsubscribe();

    this.pendingTimeouts.forEach(id => clearTimeout(id));
    this.pendingTimeouts = [];

    this.visitaContada = false;
    
    this.limpiarEstadoPlaylist();
  }

  private limpiarEstadoPlaylist(): void {
    console.log('🧹 Limpiando estado de playlist del localStorage');
    this.fromPlaylist = false;
    localStorage.removeItem('fromPlaylist');
    localStorage.removeItem('currentPlaylistId');
    localStorage.removeItem('currentPlaylistData');
    this.playlistId = null;
    this.videosDePlaylist = [];
  }

  private scheduleTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(callback, delay);
    this.pendingTimeouts.push(id);
    return id;
  }



  videoTerminado: boolean = false;

  get videosRecomendadosParaReproductor(): any[] {

    return this.videosRecomendadosPantallaFinal || [];
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
    const playlistIdFromRoute = this.route.snapshot.params['playlistId'];
    
    if (playlistIdFromRoute) {
      this.playlistId = Number(playlistIdFromRoute);
      this.fromPlaylist = true;
      console.log('playlistId recibido desde URL:', this.playlistId);
      return;
    }

    const state = history.state as { playlistId: number };
    if (state && state.playlistId) {
      this.playlistId = state.playlistId;
      this.fromPlaylist = true;
      console.log('playlistId recibido desde history.state:', this.playlistId);
      return;
    }

    const fromPlaylistStorage = localStorage.getItem('fromPlaylist');
    const playlistIdStorage = localStorage.getItem('currentPlaylistId');
    const playlistDataStorage = localStorage.getItem('currentPlaylistData');
    
    if (fromPlaylistStorage === 'true' && playlistIdStorage) {
      this.playlistId = Number(playlistIdStorage);
      this.fromPlaylist = true;
      console.log('playlistId recuperado desde localStorage (ID):', this.playlistId);
      return;
    }
    
    if (fromPlaylistStorage === 'true' && playlistDataStorage) {
      try {
        const playlistData = JSON.parse(playlistDataStorage);
        this.playlistId = playlistData.id;
        this.fromPlaylist = true;
        console.log('playlistId recuperado desde localStorage (datos):', this.playlistId);
        return;
      } catch (error) {
        console.error('Error parsing playlist data from localStorage:', error);
      }
    }

    this.fromPlaylist = false;
    console.log('No se encontró información de playlist');
  }

  reloadPage(event: Event) {
    event.preventDefault();
    const target = event.currentTarget as HTMLAnchorElement;
    window.location.href = target.href;
  }

  obtenerUsuario(): void {
    this.usuarioSubscription = this.usuarioGlobal.usuario$.subscribe(res => {
      this.usuario = res;
      console.log(res)
      if (this.usuario && this.usuario.id) {
        this.userId = this.usuario.id;
        this.obtenerEstadoDeNotificaciones();
        this.obtenerPuntuacionActual();
        this.verificarSuscripcion();
        if (!this.visitaYaContadaParaEsteVideo) {
          this.visitar(this.userId);
        }
      } else {
        if (!this.visitaYaContadaParaEsteVideo) {
          this.visitar(); 
        }
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
        console.log('🎯 Videos disponibles para autoplay:', this.videosRecomendadosPantallaFinal.length);
        
        // Notificar al reproductor que hay videos disponibles
        this.siguienteVideoDisponible = videosConDuracion.length > 0;
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error al obtener videos relacionados:', error);
        this.videosRecomendadosColumnaLateral = [];
        this.videosRecomendadosPantallaFinal  = [];
        this.siguienteVideoDisponible = false;
        this.cdr.detectChanges();
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

  toggleDropdownLateral(videoId: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.dropdownVisibleLateral = this.dropdownVisibleLateral === videoId ? null : videoId;
  }

  agregarVideoALista(videoId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.status.isLoggedIn) {
      window.location.href = this.serverIp + '3002/#/';
      return;
    }
    
    const dialogRef = this.dialog.open(AgregarListaComponent, {
      data: { videoId: videoId },
      autoFocus: false,
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Video agregado a la lista');
      }
    });
    
    this.dropdownVisibleLateral = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.options')) {
      this.dropdownVisible = false;
    }
    if (!target.closest('.options-btn-lateral') && !target.closest('.dropdown-menu-lateral')) {
      this.dropdownVisibleLateral = null;
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
      
      this.scheduleTimeout(() => {
        intervalo = setInterval(() => {
          if (this.publicidadDuracionRestante > 0) {
            this.publicidadDuracionRestante--;
          } else {
            clearInterval(intervalo);
            this.reproduciendoPublicidad = false;
            this.finalizarPublicidad();
          }
        }, 1000);
        
        this.scheduleTimeout(() => {
          this.mostrarBotonSaltar = true;
          this.cdr.detectChanges(); 
        }, 5000); 

      }, 500)
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
        
        this.scheduleTimeout(() => {
          this.mostrarColumnaLateral = true;
          this.obtenerVideosRelacionados(this.videoId);
          this.listarNumeroDeSuscriptores(this.canalId);
          
          this.scheduleTimeout(() => {
            const lateral = document.querySelector('.columnaLateral') as HTMLElement;
            if (lateral) lateral.classList.add('mostrar');
          }, 50);
          
          this.cdr.detectChanges();
          this.publicidadCargando = false;
        }, 800)
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
    if (!this.status.isLoggedIn) {
      window.location.href = this.serverIp + '3002/#/';
      return;
    }
    
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

  openReportModalForVideo(videoId: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.status.isLoggedIn) {
      window.location.href = this.serverIp + '3002/#/';
      return;
    }
    
    const dialogRef = this.dialog.open(ModalReporteVideoComponent, {
      width: '400px',
      data: { videoId: videoId, userId: this.userId }
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.handleReportSubmitted(response);
      }
    });
    this.dropdownVisibleLateral = null;
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
    this.visitaContada = false;
    this.visitaYaContadaParaEsteVideo = false;
    this.mostrarColumnaLateral = false;      
    this.videosPantallaFinalListos = false;     
    

    this.videoService.obtenerInformacionVideo(this.videoId).subscribe({
     next: (res) => {
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

        this.cdr.detectChanges(); 

          this.scheduleTimeout(() => {
            this.scheduleDescriptionHeightCheck(); 
          }, 150);
        
        this.scheduleTimeout(() => {
          this.mostrarColumnaLateral = true;
          this.obtenerVideosRelacionados(this.videoId);
          this.listarNumeroDeSuscriptores(this.canalId);
          if (this.canalId) {
            this.obtenerEstadoDeNotificaciones();
          }
          this.cdr.detectChanges();
        }, 300)
      },
     error: (err) => {
      console.warn('Error al cargar video:', err);

      this.mostrarColumnaLateral = true;

      if (err.status === 404) {
        this.isNotFound = true;
        this.isBlocked = false;
        this.errorMessage = '';
        return;
      }

      if (err.status === 403 || err.status === 451) {
        this.manejarBloqueo();
        return;
      }

      this.isBlocked = false;
      this.isNotFound = false;
      this.errorMessage = this.obtenerMensajeDeErrorAmigable(err);
    }
  });
  }


  
  private manejarBloqueo(): void {
    this.isBlocked = true;
    this.isNotFound = false;
    this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
  }

  private obtenerMensajeDeErrorAmigable(error: any): string {
    if (error.status === 0) {
      return 'No hay conexión a internet. Verifica tu red e inténtalo de nuevo.';
    }
    if (error.status >= 500) {
      return 'Error en el servidor. Inténtalo más tarde.';
    }
    return 'Ocurrió un error al cargar el video. Por favor, intenta de nuevo.';
  }



  private scheduleDescriptionHeightCheck(): void {
    if (!this.descripcionElement) {
      console.warn('descripcionElement no disponible aún');
      return;
    }

    this.scheduleTimeout(() => {
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
    }
    
  }
  siguienteVideoDisponible: boolean = true;
  onVideoTerminado(): void {
    console.log('🎯 Video terminado SIN autoplay - mostrando end screen');
    this.terminarVideo();
  }

  onSolicitarSiguienteVideo(): void {
    console.log('📨 COUNTDOWN COMPLETADO - Reproductor solicita siguiente video');
    console.log('🔍 Estado actual:', {
      fromPlaylist: this.fromPlaylist,
      playlistId: this.playlistId,
      videoId: this.videoId,
      URLactual: window.location.pathname,
      autoplay: this.autoplayService.getAutoplayValue(),
      siguienteDisponible: this.siguienteVideoDisponible,
      videosRecomendados: this.videosRecomendadosPantallaFinal.length
    });
    
    if (!this.autoplayService.getAutoplayValue()) {
      console.log('⚠️ Autoplay desactivado - no reproducir siguiente');
      return;
    }
    
    if (this.fromPlaylist && this.playlistId) {
      console.log('🎬 Navegando al siguiente video de la playlist');
      this.verificarYNavegar();
    } 
    else if (this.videosRecomendadosPantallaFinal && this.videosRecomendadosPantallaFinal.length > 0) {
      const primerRecomendado = this.videosRecomendadosPantallaFinal[0];
      console.log('🎥 Reproduciendo primer video recomendado:', primerRecomendado.id, primerRecomendado.titulo);
      this.router.navigate(['/video', primerRecomendado.id]);
    } else {
      console.log('⚠️ No hay siguiente video disponible');
    }
  }

  verificarYNavegar(): void {
    console.log('� INICIANDO verificación de siguiente video');
    console.log('🔍 Datos:', { playlist: this.playlistId, videoActual: this.videoId });
    console.log('📍 URL actual:', window.location.pathname);
    this.siguienteVideo();
  }

  onVerificarSiguienteVideo(): void {
    console.log('🔍 Reproductor solicita verificación ANTES del countdown');
    
    if (this.fromPlaylist && this.playlistId) {
      this.playlistService.obtenerSiguienteVideo(this.playlistId, this.videoId)
        .subscribe({
          next: (res: any) => {
            if (res?.data?.id) {
              console.log('✅ HAY siguiente video en playlist - iniciando countdown');
              this.siguienteVideoDisponible = true;
              if (this.reproductorComponent && this.reproductorComponent.startAutoplayCountdown) {
                console.log('🎯 Llamando countdown directamente al reproductor');
                this.reproductorComponent.startAutoplayCountdown();
              }
            } else {
              console.log('❌ NO HAY más videos en playlist - mostrar end screen con recomendados');
              this.siguienteVideoDisponible = false;
              if (this.reproductorComponent) {
                console.log('🛑 Mostrando end screen con recomendados');
                this.reproductorComponent.mostrarEndScreenConRecomendados();
              }
            }
          },
          error: (err) => {
            console.error('❌ Error verificando siguiente video de playlist:', err);
            this.siguienteVideoDisponible = false;
            if (this.reproductorComponent) {
              console.log('🛑 Error - mostrando end screen con recomendados');
              this.reproductorComponent.mostrarEndScreenConRecomendados();
            }
          }
        });
    } else {
      console.log('📺 No estamos en playlist - verificando videos recomendados');
      if (this.videosRecomendadosPantallaFinal && this.videosRecomendadosPantallaFinal.length > 0) {
        console.log('✅ HAY videos recomendados disponibles - iniciando countdown');
        this.siguienteVideoDisponible = true;
        if (this.reproductorComponent && this.reproductorComponent.startAutoplayCountdown) {
          console.log('🎯 Llamando countdown para videos recomendados');
          this.reproductorComponent.startAutoplayCountdown();
        }
      } else {
        console.log('❌ NO HAY videos recomendados - mostrar end screen vacío');
        this.siguienteVideoDisponible = false;
        if (this.reproductorComponent) {
          console.log('🛑 Mostrando end screen sin recomendados');
          this.reproductorComponent.mostrarEndScreenConRecomendados();
        }
      }
    }
  }

  @ViewChild('reproductorRef') reproductorComponent: any;



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
  
          this.scheduleTimeout(() => {
            const videoElement = document.querySelector('video') as HTMLVideoElement;
            if (videoElement) {
              videoElement.play().catch(err => {
                console.warn('Autoplay bloqueado (política del navegador):', err);
              });
            }
          }, 300)
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
  this.playlistService.obtenerPlaylistConVideos(this.playlistId, this.videoId, this.fromPlaylist, this.userId)
    .subscribe({
      next: (res) => {
        console.log('📦 Respuesta del servicio de playlist:', res);
        if (!res?.data?.playlist || !res.data.videos?.length) {
          console.warn('Playlist no encontrada o vacía, manteniendo en modo video');
          this.fromPlaylist = false;
          localStorage.removeItem('fromPlaylist');
          localStorage.removeItem('currentPlaylistId');
          return;
        }

        const playlist = res.data.playlist;
        const videos = res.data.videos;

        this.videosDePlaylist = videos.map((v: any) => ({
          ...new Videos(v), 
          duracionFormateadaPlaylist: this.convertirDuracion(v.duracion)
        }));

        this.nombrePlaylist = playlist.nombre;
        this.siguienteVideoDisponible = true; 

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar playlist:', err);
        this.fromPlaylist = false;
        localStorage.removeItem('fromPlaylist');
        localStorage.removeItem('currentPlaylistId');
      }
    });
}

  @ViewChild('videoItem') videoItems!: QueryList<ElementRef>;


  scrollToCurrentVideo(): void {
    this.scheduleTimeout(() => {
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
          console.log('📊 RESPUESTA COMPLETA del backend:', res);
          console.log('🔍 Video actual solicitado:', this.videoId);
          console.log('🎯 Siguiente video devuelto:', res?.data?.id);
          
                this.siguienteVideoDatos = {
                  id: res.id,
                  titulo: res.titulo,
                  miniatura: res.miniatura,
                };

          if (res?.data?.id) {
            const siguienteId = res.data.id;
            console.log('🎬 Navegando de', this.videoId, 'hacia', siguienteId);
            
            this.router.navigate(['/video', siguienteId, 'playlist', this.playlistId]);
          } else {
            console.log('📁 FINAL DE PLAYLIST DETECTADO - desactivando autoplay');
            console.log('🛑 Seteando siguienteVideoDisponible = false');
            this.siguienteVideoDisponible = false;
            this.mostrarEndScreen = true;
            this.cdr.detectChanges();
            console.log('✅ End screen mostrado, bucle detenido');
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener siguiente video:', err);
          this.siguienteVideoDisponible = false;
          this.mostrarEndScreen = true;
          this.cdr.detectChanges();
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
      return; 
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
        this.mostrarVideo()
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

  const valorAnterior = this.puntuacionSeleccionada;
  this.puntuacionSeleccionada = null;

  this.puntuarService.quitarPuntuacion(this.videoId, this.usuario.id, this.valorPuntuacion).subscribe(
    response => {
      this.puntuacionActual = null;
      this.valorPuntuacion = null;
      this.puntuacionSeleccionada = null;
      this.mostrarVideo()

    },
    error => {
      console.error('Error al eliminar la puntuación:', error.error.message);

      this.puntuacionSeleccionada = valorAnterior;
    }
  );
}


crearActualizarPuntuacion(): void {
  if (this.valorPuntuacion === null) {
    console.error('No se ha seleccionado un valor de puntuación para crear o actualizar.');
    return;
  }

  const valorAnterior = this.puntuacionSeleccionada;
  this.puntuacionSeleccionada = this.valorPuntuacion;

  this.puntuarService.puntuar(this.videoId, this.usuario.id, this.valorPuntuacion).subscribe(
    response => {
      this.obtenerPuntuacionActual();
        this.puntuacionSeleccionada = response.valora;
        this.valorPuntuacion = response.valora;
    },
    error => {
      console.error('Error al crear o actualizar la puntuación:', error.error.message);

      this.puntuacionSeleccionada = valorAnterior;
    }
  );
}

visitar(userId?: number, progresoSegundos: number = 0, completado: boolean = false): void {
  if (this.visitaYaContadaParaEsteVideo) {
    console.log('Visita ya contada para este video en esta sesión, ignorando...');
    return;
  }

  if (this.visitaContada) {
    return;
  }

  this.visitaYaContadaParaEsteVideo = true;
  this.visitaContada = true;

  const esInvitado = !userId;
  const contadorClave = esInvitado
    ? 'contadorVideosInvitado'
    : `contadorVideos_${userId}`;

  let contadorTotal = this.cargarContador(contadorClave) || 0;

  const visitaObservable = esInvitado
    ? this.videoService.contarVisitaInvitado(this.videoId, progresoSegundos, completado)
    : this.videoService.contarVisita(this.videoId, userId!, progresoSegundos, completado);

  visitaObservable.pipe(take(1)).subscribe({
    next: (res) => {
      contadorTotal++;
      this.guardarContador(contadorClave, contadorTotal);

      if (contadorTotal >= 3 && (esInvitado || this.usuario?.premium !== 1)) {
        this.guardarContador(contadorClave, 0); 
        this.cargarPublicidad();
      }
    },
    error: (err) => console.error('[Visitar] Error:', err)
  });
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
    this.cargando = true;
    this.suscripcionService.suscribirse(this.userId, this.canalId).subscribe(
      response => {
        this.mensaje = 'Suscripción exitosa';
        this.suscrito = 'suscrito';

        this.notificacionesService.cambiarEstado(this.canalId, this.userId, true).subscribe({
          next: () => {
            this.notificacionesActivas = true;
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.notificacionesActivas = true;
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error => {
        this.cargando = false;
        this.handleError(error);
      }
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

  agregarAVideoALista(): void {
    if (!this.status.isLoggedIn) {
      window.location.href = this.serverIp + '3002/#/';
      return;
    }
    
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