import { Component } from '@angular/core';
import { CanalService } from '../../servicios/canal.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-videos-del-canal',
  templateUrl: './videos-del-canal.component.html',
  styleUrl: './videos-del-canal.component.css'
})
export class VideosDelCanalComponent {

  usuario:any;
  canal:any;
  canalId:any;
  videos:any;
  canalNombre:any
  userId:any;
  
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
          this.videos = res; 
          this.userId = this.canal.user_id;  
          console.log(this.canal);
          console.log(this.usuario);
          console.log(this.videos);
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
