import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef, SimpleChanges, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModocineService } from '../../servicios/modocine.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reproductor-video',
  templateUrl: './reproductor-video.component.html',
  styleUrls: ['./reproductor-video.component.css']
})
export class ReproductorVideoComponent implements OnInit, AfterViewInit {

  @Input() videoUrl?: string;
  @Input() isCinemaMode: boolean = false;
  @Input() controlsWidth!: number;
  @Input() reproduciendoPublicidad: boolean = false;
  @Input() videoWidth: number = 1280;
  @Input() videosRecomendados: any[] = [];
  @Input() isFromPlaylist: boolean = false; // Indica si el video es de una playlist
  @Input() playlistVideos: any[] = [];

  @Output() nextVideo = new EventEmitter<any>();
  @Output() toggleCinemaMode = new EventEmitter<boolean>();
  @Output() videoTerminado = new EventEmitter<void>();

  @ViewChild('previewThumbnail', { static: true }) previewThumbnail?: ElementRef<HTMLDivElement>;
  @ViewChild('previewVideo', { static: true }) previewVideo?: ElementRef<HTMLVideoElement>;

  @ViewChild('videoPlayer', { static: false }) videoPlayer?: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar', { static: true }) progressBar?: ElementRef<HTMLInputElement>;
  @ViewChild('volumeSlider', { static: true }) volumeSlider?: ElementRef<HTMLInputElement>;
  @ViewChild('videoContainer', { static: false }) videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('controlsRef', { static: true }) controlsRef?: ElementRef<HTMLDivElement>;

  isPlaying = false;
  isMuted = false;
  currentTime: number = 0;
  duration: number = 0;
  isFullscreen = false;
  hideControlsTimeout: any;
  previewTime: string = '';
  showOverlay = false;       
  overlayTimeout: any;
  mostrarEndScreen: boolean = false;
  tooltipVisible: number | null = null; 


  isAutoplayEnabled: boolean = false; // Estado de reproducción automática
  isLooping: boolean = false; // Estado de repetición del video
  currentPlaylistIndex: number = 0; // Índice del video actual en la playlist
  isVideoEnded: boolean = false; 

  private cinemaModeSubscription?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private cinemaModeService: ModocineService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.cinemaModeSubscription = this.cinemaModeService.getCinemaMode().subscribe(enabled => {
      this.isCinemaMode = enabled;
      this.applyCinemaMode(enabled);
      this.cdr.detectChanges();
    });
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));

    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });

    if (this.isFromPlaylist) {
      this.isAutoplayEnabled = true;
    }
  }

  
  ngAfterViewInit(): void {
    const video = this.videoEl;
    if (!video) return;

    video.load();
    video.addEventListener('ended', this.onVideoEnd.bind(this));
    this.applyCinemaMode(this.isCinemaMode);
    this.cdr.detectChanges();


    const preview = this.previewVideo?.nativeElement;
    if (!preview) return;
    preview.muted = true;
    preview.load();
  }

  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  
    if (this.isFullscreen && this.isCinemaMode) {
      this.isCinemaMode = false;
    }
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoPlayer?.nativeElement || null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl'] && this.videoUrl) {
      this.mostrarEndScreen = false; 
      this.cambiarFuenteVideo(this.videoUrl);
      this.isVideoEnded = false;
    }

    if (changes['isCinemaMode']) {
      setTimeout(() => this.applyCinemaMode(this.isCinemaMode), 0);
    }

    if (changes['isFromPlaylist']) {
      this.isAutoplayEnabled = this.isFromPlaylist; // Actualiza autoplay según playlist
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.cinemaModeSubscription?.unsubscribe();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));

  }



  
  @HostListener('mousemove')
  showControls(): void {
    const controls = this.controlsEl;
    if (!controls) return;

    controls.classList.remove('hide');
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(() => {
      controls.classList.add('hide');
    }, 3000);
  }

  @HostListener('mouseleave')
  hideControls(): void {
    this.controlsEl?.classList.add('hide');
  }



  togglePlayPause(): void {
    const video = this.videoEl;
    if (this.reproduciendoPublicidad) return;

    if (!video) return;
    if (video.paused || video.ended) {
      this.isPlaying = true;
      this.isVideoEnded = false; // Resetear al reanudar
      video.play().catch(console.error);
    } else {
      this.isPlaying = false;
      video.pause();
    }
    this.showCentralOverlay();
    this.cdr.detectChanges();
  }

  
  private showCentralOverlay(): void {
    this.showOverlay = true;
    clearTimeout(this.overlayTimeout);
    this.overlayTimeout = setTimeout(() => {
      this.showOverlay = false;
    }, 1000); 
  }

  setDuration(): void {
    const video = this.videoEl;
    if (!video) return;

    this.duration = video.duration;
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  updateProgressBar(): void {
    const video = this.videoPlayer?.nativeElement;
    const progressBar = this.progressBar?.nativeElement;
    if (!video || !progressBar || !video.duration) return;
  
    this.currentTime = video.currentTime;
  
    const progressPercent = (video.currentTime / video.duration) * 100;
    progressBar.value = progressPercent.toString();
  
    progressBar.style.background = `linear-gradient(to right, #042234 ${progressPercent}%, rgba(255,255,255,1) ${progressPercent}%)`;
  
    if (video.buffered.length > 0) {
      const bufferEnd = video.buffered.end(video.buffered.length - 1);
      const bufferPercent = (bufferEnd / video.duration) * 100;
      progressBar.style.setProperty('--buffer', `${bufferPercent}%`);
    }

    if (this.reproduciendoPublicidad) {
      progressBar.style.background = `linear-gradient(to right, yellow ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`;
    } else {
      progressBar.style.background = `linear-gradient(to right, #042234 ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`;
    }

    this.isVideoEnded = video.ended;
    this.cdr.detectChanges();
  }
  
  @ViewChild('previewCanvas') previewCanvas?: ElementRef<HTMLCanvasElement>;

  showPreview(event: MouseEvent) {
    if (this.reproduciendoPublicidad) return; 
    if (!this.previewThumbnail || !this.previewCanvas || !this.previewVideo) return;
  
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const time = percent * (this.videoEl?.duration || 0);
  
    this.previewThumbnail.nativeElement.style.display = 'block';
    this.previewThumbnail.nativeElement.style.left = `${event.clientX - rect.left}px`;
  
    const canvas = this.previewCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const previewVideo = this.previewVideo.nativeElement;
    previewVideo.currentTime = time;
  
    previewVideo.addEventListener('seeked', () => {
      ctx.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
    }, { once: true });
  }
  
  hidePreview() {
    if (this.previewThumbnail) this.previewThumbnail.nativeElement.style.display = 'none';
  }

  seekVideo(event: Event): void {
    if (this.reproduciendoPublicidad) return;

    const video = this.videoPlayer?.nativeElement;
    const input = event.target as HTMLInputElement;
    if (!video || !input) return;

    const percent = parseFloat(input.value);
    const newTime = (percent / 100) * video.duration;
    video.currentTime = newTime;
    this.isVideoEnded = false; 
    this.isPlaying = true;
    video.play().catch(console.error);
    this.cdr.detectChanges();

    input.style.background = `linear-gradient(to right, #042234 ${percent}%, rgba(255,255,255,0.3) ${percent}%)`;
  }

  toggleMute(): void {
    const video = this.videoEl;
    if (!video) return;

    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  changeVolume(volumeSlider: HTMLInputElement): void {
    const video = this.videoEl;
    if (!video) return;

    const percent = parseInt(volumeSlider.value);
    video.volume = percent / 100;
  
    volumeSlider.style.background = `
      linear-gradient(to right, #075788 0%, #075788 ${percent}%, rgba(255,255,255,0.3) ${percent}%, rgba(255,255,255,0.3) 100%)
    `;
  }

  toggleFullscreen(videoContainer: HTMLElement): void {
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }


  toggleAutoplay(): void {
    this.isAutoplayEnabled = !this.isAutoplayEnabled;
    if (!this.isAutoplayEnabled) {
      this.isLooping = false;
      const video = this.videoEl;
      if (video) video.loop = false;
    }
    this.cdr.detectChanges();
  }

  toggleLoop(): void {
    const video = this.videoEl;
    if (!video) return;

    this.isLooping = !this.isLooping;
    video.loop = this.isLooping;
    if (this.isLooping) {
      // Reiniciar y reproducir
      video.currentTime = 0;
      video.play().catch(console.error);
      this.isPlaying = true;
      this.isVideoEnded = false;
      this.mostrarEndScreen = false; // Ocultar overlay
    }
    this.cdr.detectChanges();
  }


  cambiarFuenteVideo(url: string): void {
    const video = this.videoEl;
    if (!video) return;

    video.src = url;
    video.removeEventListener('canplaythrough', this.handleCanPlayThrough);
    video.addEventListener('canplaythrough', this.handleCanPlayThrough);
    video.load();
    this.isVideoEnded = false;
    this.isLooping = false;
    this.mostrarEndScreen = false; // Ocultar overlay al cambiar fuente
    video.loop = false;
    this.applyCinemaMode(this.isCinemaMode);
    this.cdr.detectChanges();
  }

  handleCanPlayThrough = (): void => {
    const video = this.videoEl;
    if (!video) return;

    video.play().catch(console.error);
  };

  onVideoEnd(): void {
    const video = this.videoEl;
    if (!video) return;

    this.isVideoEnded = true;
    this.isPlaying = false;

    if (this.isAutoplayEnabled && this.isFromPlaylist && this.playlistVideos.length > 0) {
      // Reproducir siguiente video de la playlist
      this.mostrarEndScreen = false; // Ocultar overlay antes de cambiar
      this.currentPlaylistIndex = (this.currentPlaylistIndex + 1) % this.playlistVideos.length;
      const nextVideo = this.playlistVideos[this.currentPlaylistIndex];
      this.nextVideo.emit(nextVideo);
      this.cambiarFuenteVideo(nextVideo.url);
    } else if (this.isLooping) {
      // Repetir video actual
      video.currentTime = 0;
      video.play().catch(console.error);
      this.isPlaying = true;
      this.isVideoEnded = false;
      this.mostrarEndScreen = false; // Ocultar overlay
    } else {
      // Mostrar overlay de recomendaciones
      this.mostrarEndScreen = true;
      this.videoTerminado.emit();
    }
    this.cdr.detectChanges();
  }
  seleccionarRecomendacion(video: any): void {
    this.mostrarEndScreen = false; // Ocultar overlay al seleccionar
    this.isVideoEnded = false;
    this.isPlaying = true;
    this.router.navigate(['/video', video.id]);
    this.cdr.detectChanges();
  }

  cerrarEndScreen(): void {
    this.mostrarEndScreen = false;
    this.cdr.detectChanges();
  }



  onImageError(event: Event, video: any): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/video-default.png';
    video.miniatura = 'assets/images/video-default.png'; 
    this.cdr.detectChanges();
  }


  toggleMode(): void {
    this.toggleCinemaMode.emit(!this.isCinemaMode);
  }

  private applyCinemaMode(enabled: boolean): void {
    const container = this.containerEl;
    const video = this.videoEl;

    if (container) {
      if (enabled) container.classList.add('cinema-mode');
      else container.classList.remove('cinema-mode');
    }

    if (video) {
      video.style.objectFit = enabled ? 'cover' : 'contain';
    }
  }

    private get videoEl(): HTMLVideoElement | null {
    return this.videoPlayer?.nativeElement ?? null;
  }

  private get containerEl(): HTMLDivElement | null {
    return this.videoContainer?.nativeElement ?? null;
  }

  private get controlsEl(): HTMLDivElement | null {
    return this.controlsRef?.nativeElement ?? null;
  }


}
