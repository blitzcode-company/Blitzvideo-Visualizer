import { Component, ViewEncapsulation, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef, SimpleChanges, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModocineService } from '../../../servicios/modocine.service';
import { Router } from '@angular/router';
import { AutoplayService } from '../../../servicios/autoplay.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import videojs from 'video.js';
export interface PlayerDimensions {
    width: number;
    height: number;
    aspectRatio: string;
    finalWidth: string;
    finalHeight: string;
}

export interface PlayerConfig {
    mastheadHeight: number;
    topPadding: number;
    spaceBelow: number;
    horizontalMargin: number;
    sidebarWidth: number;
    minHeight: number;
    maxHeight: number | 'none';
    minWidth: number;
    maxWidth: number | '100%';
    widthRatio: number;
    heightRatio: number;
    controlsHeight: number;
    borderRadius: number;
}

export type PlayerMode = 'normal' | 'cinema' | 'fullscreen' | 'floating' | 'compact';
export type AspectRatioType = '16:9' | '4:3' | '21:9' | '1:1' | '2.35:1';

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
    @Input() siguienteVideoDisponible: boolean = true;
    @Input() miniaturaUrl?: string;
    @Output() nextVideo = new EventEmitter<any>();
    @Output() toggleCinemaMode = new EventEmitter<boolean>();
    @Output() videoTerminado = new EventEmitter<void>();
    @Output() solicitarSiguienteVideo = new EventEmitter<void>();
    @Output() verificarSiguienteVideo = new EventEmitter<void>();
    @Output() autoplayChanged = new EventEmitter<boolean>();
    @Output() tiempoActualizado = new EventEmitter<number>()
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
    @ViewChild('previewCanvas') previewCanvas?: ElementRef<HTMLCanvasElement>;
    nextVideoData: any = null;
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
    player!: any;
    showSpinner = false;
    videoReady = false;
    showControlsActive = true;
    hideControlsTimeout: any;
    isPipMode = false;
    autoPlayNextEnabled: boolean = true;
    autoPlayCountdown: number = 5;
    autoPlayTimer: any;
    cancelAutoPlay: boolean = false;
    autoplayActivado = false;
    showAutoplayCountdown = false;
    autoplayCountdownSeconds = 5;
    autoplayCountdownInterval: any;
    isLooping: boolean = false;
    currentPlaylistIndex: number = 0;
    isVideoEnded: boolean = false;
    skipOverlayText: any;
    isAutoplayStart = true;
    videoElement!: HTMLVideoElement;
    showSkipLeftAnimation = false;
    showSkipRightAnimation = false;
    private playerConfig: PlayerConfig = {
        mastheadHeight: 0,
        topPadding: 0,
        spaceBelow: 20,
        horizontalMargin: 0,
        sidebarWidth: 0,
        minHeight: 240,
        maxHeight: 'none',
        minWidth: 320,
        maxWidth: '100%',
        widthRatio: 16,
        heightRatio: 9,
        controlsHeight: 48,
        borderRadius: 0
    };
    private resizeObserver?: ResizeObserver;
    private resizeThrottleTimeout: any;
    currentAspectRatio: AspectRatioType = '16:9';
    isFloatingMode: boolean = false;
    isCompactMode: boolean = false;
    showDebugPanel: boolean = false;
    private readonly STORAGE_KEY_AUDIO = 'audioDesbloqueado';
    private readonly STORAGE_KEY_VOLUME = 'playerVolume';
    private readonly STORAGE_KEY_MUTED = 'playerMuted';
    private readonly STORAGE_KEY_PLAYER_CONFIG = 'playerConfig';
    private readonly RATIO_16_9 = 16 / 9;
    private readonly TOLERANCIA_RATIO = 0.05;
    private browserZoomLevel = 1;
    private audioUnlocked = false;
    private previousVolume = 0.7;
    private userInteracted = false;
    private cinemaModeSubscription?: Subscription;
    private autoplaySub!: Subscription;
    private lastTap = 0;
    private touchTimeout: any = null;
    private boundHandleContainerClick?: any;
    private boundHandleContainerDblClick?: any;
    private boundHandleTouchStart?: any;
    private boundProgressMouseMove?: any;
    private boundProgressMouseLeave?: any;
    private animationId: number | null = null;
    private audioDesbloqueado = false;
    private skipTimeout: any;
    private skipLeftTimeout: any;
    private skipRightTimeout: any;
    private activeControl: 'progress' | 'volume' | null = null;
    private hideTimeout: any;
    private _blockSingleClick = false;
    private isTogglingCinemaMode = false;
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    constructor(
        private cdr: ChangeDetectorRef,
        private cinemaModeService: ModocineService,
        private autoplayService: AutoplayService,
        private router: Router,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer
    ) {

    this.iconRegistry.addSvgIcon(
      'default-view',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/default-view.svg')
    );


    this.iconRegistry.addSvgIcon(
      'theater-mode',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/theater-mode.svg')
    );
    }

    ngOnInit(): void {
        this.cargarAjustesDeSonido();
        this.loadPlayerPreferences();
        this.aplicarModoCineDesdeServicio();
        this.aplicarAutoPlayDesdeServicio();
        
        document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
        });
        
        this.cdr.detectChanges();
    }

    ngAfterViewInit(): void {
        const video = this.videoEl;
        if (!video) return;

        this.initializeVariableSystem();
        
        this.definirVideoJS(video);
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

        this.setupEventListeners();
        this.attachPreviewListeners();

        const volumePercent = this.isMuted ? 0 : video.volume * 100;
        slider.value = volumePercent.toString();
        slider.style.background = `linear-gradient(to right, #075788 0%, #075788 ${volumePercent}%, rgba(255,255,255,0.3) ${volumePercent}%, rgba(255,255,255,0.3) 100%)`;

        video.addEventListener('loadedmetadata', () => this.setDuration());

        const preview = this.previewVideo?.nativeElement;
        if (preview) {
            preview.muted = true;
            preview.load();
        }

        video.addEventListener('enterpictureinpicture', () => {
            this.isPipMode = true;
            this.cdr.detectChanges();
        });

        video.addEventListener('leavepictureinpicture', () => {
            this.isPipMode = false;
            this.cdr.detectChanges();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['videoUrl'] && this.videoUrl && !changes['videoUrl'].firstChange) {
            if (!changes['videoUrl'].firstChange && changes['videoUrl'].previousValue !== this.videoUrl) {
                this.cargarVideoConAutoplay();
                return;
            }
        }

        if (changes['siguienteVideoDisponible'] && this.isVideoEnded && this.autoplayActivado) {
            if (this.siguienteVideoDisponible) {
                this.startAutoplayCountdown();
            } else {
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
        // Limpiar subscriptions
        this.cinemaModeSubscription?.unsubscribe();
        this.autoplaySub?.unsubscribe();
        
        // Limpiar event listeners
        document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
        this.clearAutoplayCountdown();
        
        // Limpiar event listeners del contenedor
        if (this.containerEl) {
            const c = this.containerEl;
            if (this.boundHandleContainerClick) c.removeEventListener('click', this.boundHandleContainerClick);
            if (this.boundHandleContainerDblClick) c.removeEventListener('dblclick', this.boundHandleContainerDblClick);
            if (this.boundHandleTouchStart) c.removeEventListener('touchstart', this.boundHandleTouchStart);
        }
        
        // Limpiar preview listeners
        this.detachPreviewListeners();
        
        // Limpiar timeouts
        clearTimeout(this.touchTimeout);
        clearTimeout(this.hideControlsTimeout);
        if (this.resizeThrottleTimeout) clearTimeout(this.resizeThrottleTimeout);
        
        // Limpiar ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = undefined;
        }
        
        this.clearCSSVariables();
        
        this.disableFloatingMode();
        this.disableCompactMode();
    }

    private initializeVariableSystem(): void {
        this.applyAllVariables();
        this.setupResizeObserver();
        this.setupResponsiveBreakpoints();
    }

    private applyAllVariables(): void {
        const container = this.containerEl;
        if (!container) return;

        container.style.setProperty('--player-masthead-height', `${this.playerConfig.mastheadHeight}px`);
        container.style.setProperty('--player-top-padding', `${this.playerConfig.topPadding}px`);
        container.style.setProperty('--player-space-below', `${this.playerConfig.spaceBelow}px`);
        container.style.setProperty('--player-horizontal-margin', `${this.playerConfig.horizontalMargin}px`);
        container.style.setProperty('--player-sidebar-width', `${this.playerConfig.sidebarWidth}px`);
        container.style.setProperty('--player-min-height', `${this.playerConfig.minHeight}px`);
        container.style.setProperty('--player-max-height', this.playerConfig.maxHeight.toString());
        container.style.setProperty('--player-min-width', `${this.playerConfig.minWidth}px`);
        container.style.setProperty('--player-max-width', this.playerConfig.maxWidth.toString());
        container.style.setProperty('--player-width-ratio', this.playerConfig.widthRatio.toString());
        container.style.setProperty('--player-height-ratio', this.playerConfig.heightRatio.toString());
        container.style.setProperty('--player-controls-height', `${this.playerConfig.controlsHeight}px`);
        container.style.setProperty('--player-border-radius', `${this.playerConfig.borderRadius}px`);

        this.updateCalculatedVariables();
    }

    private updateCalculatedVariables(): void {
        const container = this.containerEl;
        if (!container) return;

        const viewportHeight = window.innerHeight;
        const nonPlayerHeight = this.playerConfig.mastheadHeight +
            this.playerConfig.topPadding +
            this.playerConfig.spaceBelow;

        const maxHeightDynamic = Math.max(0, viewportHeight - nonPlayerHeight);
        const maxWidthDynamic = maxHeightDynamic * (this.playerConfig.widthRatio / this.playerConfig.heightRatio);
        const minWidthDynamic = this.playerConfig.minHeight * (this.playerConfig.widthRatio / this.playerConfig.heightRatio);

        container.style.setProperty('--player-non-player-height', `${nonPlayerHeight}px`);
        container.style.setProperty('--player-max-height-dynamic', `${maxHeightDynamic}px`);
        container.style.setProperty('--player-max-width-dynamic', `${maxWidthDynamic}px`);
        container.style.setProperty('--player-min-width-dynamic', `${minWidthDynamic}px`);

        const finalWidth = `clamp(${this.playerConfig.minWidth}px, ${maxWidthDynamic}px, ${this.playerConfig.maxWidth === '100%' ? '100%' : this.playerConfig.maxWidth + 'px'})`;
        container.style.setProperty('--player-final-width', finalWidth);
    }

    private setupResizeObserver(): void {
        const container = this.containerEl;
        if (!container) return;

        const throttledUpdate = () => {
            if (this.resizeThrottleTimeout) return;
            this.resizeThrottleTimeout = setTimeout(() => {
                this.updateCalculatedVariables();
                this.onPlayerResize();
                this.resizeThrottleTimeout = null;
            }, 100);
        };

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => throttledUpdate());
            this.resizeObserver.observe(container);
        }

        window.addEventListener('resize', () => throttledUpdate());
    }

    private setupResponsiveBreakpoints(): void {
        const mediaQueries = [
            { query: '(min-width: 1200px)', config: { minHeight: 360, spaceBelow: 24 } },
            { query: '(min-width: 769px) and (max-width: 1199px)', config: { minHeight: 300, spaceBelow: 20 } },
            { query: '(min-width: 481px) and (max-width: 768px)', config: { minHeight: 240, spaceBelow: 16 } },
            { query: '(max-width: 480px)', config: { minHeight: 200, spaceBelow: 12 } },
            { query: '(max-width: 360px)', config: { minHeight: 160, spaceBelow: 8 } }
        ];

        mediaQueries.forEach(mq => {
            const mediaQuery = window.matchMedia(mq.query);
            const handler = (e: MediaQueryListEvent | MediaQueryList) => {
                if (e.matches) {
                    this.updateConfig(mq.config);
                }
            };
            handler(mediaQuery);
            mediaQuery.addEventListener('change', handler);
        });
    }

    updateConfig(config: Partial<PlayerConfig>): void {
        this.playerConfig = { ...this.playerConfig, ...config };
        this.applyAllVariables();
    }

    setAspectRatio(ratio: AspectRatioType): void {
        const [width, height] = ratio.split(':').map(Number);
        this.currentAspectRatio = ratio;
        this.updateConfig({
            widthRatio: width,
            heightRatio: height
        });

        if (this.containerEl) {
            this.containerEl.setAttribute('data-aspect', ratio);
        }

        setTimeout(() => this.ajustarAspectRatio(), 50);
        this.savePlayerPreferences();
    }

    setPlayerMode(mode: PlayerMode): void {
        const container = this.containerEl;
        if (!container) return;

        const modes: PlayerMode[] = ['cinema', 'fullscreen', 'floating', 'compact'];
        modes.forEach(m => container.classList.remove(m));

        if (mode !== 'normal') container.classList.add(mode);

        switch (mode) {
            case 'cinema':
                this.updateConfig({
                    maxWidth: 100,
                    minWidth: 100,
                    maxHeight: 'none',
                    spaceBelow: 0,
                    topPadding: 0,
                    mastheadHeight: 0
                });
                if (!this.isCinemaMode) this.toggleMode();
                break;
            case 'fullscreen':
                if (this.containerEl) this.toggleFullscreen(this.containerEl);
                break;
            case 'floating':
                this.enableFloatingMode();
                break;
            case 'compact':
                this.enableCompactMode();
                break;
            case 'normal':
                this.updateConfig({
                    maxWidth: '100%',
                    minWidth: 320,
                    spaceBelow: 20,
                    topPadding: 0
                });
                if (this.isCinemaMode) this.toggleMode();
                this.disableFloatingMode();
                this.disableCompactMode();
                break;
        }
    }

    private enableFloatingMode(): void {
        const container = this.containerEl;
        if (!container) return;

        this.isFloatingMode = true;
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.width = '320px';
        container.style.height = '180px';
        container.style.zIndex = '9999';
        container.style.cursor = 'grab';
        container.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        container.style.borderRadius = '8px';

        this.makeDraggable();
    }

    private disableFloatingMode(): void {
        const container = this.containerEl;
        if (!container) return;

        this.isFloatingMode = false;
        container.style.position = '';
        container.style.bottom = '';
        container.style.right = '';
        container.style.width = '';
        container.style.height = '';
        container.style.zIndex = '';
        container.style.cursor = '';
        container.style.boxShadow = '';
        container.style.borderRadius = '';
    }

    private makeDraggable(): void {
        const container = this.containerEl;
        if (!container) return;

        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        const onMouseDown = (e: MouseEvent) => {
            if (this.isFloatingMode) {
                isDragging = true;
                offsetX = e.clientX - container.offsetLeft;
                offsetY = e.clientY - container.offsetTop;
                container.style.cursor = 'grabbing';
                e.preventDefault();
            }
        };

        const onMouseMove = (e: MouseEvent) => {
            if (isDragging && this.isFloatingMode) {
                container.style.left = `${e.clientX - offsetX}px`;
                container.style.top = `${e.clientY - offsetY}px`;
                container.style.right = 'auto';
                container.style.bottom = 'auto';
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            if (container) container.style.cursor = 'grab';
        };

        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    private enableCompactMode(): void {
        this.isCompactMode = true;
        this.updateConfig({
            sidebarWidth: 300,
            maxWidth: 'calc(100% - 300px)' as any
        });
    }

    private disableCompactMode(): void {
        this.isCompactMode = false;
        this.updateConfig({
            sidebarWidth: 0,
            maxWidth: '100%'
        });
    }



    getCurrentDimensions(): PlayerDimensions {
        const container = this.containerEl;
        if (!container) {
            return { width: 0, height: 0, aspectRatio: '16:9', finalWidth: '0px', finalHeight: '0px' };
        }

        const styles = getComputedStyle(container);
        return {
            width: container.clientWidth,
            height: container.clientHeight,
            aspectRatio: `${this.playerConfig.widthRatio}:${this.playerConfig.heightRatio}`,
            finalWidth: styles.getPropertyValue('--player-final-width'),
            finalHeight: styles.getPropertyValue('--player-final-height')
        };
    }

    getCurrentCSSVariables(): Record<string, string> {
        const container = this.containerEl;
        if (!container) return {};

        const variables = [
            '--player-final-width',
            '--player-final-height',
            '--player-max-width-dynamic',
            '--player-max-height-dynamic',
            '--player-min-width-dynamic',
            '--player-non-player-height'
        ];

        const result: Record<string, string> = {};
        variables.forEach(v => {
            result[v] = getComputedStyle(container).getPropertyValue(v).trim();
        });
        return result;
    }

    resetPlayerSystem(): void {
        this.playerConfig = {
            mastheadHeight: 0,
            topPadding: 0,
            spaceBelow: 20,
            horizontalMargin: 0,
            sidebarWidth: 0,
            minHeight: 240,
            maxHeight: 'none',
            minWidth: 320,
            maxWidth: '100%',
            widthRatio: 16,
            heightRatio: 9,
            controlsHeight: 48,
            borderRadius: 0
        };

        if (this.isFloatingMode) this.disableFloatingMode();
        if (this.isCompactMode) this.disableCompactMode();
        if (this.isCinemaMode) this.applyCinemaMode(false);

        this.applyAllVariables();
        setTimeout(() => this.resizePlayer(), 100);
    }

    private clearCSSVariables(): void {
        const container = this.containerEl;
        if (!container) return;

        const variables = [
            '--player-masthead-height', '--player-top-padding', '--player-space-below',
            '--player-horizontal-margin', '--player-sidebar-width', '--player-min-height',
            '--player-max-height', '--player-min-width', '--player-max-width',
            '--player-width-ratio', '--player-height-ratio', '--player-controls-height',
            '--player-border-radius', '--player-non-player-height', '--player-max-height-dynamic',
            '--player-max-width-dynamic', '--player-min-width-dynamic', '--player-final-width'
        ];
        variables.forEach(v => container.style.removeProperty(v));
    }

    private savePlayerPreferences(): void {
        const preferences = {
            aspectRatio: this.currentAspectRatio,
            volume: this.previousVolume,
            muted: this.isMuted,
            autoplay: this.autoplayActivado
        };
        localStorage.setItem(this.STORAGE_KEY_PLAYER_CONFIG, JSON.stringify(preferences));
    }

    private loadPlayerPreferences(): void {
        const saved = localStorage.getItem(this.STORAGE_KEY_PLAYER_CONFIG);
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                if (prefs.aspectRatio) this.setAspectRatio(prefs.aspectRatio);
                if (prefs.volume !== undefined) this.previousVolume = prefs.volume;
                if (prefs.muted !== undefined) this.isMuted = prefs.muted;
                if (prefs.autoplay !== undefined) this.autoplayService.setAutoplay(prefs.autoplay);
            } catch (e) {
                console.error('Error cargando preferencias:', e);
            }
        }
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

    private guardarVolumenEnStorage(): void {
        localStorage.setItem(this.STORAGE_KEY_VOLUME, this.previousVolume.toString());
        localStorage.setItem(this.STORAGE_KEY_MUTED, this.isMuted ? 'true' : 'false');
        this.savePlayerPreferences();
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
    }

    private actualizarSliderVisual(): void {
        const slider = this.volumeSlider?.nativeElement;
        if (!slider) return;

        const vol = this.isMuted ? 0 : this.player.volume() * 100;
        slider.value = vol.toString();
        slider.style.background = `linear-gradient(to right, #32b1f9 0%, #32b1f9 ${vol}%, rgba(255,255,255,0.2) ${vol}%, rgba(255,255,255,0.2) 100%)`;
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


    private definirVideoJS(video: any) {
        this.isPlaying = !video.paused;
        this.player = videojs(this.videoPlayer!.nativeElement, {
            controls: false,
            autoplay: true,
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
        this.setAspectRatio('16:9');
    }

    private setupVideoJSEvents(): void {
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
            this.tiempoActualizado.emit(this.currentTime); 
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

    private ajustarAspectRatio(): void {
        const w = this.player.videoWidth();
        const h = this.player.videoHeight();
        if (!w || !h) return;

        const ratio = w / h;
        const diff = Math.abs(ratio - this.RATIO_16_9) / this.RATIO_16_9;
        const es16x9 = diff < this.TOLERANCIA_RATIO;

        if (this.videoContainer?.nativeElement) {
            const container = this.videoContainer.nativeElement;

            if (es16x9) {
                container.style.aspectRatio = '16 / 9';
                container.style.maxHeight = '';
            } else {
                container.style.aspectRatio = `${w} / ${h}`;
                container.style.maxHeight = '90vh';
            }
        }
    }

    private resizePlayer() {
        if (this.player) {
            this.player.trigger('resize');
            setTimeout(() => {
                this.player.width('100%').height('100%');
            }, 50);
        }
    }

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

    loadVideo(): void {
        if (!this.videoUrl || !this.player) return;

        this.player.src({ src: this.videoUrl, type: 'video/mp4' });

        this.player.ready(() => {
            this.videoReady = true;
            this.showSpinner = false;
            this.cdr.detectChanges();
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

            this.player.play().catch((error: any) => {
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

    showSkipOverlay(seconds: number) {
        this.skipOverlayText = (seconds > 0 ? '+' : '') + seconds + 's';
        this.showOverlay = true;
        clearTimeout(this.overlayTimeout);
        this.overlayTimeout = setTimeout(() => this.showOverlay = false, 800);
    }

    private showCentralOverlayWithText(text: string): void {
        this.skipOverlayText = text;
        this.showOverlay = true;
        clearTimeout(this.overlayTimeout);
        this.overlayTimeout = setTimeout(() => {
            this.showOverlay = false;
        }, 3000);
    }

    private showUnmuteHint(): void {
        this.showCentralOverlayWithText('Toca para activar el sonido');
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
        this.savePlayerPreferences();
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

    onWaiting() {
        this.showSpinner = true;
    }

    onPlaying() {
        this.showSpinner = false;
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

        let siguiente = null;

        if (this.isFromPlaylist && this.playlistVideos?.length > 0) {
            const nextIndex = (this.currentPlaylistIndex + 1) % this.playlistVideos.length;
            siguiente = this.playlistVideos[nextIndex];
        } else if (this.videosRecomendados?.length > 0) {
            siguiente = this.videosRecomendados[0];
        }

        this.nextVideoData = siguiente;

        if (this.autoplayActivado) {
            this.verificarSiguienteVideo.emit();
        } else {
            this.mostrarEndScreenConRecomendados();
            this.videoTerminado.emit();
        }

        this.cdr.detectChanges();
    }

    onFullscreenChange() {
        this.isFullscreen = !!document.fullscreenElement;
        if (this.isFullscreen && this.isCinemaMode) {
            this.isCinemaMode = false;
        }
        setTimeout(() => this.resizePlayer(), 100);
    }


    mostrarEndScreenConRecomendados(): void {
        const primeros6 = this.videosRecomendados.slice(0, 6);
        this.videosRecomendados = primeros6;
        
        this.mostrarEndScreen = true;
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

    startAutoplayCountdown(): void {
        this.showAutoplayCountdown = true;
        this.autoplayCountdownSeconds = 5;

        this.autoplayCountdownInterval = setInterval(() => {
            this.autoplayCountdownSeconds--;
            this.cdr.detectChanges();

            if (this.autoplayCountdownSeconds <= 0) {
                this.clearAutoplayCountdown();
                this.solicitarSiguienteVideo.emit();
            }
        }, 1000);
    }

    cancelAutoplayCountdown(): void {
        this.clearAutoplayCountdown();
        this.mostrarEndScreenConRecomendados();
    }

    playNextVideoImmediately(): void {
        this.cancelAutoplayCountdown();
        this.cdr.detectChanges();
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
        if (this.siguienteVideoDisponible) {
            this.startAutoplayCountdown();
        } else {
            this.mostrarEndScreen = true;
            this.cdr.detectChanges();
        }
    }

    toggleMode(): void {
        this.isTogglingCinemaMode = true;
        const nuevoEstado = !this.isCinemaMode;
        this.isCinemaMode = nuevoEstado;
        this.cinemaModeService.setCinemaMode(nuevoEstado);
        this.applyCinemaMode(nuevoEstado);
        this.toggleCinemaMode.emit(nuevoEstado);
        this.cdr.detectChanges();

        setTimeout(() => {
            this.resizePlayer();
            this.isTogglingCinemaMode = false;
        }, 0);
    }

    private applyCinemaMode(enabled: boolean): void {
        const container = this.containerEl;
        if (!container) return;

        if (enabled) {
            container.classList.add('cinema-mode');
            this.updateConfig({
                maxWidth: 100,
                minWidth: 100,
                maxHeight: 'none',
                spaceBelow: 0,
                topPadding: 0,
                mastheadHeight: 0
            });
        } else {
            container.classList.remove('cinema-mode');
            this.updateConfig({
                maxWidth: '100%',
                minWidth: 320,
                spaceBelow: 20,
                topPadding: 0,
                mastheadHeight: 0
            });
        }
    }

    private aplicarModoCineDesdeServicio() {
        this.isCinemaMode = this.cinemaModeService.getCinemaModeValue();
        this.cinemaModeSubscription = this.cinemaModeService.getCinemaMode().subscribe(enabled => {
            if (this.isTogglingCinemaMode) return;
            this.isCinemaMode = enabled;
            this.applyCinemaMode(enabled);
            this.cdr.detectChanges();
        });
    }

    private aplicarAutoPlayDesdeServicio() {
        this.autoplayActivado = this.autoplayService.getAutoplayValue();

        this.autoplaySub = this.autoplayService.getAutoplay().subscribe((valor) => {
            this.autoplayActivado = valor;
            this.cdr.detectChanges();
        });
    }


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

    @HostListener('click')
    @HostListener('keydown')
    userInteraction() {
        this.userInteracted = true;
        if (this.videoEl) this.videoEl.muted = false;
    }

    @HostListener('window:beforeunload', ['$event'])
    guardarEstadoDeAudioEnDescarga(): void {
        this.guardarVolumenEnStorage();
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        const video = this.videoEl;
        if (!video || this.reproduciendoPublicidad) return;

        const activeElement = document.activeElement;
        const tagName = activeElement?.tagName.toLowerCase();
        const isEditable = activeElement?.hasAttribute('contenteditable');

        if (tagName === 'input' || tagName === 'textarea' || isEditable ||
            activeElement?.closest('.ql-editor') || activeElement?.closest('[contenteditable="true"]')) {
            return;
        }

        switch (event.key.toLowerCase()) {
            case ' ':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'l':
                if (this.activeControl !== 'volume') this.skipForwardKeyboard();
                break;
            case 'j':
                if (this.activeControl !== 'volume') this.skipBackwardKeyboard();
                break;
            case 'arrowright':
                if (this.activeControl === 'volume') {
                    event.preventDefault();
                    video.volume = Math.min(1, video.volume + 0.05);
                    if (this.volumeSlider?.nativeElement) this.volumeSlider.nativeElement.value = (video.volume * 100).toString();
                } else {
                    this.skipForwardKeyboard();
                }
                break;
            case 'arrowleft':
                if (this.activeControl === 'volume') {
                    event.preventDefault();
                    video.volume = Math.max(0, video.volume - 0.05);
                    if (this.volumeSlider?.nativeElement) this.volumeSlider.nativeElement.value = (video.volume * 100).toString();
                } else {
                    this.skipBackwardKeyboard();
                }
                break;
            case 'arrowup':
                event.preventDefault();
                video.volume = Math.min(1, video.volume + 0.05);
                if (this.volumeSlider?.nativeElement) this.volumeSlider.nativeElement.value = (video.volume * 100).toString();
                break;
            case 'arrowdown':
                event.preventDefault();
                video.volume = Math.max(0, video.volume - 0.05);
                if (this.volumeSlider?.nativeElement) this.volumeSlider.nativeElement.value = (video.volume * 100).toString();
                break;
            case 'm':
                this.toggleMute();
                break;
            case 'f':
                if (this.containerEl) this.toggleFullscreen(this.containerEl);
                break;
            case 'c':
                event.preventDefault();
                this.toggleMode();
                break;
            case 'd':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                }
                break;
            case 'q':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.setAspectRatio('21:9');
                }
                break;
            case 'w':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.setAspectRatio('4:3');
                }
                break;
        }
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

    private setupEventListeners(): void {
        this.boundHandleContainerClick = this.handleContainerClickEvent.bind(this);
        this.boundHandleContainerDblClick = this.handleContainerDblClickEvent.bind(this);
        this.boundHandleTouchStart = this.handleTouchStartEvent.bind(this);

        if (this.containerEl) {
            const c = this.containerEl;
            c.addEventListener('click', this.boundHandleContainerClick);
            c.addEventListener('dblclick', this.boundHandleContainerDblClick);
            c.addEventListener('touchstart', this.boundHandleTouchStart, { passive: true });
        }
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

    private onPlayerResize(): void {
        const dimensions = this.getCurrentDimensions();
        this.cdr.detectChanges();
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

    getVideoElement(): HTMLVideoElement | null {
        return this.videoPlayer?.nativeElement || null;
    }

    play(): void {
        const video = this.videoPlayer?.nativeElement;
        if (!video) return;
        video.play().catch(err => {
            console.warn('Autoplay bloqueado por el navegador:', err);
        });
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

    onImageError(event: Event, video: any): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/images/video-default.png';
        video.miniatura = 'assets/images/video-default.png';
        this.cdr.detectChanges();
    }

    onThumbnailError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/images/video-default.png';
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
        this.player.play().catch(() => { });
    }
}