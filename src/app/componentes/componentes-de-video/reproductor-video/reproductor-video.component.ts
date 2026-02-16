import { Component,ViewEncapsulation  ,Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef, SimpleChanges, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModocineService } from '../../../servicios/modocine.service';
import { Router } from '@angular/router';
import { AutoplayService } from '../../../servicios/autoplay.service';
import videojs from 'video.js';

@Component({
  selector: 'app-reproductor-video',
  templateUrl: './reproductor-video.component.html',
  styleUrls: ['./reproductor-video.component.css'],
    encapsulation: ViewEncapsulation.None

})
export class ReproductorVideoComponent implements OnInit, AfterViewInit {

  @Input() videoUrl?: string;
  @Input() isCinemaMode: boolean = false;
  @Input() controlsWidth!: number;
  @Input() reproduciendoPublicidad: boolean = false;
  @Input() videosRecomendados: any[] = [];
  @Input() isFromPlaylist: boolean = false;
  @Input() playlistVideos: any[] = [];
  @Input() mostrarEndScreen: boolean = false;
  @Input() siguienteVideoDisponible: boolean = true; // Nueva propiedad
  @Output() nextVideo = new EventEmitter<any>();
  @Output() toggleCinemaMode = new EventEmitter<boolean>();
  @Output() videoTerminado = new EventEmitter<void>();
  @Output() solicitarSiguienteVideo = new EventEmitter<void>();
  @Output() verificarSiguienteVideo = new EventEmitter<void>(); // Verificar antes del countdown
  @Output() autoplayChanged = new EventEmitter<boolean>();
  @Input() miniaturaUrl?: string;

  @ViewChild('previewThumbnail', { static: true }) previewThumbnail?: ElementRef<HTMLDivElement>;
  @ViewChild('previewVideo', { static: true }) previewVideo?: ElementRef<HTMLVideoElement>;

  
  @ViewChild('videoPlayer', { static: false }) videoPlayer?: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar', { static: true }) progressBar?: ElementRef<HTMLInputElement>;
  @ViewChild('volumeSlider', { static: true }) volumeSlider?: ElementRef<HTMLInputElement>;
  @ViewChild('videoContainer', { static: false }) videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('controlsRef', { static: true }) controlsRef?: ElementRef<HTMLDivElement>;

  @ViewChild('skipLeft') skipLeft?: ElementRef<HTMLDivElement>;
  @ViewChild('skipRight') skipRight?: ElementRef<HTMLDivElement>;
  @ViewChild('ambientCanvas') ambientCanvas!: ElementRef<HTMLCanvasElement>;


  aspectRatio: string = "16 / 9"; 
  maxHeight = 720;   
  minHeight = 250;   
  videoWidth: number = 1280; 
  isPlaying = false;
  isMuted = true;
  currentTime: number = 0;
  duration: number = 0;
  isFullscreen = false;
  previewTime: string = '';
  showOverlay = false;       
  overlayTimeout: any;
  tooltipVisible: number | null = null; 
  private browserZoomLevel = 1;
  player!: any;
  showSpinner = false;
  videoReady = false;
  showControlsActive = true;
  hideControlsTimeout: any;
  isPipMode = false;
  private audioUnlocked = false;
  private previousVolume = 0.7;
  private userInteracted = false;
  autoPlayNextEnabled: boolean = true;
  autoPlayCountdown: number = 5;
  autoPlayTimer: any;
  cancelAutoPlay: boolean = false;
  autoplayActivado = false;
  
  // Contador visible de autoplay
  showAutoplayCountdown = false;
  autoplayCountdownSeconds = 5;
  autoplayCountdownInterval: any;
  isLooping: boolean = false;
  currentPlaylistIndex: number = 0; 
  isVideoEnded: boolean = false; 
  skipOverlayText: any;
  private cinemaModeSubscription?: Subscription;
  private autoplaySub!: Subscription;
  isAutoplayStart = true;
  private lastTap = 0;
  private touchTimeout: any = null;
  private boundHandleContainerClick?: any;
  private boundHandleContainerDblClick?: any;
  private boundHandleTouchStart?: any;
  private boundProgressMouseMove?: any;
  private boundProgressMouseLeave?: any;
  private animationId: number | null = null;
  private skipTimeout: any;
  isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  showSkipLeftAnimation = false;
  showSkipRightAnimation = false;
  private skipLeftTimeout: any;
  private skipRightTimeout: any;
  
  private activeControl: 'progress' | 'volume' | null = null;
  private hideTimeout: any;

  private readonly STORAGE_KEY_AUDIO = 'audioDesbloqueado';
  private readonly STORAGE_KEY_VOLUME = 'playerVolume';
  private readonly STORAGE_KEY_MUTED = 'playerMuted';
  private _blockSingleClick = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private cinemaModeService: ModocineService,
    private autoplayService: AutoplayService,
    private router:Router
  ) {}

  ngOnInit(): void {

    this.aplicarModoCineDesdeServicio();
    this.aplicarAutoPlayDesdeServicio();
    this.cargarAjustesDeSonido();
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
    this.cdr.detectChanges();

}

  private cargarAjustesDeSonido() {
    const savedAudio = localStorage.getItem(this.STORAGE_KEY_AUDIO);
    const savedVolume = localStorage.getItem(this.STORAGE_KEY_VOLUME);
    const savedMuted = localStorage.getItem(this.STORAGE_KEY_MUTED);

    this.audioDesbloqueado = savedAudio === 'true';
    
    if (savedVolume) {
      const volValue = parseFloat(savedVolume);
      this.previousVolume = volValue > 1 ? volValue / 100 : volValue; 
    } else {
      this.previousVolume = 0.7; 
    }
    
    this.isMuted = savedMuted === 'true';
  }

private aplicarModoCineDesdeServicio () {

 this.isCinemaMode = this.cinemaModeService.getCinemaModeValue();
    this.cinemaModeSubscription = this.cinemaModeService.getCinemaMode().subscribe(enabled => {
      if (this.isTogglingCinemaMode) {
        return;
      }
      this.isCinemaMode = enabled;
      this.applyCinemaMode(enabled);
      this.cdr.detectChanges();
    });

}

private aplicarAutoPlayDesdeServicio () {
 this.autoplayActivado = this.autoplayService.getAutoplayValue();
 console.log('🎛️ Autoplay inicial desde servicio:', this.autoplayActivado);

    this.autoplaySub = this.autoplayService.getAutoplay().subscribe((valor) => {
      console.log('🔄 Autoplay actualizado desde servicio:', valor);
      this.autoplayActivado = valor
      this.cdr.detectChanges(); 
    });

}



@HostListener('window:beforeunload', ['$event'])
guardarEstadoDeAudioEnDescarga(): void {
    this.guardarVolumenEnStorage(); 
}


private intentarReproducirConSonido(): void {
  if (!this.player) return;

  const quiereSonido = this.audioDesbloqueado && !this.isMuted;
  const volumen = this.previousVolume || 0.7;

  if (quiereSonido) {
    this.player.muted(false);
    this.player.volume(volumen);
  } else {
    this.player.muted(true);
    this.player.volume(0);
    this.isMuted = true;
  }

  this.actualizarSliderVisual();

  this.player.play().catch((error: any) => {
    if (error.name === 'NotAllowedError') {
      console.warn('Autoplay con sonido bloqueado → se requiere interacción');
      
      this.player.muted(true);
      this.isMuted = true;
      this.actualizarSliderVisual();
      
      this.showCentralOverlayWithText('Toca para activar el sonido');
    }
  });
}

private desbloquearAudioParaSiempre(): void {
  if (this.audioDesbloqueado) return;

  this.audioDesbloqueado = true;
  localStorage.setItem(this.STORAGE_KEY_AUDIO, 'true');

  if (this.player) {
    this.player.muted(false);
    this.player.volume(this.previousVolume || 0.7);
  }

  this.isMuted = false;
  this.guardarVolumenEnStorage();
  this.actualizarSliderVisual();
  this.showCentralOverlayWithText('Sonido activado');
  console.log('AUDIO DESBLOQUEADO PARA SIEMPRE');
}

  @HostListener('click')
  @HostListener('keydown')
  userInteraction() {
    this.userInteracted = true;
    if (this.videoEl) this.videoEl.muted = false;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const video = this.videoEl;
    if (!video || this.reproduciendoPublicidad) return;

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
  
      case 'l': 
        if (this.activeControl !== 'volume') {
          this.skipForwardKeyboard();
        }
        break;
  
      case 'j': 
        if (this.activeControl !== 'volume') {
          this.skipBackwardKeyboard();
        }
        break;
  
      case 'arrowright':
        if (this.activeControl === 'volume') {
          event.preventDefault();
          video.volume = Math.min(1, video.volume + 0.05);
          if(this.volumeSlider?.nativeElement) this.volumeSlider.nativeElement.value = (video.volume*100).toString();
        } else {
          this.skipForwardKeyboard();
        }
        break;    
  
      case 'arrowleft': 
        if (this.activeControl === 'volume') {
          event.preventDefault();
          video.volume = Math.max(0, video.volume - 0.05);
          if(this.volumeSlider?.nativeElement) this.volumeSlider.nativeElement.value = (video.volume*100).toString();
        } else {
          this.skipBackwardKeyboard();
        }
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

  skipForwardKeyboard() {
    const video = this.videoEl;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 5, video.duration);
    this.showSkipOverlay(5);
    
    this.showSkipRightAnimation = true;
    clearTimeout(this.skipRightTimeout);
    this.skipRightTimeout = setTimeout(() => {
      this.showSkipRightAnimation = false;
      this.cdr.detectChanges();
    }, 600);
  }
  
  skipBackwardKeyboard() {
    const video = this.videoEl;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 5, 0);
    this.showSkipOverlay(-5);
    
    this.showSkipLeftAnimation = true;
    clearTimeout(this.skipLeftTimeout);
    this.skipLeftTimeout = setTimeout(() => {
      this.showSkipLeftAnimation = false;
      this.cdr.detectChanges();
    }, 600);
  }

  skipForward(event: MouseEvent) {
    event.stopPropagation();
    const video = this.videoEl;
    if (!video || this.reproduciendoPublicidad) return;
  
    video.currentTime = Math.min(video.currentTime + 5, video.duration);
    this.updateProgressBar();
    this.showSkipOverlay(5);
    
    this.showSkipRightAnimation = true;
    clearTimeout(this.skipRightTimeout);
    this.skipRightTimeout = setTimeout(() => {
      this.showSkipRightAnimation = false;
      this.cdr.detectChanges();
    }, 600);
  }

  onWaiting() {
    this.showSpinner = true;
  }

  onPlaying() {
    this.showSpinner = false;
  }
  
  skipBackward(event: MouseEvent) {
    event.stopPropagation();
    const video = this.videoEl;
    if (!video || this.reproduciendoPublicidad) return;
  
    video.currentTime = Math.max(video.currentTime - 5, 0);
    this.updateProgressBar();
    this.showSkipOverlay(-5);
    
    this.showSkipLeftAnimation = true;
    clearTimeout(this.skipLeftTimeout);
    this.skipLeftTimeout = setTimeout(() => {
      this.showSkipLeftAnimation = false;
      this.cdr.detectChanges();
    }, 600);
  }


  showSkipOverlay(seconds: number) {
    this.skipOverlayText = (seconds > 0 ? '+' : '') + seconds + 's';
    this.showOverlay = true;
    clearTimeout(this.overlayTimeout);
    this.overlayTimeout = setTimeout(() => this.showOverlay = false, 800);
  }
  private videoElement!: HTMLVideoElement;

  ngAfterViewInit(): void {
    const video = this.videoEl;
    if (!video) return;
    this.definirVideoJS(video)
  
  this.player.on('loadedmetadata', () => {
      const w = this.player.videoWidth();
      const h = this.player.videoHeight();

      if (w && h) {
        const ratio = `${w} / ${h}`;
        this.videoContainer.nativeElement.style.aspectRatio = ratio;
      }
    });
  
   this.videoElement = this.player.el().querySelector('video') as HTMLVideoElement;
    this.setupVideoJSEvents();
    this.startAmbientEffect();
    this.applyCinemaMode(this.isCinemaMode);

    const slider = this.volumeSlider?.nativeElement;
    if (!video || !slider) return; 

    this.player.ready(() => {
      this.intentarReproducirConSonido();
      this.cdr.detectChanges();
    });

    this.boundHandleContainerClick = this.handleContainerClickEvent.bind(this);
    this.boundHandleContainerDblClick = this.handleContainerDblClickEvent.bind(this);
    this.boundHandleTouchStart = this.handleTouchStartEvent.bind(this);

    if (this.containerEl) {
      const c = this.containerEl;
      c.addEventListener('click', this.boundHandleContainerClick);
      c.addEventListener('dblclick', this.boundHandleContainerDblClick);
      c.addEventListener('touchstart', this.boundHandleTouchStart, { passive: true });
    }

    this.attachPreviewListeners();

    const volumePercent = this.isMuted ? 0 : video.volume * 100;
    slider.value = volumePercent.toString();
    slider.style.background = `
      linear-gradient(to right, #075788 0%, #075788 ${volumePercent}%, rgba(255,255,255,0.3) ${volumePercent}%, rgba(255,255,255,0.3) 100%)
    `;
    

    video.addEventListener('loadedmetadata', () => this.setDuration());

    const preview = this.previewVideo?.nativeElement;
    if (preview) {
      preview.muted = true;
      preview.load();
    }


console.log("Init → isMuted:", this.videoEl?.muted, "player muted:", this.player?.muted?.());

  video.addEventListener('enterpictureinpicture', () => {
    this.isPipMode = true;
    this.cdr.detectChanges();
  });

  video.addEventListener('leavepictureinpicture', () => {
    this.isPipMode = false;
    this.cdr.detectChanges();
  });
    }


private definirVideoJS (video: any) {
  this.isPlaying = !video.paused;
  this.player = videojs(this.videoPlayer!.nativeElement, {
        controls: false,
        autoplay:true,
        preload: 'auto',
        fluid: false,
        responsive: true,
        bigPlayButton: false,
     html5: {
      vhs: {
        overrideNative: true,
        enableLowInitialPlaylist: true,
        smoothQualityChange: true,
        fastQualityChange: true
      },
      nativeVideoTracks: false,
      nativeAudioTracks: false,
      nativeTextTracks: false
    }
  });

}



private startAmbientEffect() {
 const video = this.videoEl;
  const canvas = this.ambientCanvas.nativeElement;
  const ctx = canvas.getContext('2d');

  if (!ctx || !video) return;

  const draw = () => {
    if (video.paused || video.ended) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);
  };

  const resize = () => {
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;
  };

  video.addEventListener('play', () => {
    resize();
    draw();
    video.closest('.reproductor-video-container')?.classList.add('playing');
  });

  video.addEventListener('pause', () => {
    video.closest('.reproductor-video-container')?.classList.remove('playing');
  });

  video.addEventListener('ended', () => {
    video.closest('.reproductor-video-container')?.classList.remove('playing');
  });
}



cambiarVideoSinMutear(nuevaUrl: string): void {
  const video = this.videoEl;
  if (!video || !this.player) return;

  video.pause(); 
  this.isVideoEnded = false;
  this.mostrarEndScreen = false;
  this.showSpinner = true; 
  this.videoReady = false;
  this.cdr.detectChanges();

  this.player.src({ src: nuevaUrl, type: 'video/mp4' });

  if (this.audioDesbloqueado) {
    this.player.muted(this.isMuted); 
    
    this.player.volume(this.previousVolume);
  } else {
     this.player.muted(true);
     this.showUnmuteHint();
  }


  this.player.ready(() => {
      this.videoReady = true;
      this.showSpinner = false;
      this.cdr.detectChanges();
      
      this.player.play().catch((error:any) => {
          if (error.name === 'NotAllowedError') {
               console.warn('Autoplay bloqueado por el navegador, se requiere interacción.');
          } else if (error.name === 'AbortError') {
               console.log('AbortError al cambiar de fuente, puede ser ignorado.');
          } else {
               console.error('Error desconocido al reproducir:', error);
          }
      });
  });
}
private handleContainerClickEvent(event: MouseEvent) {
  const target = event.target as HTMLElement;
  this.isAutoplayStart = false;

  if (target.closest('.controls') || target.closest('button') || target.closest('input')) {
    return;
  }

  if (!this.audioDesbloqueado) {
    this.desbloquearAudioParaSiempre();
  }

  if (this._blockSingleClick) {
    this._blockSingleClick = false;
    return;
  }

  this.togglePlayPause();
}






private handleContainerDblClickEvent = (event: MouseEvent) => {
  this._blockSingleClick = true;

  const container = this.containerEl;
  if (!container || !this.videoEl) return;

  const rect = container.getBoundingClientRect();
  const x = (event.clientX - rect.left);
  const w = rect.width;

  if (x < w * 0.4) return this.skipBackward(null as any);
  if (x > w * 0.6) return this.skipForward(null as any);

  this.toggleFullscreen(container);
};

private handleTouchStartEvent = (ev: TouchEvent) => {
  const now = Date.now();
  const TIME_DIFF = 300; 
  if (this.lastTap && (now - this.lastTap) < TIME_DIFF) {
    
    clearTimeout(this.touchTimeout);
    this.lastTap = 0;
    const touch = ev.changedTouches[0];
    const rect = this.containerEl?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;
    const w = rect.width;
    const leftThreshold = w * 0.4;
    const rightThreshold = w * 0.6;

    if (x < leftThreshold) this.skipBackward(null as any);
    else if (x > rightThreshold) this.skipForward(null as any);
    else if (this.containerEl) this.toggleFullscreen(this.containerEl);
  } else {
    this.lastTap = now;
    this.touchTimeout = setTimeout(() => {
      this.toggleControlsOnTouch(); 
      this.lastTap = 0;
    }, 250);
  }
};

private toggleControlsOnTouch() {
  const controls = this.controlsEl;
  if (!controls) return;

  if (controls.classList.contains('hide')) {
    controls.classList.remove('hide');
    controls.style.pointerEvents = 'auto';
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(() => {
      controls.classList.add('hide');
      controls.style.pointerEvents = 'none';
    }, 3000);
  } else {
    controls.classList.add('hide');
    controls.style.pointerEvents = 'none';
  }
}



private attachPreviewListeners() {
  const prog = this.progressBar?.nativeElement;
  if (!prog) return;

  this.boundProgressMouseMove = (e: MouseEvent) => this.showPreview(e);
  this.boundProgressMouseLeave = () => this.hidePreview();

  prog.addEventListener('mousemove', this.boundProgressMouseMove);
  prog.addEventListener('mouseleave', this.boundProgressMouseLeave);

}

private detachPreviewListeners() {
  const prog = this.progressBar?.nativeElement;
  if (!prog) return;
  if (this.boundProgressMouseMove) prog.removeEventListener('mousemove', this.boundProgressMouseMove);
  if (this.boundProgressMouseLeave) prog.removeEventListener('mouseleave', this.boundProgressMouseLeave);
}


 private resizePlayer() {
  if (this.player) {
    this.player.trigger('resize');
    
    setTimeout(() => {
      this.player.width('100%').height('100%'); 
    }, 50); 
  }
}

  setupVideoJSEvents(): void {
  this.player.on('loadstart', () => {
    this.videoReady = false;
    this.showSpinner = true;
    this.cdr.detectChanges();
  });

  this.player.on('loadedmetadata', () => {
    this.duration = this.player.duration();
    this.cdr.detectChanges();
  });

  this.player.on('canplay', () => {
    this.videoReady = true;
    this.showSpinner = false;
    this.cdr.detectChanges();
  });

  this.player.on('waiting', () => {
    this.showSpinner = true;
    this.cdr.detectChanges();
  });

 this.player.on('playing', () => {
    this.showSpinner = false;
    this.isPlaying = true; 
    this.cdr.detectChanges();

    if (this.audioDesbloqueado && !this.isMuted) {
        const volumen = this.previousVolume || 0.7;
        this.player.muted(false);
        this.player.volume(volumen);
        this.actualizarSliderVisual();
    }
  });

  this.player.on('timeupdate', () => {
    this.currentTime = this.player.currentTime();
    this.updateProgressBar();
    if (this.mostrarEndScreen && !this.isVideoEnded) {
      this.mostrarEndScreen = false;
      this.cdr.detectChanges();
    }
  });

    this.player.on('play', () => {
    this.isPlaying = true;
    this.cdr.detectChanges();
  });

  this.player.on('pause', () => {
    this.isPlaying = false;
    this.cdr.detectChanges();
  });

  this.player.on('ended', () => {
    this.isPlaying = false;
    this.cdr.detectChanges();
  });

}
private audioDesbloqueado = false; 


private cargarVideoConAutoplay(): void {
    if (!this.player || !this.videoUrl) return;

    this.player.src({
        src: this.videoUrl,
        type: 'video/mp4'
    });

    this.player.ready(() => {
      this.intentarReproducirConSonido();
    });
}



private showUnmuteHint(): void {
  this.showCentralOverlayWithText('Toca para activar el sonido');
}


private showCentralOverlayWithText(text: string): void {
  this.skipOverlayText = text;
  this.showOverlay = true;
  clearTimeout(this.overlayTimeout);
  this.overlayTimeout = setTimeout(() => {
    this.showOverlay = false;
  }, 3000);
}


private actualizarSliderVisual(): void {
  const slider = this.volumeSlider?.nativeElement;
  if (!slider) return;

  const vol = this.isMuted ? 0 : this.player.volume() * 100;
  slider.value = vol.toString();
  slider.style.background = `linear-gradient(to right, #32b1f9 0%, #32b1f9 ${vol}%, rgba(255,255,255,0.2) ${vol}%, rgba(255,255,255,0.2) 100%)`;
}


onMetadataLoaded(video: HTMLVideoElement) {
  const ratio = video.videoWidth / video.videoHeight;
  const container = document.querySelector('.reproductor') as HTMLElement;

  container.style.aspectRatio = ratio.toString();
}


playVideoOnClick(): void {
  if (this.videoReady || !this.videoUrl) return;

  this.showSpinner = true;
  this.loadVideo();
  this.player.play().catch(() => {});
}


loadVideo(): void {
  if (!this.videoUrl || !this.player) return;


 this.player.src({ src: this.videoUrl, type: 'video/mp4' });

  this.player.ready(() => {
    this.videoReady = true;
    this.showSpinner = false;
    this.cdr.detectChanges();
  });
}


onThumbnailError(event: Event): void {
  const img = event.target as HTMLImageElement;
  img.src = 'assets/images/video-default.png';
}
  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  
    if (this.isFullscreen && this.isCinemaMode) {
      this.isCinemaMode = false;
    }
    setTimeout(() => this.resizePlayer(), 100);
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoPlayer?.nativeElement || null;
  }

ngOnChanges(changes: SimpleChanges): void {
  if (changes['videoUrl'] && this.videoUrl && !changes['videoUrl'].firstChange) {
   if (!changes['videoUrl'].firstChange && changes['videoUrl'].previousValue !== this.videoUrl) {
      this.cargarVideoConAutoplay();
      return;
    }
  }

  // Manejar cambios en siguienteVideoDisponible cuando el video ha terminado y autoplay está activo
  if (changes['siguienteVideoDisponible'] && this.isVideoEnded && this.autoplayActivado) {
    if (this.siguienteVideoDisponible) {
      console.log('✅ Verificación completada - HAY siguiente video, iniciando countdown');
      this.startAutoplayCountdown();
    } else {
      console.log('❌ Verificación completada - NO hay siguiente video, mostrando end screen');
      this.mostrarEndScreen = true;
      this.cdr.detectChanges();
    }
  }


    if (changes['isCinemaMode']) {
      setTimeout(() => {
        this.applyCinemaMode(this.isCinemaMode);
        this.resizePlayer();
      }, 0);
    }

    if (changes['videoUrl'] && this.videoUrl && this.player) {
    this.videoReady = false;
    this.showSpinner = true;
    this.mostrarEndScreen = false;
    this.isVideoEnded = false;
    this.clearAutoplayCountdown();
    this.loadVideo();
    setTimeout(() => this.resizePlayer(), 300);
    this.cdr.detectChanges();
  }

  }

  ngOnDestroy(): void {
    this.cinemaModeSubscription?.unsubscribe();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    this.autoplaySub?.unsubscribe();
    this.clearAutoplayCountdown();

      if (this.containerEl) {
    const c = this.containerEl;
    if (this.boundHandleContainerClick) c.removeEventListener('click', this.boundHandleContainerClick);
    if (this.boundHandleContainerDblClick) c.removeEventListener('dblclick', this.boundHandleContainerDblClick);
    if (this.boundHandleTouchStart) c.removeEventListener('touchstart', this.boundHandleTouchStart);
  }
  this.detachPreviewListeners();
  clearTimeout(this.touchTimeout);
  clearTimeout(this.hideControlsTimeout);

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
  if (!video || this.reproduciendoPublicidad) return;

  this.desbloquearAudioParaSiempre();

  if (video.paused || video.ended) {
    video.play().then(() => {
      video.muted = false; 
    });
  } else {
    video.pause();
  }

  this.isPlaying = !video.paused;

  this.showOverlay = true;
  setTimeout(() => {
    this.showOverlay = false;
    this.cdr.detectChanges();
  }, 400);

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
    this.mostrarEndScreen = false;
    this.isPlaying = true;
    video.play().catch(console.error);
    this.cdr.detectChanges();

    input.style.background = `linear-gradient(to right, #042234 ${percent}%, rgba(255,255,255,0.3) ${percent}%)`;
  }



  
toggleMute(): void {
  if (!this.player) return;
  if (!this.audioDesbloqueado) {

    this.audioDesbloqueado = true;
    localStorage.setItem(this.STORAGE_KEY_AUDIO, 'true');
  }
  if (this.isMuted) {
    const restoredVolume = this.previousVolume > 0 ? this.previousVolume : 0.7;
    this.player.muted(false);
    this.player.volume(restoredVolume); 
    this.isMuted = false;
    this.previousVolume = restoredVolume; 

  } else {
    this.previousVolume = this.player.volume(); 
    this.player.muted(true);
    this.player.volume(0);
    this.isMuted = true;
  }

  this.actualizarSliderVisual();
  this.guardarVolumenEnStorage(); 
}



private guardarVolumenEnStorage(): void {
  localStorage.setItem(this.STORAGE_KEY_VOLUME, this.previousVolume.toString());
  localStorage.setItem(this.STORAGE_KEY_MUTED, this.isMuted ? 'true' : 'false');
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
    this.desbloquearAudioParaSiempre();
  }

  this.actualizarSliderVisual();
  this.guardarVolumenEnStorage();

  volumeSlider.style.background = `linear-gradient(to right, #075788 0%, #075788 ${percent}%, rgba(255,255,255,0.3) ${percent}%, rgba(255,255,255,0.3) 100%)`;
}


setActiveControl(control: 'progress' | 'volume'): void {
  this.activeControl = control;

  clearTimeout(this.hideTimeout);

  this.hideTimeout = setTimeout(() => {
    this.activeControl = null;
  }, 2000);
}

toggleFullscreen(videoContainer: HTMLElement): void {
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

  toggleAutoplay(): void {
    const nuevoValor = !this.autoplayActivado;
    this.autoplayService.setAutoplay(nuevoValor);
    this.cdr.detectChanges();
  }

  toggleLoop(): void {
    const video = this.videoEl;
    if (!video) return;

    this.isLooping = !this.isLooping;
    video.loop = this.isLooping;
    if (this.isLooping) {
      video.currentTime = 0;
      video.play().catch(console.error);
      this.isPlaying = true;
      this.isVideoEnded = false;
      this.mostrarEndScreen = false; 
    }
    this.cdr.detectChanges();
  }


  cambiarFuenteVideo(url: string): void {
    const video = this.videoEl;
    if (!video) return;

    video.removeEventListener('canplay', this.handleCanPlayThrough);
    video.pause();

    video.src = url;
    video.load();

    this.handleCanPlayThrough = () => {
      video.play().catch(err => {
        console.warn('Autoplay bloqueado:', err);
      });
    };
    video.addEventListener('canplay', this.handleCanPlayThrough, { once: true });

    this.isVideoEnded = false;
    this.mostrarEndScreen = false;
    this.cdr.detectChanges();
  }

  handleCanPlayThrough = (): void => {
    const video = this.videoEl;
    if (!video) return;
  
    video.play().catch(err => {
      console.warn('Autoplay bloqueado (necesita clic):', err);
    });
  };

  play(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
  
    video.play().catch(err => {
      console.warn('Autoplay bloqueado por el navegador:', err);
    });
  }

  onVideoEnd(): void {
    this.isVideoEnded = true;
    this.isPlaying = false;

    const video = this.videoEl;

    if (this.isLooping && video) {
      video.currentTime = 0;
      video.play().catch(console.error);
      this.isPlaying = true;
      this.isVideoEnded = false;
      this.mostrarEndScreen = false;
      return;
    }

    console.log('🔍 ESTADO AL TERMINAR VIDEO:', {
      autoplayActivado: this.autoplayActivado,
      isFromPlaylist: this.isFromPlaylist,
      siguienteVideoDisponible: this.siguienteVideoDisponible,
      videosRecomendados: this.videosRecomendados?.length || 0
    });

    // Si el autoplay está activado, verificar si hay siguiente video (playlist o recomendados)
    if (this.autoplayActivado) {
      console.log('✅ Autoplay ACTIVO - verificando siguiente video disponible');
      this.verificarSiguienteVideo.emit();
    } else {
      console.log('⏹️ Autoplay DESACTIVADO → mostrando end screen con recomendados');
      this.mostrarEndScreenConRecomendados();
      this.videoTerminado.emit(); 
    }
    

    this.cdr.detectChanges();
  }


  seleccionarRecomendacion(video: any): void {
    this.mostrarEndScreen = false; 
    this.isVideoEnded = false;
    this.isPlaying = true;
    this.router.navigate(['/video', video.id]);
    this.cdr.detectChanges();
  }

  cerrarEndScreen(): void {
    this.mostrarEndScreen = false;
    this.cdr.detectChanges();
  }

  mostrarEndScreenConRecomendados(): void {
    console.log('📺 Mostrando end screen con videos recomendados');
    console.log('🎬 Videos recomendados disponibles:', this.videosRecomendados.length);
    if (this.videosRecomendados.length > 0) {
      console.log('✅ Primeros 3 videos:', this.videosRecomendados.slice(0, 3).map(v => v.titulo));
    } else {
      console.log('⚠️ No hay videos recomendados disponibles');
    }
    this.mostrarEndScreen = true;
    this.cdr.detectChanges();
  }

  startAutoplayCountdown(): void {
    this.showAutoplayCountdown = true;
    this.autoplayCountdownSeconds = 5;
    
    this.autoplayCountdownInterval = setInterval(() => {
      this.autoplayCountdownSeconds--;
      this.cdr.detectChanges();
      
      if (this.autoplayCountdownSeconds <= 0) {
        this.clearAutoplayCountdown();
        console.log('🎬 Solicitando siguiente video...');
        this.solicitarSiguienteVideo.emit();
      }
    }, 1000);
  }

  cancelAutoplayCountdown(): void {
    this.clearAutoplayCountdown();
    console.log('❌ Usuario canceló autoplay - mostrando videos recomendados');
    this.mostrarEndScreenConRecomendados();
  }

  private clearAutoplayCountdown(): void {
    this.showAutoplayCountdown = false;
    if (this.autoplayCountdownInterval) {
      clearInterval(this.autoplayCountdownInterval);
      this.autoplayCountdownInterval = null;
    }
    this.cdr.detectChanges();
  }

  iniciarCountdownSiProcede(): void {
    console.log('🎯 iniciarCountdownSiProcede() llamado - siguienteVideoDisponible:', this.siguienteVideoDisponible);
    if (this.siguienteVideoDisponible) {
      console.log('🔁 Iniciando countdown - hay siguiente video disponible');
      this.startAutoplayCountdown();
    } else {
      console.log('🗑️ No hay siguiente video - mostrando end screen');
      this.mostrarEndScreen = true;
      this.cdr.detectChanges();
    }
  }



  onImageError(event: Event, video: any): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/video-default.png';
    video.miniatura = 'assets/images/video-default.png'; 
    this.cdr.detectChanges();
  }

  private isTogglingCinemaMode = false;

  toggleMode(): void {
    this.isTogglingCinemaMode = true;
    const nuevoEstado = !this.isCinemaMode;
    this.isCinemaMode = nuevoEstado;
    this.cinemaModeService.setCinemaMode(nuevoEstado);
    this.applyCinemaMode(nuevoEstado);
    this.toggleCinemaMode.emit(nuevoEstado);
    this.cdr.detectChanges();


    const video = this.videoPlayer?.nativeElement;
      if (video?.videoWidth) {
        this.onMetadataLoaded({ target: video } as any);
      }

    setTimeout(() => {
      this.resizePlayer();
      this.isTogglingCinemaMode = false;
    }, 0);
  }

  private applyCinemaMode(enabled: boolean): void {
    const container = this.containerEl;
    const video = this.videoEl;

    if (container) {
      if (enabled) container.classList.add('cinema-mode');
      else container.classList.remove('cinema-mode');
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
