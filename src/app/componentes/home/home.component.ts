import { Component } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { Videos } from '../../clases/videos';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

constructor(private videoService: VideosService, 
            private titleService: Title,
            private suscripcionService: SuscripcionesService,
            private authService: AuthService,
          ){}

videos:any;
serverIp = environment.serverIp;
canales: any[] = [];
userId:any;
duracionVideo: any;
usuario:any;

ngOnInit() {
  this.mostrarTodosLosVideos();
  this.titleService.setTitle('Pagina principal - BlitzVideo');
  this.obtenerUsuario();
}

obtenerUsuario(): void {
  this.authService.usuario$.subscribe(res => {
    this.usuario = res;
    this.userId = this.usuario.id
    this.mostrarCanalesSuscritos();

  });

  this.authService.mostrarUserLogueado().subscribe();
}

onImageError(event: any) {
  event.target.src = 'assets/images/video-default.png';
}

mostrarTodosLosVideos() {
  this.videoService.listarVideos().subscribe(res => {
    this.videos = res.map((video: any) => {
      console.log(video.duracion); 
      return {
        ...video,
        duracionFormateada: this.convertirDuracion(video.duracion)
      };
    });
  });
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
      console.log('Canales suscritos:', this.canales);  
    },
    error => {
      console.error('Error al obtener listas de suscripciones', error);
    }
  );
}

}




