import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanalService } from '../../servicios/canal.service';
import { AuthService } from '../../servicios/auth.service';
import { Canal } from '../../clases/canal';
import { Videos } from '../../clases/videos';

@Component({
  selector: 'app-ver-canal',
  templateUrl: './ver-canal.component.html',
  styleUrls: ['./ver-canal.component.css']
})
export class VerCanalComponent implements OnInit {
  
  usuario:any;
  canal:any;
  canalId:any;
  canalNombre:any
  userId:any;
  videos: Videos[] = [];
  ultimoVideo:any;
  videosGeneral:any

  ngOnInit() {
    this.canalId = this.route.snapshot.params['id'];
    this.obtenerCanal();
  }
  constructor(private canalService: CanalService,private route: ActivatedRoute){}

  obtenerCanal() {
    this.canalService.listarVideosDeCanal(this.canalId).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.canal = res[0].canal;
          this.canalNombre = this.canal.nombre;
          this.usuario = this.canal.user;
          this.videosGeneral = res;
          this.videos = res.slice(0, 3);
          this.userId = this.canal.user_id;
  
          this.ultimoVideo = this.videosGeneral.reduce((prev:any, current:any) => (prev.id > current.id) ? prev : current);

          if (this.ultimoVideo) {
            this.ultimoVideo.indice = this.videos.findIndex(videosGeneral => videosGeneral.id === this.ultimoVideo.id) + 1;
            console.log('Índice del último video:', this.ultimoVideo.indice);
          }
          
          
          console.log(this.canal);
          console.log(this.usuario);
          console.log(this.videos);
          console.log(this.ultimoVideo); 
        } else {
          console.error('No se encontraron videos para este canal');
        }
      },
      error => {
        console.error('Error al obtener el canal:', error);
      }
    );
  }



}
