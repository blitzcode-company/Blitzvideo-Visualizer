import { Component } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { Videos } from '../../clases/videos';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { AuthService } from '../../servicios/auth.service';
import { StatusService } from '../../servicios/status.service';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { Notificacion } from '../../clases/notificacion';
import { StreamService } from '../../servicios/stream.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

constructor(private videoService: VideosService, 
            private titleService: Title,
            public status:StatusService,
            private notificacionesService: NotificacionesService,
            private streamService: StreamService,
            private suscripcionService: SuscripcionesService,
            private authService: AuthService,
          ){}

videos: any[] = [];

serverIp = environment.serverIp;
canales: any[] = [];
userId:any;
duracionVideo: any;
usuario:any;
usuarioConCanal:any;
idCanal:any;
notificaciones: Notificacion[] = [];
mostrarNotificaciones: boolean = false; 
contadorNotificaciones: number = 0;
streams: any[] = []; 
errorStreams: boolean = false;


ngOnInit() {
  this.mostrarVideos();
  this.obtenerUsuario(); 
  this.cargarStreams();
  this.notificacionesService.notificaciones$.subscribe(cantidad => {
    const titulo = cantidad > 0
      ? `(${cantidad}) BlitzVideo`
      : 'BlitzVideo';
    this.titleService.setTitle(titulo);
  });
}

obtenerUsuario(): void {
  this.authService.usuario$.subscribe(res => {
    this.usuario = res;
    if (this.usuario) {
      this.userId = this.usuario.id;
      this.obtenerUsuarioConCanal()
      this.mostrarCanalesSuscritos();
      this.mostrarVideos();
      this.notificacionesService.actualizarCantidadDesdeApi(this.userId);
    } else {
      this.userId = null; 
    }

  });

  this.authService.mostrarUserLogueado().subscribe();
}


obtenerUsuarioConCanal(): void {
  if (this.userId !== undefined) {
    this.authService.obtenerCanalDelUsuario(this.userId).subscribe(
      (res: any) => {
        this.usuarioConCanal = res;
        this.idCanal = this.usuarioConCanal.canales.id;
      },
      (error) => {
        console.error('Error al obtener el canal del usuario', error);
      }
    );
  } else {
    console.error('El userId no está definido');
  }
}       
onImageError(event: any) {
  event.target.src = 'assets/images/video-default.png';
}

mostrarVideos() {
  if (this.userId) {
    this.videoService.listarVideosPersonalizados(this.userId).subscribe(res => {
      console.log('Videos personalizados:', res); 

      this.videos = res
        .map((video: any) => {
          return {
            ...video,
            duracionFormateada: this.convertirDuracion(video.duracion)
          };
        })
        .sort(() => Math.random() - 0.5);
    });
  } else {
    this.videoService.listarVideos().subscribe(res => {
      this.videos = res
        .map((video: any) => {
          return {
            ...video,
            duracionFormateada: this.convertirDuracion(video.duracion)
          };
        })
        .sort(() => Math.random() - 0.5);
      
    });
  }
}

cargarStreams(): void {
  this.streamService.listarStreams().subscribe(
    res => {
      console.log(res)
      this.streams = res.map((stream: any) => ({
        ...stream,
      }));
      this.errorStreams = false;
    },
    error => {
      console.error('Error al cargar los streams:', error);
      this.errorStreams = true;
    }
  );
}


convertirDuracion (segundos:number): string {
  const minutos = Math.floor(segundos/ 60);
  const segundosRestantes = segundos % 60;
  const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
  return `${minutos}:${segundosFormateados}`
}


mostrarCanalesSuscritos() {
  this.suscripcionService.listarSuscripciones(this.userId).subscribe(
    suscripciones => {
      this.canales = suscripciones; 
    },
    error => {
      console.error('Error al obtener listas de suscripciones', error);
    }
  );
}

}



