import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-reproductor-video',
  templateUrl: './reproductor-video.component.html',
  styleUrls: ['./reproductor-video.component.css']
})
export class ReproductorVideoComponent implements OnInit, AfterViewInit {
  @Input() videoUrl: string | undefined;
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement> | undefined;
  @ViewChild('progressBar', { static: true }) progressBar!: ElementRef<HTMLInputElement>;
  @ViewChild('volumeSlider', { static: true }) volumeSlider!: ElementRef<HTMLInputElement>;

  isPlaying = false;
  isMuted = false;
  currentTime: number = 0;
  duration: number = 0;
  isCinemaMode = false;
  isFullscreen = false;


  constructor(private el: ElementRef) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.load();
    }
  }

  togglePlayPause() {
    const video: HTMLVideoElement | undefined = this.videoPlayer?.nativeElement;
    if (video) {
      if (video.paused || video.ended) {
        video.play();
        this.isPlaying = true;
      } else {
        video.pause();
        this.isPlaying = false;
      }
    }
  }

  setDuration() {
    const video: HTMLVideoElement | undefined = this.videoPlayer?.nativeElement;
    if (video) {
      this.duration = video.duration;
    }
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  updateProgressBar() {
    const video: HTMLVideoElement | undefined = this.videoPlayer?.nativeElement;
    const progressBar: HTMLInputElement | undefined = this.progressBar?.nativeElement;
    if (video && progressBar) {
      const progress = (video.currentTime / video.duration) * 100;
      this.currentTime = video.currentTime; 
      progressBar.value = progress.toString();
    }
  }

  seek(progressBar: HTMLInputElement) {
    const video: HTMLVideoElement | undefined = this.videoPlayer?.nativeElement;
    if (video) {
      const time = (parseInt(progressBar.value) / 100) * video.duration;
      video.currentTime = time;
    }
  }

  toggleMute() {
    const video: HTMLVideoElement | undefined = this.videoPlayer?.nativeElement;
    if (video) {
      video.muted = !video.muted;
      this.isMuted = video.muted;
    }
  }

  changeVolume(volumeSlider: HTMLInputElement) {
    const video: HTMLVideoElement | undefined = this.videoPlayer?.nativeElement;
    if (video) {
      video.volume = parseInt(volumeSlider.value) / 100;
    }
  }

  toggleFullscreen() {
    const video: HTMLVideoElement | undefined = this.videoPlayer?.nativeElement;
    if (video) {
      if (!document.fullscreenElement) {
        video.requestFullscreen().catch(err => {
          console.error(`Error al activar pantalla completa: ${err.message} (${err.name})`);
        });
        this.isFullscreen = true;
      } else {
        document.exitFullscreen();
        this.isFullscreen = false;
      }
    }
  }


  toggleCinemaMode() {
    this.isCinemaMode = !this.isCinemaMode;
  }
}