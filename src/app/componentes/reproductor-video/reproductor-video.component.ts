import { Component, Input, EventEmitter, Output, OnInit, AfterViewInit, ViewChild, ElementRef, SimpleChanges } from '@angular/core';

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
  @Input() isCinemaMode: boolean = false; 
  @Output() toggleCinemaMode = new EventEmitter<boolean>(); 
  @Output() videoTerminado: EventEmitter<void> = new EventEmitter();

  isPlaying = false;
  isMuted = false;
  currentTime: number = 0;
  duration: number = 0;
  isFullscreen = false;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (this.videoPlayer?.nativeElement) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.load();
      videoElement.addEventListener('ended', this.onVideoEnd.bind(this));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl'] && this.videoUrl) {
      this.cambiarFuenteVideo(this.videoUrl);
    }
  }

  onVideoEnd(): void {
    this.videoTerminado.emit();
  }

  toggleMode(): void {
    this.isCinemaMode = !this.isCinemaMode;
    this.toggleCinemaMode.emit(this.isCinemaMode); 
  }

  cambiarFuenteVideo(url: string): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement) {
      videoElement.src = url;
      videoElement.removeEventListener('canplaythrough', this.handleCanPlayThrough);

      videoElement.addEventListener('canplaythrough', () => {
        videoElement.play().catch((error) => {
          console.error('Error al reproducir el video:', error);
        });
      });

      videoElement.load();
    }
  }

  handleCanPlayThrough(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement) {
      videoElement.play().catch((error) => {
        console.error('Error al reproducir el video:', error);
      });
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

  handleCinemaMode(isCinema: boolean): void {
    this.isCinemaMode = isCinema; 
  }
}
