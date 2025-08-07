import { Component, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {
  videos: any[] = [];
  isLoading: boolean = false;
  mostrandoVideosGenerales: boolean = false;
  serverIp = environment.serverIp;
  canales: any[] = [];
  userId: any;
  usuario: any;
  usuarioConCanal: any;
  idCanal: any;
  notificaciones: Notificacion[] = [];
  mostrarNotificaciones: boolean = false;
  contadorNotificaciones: number = 0;
  streams: any[] = [];
  errorStreams: boolean = false;
  private subscriptions = new Subscription();

  constructor(
    private videoService: VideosService,
    private titleService: Title,
    public status: StatusService,
    private notificacionesService: NotificacionesService,
    private streamService: StreamService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.authService.usuario$.subscribe(res => {
        this.usuario = res;
        if (this.usuario) {
          this.userId = this.usuario.id;
          this.obtenerUsuarioConCanal();
          this.mostrarCanalesSuscritos();
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

  obtenerUsuarioConCanal(): void {
    if (this.userId !== undefined) {
      this.authService.obtenerCanalDelUsuario(this.userId).subscribe({
        next: (res: any) => {
          console.log('Respuesta de obtenerCanalDelUsuario:', res);
          this.usuarioConCanal = res || {};
          this.idCanal = res?.canales?.id || null;
        },
        error: (error) => {
          console.error('Error al obtener el canal del usuario:', error);
          this.usuarioConCanal = {};
          this.idCanal = null;
        }
      });
    } else {
      console.error('El userId no está definido');
      this.usuarioConCanal = {};
      this.idCanal = null;
    }
  }

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

  mostrarCanalesSuscritos() {
    this.suscripcionService.listarSuscripciones(this.userId).subscribe({
      next: (suscripciones) => {
        this.canales = suscripciones;
        console.log('Canales suscritos:', this.canales);
      },
      error: (error) => {
        console.error('Error al obtener listas de suscripciones', error);
      }
    });
  }
}