import { Component, Input, EventEmitter, Output, OnInit, AfterViewInit, ViewChild, ElementRef, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import Hls from 'hls.js';


@Component({
  selector: 'app-reproductor-stream',
  templateUrl: './reproductor-stream.component.html',
  styleUrl: './reproductor-stream.component.css'
})
export class ReproductorStreamComponent {

  @Input() streamUrl: string | undefined;
  @Input() activoStream: number = 0;
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement> | undefined;
  @ViewChild('progressBar', { static: true }) progressBar!: ElementRef<HTMLInputElement>;
  @ViewChild('volumeSlider', { static: true }) volumeSlider!: ElementRef<HTMLInputElement>;
  @Input() isCinemaMode: boolean = false; 
  @Output() toggleCinemaMode = new EventEmitter<boolean>(); 
  @Output() videoTerminado: EventEmitter<void> = new EventEmitter();
  @ViewChild('videoContainer', { static: false }) videoContainer!: ElementRef<HTMLDivElement>;

  isPlaying = false;
  isMuted = false;
  currentTime: number = 0;
  duration: number = 0;
  isFullscreen = false;
  

  constructor(
    private cdr: ChangeDetectorRef,

  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (this.videoPlayer?.nativeElement) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.load();
      videoElement.addEventListener('ended', this.onVideoEnd.bind(this));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['streamUrl'] && this.streamUrl) {
      this.cambiarFuenteVideo(this.streamUrl);
    }
    if (changes['isCinemaMode'] && this.videoContainer?.nativeElement) {
      console.log('Cambiando isCinemaMode:', this.isCinemaMode);
      this.applyCinemaMode(this.isCinemaMode);
      this.cdr.detectChanges();
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
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
  
    video.pause();
    video.removeAttribute('src');
    video.load();
  
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => {
          this.isPlaying = true;
        }).catch((error) => {
          console.error('Error al reproducir con HLS.js:', error);
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().then(() => {
          this.isPlaying = true;
        }).catch((error) => {
          console.error('Error al reproducir en Safari:', error);
        });
      });
    } else {
      console.error('HLS no es compatible en este navegador y no se puede reproducir el stream.');
    }
  }

  private applyCinemaMode(enabled: boolean) {
    console.log('Aplicando modo cine:', enabled);
    const videoContainer = this.videoContainer?.nativeElement;
    const videoElement = this.videoPlayer?.nativeElement;

    if (videoContainer) {
      if (enabled) {
        videoContainer.classList.add('cinema-mode');
        console.log('Añadiendo clase cinema-mode al contenedor', videoContainer.classList);
      } else {
        videoContainer.classList.remove('cinema-mode');
        console.log('Quitando clase cinema-mode del contenedor', videoContainer.classList);
      }
    } else {
      console.warn('videoContainer no está disponible');
    }

    if (videoElement && this.streamUrl) {
      videoElement.style.objectFit = enabled ? 'cover' : 'contain';
      console.log('Ajustando video object-fit:', videoElement.style.objectFit);
    } else {
      console.warn('videoElement o videoUrl no están disponibles');
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
  const video = this.videoPlayer?.nativeElement;

  if (video) {
    if (!video.src && video.children.length === 0) {
      console.warn('No hay fuente de video cargada.');
      return;
    }

    if (video.paused || video.ended) {
      video.play().then(() => {
        this.isPlaying = true;
      }).catch((error) => {
        console.error('Error al reproducir el video:', error);
      });
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
