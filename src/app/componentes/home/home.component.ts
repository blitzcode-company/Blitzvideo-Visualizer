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
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';

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
  notificaciones: Notificacion[] = [];
  mostrarNotificaciones: boolean = false;
  contadorNotificaciones: number = 0;
  sidebarVisible: boolean = true;

  streams: any[] = [];
  errorStreams: boolean = false;
  private subscriptions = new Subscription();
  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;


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

  reloadPage(event: Event) {
    event.preventDefault();  
    const target = event.currentTarget as HTMLAnchorElement;
    window.location.href = target.href;
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


}