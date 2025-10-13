import { Component, HostListener, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, AfterViewChecked, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Overlay } from '@angular/cdk/overlay';
import { VideosService } from '../../servicios/videos.service';
import { AuthService } from '../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../servicios/puntuaciones.service';
import { StatusService } from '../../servicios/status.service';
import { Observable, Subscription, take, filter, fromEvent } from 'rxjs';
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
  idDelCanalDelUsuario: any;
  usuarioConCanal: any;
  idCanal: any;
  canales: any;
  modoCine: boolean = false;
  get puedeEditarVideo(): boolean {
    return !!this.usuarioConCanal?.canales && !!this.video && this.usuarioConCanal.canales.id === this.video.canal_id;
  }
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
  videosRecomendados: any[] = [];
  modoGuardado: any;
  nombrePlaylist: any;
  sidebarCollapsed = false;
  duracionFormateada: string = '';
  duracionFormateadaPlaylist: string = '';
  sidebarCollapsed$: Observable<boolean>;
  forceSidebarClosed: boolean = true;
  private sidebarSubscription!: Subscription;
  private cinemaModeSubscription!: Subscription;
  @ViewChild('descripcion') descripcionElement!: ElementRef;
  escalaTransform: string = 'scale(1)';
  anchoEscala: string = '100%';
  alturaEscala: string = 'auto';
  escalaReproductor: string = 'scale(1)';
  private zoomSubscription!: Subscription;
  @ViewChild('videoWrapper', { static: false }) videoWrapper!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideosService,
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
    private notificacionesService: NotificacionesService
  ) {
    this.sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  }

  ngOnInit(): void {
    this.cinemaModeSubscription = this.cinemaModeService.getCinemaMode().subscribe(enabled => {
      this.isCinemaMode = enabled;
      this.cdr.detectChanges();
    });
    this.usuarioGlobal.usuarioConCanal$.subscribe(uc => {
      this.usuarioConCanal = uc;
      this.cdr.detectChanges();
    });
    this.route.params.subscribe(params => {
      this.videoId = params['id'];
      this.videoIdPlaylist = this.videoId;
      this.mostrarVideo();
    });
    this.obtenerEstadoDeNotificaciones();
    this.obtenerIdDePlaylist();
    this.obtenerUsuario();
    this.mostrarSidebar();
    this.verificarEdicionVideo();
    this.checkDescriptionHeight();
    this.iniciarEscuchaZoom();
    setTimeout(() => {
      this.ajustarEscala();

      this.verificarSuscripcion();
    }, 100);
    const storedCinemaMode = localStorage.getItem('cinemaMode');
    this.isCinemaMode = storedCinemaMode ? JSON.parse(storedCinemaMode) : false;
    this.cdr.detectChanges();
  }

  puedeEditar(video: any): boolean {
    if (!this.usuarioConCanal || !this.usuarioConCanal.canales) return false;
    return this.usuarioConCanal.canales.id === video.canal_id;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkContentOverflow();
      this.cdr.detectChanges();
    }, 0);
    this.checkDescriptionHeight();
    this.ajustarEscala();
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
    this.sidebarSubscription?.unsubscribe();
    this.cinemaModeSubscription?.unsubscribe();
    this.zoomSubscription?.unsubscribe();
    this.fromPlaylist = false;
  }

  private iniciarEscuchaZoom(): void {
    this.zoomSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.ajustarEscala();
        this.cdr.detectChanges();
      });
  }


 @ViewChild('reproductorVideo') reproductorVideo!: ReproductorVideoComponent;

 private ajustarEscala(): void {
  const zoom = window.outerWidth / window.innerWidth;
  
  const escala = 1 / zoom;
  
  this.escalaTransform = `scale(${escala.toFixed(4)})`;
  
  const zoomPorcentaje = (zoom * 100).toFixed(4);
  this.anchoEscala = `${zoomPorcentaje}%`;
  this.alturaEscala = `${zoomPorcentaje}%`;

  if (window.innerWidth < 768) {
    this.escalaTransform = 'scale(1)';
    this.anchoEscala = '100%';
    this.alturaEscala = '100%';
  }

  console.log(`Zoom detectado: ${zoom.toFixed(2)}, Escala aplicada: ${escala.toFixed(2)}`);  // Para debug
}
  @HostListener('window:resize')
  onResize(): void {
    this.ajustarEscala();
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
  }

  reloadPage(event: Event) {
    event.preventDefault();
    const target = event.currentTarget as HTMLAnchorElement;
    window.location.href = target.href;
  }

  obtenerUsuario(): void {
    this.usuarioGlobal.usuario$.subscribe(res => {
      this.usuario = res;
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

  obtenerVideosRelacionados(videoId: number) {
    this.videoService.listarVideosRelacionados(videoId).subscribe(
      (res: any[]) => {
        this.videosRecomendados = res;
        this.videosRecomendados.forEach(video => {
          video.duracionFormateada = this.convertirDuracion(video.duracion);
        });
      },
      error => {
        console.error('Error al obtener videos relacionados:', error);
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

  cargarPublicidad(): void {
    this.videoService.obtenerPublicidad().subscribe(
      (data) => {
        this.publicidad = data;
        this.reproduciendoPublicidad = true;
        this.videoPublicidadUrl = this.publicidad.link;
        this.publicidadDuracionRestante = this.publicidad.duracion;
        this.nombrePublicidad = this.publicidad.titulo;
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
      error => {
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

  mostrarVideo(): void {
    this.videoService.obtenerInformacionVideo(this.videoId).subscribe(
      (res) => {
        this.video = res;
        this.cdr.detectChanges();
        this.errorMessage = '';
        this.canalId = this.video.canal_id;
        if (this.video?.error?.code === 403) {
          this.isBlocked = true;
          this.errorMessage = 'Este video ha sido bloqueado y no se puede acceder.';
          return;
        }
        if (this.playlistId) {
          console.log(this.playlistId);
          this.obtenerVideosDePlaylist();
        }
        this.isBlocked = false;
        this.videoUrl = this.video.link;
        this.procesarFechaDeCreacion();
        this.actualizarTituloDePagina();
        this.obtenerVideosRelacionados(this.videoId);
        this.listarNumeroDeSuscriptores(this.canalId);
        if (this.canalId) {
          this.obtenerEstadoDeNotificaciones();
        }
      },
      error => {
        this.isBlocked = false;
        this.errorMessage = this.obtenerMensajeDeError(error);
        console.error('Error al obtener información del video:', error);
      }
    );
  }

  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }

  obtenerVideosDePlaylist(): void {
    this.playlistService.obtenerPlaylistConVideos(this.playlistId, this.videoIdPlaylist || 0, true).subscribe(
      (response) => {
        this.nombrePlaylist = response.data.playlist.nombre;
        let videos = response.data.playlist.videos ?? [];
        const videoActualEnLista = videos.find(v => v.id === this.videoIdPlaylist);
        if (!videoActualEnLista && this.videoIdPlaylist) {
          const videoActual = response.data.videos?.find(v => v.id === this.videoIdPlaylist);
          if (videoActual) {
            videos = [videoActual, ...videos];
          }
        }
        this.videosDePlaylist = videos.map(video => ({
          ...video,
          duracionFormateadaPlaylist: this.convertirDuracion(video.duracion)
        }));
      },
      error => {
        console.error('Error al obtener los videos de la playlist:', error);
      }
    );
  }

  siguienteVideo(): void {
    const videoIdNum = Number(this.videoIdPlaylist);
    const indiceActual = this.videosDePlaylist.findIndex(video => video.id === videoIdNum);
    if (indiceActual === -1) {
      console.warn('Video actual no encontrado en la lista.');
      if (this.videosDePlaylist.length > 0) {
        this.videoIdPlaylist = this.videosDePlaylist[0].id;
        this.router.navigate(['/video', this.videoIdPlaylist], { state: { playlistId: this.playlistId } });
      }
      return;
    }
    if (indiceActual < this.videosDePlaylist.length - 1) {
      const siguienteVideo = this.videosDePlaylist[indiceActual + 1];
      this.videoIdPlaylist = siguienteVideo.id;
      this.router.navigate(['/video', this.videoIdPlaylist], { state: { playlistId: this.playlistId } });
    } else {
      console.log('No hay más videos en la lista');
    }
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

  visitar(userId?: number): void {
    const esInvitado = !this.usuario;
    const contadorClave = esInvitado ? 'contadorVideosInvitado' : `contadorVideos_${userId}`;
    let contadorTotal = this.cargarContador(contadorClave) || 0;
    const visitaObservable: Observable<any> = esInvitado
      ? this.videoService.contarVisitaInvitado(this.videoId)
      : userId
        ? this.videoService.contarVisita(this.videoId, userId)
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