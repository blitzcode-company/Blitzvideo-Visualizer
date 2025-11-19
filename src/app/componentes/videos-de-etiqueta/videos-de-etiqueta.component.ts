import { Component,  OnInit  } from '@angular/core';
import { Videos } from '../../clases/videos';
import { ActivatedRoute, Router } from '@angular/router';
import { VideosService } from '../../servicios/videos.service';
import { Title } from '@angular/platform-browser';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';

@Component({
  selector: 'app-videos-de-etiqueta',
  templateUrl: './videos-de-etiqueta.component.html',
  styleUrl: './videos-de-etiqueta.component.css'
})
export class VideosDeEtiquetaComponent {

  etiquetaId: number = 0;
  etiquetaNombre: string = 'Cargando...';
  videos: Videos[] = [];
  duracionFormateada: any;
  isLoading = true;
  error = false;
  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  isMobile = window.innerWidth <= 767;

constructor(
    private route: ActivatedRoute,
    public router: Router,
    private usuarioGlobal: UsuarioGlobalService,
    private videoService: VideosService,
    private titleService: Title
  ) {}


  ngOnInit(): void {

  this.etiquetaId = this.route.snapshot.params['id'];

   if (this.etiquetaId) {
        this.cargarVideosDeEtiqueta(this.etiquetaId);
      }
    
  }


  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

cargarVideosDeEtiqueta(id: number): void {
    this.isLoading = true;
    this.error = false;

    this.videoService.listarVideosPorEtiqueta(id).subscribe({
     next: (response: any) => {
        const videosArray = Array.isArray(response) ? response : 
                          response.videos || response.data || [response];

        this.videos = videosArray.map((video: any) => ({
          ...video,
          duracionFormateada: this.convertirDuracion(video.duracion),
          canal: video.canal || { id: video.canal_id, nombre: 'Canal desconocido' }
        }));

        let nombreEtiqueta = `Etiqueta #${id}`;
        if (videosArray.length > 0 && videosArray[0].etiquetas?.length > 0) {
          const etiqueta = videosArray[0].etiquetas.find((e: any) => e.id == id);
          if (etiqueta) {
            nombreEtiqueta = etiqueta.nombre;
          }
        }

        this.etiquetaNombre = nombreEtiqueta;
        this.titleService.setTitle(`${nombreEtiqueta} • BlitzVideo`);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando videos de etiqueta:', err);
        this.error = true;
        this.isLoading = false;
        this.etiquetaNombre = 'Etiqueta no encontrada';
      }
    });
  }

  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/video-default.png';
  }

  trackByVideoId(index: number, video: Videos): number {
    return video.id;
  }

}
