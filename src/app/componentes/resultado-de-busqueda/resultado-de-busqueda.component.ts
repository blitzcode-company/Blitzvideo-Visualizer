import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideosService } from '../../servicios/videos.service';
import { TiempoService } from '../../servicios/tiempo.service';
import { Title } from '@angular/platform-browser';
import  moment from 'moment';
import 'moment/locale/es';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { AuthService } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resultado-de-busqueda',
  templateUrl: './resultado-de-busqueda.component.html',
  styleUrl: './resultado-de-busqueda.component.css'
})
export class ResultadoDeBusquedaComponent implements OnInit{

  videos: any[] = [];
  video: any;
  sidebarCollapsed = false;
  sidebarVisible: boolean = true;
  private subscriptions = new Subscription();

  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  nombre: string = '';
  isMobile = window.innerWidth <= 768;

  constructor(private videoService: VideosService,
              private usuarioGlobal: UsuarioGlobalService,
              private route: ActivatedRoute,
              private authService: AuthService,
              private titleService: Title,
              private tiempo: TiempoService) {
                moment.locale('es'); 
              }

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.nombre = params['q'] || ''; 
    if (this.nombre) {
      this.listarVideosPorNombre(this.nombre);
    }
    this.titleService.setTitle(this.nombre + ' - BlitzVideo');
  });

  this.checkMobile();
  this.subscriptions.add(
    this.authService.mostrarUserLogueado().subscribe()
  );
}

ngOnDestroy() {
  this.subscriptions.unsubscribe();
}



toggleSidebar() {
  this.sidebarCollapsed = !this.sidebarCollapsed;
}

checkMobile() {
  this.isMobile = window.innerWidth <= 767;
}



@HostListener('window:resize', ['$event'])
onResize(event: any) {
  this.isMobile = event.target.innerWidth <= 768;
}


  onImageError(event: any) {
    event.target.src = 'assets/images/video-default.png';
  }
  

  listarVideosPorNombre(nombre: string): void {
    this.videoService.listarVideosPorNombre(nombre).subscribe(
      (res: any[]) => {  
        this.videos = res.map(videoData => {
          return {
            ...videoData,
            created_at: this.tiempoTranscurrido(videoData.created_at),
            duracionFormateada: this.convertirDuracion(videoData.duracion)

          };
        });
        console.log(this.videos);
      },
      (error) => {
        console.error('Error al obtener videos:', error);
      }
    );
  }


  convertirDuracion (segundos:number): string {
    const minutos = Math.floor(segundos/ 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`
  }

  tiempoTranscurrido(fecha: Date | string): string {
    return moment(fecha).fromNow(); 
  }


}
