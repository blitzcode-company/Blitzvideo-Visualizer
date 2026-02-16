import { Component, Input, EventEmitter, Output, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, SimpleChanges, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import videojs from 'video.js';
import Hls from 'hls.js';
import 'video.js/dist/video-js.css';

@Component({
  selector: 'app-reproductor-stream',
  templateUrl: './reproductor-stream.component.html',
  styleUrl: './reproductor-stream.component.css'
})
export class ReproductorStreamComponent {

  private previousVolume = 0.7;
  private readonly STORAGE_KEY_VOLUME = 'playerVolume';
  private readonly STORAGE_KEY_MUTED = 'playerMuted';
  private videoElement!: HTMLVideoElement;


@Input() streamUrl: string | null = null;
  @Input() activoStream: number = 0;
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement> | undefined;
  @ViewChild('progressBar', { static: true }) progressBar!: ElementRef<HTMLInputElement>;
  @ViewChild('volumeSlider', { static: true }) volumeSlider!: ElementRef<HTMLInputElement>;
  @Input() isCinemaMode: boolean = false; 
  @Output() toggleCinemaMode = new EventEmitter<boolean>(); 
  @Output() videoTerminado: EventEmitter<void> = new EventEmitter();
  @ViewChild('videoContainer', { static: false }) videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('controlsRef', { static: true }) controlsRef?: ElementRef<HTMLDivElement>;
  hideControlsTimeout: any;


  isPipMode = false;
  player!: any;
  isPlaying = false;
  isMuted = false;
  currentTime: number = 0;
  duration: number = 0;
  isFullscreen = false;
  showControlsActive = true;

  private retryInterval: any;
  private isTryingToLoad = false;

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

      const video = this.videoEl;
        if (!video) return;
    
        this.isPlaying = !video.paused;
    
        this.player = videojs(this.videoPlayer!.nativeElement, {
            controls: false,
            
            autoplay: 'muted',
            preload: 'auto',
            fluid: false,
            responsive: true,
            bigPlayButton: false,
            liveui: true,
            controlBar: {
          volumePanel: { inline: false },
          pictureInPictureToggle: true,
        },
         html5: {
          vhs: {
           overrideNative: true,
          enableLowInitialPlaylist: true,
          fastQualityChange: true,
          smoothQualityChange: true,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 8,
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false
        }
          });
          this.player.on('play', () => console.log('playing'));
          this.player.on('pause', () => console.log('paused'));
           this.player.on('loadedmetadata', () => {
            const w = this.player.videoWidth();
            const h = this.player.videoHeight();
            console.log('Stream cargado correctamente');
             this.mostrarLive();

            if (w && h) {
              const ratio = `${w} / ${h}`;
              this.videoContainer.nativeElement.style.aspectRatio = ratio;
            }
          });
          this.player.on('enterpictureinpicture', () => this.isPipMode = true);
          this.player.on('leavepictureinpicture', () => this.isPipMode = false);
          this.player.ready(() => {
      this.handleStreamUrlChange(); 
    });
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

    private cinemaModeSubscription?: Subscription;
  


    
    ngOnDestroy(): void {
    this.cinemaModeSubscription?.unsubscribe();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
       this.detenerPolling();
    if (this.player) {
      this.player.dispose();
    }
  }
  

   @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const video = this.videoEl;
    if (!video) return;

    const activeElement = document.activeElement;
    const tagName = activeElement?.tagName.toLowerCase();
    const isEditable = activeElement?.hasAttribute('contenteditable');

    if (
    tagName === 'input' ||
    tagName === 'textarea' ||
    isEditable ||
    activeElement?.closest('.ql-editor') || 
    activeElement?.closest('[contenteditable="true"]')
  ) {
    return; 
  }

    if (!video) {
      return;
    }
    
    switch(event.key.toLowerCase()) {
      case ' ':
        event.preventDefault();
        this.togglePlayPause();
        break;
  

      case 'arrowup':
        event.preventDefault();
        video.volume = Math.min(1, video.volume + 0.05);
        if(this.volumeSlider?.nativeElement) this.volumeSlider.nativeElement.value = (video.volume*100).toString();
        break;
  
      case 'arrowdown':
        event.preventDefault();
        video.volume = Math.max(0, video.volume - 0.05);
        if(this.volumeSlider?.nativeElement) this.volumeSlider.nativeElement.value = (video.volume*100).toString();
        break;
  
      case 'm': 
        this.toggleMute();
        break;
  
      case 'f':
        if(this.containerEl) this.toggleFullscreen(this.containerEl);
        break;
  
        case 'c':
          event.preventDefault();
          console.log('Modo cine antes de toggle:', this.isCinemaMode);
          this.toggleMode();
          console.log('Modo cine después de toggle:', this.isCinemaMode);
          break;
    }
  }


private handleStreamUrlChange() {
    if (!this.player) return;

    if (this.streamUrl) {
      console.log('Cargando stream HLS:', this.streamUrl);
      this.player.src({
        src: this.streamUrl,
        type: 'application/x-mpegURL'
      });
      this.isTryingToLoad = false;
      this.detenerPolling();
      this.mostrarLive();
    } else {
      console.log('Stream offline - esperando...');
      this.mostrarOffline();
      this.iniciarPolling(); 
    }
  }

  private handlePlayerError() {
    const error = this.player.error();
    console.warn('Error en Video.js:', error);

    if (error?.code === 4 || error?.code === 2) { 
      this.mostrarOffline();
      this.iniciarPolling();
    }
  }

  private iniciarPolling() {
   if (this.retryInterval) return;

    this.retryInterval = setInterval(async () => {
      if (!this.streamUrl) return; 

      try {
        const res = await fetch(this.streamUrl, { method: 'HEAD' });
        if (res.ok) {
          console.log('¡Stream detectado por polling! Activando...');
          this.player.src({
            src: this.streamUrl,
            type: 'application/x-mpegURL'
          });
          this.player.play().catch(() => {});
          this.detenerPolling();
          this.cdr.detectChanges();
        }
      } catch (e) {
      }
    }, 8000);
  }

  private detenerPolling() {
  if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }

  private mostrarLive() {
    this.player?.nativeElement.classList.remove('offline');
    this.player?.nativeElement.classList.add('live');
  }

  private mostrarOffline() {
    this.player?.nativeElement.classList.remove('live');
    this.player?.nativeElement.classList.add('offline');
    this.player?.pause();
  }



  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  
    if (this.isFullscreen && this.isCinemaMode) {
      this.isCinemaMode = false;
    }
    setTimeout(() => this.resizePlayer(), 100);
  }

   private resizePlayer() {
  if (this.player) {
    this.player.trigger('resize');
    
    setTimeout(() => {
      this.player.width('100%').height('100%'); 
    }, 50); 
  }
}


  async togglePictureInPicture(): Promise<void> {
  if (!this.videoElement) return;

  try {
    if (!this.isPipMode && document.pictureInPictureEnabled) {
      await this.videoElement.requestPictureInPicture();
    } else {
      await document.exitPictureInPicture();
    }
  } catch (error) {
    console.warn('PiP error:', error);
  }
}

  onVideoEnd(): void {
    this.videoTerminado.emit();
  }

aspectRatio: string = "16 / 9"; 
maxHeight = 720;   
minHeight = 250;   


  onMetadataLoaded(event: Event) {
    const video = event.target as HTMLVideoElement;

    if (!video) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    console.log("METADATA:", w, h);

    if (!w || !h) return;

    let ratio = w / h;

    if (ratio < 0.5) ratio = 0.5;
    if (ratio > 3) ratio = 3;

    this.aspectRatio = `${ratio} / 1`;

    this.maxHeight = ratio < 1 ? 850 : 720;

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



changeVolume(volumeSlider: HTMLInputElement): void {
  if (!this.player) return;

  const percent = parseInt(volumeSlider.value);
  const volume = percent / 100;

  this.player.volume(volume);
  
  if (volume === 0) {
    this.player.muted(true);
    this.isMuted = true;
  } else {
    this.player.muted(false);
    this.isMuted = false;
    this.previousVolume = volume;
  }
localStorage.setItem(this.STORAGE_KEY_VOLUME, volume.toString());
  localStorage.setItem(this.STORAGE_KEY_MUTED, this.isMuted ? 'true' : 'false');

  

  volumeSlider.style.background = `linear-gradient(to right, #075788 0%, #075788 ${percent}%, rgba(255,255,255,0.3) ${percent}%, rgba(255,255,255,0.3) 100%)`;
  localStorage.setItem('videoVolume', percent.toString());
  localStorage.setItem('videoMuted', this.isMuted ? '1' : '0');
}


  toggleFullscreen(videoContainer: HTMLElement): void {
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  handleCinemaMode(isCinema: boolean): void {
    this.isCinemaMode = isCinema; 
  }


  private get controlsEl(): HTMLDivElement | null {
    return this.controlsRef?.nativeElement ?? null;
  }
    private get videoEl(): HTMLVideoElement | null {
    return this.videoPlayer?.nativeElement ?? null;
  }

  private get containerEl(): HTMLDivElement | null {
    return this.videoContainer?.nativeElement ?? null;
  }

}
