import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideosService } from '../../servicios/videos.service';
import { TiempoService } from '../../servicios/tiempo.service';
import { Title } from '@angular/platform-browser';
import  moment from 'moment';
import 'moment/locale/es';

@Component({
  selector: 'app-resultado-de-busqueda',
  templateUrl: './resultado-de-busqueda.component.html',
  styleUrl: './resultado-de-busqueda.component.css'
})
export class ResultadoDeBusquedaComponent implements OnInit{

  videos: any[] = [];
  video: any;

  nombre: string = '';

  constructor(private videoService: VideosService,
              private route: ActivatedRoute,
              private titleService: Title,
              private tiempo: TiempoService) {
                moment.locale('es'); 
              }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.nombre = params.get('nombre') || '';
      if (this.nombre) {
        this.listarVideosPorNombre(this.nombre);
      }
      this.titleService.setTitle(this.nombre + ' - BlitzVideo');

    });
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
