import { Component, OnInit } from '@angular/core';
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
      this.video = this.videos
      console.log(this.video)

    })
  }
   

}
