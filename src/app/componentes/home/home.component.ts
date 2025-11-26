import { Component, OnDestroy, HostListener } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { AuthService } from '../../servicios/auth.service';
import { StatusService } from '../../servicios/status.service';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { Notificacion } from '../../clases/notificacion';
import { StreamService } from '../../servicios/stream.service';
import { Subscription } from 'rxjs';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { ViewChildren, QueryList, ElementRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {

  @ViewChildren('previewVideo') previewVideos!: QueryList<ElementRef<HTMLVideoElement>>;

  videos: any[] = [];
  isLoading: boolean = false;
  mostrandoVideosGenerales: boolean = false;
  serverIp = environment.serverIp;
  canales: any[] = [];
  userId: any;
  usuario: any;
  usuarioConCanal: any;
  notificaciones: Notificacion[] = [];
  mostrarNotificaciones: boolean = false;
  contadorNotificaciones: number = 0;
  sidebarVisible: boolean = true;

  streams: any[] = [];
  bloqueSinStreams:  boolean = false;
  errorStreams: boolean = false;
  private subscriptions = new Subscription();
  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  isMobile = window.innerWidth <= 767;


  constructor(
    private videoService: VideosService,
    private titleService: Title,
    private usuarioGlobal: UsuarioGlobalService,
    public status: StatusService,
    private notificacionesService: NotificacionesService,
    private streamService: StreamService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService
  ) {}



  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  ngOnInit() {
    this.subscriptions.add(
      this.authService.usuario$.subscribe(res => {
        this.usuario = res;
        if (this.usuario) {
          this.userId = this.usuario.id;
          this.mostrarVideos();
          this.notificacionesService.actualizarCantidadDesdeApi(this.userId);
        } else {
          this.userId = null;
          console.log('No hay usuario autenticado, cargando videos generales');
          this.mostrarVideos();
          this.usuarioConCanal = {}; 
        }
      })
    );
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
    this.subscriptions.add(
      this.authService.mostrarUserLogueado().subscribe()
    );

    this.cargarStreams();

    this.subscriptions.add(
      this.notificacionesService.notificaciones$.subscribe(cantidad => {
        const titulo = cantidad > 0 ? `(${cantidad}) BlitzVideo` : 'BlitzVideo';
        this.titleService.setTitle(titulo);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 767;
  }

  trackByStreamId(index: number, stream: any): number {
  return stream.id;
}

  reloadPage(event: Event) {
    event.preventDefault();  
    const target = event.currentTarget as HTMLAnchorElement;
    window.location.href = target.href;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
  }
  previewPlaying :boolean =true;




  onImageError(event: any) {
    event.target.src = 'assets/images/video-default.png';
  }

  mostrarVideos() {
    console.log('Iniciando mostrarVideos con userId:', this.userId);
    this.isLoading = true;
    this.mostrandoVideosGenerales = false;
    if (this.userId) {
      this.videoService.listarVideosPersonalizados(this.userId).subscribe({
        next: (res) => {
          console.log('Respuesta de listarVideosPersonalizados:', res);
          if (res && res.length > 0) {
            this.videos = res.map((video: any) => ({
              ...video,
              mostrarPreview: false,
              duracionFormateada: this.convertirDuracion(video.duracion)
            }));
            this.isLoading = false;
          } else {
            this.mostrandoVideosGenerales = true;
            this.cargarVideosGenerales();
          }
        },
        error: (err) => {
          this.mostrandoVideosGenerales = true;
          this.cargarVideosGenerales();
        }
      });
    } else {
      this.mostrandoVideosGenerales = true;
      this.cargarVideosGenerales();
    }
  }


playPreview(video: any) {
  if (video.previewBlobUrl) {
    video.mostrarPreview = true;
    video.isPlayingPreview = true;
    return;
  }

  video.mostrarPreview = true;
  video.isLoadingPreview = true;

  fetch(video.link, {
    method: 'GET',
    headers: { Range: 'bytes=0-2097152' } 
  })
  .then(res => res.blob())
  .then(blob => {
    video.previewBlobUrl = URL.createObjectURL(blob);
    video.isLoadingPreview = false;
  })
  .catch(() => {
    video.previewBlobUrl = video.link;
  });
}
stopPreview(video: any) {
  video.mostrarPreview = false;
  video.isPlayingPreview = false;

  const index = this.videos.indexOf(video);
  const videoEl = this.previewVideos.toArray()[index]?.nativeElement;
  if (videoEl) {
    videoEl.pause();
    videoEl.currentTime = 0; 
  }
}

forceMute(event: any) {
  const video = event.target as HTMLVideoElement;
  video.muted = true;
  video.volume = 0;
}

onLoadedData(event: any, video: any) {
  const vid = event.target as HTMLVideoElement;
  
  let start = 8;
  if (video.duracion < 20) start = 2;
  else if (video.duracion > 60) start = Math.floor(video.duracion * 0.25);

  vid.currentTime = start;
  vid.play().catch(() => {});
}

onTimeUpdate(event: any) {
  const vid = event.target as HTMLVideoElement;
  
  if (vid.currentTime > vid.duration - 3 || vid.currentTime < 5) {
    const start = this.getPreviewStartTime(vid.duration || 60);
    vid.currentTime = start;
  }
}

getPreviewStartTime(duracion: number): number {
  if (duracion < 20) return 2;
  if (duracion < 60) return 8;
  return Math.floor(duracion * 0.25);
}

    trackByVideoId(index: number, video: any): number {
      return video.id;
    }

  private cargarVideosGenerales() {
    this.videoService.listarVideos().subscribe({
      next: (res) => {
        this.videos = res.map((video: any) => ({
          ...video,
          duracionFormateada: this.convertirDuracion(video.duracion)
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.videos = [];
        this.isLoading = false;
      }
    });
  }

  cargarStreams(): void {
    this.streamService.listarStreams().subscribe({
      next: (res) => {
        console.log(res)
        this.streams = res.map((stream: any) => ({
          ...stream,
        }));
        this.errorStreams = false;
      },
      error: (error) => {
        console.error('Error al cargar los streams:', error);
        this.errorStreams = true;
      }
    });
  }

  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }


}