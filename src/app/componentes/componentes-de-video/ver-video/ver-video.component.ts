import { Component, HostListener, OnInit, OnDestroy, EventEmitter, ElementRef, ViewChild, QueryList, AfterViewInit, AfterViewChecked, Input, Output, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, NavigationEnd } from '@angular/router';
import { Overlay } from '@angular/cdk/overlay';
import { VideosService } from '../../../servicios/videos.service';
import { AuthService } from '../../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../../servicios/puntuaciones.service';
import { StatusService } from '../../../servicios/status.service';
import { Observable, Subscription, take, filter, combineLatest } from 'rxjs';
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
import { AutoplayService } from '../../../servicios/autoplay.service';
import { ChatstreamService } from '../../../servicios/chatstream.service';

@Component({
  selector: 'app-ver-video',
  templateUrl: './ver-video.component.html',
  styleUrls: ['./ver-video.component.css']
})
export class VerVideoComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  videoId = 0;
  canalId = 0;
  userId = 0;
  playlistId: any;
  videoIdPlaylist: any;
  streamIdDelVideo: number | null = null;

  video: Videos = new Videos();
  usuario: Usuario = new Usuario();
  usuarioConCanal: any;
  numeroDeSuscriptores: any;
  puntuacionActual: any = {};
  puntuaciones: any = { puntuacion_1: 0, puntuacion_2: 0, puntuacion_3: 0, puntuacion_4: 0, puntuacion_5: 0 };
  publicidad: any = null;
  videosDePlaylist: any[] = [];
  videosRecomendadosColumnaLateral: any[] = [];
  videosRecomendadosPantallaFinal: any[] = [];
  siguienteVideoDatos: any = null;
  mensajesDelChat: any[] = [];
  mensajesVisibles: any[] = [];

  videoUrl: any;
  miniaturaUrl = '';
  videoPublicidadUrl: string | null = null;
  serverIp = environment.serverIp;
  defaultAvatar = 'assets/images/user.svg';

  isBlocked = false;
  isNotFound = false;
  cargando = false;
  fromPlaylist = false;
  visitaContada = false;
  visitaYaContadaParaEsteVideo = false;
  publicidadCargando = false;
  reproduciendoPublicidad = false;
  notificacionesActivas = false;
  mostrarColumnaLateral = false;
  videosPantallaFinalListos = false;
  mostrarEndScreen = false;
  videoTerminado = false;
  sidebarVisible = false;
  isMobile = false;
  commentsSheetOpen = false;
  siguienteVideoDisponible = true;

  isCinemaMode = false;
  isExpanded = false;
  showToggleLink = false;
  isContentOverflowing = false;
  dropdownVisible = false;
  dropdownVisibleLateral: number | null = null;
  errorMessage = '';
  mensaje = '';
  suscrito = '';
  hoverValor: number | null = null;
  highlightCommentId: number | null = null;
  nombrePlaylist: any;
  startedAt: string | null = null;
  totalVotos = 0;
  totalComentarios = 0;

  publicidadDuracionRestante!: number;
  mostrarBotonSaltar = false;
  nombrePublicidad: any;

  puntuacionSeleccionada: number | null = null;
  valorPuntuacion: number | null = null;

  isDragging = false;
  startY = 0;
  currentY = 0;
  deltaY = 0;

  sidebarCollapsed$: Observable<boolean>;
  autoplayActivado = false;

  private subs: Subscription[] = [];
  private pendingTimeouts: number[] = [];
  private progresoInterval: any = null;

  @Output() autoplayFinish = new EventEmitter<void>();
  @ViewChild(ReproductorVideoComponent) reproductor!: ReproductorVideoComponent;
  @ViewChild('reproductorRef') reproductorComponent: any;
  @ViewChild('reproductorVideo') reproductorVideo!: ReproductorVideoComponent;
  @ViewChild('descripcion') descripcionElement!: ElementRef;
  @ViewChild('commentsSheet') sheetRef!: ElementRef<HTMLElement>;
  @ViewChild('commentsOverlay') overlayRef!: ElementRef<HTMLElement>;
  @ViewChild('videoWrapper', { static: false }) videoWrapper!: ElementRef;
  @ViewChild('sheet', { static: false }) sheet!: ElementRef;
  @ViewChild('videoPageWrapper') videoPageWrapper!: ElementRef;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('videoItem') videoItems!: QueryList<ElementRef>;

  private overlayComment!: HTMLElement;
  videoIdPlaylistAux: any;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideosService,
    private autoplayService: AutoplayService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService,
    private titleService: Title,
    private router: Router,
    private overlay: Overlay,
    private chatService: ChatstreamService,
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
    this.sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
    this.escucharNavegacion();
  }


  ngOnInit(): void {
    this.recuperarHighlightComentario();
    this.inicializarCinemaMode();
    this.detectMobile();
    window.addEventListener('resize', () => this.detectMobile());
    this.mostrarSidebar();
    this.obtenerUsuario();

    this.subs.push(
      this.usuarioGlobal.usuarioConCanal$.subscribe(uc => {
        this.usuarioConCanal = uc;
        this.cdr.detectChanges();
      }),
      this.autoplayService.getAutoplay().subscribe(enabled => {
        this.autoplayActivado = enabled;
      })
    );

    this.subs.push(
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.videoId = Number(params.get('id'));
        this.videoIdPlaylist = this.videoId;

        const playlistIdFromParams = params.get('playlistId');
        const playlistIdNumber = playlistIdFromParams ? Number(playlistIdFromParams) : 0;

        if (playlistIdFromParams && playlistIdNumber > 0) {
          this.playlistId = playlistIdNumber;
          this.fromPlaylist = true;
          localStorage.setItem('fromPlaylist', 'true');
          localStorage.setItem('currentPlaylistId', this.playlistId.toString());
          this.siguienteVideoDisponible = true;
        } else {
          this.limpiarEstadoPlaylist();
        }

        this.resetearEstadoVideo();
        this.mostrarVideo();

        if (this.fromPlaylist) {
          this.obtenerVideosDePlaylist();
        }

        const storedCinemaMode = localStorage.getItem('cinemaMode');
        this.isCinemaMode = storedCinemaMode ? JSON.parse(storedCinemaMode) : false;
        this.cdr.detectChanges();

        this.scheduleTimeout(() => this.verificarSuscripcion(), 100);
      })
    );
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
    this.overlayComment = document.querySelector('.comments-overlay') as HTMLElement;
    this.inicializarStickyPlayer();
  }

  ngAfterViewChecked(): void {}

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.pendingTimeouts.forEach(id => clearTimeout(id));
    if (this.progresoInterval) clearInterval(this.progresoInterval);
    this.limpiarEstadoPlaylist();
    this.visitaContada = false;
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.limpiarEstadoPlaylist();
  }


  private escucharNavegacion(): void {
    const sub = this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) return;

      const id = +this.route.snapshot.paramMap.get('id')!;
      if (!id || id === this.videoId) return;

      const hasPlaylist = event.url.includes('/playlist/');
      if (this.fromPlaylist && !hasPlaylist) {
        this.limpiarEstadoPlaylist();
      }

      this.videoId = id;
      this.videoIdPlaylist = id;
      this.visitaContada = false;
      this.visitaYaContadaParaEsteVideo = false;
      this.mostrarVideo();
    });
    this.subs.push(sub);
  }

  private recuperarHighlightComentario(): void {
    const id = localStorage.getItem('scrollToCommentId');
    if (id) this.highlightCommentId = +id;
  }

  private inicializarCinemaMode(): void {
    this.isCinemaMode = this.cinemaModeService.getCinemaModeValue();
    this.subs.push(
      this.cinemaModeService.getCinemaMode().subscribe(enabled => {
        this.isCinemaMode = enabled;
      })
    );
  }

  private resetearEstadoVideo(): void {
    this.visitaContada = false;
    this.visitaYaContadaParaEsteVideo = false;
    this.mostrarColumnaLateral = false;
    this.videosPantallaFinalListos = false;
    this.mostrarEndScreen = false;
    this.checkDescriptionHeight();
  }

  private inicializarStickyPlayer(): void {
    if (window.innerWidth > 1024) return;

    const wrapper = this.videoPageWrapper.nativeElement;
    let ticking = false;
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const threshold = 120;

        if (scrollY > threshold && scrollY > lastScrollY) {
          this.scheduleTimeout(() => {
            wrapper.classList.add('sticky-header-player');
            wrapper.classList.remove('pre-active');
          }, 10);
        } else if (scrollY < threshold) {
          wrapper.classList.remove('sticky-header-player');
        }

        lastScrollY = scrollY;
        ticking = false;
      });
      ticking = true;
    });
  }


  obtenerUsuario(): void {
    this.subs.push(
      this.usuarioGlobal.usuario$.subscribe(res => {
        this.usuario = res;

        if (this.usuario?.id && this.usuario.id > 1) {
          this.userId = this.usuario.id;

          if (this.videoId && this.video && !this.visitaYaContadaParaEsteVideo) {
            this.cargarProgresoAnterior();
            this.iniciarHeartbeatProgreso();
            this.visitar(this.userId);
          }

          this.obtenerEstadoDeNotificaciones();
          this.obtenerPuntuacionActual();
          this.verificarSuscripcion();
        }
      })
    );
    this.authService.mostrarUserLogueado().subscribe();
  }


  mostrarVideo(): void {
    this.resetearEstadoVideo();

    this.videoService.obtenerInformacionVideo(this.videoId).subscribe({
      next: (res) => {
        this.video = new Videos(res);
        this.startedAt = res.stream?.started_at ?? null;
        this.streamIdDelVideo = res.stream?.id ?? null;
        this.errorMessage = '';
        this.canalId = this.video.canal_id;

        if (this.startedAt && this.streamIdDelVideo) {
          this.cargarMensajesDelChat();
        }

        if (this.video?.error?.code === 403) {
          this.isBlocked = true;
          this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
          this.mostrarColumnaLateral = true;
          return;
        }

        this.isBlocked = false;
        this.videoUrl = this.video.link;
        this.miniaturaUrl = this.video.miniatura;
        this.cargarProgresoAnterior();
        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();
        this.calcularTotalVotos();
        this.cdr.detectChanges();

        if (this.playlistId) this.obtenerVideosDePlaylist();
        if (!this.fromPlaylist) this.videosDePlaylist = [];

        this.scheduleTimeout(() => this.scheduleDescriptionHeightCheck(), 150);

        this.scheduleTimeout(() => {
          const idFinal = this.userId > 1 ? this.userId : undefined;
          if (!this.visitaYaContadaParaEsteVideo) this.visitar(idFinal);
        }, 800);

        this.scheduleTimeout(() => {
          this.mostrarColumnaLateral = true;
          this.obtenerVideosRelacionados(this.videoId);
          this.listarNumeroDeSuscriptores(this.canalId);
          if (this.canalId) this.obtenerEstadoDeNotificaciones();
          this.cdr.detectChanges();
        }, 300);
      },
      error: (err) => {
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


  private cargarMensajesDelChat(): void {
    if (!this.streamIdDelVideo || !this.startedAt) return;

    const startedAtUTC = this.startedAt.replace(' ', 'T') + 'Z';

    this.chatService.cargarMensaje(this.streamIdDelVideo).subscribe({
      next: (res: any) => {
        this.mensajesDelChat = res.map((msg: any) => ({
          id: msg.id,
          user: msg.user?.name || 'Anónimo',
          user_photo: msg.user?.foto || null,
          text: msg.mensaje || '',
          created_at: msg.created_at,
          offset: (new Date(msg.created_at).getTime() - new Date(startedAtUTC).getTime()) / 1000
        }));
      }
    });
  }

  onTiempoActualizado(segundos: number): void {
    const anterior = this.mensajesVisibles.length;
    this.mensajesVisibles = this.mensajesDelChat.filter(msg => msg.offset <= segundos);

    if (this.mensajesVisibles.length > anterior) {
      this.scheduleTimeout(() => {
        const container = this.chatContainer?.nativeElement;
        if (container) {
          const messagesDiv = container.querySelector('.chat-messages-container');
          if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
      }, 50);
    }
  }

  scrollToBottom(): void {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }


  private obtenerElementoVideo(): HTMLVideoElement | null {
    return this.reproductor?.videoElement || null;
  }

  private cargarProgresoAnterior(): void {
    if (!this.userId || !this.videoId) return;

    this.videoService.obtenerProgresoAnterior(this.userId, this.videoId).subscribe({
      next: (res) => {
        if (res.progreso <= 0) return;

        const videoEl = this.obtenerElementoVideo();
        if (!videoEl) return;

        const setProgreso = () => {
          videoEl.currentTime = res.progreso;
          this.cdr.detectChanges();
          videoEl.removeEventListener('loadedmetadata', setProgreso);
        };

        if (videoEl.readyState >= 1) {
          setProgreso();
        } else {
          videoEl.addEventListener('loadedmetadata', setProgreso);
        }
      },
      error: (err) => console.error('[PROGRESO] Error:', err)
    });
  }

  private iniciarHeartbeatProgreso(): void {
    if (this.progresoInterval) clearInterval(this.progresoInterval);

    this.progresoInterval = setInterval(() => {
      const videoEl = this.obtenerElementoVideo();
      if (!videoEl || videoEl.paused || videoEl.ended || videoEl.readyState < 2) return;

      const current = Math.floor(videoEl.currentTime);
      const duration = Math.floor(videoEl.duration || 0);

      if (current <= 0) return;

      this.videoService.enviarProgreso(this.userId, this.videoId, current, duration).subscribe({
        error: err => console.error('[HEARTBEAT] Error:', err)
      });
    }, 5000);
  }


  visitar(userId?: number, progresoSegundos = 0, completado = false): void {
    if (this.visitaYaContadaParaEsteVideo) return;

    let userIdFinal = userId ?? this.userId;
    if (!userIdFinal || userIdFinal <= 1) userIdFinal = 1;

    this.visitaYaContadaParaEsteVideo = true;
    this.visitaContada = true;

    const esInvitado = userIdFinal === 1;
    const contadorClave = esInvitado ? 'contadorVideosInvitado' : `contadorVideos_${userIdFinal}`;
    let contadorTotal = this.cargarContador(contadorClave) || 0;

    const visitaObs = esInvitado
      ? this.videoService.contarVisitaInvitado(this.videoId, progresoSegundos, completado)
      : this.videoService.contarVisita(this.videoId, userIdFinal, progresoSegundos, completado);

    visitaObs.pipe(take(1)).subscribe({
      next: () => {
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


  cargarPublicidad(): void {
    if (this.publicidadCargando) return;

    this.publicidadCargando = true;
    this.mostrarEndScreen = false;

    this.videoService.obtenerPublicidad().subscribe(
      (data) => {
        this.publicidad = data;
        this.reproduciendoPublicidad = true;
        this.videoPublicidadUrl = this.publicidad.link;
        this.nombrePublicidad = this.publicidad.titulo;
        this.publicidadDuracionRestante = this.publicidad.duracion;
        this.mostrarBotonSaltar = false;

        this.scheduleTimeout(() => {
          const intervalo = setInterval(() => {
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
        }, 500);
      },
      () => { this.publicidadCargando = false; }
    );
  }

  finalizarPublicidad(): void {
    this.reproduciendoPublicidad = false;
    this.videoPublicidadUrl = null;
    this.mostrarColumnaLateral = false;
    this.videosPantallaFinalListos = false;

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
        if (this.reproductor) this.reproductor.cambiarVideoSinMutear(this.video.link);
        if (this.videoUrl !== this.video.link) this.videoUrl = this.video.link;

        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();

        this.scheduleTimeout(() => {
          this.mostrarColumnaLateral = true;
          this.obtenerVideosRelacionados(this.videoId);
          this.listarNumeroDeSuscriptores(this.canalId);
          this.cdr.detectChanges();
          this.publicidadCargando = false;
        }, 800);

        if (this.progresoInterval) clearInterval(this.progresoInterval);
        this.iniciarHeartbeatProgreso();
        this.cargarProgresoAnterior();
      },
      () => {
        this.isBlocked = false;
        this.mostrarColumnaLateral = true;
      }
    );
  }

  saltarPublicidad(): void {
    this.reproduciendoPublicidad = false;
    this.mostrarBotonSaltar = false;
    this.publicidadCargando = false;
    this.finalizarPublicidad();
  }


  obtenerVideosRelacionados(videoId: number): void {
    this.videoService.listarVideosRelacionados(videoId).subscribe(
      (res: any[]) => {
        const videos = res.map(v => ({ ...v, duracionFormateada: this.convertirDuracion(v.duracion) }));
        this.videosRecomendadosColumnaLateral = videos;
        this.videosRecomendadosPantallaFinal = videos;
        this.siguienteVideoDisponible = videos.length > 0;
        this.cdr.detectChanges();
      },
      () => {
        this.videosRecomendadosColumnaLateral = [];
        this.videosRecomendadosPantallaFinal = [];
        this.siguienteVideoDisponible = false;
        this.cdr.detectChanges();
      }
    );
  }

  obtenerVideosDePlaylist(): void {
    this.playlistService.obtenerPlaylistConVideos(this.playlistId, this.videoId, this.fromPlaylist, this.userId)
      .subscribe({
        next: (res) => {
          if (!res?.data?.playlist || !res.data.videos?.length) {
            this.limpiarEstadoPlaylist();
            return;
          }

          this.videosDePlaylist = res.data.videos.map((v: any) => ({
            ...new Videos(v),
            duracionFormateadaPlaylist: this.convertirDuracion(v.duracion)
          }));

          this.nombrePlaylist = res.data.playlist.nombre;
          this.siguienteVideoDisponible = true;
          this.cdr.detectChanges();
        },
        error: () => this.limpiarEstadoPlaylist()
      });
  }

  siguienteVideo(): void {
    if (!this.autoplayService.getAutoplayValue()) {
      this.mostrarEndScreen = true;
      return;
    }

    if (!this.playlistId || !this.videoId) {
      this.mostrarEndScreen = true;
      return;
    }

    this.playlistService.obtenerSiguienteVideo(this.playlistId, this.videoId).subscribe({
      next: (res: any) => {
        if (res?.data?.id) {
          this.router.navigate(['/video', res.data.id, 'playlist', this.playlistId]);
        } else {
          this.siguienteVideoDisponible = false;
          this.mostrarEndScreen = true;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.siguienteVideoDisponible = false;
        this.mostrarEndScreen = true;
        this.cdr.detectChanges();
      }
    });
  }

  verificarYNavegar(): void {
    this.siguienteVideo();
  }


  onVideoTerminado(): void {
    this.terminarVideo();
  }

  onSolicitarSiguienteVideo(): void {
    if (!this.autoplayService.getAutoplayValue()) return;

    if (this.fromPlaylist && this.playlistId) {
      this.verificarYNavegar();
    } else if (this.videosRecomendadosPantallaFinal?.length > 0) {
      this.router.navigate(['/video', this.videosRecomendadosPantallaFinal[0].id]);
    }
  }

  onVerificarSiguienteVideo(): void {
    if (this.fromPlaylist && this.playlistId) {
      this.playlistService.obtenerSiguienteVideo(this.playlistId, this.videoId).subscribe({
        next: (res: any) => {
          if (res?.data?.id) {
            this.siguienteVideoDisponible = true;
            this.reproductorComponent?.startAutoplayCountdown?.();
          } else {
            this.siguienteVideoDisponible = false;
            this.reproductorComponent?.mostrarEndScreenConRecomendados?.();
          }
        },
        error: () => {
          this.siguienteVideoDisponible = false;
          this.reproductorComponent?.mostrarEndScreenConRecomendados?.();
        }
      });
    } else if (this.videosRecomendadosPantallaFinal?.length > 0) {
      this.siguienteVideoDisponible = true;
      this.reproductorComponent?.startAutoplayCountdown?.();
    } else {
      this.siguienteVideoDisponible = false;
      this.reproductorComponent?.mostrarEndScreenConRecomendados?.();
    }
  }

  terminarVideo(): void {
    this.videoTerminado = true;
    if (this.reproduciendoPublicidad) {
      this.finalizarPublicidad();
    } else {
      this.mostrarEndScreen = true;
    }
  }

  get videosRecomendadosParaReproductor(): any[] {
    return this.videosRecomendadosPantallaFinal || [];
  }

  get videosParaMostrar(): Videos[] {
    return this.videosDePlaylist.filter(v => v.id !== this.videoIdPlaylist);
  }


  handleCinemaMode(isCinemaMode: boolean): void {
    this.isCinemaMode = isCinemaMode;
    this.cinemaModeService.setCinemaMode(isCinemaMode);
  }

  detectMobile(): void {
    this.isMobile = window.innerWidth <= 1024;

    if (this.isMobile && this.isCinemaMode) {
      this.isCinemaMode = false;
      this.cinemaModeService.setCinemaMode(false);
    }

    if (!this.isMobile && this.commentsSheetOpen) {
      this.commentsSheetOpen = false;
      document.body.style.overflow = '';
      const el = this.sheet?.nativeElement;
      if (el) {
        el.style.transform = '';
        el.style.transition = '';
        el.classList.remove('open');
      }
    }
  }

  openCommentsSheet(): void {
    this.commentsSheetOpen = true;
    document.body.style.overflow = 'hidden';
    this.scheduleTimeout(() => {
      const el = this.sheet?.nativeElement;
      if (el) {
        el.style.transition = '';
        el.style.transform = 'translateY(0)';
        el.classList.add('open');
      }
    }, 20);
  }

  closeCommentsSheet(): void {
    this.commentsSheetOpen = false;
    document.body.style.overflow = '';
    requestAnimationFrame(() => {
      const el = this.sheet?.nativeElement;
      if (el) {
        el.classList.remove('open');
        el.style.transition = '';
        el.style.transform = 'translateY(100%)';
      }
    });
  }

  onTouchStart(e: TouchEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.sheet-header')) return;

    const inner = this.sheet.nativeElement.querySelector('app-comentarios');
    if (inner && inner.scrollTop > 0) return;

    this.startY = e.touches[0].clientY;
    this.isDragging = true;
    this.sheet.nativeElement.classList.remove('open');
    this.sheet.nativeElement.style.transition = 'none';
  }

  onTouchMove(evt: TouchEvent): void {
    if (!this.isDragging) return;
    const delta = Math.max(0, evt.touches[0].clientY - this.startY);
    this.sheet.nativeElement.style.transform = `translateY(${delta}px)`;
  }

  onTouchEnd(): void {
    if (!this.isDragging) return;

    const sheetEl = this.sheet.nativeElement;
    sheetEl.style.transition = 'transform 0.3s ease';

    const match = sheetEl.style.transform.match(/translateY\(([\d.]+)px\)/);
    const delta = match ? Number(match[1]) : 0;

    if (delta > 120) {
      sheetEl.style.transform = 'translateY(100%)';
      this.scheduleTimeout(() => {
        this.closeCommentsSheet();
        sheetEl.style.transition = '';
        sheetEl.style.transform = '';
        sheetEl.classList.remove('open');
      }, 250);
    } else {
      sheetEl.classList.add('open');
      sheetEl.style.transform = 'translateY(0)';
    }

    this.isDragging = false;
  }


  toggleExpand(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const el = this.descripcionElement.nativeElement;
    if (!this.isExpanded) {
      el.style.height = `${el.scrollHeight}px`;
    } else {
      el.style.height = `${el.scrollHeight}px`;
      void el.offsetHeight;
      el.style.height = '150px';
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

    const el = this.descripcionElement.nativeElement;
    const original = el.style.height;
    el.style.height = 'auto';
    const scrollHeight = el.scrollHeight;
    el.style.height = original || '150px';

    this.showToggleLink = scrollHeight > 180;
    this.isExpanded = !this.showToggleLink;
    this.cdr.detectChanges();
  }

  checkContentOverflow(): void {
    if (this.descripcionElement) {
      const el = this.descripcionElement.nativeElement;
      this.isContentOverflowing = el.scrollHeight > el.clientHeight;
    }
  }

  private scheduleDescriptionHeightCheck(): void {
    if (!this.descripcionElement) return;
    this.scheduleTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => this.checkDescriptionHeight()));
    }, 100);
  }


  calcularTotalVotos(): void {
    this.totalVotos = [1, 2, 3, 4, 5].reduce((acc, n) => acc + (this.video[`puntuacion_${n}`] || 0), 0);
  }

  puntuar(valora: number): void {
    if (!this.usuario?.id) {
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
      res => {
        this.puntuacionActual = res;
        this.puntuacionSeleccionada = res.valora;
        this.mostrarVideo();
      },
      err => {
        if (err.status === 404) this.puntuacionSeleccionada = null;
      }
    );
  }

  eliminarPuntuacion(): void {
    if (this.valorPuntuacion === null) return;

    const valorAnterior = this.puntuacionSeleccionada;
    this.puntuacionSeleccionada = null;

    this.puntuarService.quitarPuntuacion(this.videoId, this.usuario.id, this.valorPuntuacion).subscribe(
      () => {
        this.puntuacionActual = null;
        this.valorPuntuacion = null;
        this.mostrarVideo();
      },
      () => { this.puntuacionSeleccionada = valorAnterior; }
    );
  }

  crearActualizarPuntuacion(): void {
    if (this.valorPuntuacion === null) return;

    const valorAnterior = this.puntuacionSeleccionada;
    this.puntuarService.puntuar(this.videoId, this.usuario.id, this.valorPuntuacion).subscribe(
      res => {
        this.puntuacionSeleccionada = res.valora;
        this.valorPuntuacion = res.valora;
        this.obtenerPuntuacionActual();
      },
      () => { this.puntuacionSeleccionada = valorAnterior; }
    );
  }


  suscribirse(): void {
    if (!this.usuario?.id) {
      window.location.href = `${this.serverIp}3002/#/`;
      return;
    }

    this.cargando = true;
    this.suscripcionService.suscribirse(this.userId, this.canalId).subscribe(
      () => {
        this.suscrito = 'suscrito';
        this.notificacionesService.cambiarEstado(this.canalId, this.userId, true).subscribe({
          next: () => { this.notificacionesActivas = true; this.cargando = false; this.cdr.detectChanges(); },
          error: () => { this.notificacionesActivas = true; this.cargando = false; this.cdr.detectChanges(); }
        });
      },
      err => { this.cargando = false; this.handleError(err); }
    );
  }

  anularSuscripcion(): void {
    const ref = this.dialog.open(ConfirmacionDesuscribirModalComponent);
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.suscripcionService.anularSuscripcion(this.userId, this.canalId).subscribe(
        () => {
          this.suscrito = 'desuscrito';
          this.notificacionesActivas = false;
          this.cdr.detectChanges();
        },
        err => this.handleError(err)
      );
    });
  }

  toggleSuscripcion(): void {
    if (this.suscrito === 'suscrito') {
      this.anularSuscripcion();
    } else {
      this.suscribirse();
    }
  }

  verificarSuscripcion(): void {
    if (!this.userId || !this.canalId) return;

    this.suscripcionService.verificarSuscripcion(this.userId, this.canalId).subscribe(
      res => {
        this.suscrito = res.estado;
        if (res.estado === 'suscrito') this.notificacionesActivas = true;
        if (res.estado === 'desuscrito') this.notificacionesActivas = false;
      },
      err => {
        if (err.status === 404) this.suscrito = 'desuscrito';
      }
    );
  }

  listarNumeroDeSuscriptores(canalId: number): void {
    this.suscripcionService.listarNumeroDeSuscriptores(canalId).subscribe(
      res => { this.numeroDeSuscriptores = res; }
    );
  }

  toggleNotificaciones(): void {
    this.cargando = true;
    this.notificacionesService.cambiarEstado(this.canalId, this.userId, !this.notificacionesActivas).subscribe({
      next: () => { this.notificacionesActivas = !this.notificacionesActivas; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  obtenerEstadoDeNotificaciones(): void {
    if (!this.userId || !this.canalId) return;
    this.notificacionesService.obtenerEstado(this.canalId, this.userId).subscribe({
      next: (res: any) => { this.notificacionesActivas = res.notificaciones; },
      error: () => { this.notificacionesActivas = false; }
    });
  }


  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  toggleDropdownLateral(videoId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dropdownVisibleLateral = this.dropdownVisibleLateral === videoId ? null : videoId;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.options')) this.dropdownVisible = false;
    if (!target.closest('.options-btn-lateral') && !target.closest('.dropdown-menu-lateral')) {
      this.dropdownVisibleLateral = null;
    }
  }

  agregarAVideoALista(): void {
    if (!this.status.isLoggedIn) {
      window.location.href = this.serverIp + '3002/#/';
      return;
    }

    this.dialog.open(AgregarListaComponent, {
      data: { videoId: this.videoId },
      autoFocus: false,
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });

    this.dropdownVisible = false;
  }

  agregarVideoALista(videoId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.status.isLoggedIn) {
      window.location.href = this.serverIp + '3002/#/';
      return;
    }

    this.dialog.open(AgregarListaComponent, {
      data: { videoId },
      autoFocus: false,
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });

    this.dropdownVisibleLateral = null;
  }

  crearLista(): void {
    const ref = this.dialog.open(CrearListaComponent);
    ref.afterClosed().subscribe(result => {
      if (result) this.agregarAVideoALista();
    });
  }

  openReportModal(): void {
    if (!this.status.isLoggedIn) {
      window.location.href = this.serverIp + '3002/#/';
      return;
    }

    this.dialog.open(ModalReporteVideoComponent, {
      width: '400px',
      data: { videoId: this.videoId, userId: this.userId }
    });

    this.dropdownVisible = false;
  }

  openReportModalForVideo(videoId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.status.isLoggedIn) {
      window.location.href = this.serverIp + '3002/#/';
      return;
    }

    this.dialog.open(ModalReporteVideoComponent, {
      width: '400px',
      data: { videoId, userId: this.userId }
    });

    this.dropdownVisibleLateral = null;
  }


  private mostrarSidebar(): void {
    this.usuarioGlobal.setSidebarVisible(false);
    this.subs.push(
      this.usuarioGlobal.sidebarCollapsed$.subscribe(visible => {
        this.sidebarVisible = visible;
        this.cdr.detectChanges();
      })
    );
  }

  toggleSidebar(): void {
    this.usuarioGlobal.toggleSidebar();
  }


  scrollToCurrentVideo(): void {
    this.scheduleTimeout(() => {
      const current = this.videoItems?.find(
        el => +el.nativeElement.querySelector('.video-link')?.href.split('/').slice(-3, -2)[0] === this.videoIdPlaylist
      );
      current?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }


  private scheduleTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(callback, delay);
    this.pendingTimeouts.push(id);
    return id;
  }

  private limpiarEstadoPlaylist(): void {
    this.fromPlaylist = false;
    this.playlistId = null;
    this.videosDePlaylist = [];
    localStorage.removeItem('fromPlaylist');
    localStorage.removeItem('currentPlaylistId');
    localStorage.removeItem('currentPlaylistData');
  }

  private manejarBloqueo(): void {
    this.isBlocked = true;
    this.isNotFound = false;
    this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
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
    return error?.error?.message || error?.message || JSON.stringify(error);
  }

  private obtenerMensajeDeErrorAmigable(error: any): string {
    if (error.status === 0) return 'No hay conexión a internet.';
    if (error.status >= 500) return 'Error en el servidor. Inténtalo más tarde.';
    return 'Ocurrió un error al cargar el video.';
  }

  convertirDuracion(segundos: number): string {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  convertirFechaALineaDeTexto(fecha: Date): string {
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  }

  reloadPage(event: Event): void {
    event.preventDefault();
    window.location.href = (event.currentTarget as HTMLAnchorElement).href;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/video-default.png';
  }

  onImageErrorUser(event: any): void {
    event.target.src = 'assets/images/user.svg';
  }

  guardarContador(clave: string, valor: number): void {
    localStorage.setItem(clave, valor.toString());
  }

  cargarContador(clave: string): number {
    return parseInt(localStorage.getItem(clave) || '0', 10);
  }

  puedeEditar(video: any): boolean {
    return !!this.usuarioConCanal?.canales && this.usuarioConCanal.canales.id === video.canal_id;
  }

  get puedeEditarVideo(): boolean {
    return !!this.usuarioConCanal?.canales && !!this.video && this.usuarioConCanal.canales.id === this.video.canal_id;
  }

  envioReportar(formData: any): void {
    this.reporteService.crearReporteVideo(formData).subscribe();
  }

  getDescripcion(val: number): string {
  const descripciones: { [key: number]: string } = {
    1: 'Me enoja',
    2: 'Me entristece',
    3: 'Me gusta',
    4: 'Me divierte',
    5: 'Me encanta'
  };
  return descripciones[val] || '';
}

  private handleError(error: any): void {
    this.mensaje = error.status === 409
      ? 'Ya estás suscrito a este canal.'
      : error.error?.message || 'Ha ocurrido un error inesperado.';
  }
}