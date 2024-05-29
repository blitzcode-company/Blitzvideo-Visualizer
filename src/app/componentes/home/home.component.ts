import { Component } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { Videos } from '../../clases/videos';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

constructor(private videoService: VideosService){}

videos:any;

ngOnInit() {
  this.mostrarTodosLosVideos();

}


mostrarTodosLosVideos() {
  this.videoService.listarVideos().subscribe(res => {
    this.videos = res;
  });
}



}
