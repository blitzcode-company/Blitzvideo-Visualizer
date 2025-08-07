import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import {  Subscription } from 'rxjs';

import { ModocineService } from '../../servicios/modocine.service';

@Component({
  selector: 'app-reproductor-video',
  templateUrl: './reproductor-video.component.html',
  styleUrls: ['./reproductor-video.component.css']
})
export class ReproductorVideoComponent implements OnInit, AfterViewInit {
  @Input() videoUrl: string | undefined;
  @Input() isCinemaMode: boolean = false;
  @Output() toggleCinemaMode = new EventEmitter<boolean>();
  @Output() videoTerminado = new EventEmitter<void>();
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar', { static: true }) progressBar!: ElementRef<HTMLInputElement>;
  @ViewChild('volumeSlider', { static: true }) volumeSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('videoContainer', { static: false }) videoContainer!: ElementRef<HTMLDivElement>;

  isPlaying = false;
  isMuted = false;
  currentTime: number = 0;
  duration: number = 0;
  isFullscreen = false;
  private cinemaModeSubscription!: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private cinemaModeService: ModocineService
  ) {}

  ngOnInit(): void {
    this.cinemaModeSubscription = this.cinemaModeService.getCinemaMode().subscribe(enabled => {
      console.log('CinemaMode desde servicio en ngOnInit:', enabled);
      this.isCinemaMode = enabled;
      this.applyCinemaMode(enabled);
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit, isCinemaMode:', this.isCinemaMode);
    if (this.videoPlayer?.nativeElement) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.load();
      videoElement.addEventListener('ended', this.onVideoEnd.bind(this));
      console.log('Aplicando modo cine en ngAfterViewInit:', this.isCinemaMode);
      this.applyCinemaMode(this.isCinemaMode);
      this.cdr.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl'] && this.videoUrl) {
      this.cambiarFuenteVideo(this.videoUrl);
    }
   if (changes['isCinemaMode'] && this.videoContainer?.nativeElement) {
      console.log('Cambiando isCinemaMode:', this.isCinemaMode);
      this.applyCinemaMode(this.isCinemaMode);
      this.cdr.detectChanges();
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

    if (videoElement && this.videoUrl) {
      videoElement.style.objectFit = enabled ? 'cover' : 'contain';
      console.log('Ajustando video object-fit:', videoElement.style.objectFit);
    } else {
      console.warn('videoElement o videoUrl no están disponibles');
    }
  }

  onVideoEnd(): void {
    this.videoTerminado.emit();
  }

  toggleMode() {
    this.toggleCinemaMode.emit(!this.isCinemaMode);
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
      this.applyCinemaMode(this.isCinemaMode);
    }
  }

  handleCanPlayThrough = () => {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement) {
      videoElement.play().catch((error) => {
        console.error('Error al reproducir el video:', error);
      });
    }
  };

  togglePlayPause() {
    const video = this.videoPlayer?.nativeElement;
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
    const video = this.videoPlayer?.nativeElement;
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
    const video = this.videoPlayer?.nativeElement;
    const progressBar = this.progressBar?.nativeElement;
    if (video && progressBar) {
      const progress = (video.currentTime / video.duration) * 100;
      this.currentTime = video.currentTime;
      progressBar.value = progress.toString();
    }
  }

  seek(progressBar: HTMLInputElement) {
    const video = this.videoPlayer?.nativeElement;
    if (video) {
      const time = (parseInt(progressBar.value) / 100) * video.duration;
      video.currentTime = time;
    }
  }

  toggleMute() {
    const video = this.videoPlayer?.nativeElement;
    if (video) {
      video.muted = !video.muted;
      this.isMuted = video.muted;
    }
  }

  changeVolume(volumeSlider: HTMLInputElement) {
    const video = this.videoPlayer?.nativeElement;
    if (video) {
      video.volume = parseInt(volumeSlider.value) / 100;
    }
  }

  toggleFullscreen() {
    const video = this.videoPlayer?.nativeElement;
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
}