import { Component } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { Videos } from '../../clases/videos';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { AuthService } from '../../servicios/auth.service';
import { StatusService } from '../../servicios/status.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

constructor(private videoService: VideosService, 
            private titleService: Title,
            public status:StatusService,

            private suscripcionService: SuscripcionesService,
            private authService: AuthService,
          ){}

videos: any[] = [];
videosPaginados: any[] = [];
paginaActual: number = 1;
videosPorPagina: number = 8;
serverIp = environment.serverIp;
canales: any[] = [];
userId:any;
duracionVideo: any;
usuario:any;
totalPaginas: number = 1;
usuarioConCanal:any;
idCanal:any;

ngOnInit() {
  this.mostrarTodosLosVideos();
  this.titleService.setTitle('Pagina principal - BlitzVideo');
  this.obtenerUsuario();
}

obtenerUsuario(): void {
  this.authService.usuario$.subscribe(res => {
    this.usuario = res;
    if (this.usuario) {
      this.userId = this.usuario.id;
      this.obtenerUsuarioConCanal()
      this.mostrarCanalesSuscritos();
    } else {
      this.userId = null; 
    }

  });

  this.authService.mostrarUserLogueado().subscribe();
}


obtenerUsuarioConCanal(): void {
  this.authService.obtenerCanalDelUsuario(this.userId).subscribe(
    (res: any) => {
      this.usuarioConCanal = res; 
      console.log(this.usuarioConCanal)
      this.idCanal = this.usuarioConCanal.canales[0].id
    },
    
  );
}

onImageError(event: any) {
  event.target.src = 'assets/images/video-default.png';
}

mostrarTodosLosVideos() {
  this.videoService.listarVideos().subscribe(res => {
    this.videos = res
      .map((video: any) => {
        return {
          ...video,
          duracionFormateada: this.convertirDuracion(video.duracion)
        };
      })
      .sort(() => Math.random() - 0.5);
    
    this.totalPaginas = Math.ceil(this.videos.length / this.videosPorPagina);
    this.paginaActual = 1; 
    this.actualizarVideosPaginados();
  });
}

actualizarVideosPaginados() {
  const inicio = (this.paginaActual - 1) * this.videosPorPagina;
  const fin = inicio + this.videosPorPagina;
  this.videosPaginados = this.videos.slice(inicio, fin);
}


irAPaginaAnterior() {
  if (this.paginaActual > 1) {
    this.paginaActual--;
    this.actualizarVideosPaginados();
  }
}

irAPaginaSiguiente() {
  if (this.paginaActual < this.totalPaginas) {
    this.paginaActual++;
    this.actualizarVideosPaginados();
  }
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
      this.canales = suscripciones.map((suscripcion: any) => suscripcion.canal);
    },
    error => {
      console.error('Error al obtener listas de suscripciones', error);
    }
  );
}

}




