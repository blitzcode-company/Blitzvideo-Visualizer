import { Component } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { Videos } from '../../clases/videos';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

constructor(private videoService: VideosService, private titleService: Title){}

videos:any;

ngOnInit() {
  this.mostrarTodosLosVideos();
  this.titleService.setTitle('Pagina principal - BlitzVideo');


}


mostrarTodosLosVideos() {
  this.videoService.listarVideos().subscribe(res => {
    this.videos = res;
    console.log(this.videos)
  });
}



}
