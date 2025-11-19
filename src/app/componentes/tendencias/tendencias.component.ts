import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { VideosService } from '../../servicios/videos.service';
import { Title } from '@angular/platform-browser';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { StatusService } from '../../servicios/status.service';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { AuthService } from '../../servicios/auth.service';
import { environment } from '../../../environments/environment';
import { Videos } from '../../clases/videos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tendencias',
  templateUrl: './tendencias.component.html',
  styleUrl: './tendencias.component.css'
})
export class TendenciasComponent implements OnInit{


  videos: any[] = [];
  isLoading: boolean = false;
  serverIp = environment.serverIp;
    canales: any[] = [];
    userId: any;
    usuario: any;
    usuarioConCanal: any;
  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  isMobile = window.innerWidth <= 767;
loading = true;
  error = false;
duracionFormateada: any
  constructor(
    private videoService: VideosService,
    private titleService: Title,
    private usuarioGlobal: UsuarioGlobalService,
    public status: StatusService,
    private notificacionesService: NotificacionesService,
    private suscripcionService: SuscripcionesService,
    private authService: AuthService, 
    private router: Router,
    
  ) {}

  onImgError(event: any) {
    event.target.src = 'assets/images/video-default.png';
  }

  ngOnInit() {
    this.cargarTendencias();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  cargarTendencias(): void {
    this.loading = true;
    this.error = false;

    this.videoService.listarVideosPorTendencias().subscribe({
     next: (res) => {
        console.log('Tendencias:', res);
        this.videos = res.map((video: any) => ({
          ...video,
          mostrarPreview: false,

          duracionFormateada: this.convertirDuracion(video.duracion)
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar tendencias', err);
        this.videos = [];
        this.isLoading = false;
        this.error = true;
      }
    });
  }
  
playPreview(video: any) {
  video.mostrarPreview = true;
  
  setTimeout(() => {
    const videoEl = document.querySelectorAll('video').item(this.videos.indexOf(video)) as HTMLVideoElement;
    if (videoEl) {
      videoEl.load(); 
    }
  }, 50);
}

stopPreview(video: any) {
  video.mostrarPreview = false;
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

  irAVideo(id: number): void {
    window.location.href = `/video/${id}`;
  }

  formatearVisitas(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }

  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }









}
