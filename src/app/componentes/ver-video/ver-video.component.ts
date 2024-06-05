import { Component, OnInit, ViewChild } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { ActivatedRoute } from '@angular/router';
import { Videos } from '../../clases/videos';

@Component({
  selector: 'app-ver-video',
  templateUrl: './ver-video.component.html',
  styleUrl: './ver-video.component.css'
})
export class VerVideoComponent implements OnInit {
  id: any;
  videos = new Videos();
  video: any;

  constructor(private route:ActivatedRoute, private videoService: VideosService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id']
    this.mostrarVideo();
  }

  mostrarVideo() {
    this.videoService.obtenerInformacionVideo(this.id).subscribe(res => {
      this.videos = res;
      this.video = this.videos;
  
      if (this.video && this.video.created_at) {
        const fecha = new Date(this.video.created_at);
        if (!isNaN(fecha.getTime())) {
          this.video.created_at = this.convertirFechaALineaDeTexto(fecha);
        } 
      }
  
      console.log(this.video);
    });
  }
  
  convertirFechaALineaDeTexto(fecha: Date): string {
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre"
    ];
  
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
  
    const lineaDeTexto = `${dia} de ${mes} de ${año}`;
    return lineaDeTexto;
  }
  
}
