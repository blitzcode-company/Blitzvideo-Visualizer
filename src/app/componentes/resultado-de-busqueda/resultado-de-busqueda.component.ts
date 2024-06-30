import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideosService } from '../../servicios/videos.service';
import { TiempoService } from '../../servicios/tiempo.service';
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
              private tiempo: TiempoService) {
                moment.locale('es'); 
              }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.nombre = params.get('nombre') || '';
      if (this.nombre) {
        this.listarVideosPorNombre(this.nombre);
      }
    });
  }


  listarVideosPorNombre(nombre: string): void {
    this.videoService.listarVideosPorNombre(nombre).subscribe(
      (res: any[]) => {  // Acepta los datos crudos del servicio
        this.videos = res.map(videoData => {
          return {
            ...videoData,
            created_at: this.tiempoTranscurrido(videoData.created_at)
          };
        });
        console.log(this.videos);
      },
      (error) => {
        console.error('Error al obtener videos:', error);
      }
    );
  }

  tiempoTranscurrido(fecha: Date | string): string {
    return moment(fecha).fromNow();  // Calcula el tiempo transcurrido usando moment.js
  }


}
