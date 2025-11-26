import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy  } from '@angular/core';
import { ChatstreamService, ChatMessage } from '../../servicios/chatstream.service';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { Usuario } from '../../clases/usuario';
import { Subscription, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat-de-stream',
  templateUrl: './chat-de-stream.component.html',
  styleUrls: ['./chat-de-stream.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatDeStreamComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() streamId: number = 0;
  @Input() userId: number = 0;

  messages: ChatMessage[] = [];

  mensaje: string = '';
  usuario: Usuario = new Usuario();

  private destroy$ = new Subject<void>();
  private isUserAtBottom = true;
  private chatContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('chatMessages', { static: true }) set chatContainerRef(ref: ElementRef<HTMLDivElement>) {
    this.chatContainer = ref;
  }

  constructor(
    private chatService: ChatstreamService,
    private usuarioGlobal: UsuarioGlobalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    
    this.obtenerUsuario();
    this.cargarMensajesIniciales();
    this.suscribirseAMensajesEnTiempoReal();
  }

  ngAfterViewInit(): void {
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.leaveChannel();
  }

  obtenerUsuario(): void {
    this.usuarioGlobal.usuario$.subscribe(res => {
      this.usuario = res;
      if (this.usuario) {
        this.userId = this.usuario.id;
        console.log("User ID obtenido:", this.userId, this.usuario.id);
      
      }
    });
  }

  private cargarMensajesIniciales(): void {
    this.chatService.cargarMensaje(this.streamId).subscribe({
      next: (res: any) => {
        this.messages = res.map((msg: any) => ({
          id: msg.id,
          user: msg.user?.name || 'Anónimo',
          user_photo: msg.user?.foto || null,
          text: msg.mensaje || '',
          created_at: msg.created_at
        }));

        this.scrollToBottom();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error cargando mensajes:', err)
    });
  }

  private suscribirseAMensajesEnTiempoReal(): void {
    this.chatService.startListening(this.streamId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.limitarMensajes();
        if (this.isUserAtBottom) this.scrollToBottom();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error en WebSocket:', err)
    });
  }

  private setupScrollListener(): void {
    if (!this.chatContainer) return;

    const container = this.chatContainer.nativeElement;
    container.addEventListener('scroll', () => {
      const threshold = 100;
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      this.isUserAtBottom = atBottom;
    });
  }

  private limitarMensajes(): void {
    if (this.messages.length > 150) {
      this.messages = this.messages.slice(-100);
    }
  }

  enviarMensaje(): void {
    if (!this.mensaje.trim() || !this.streamId || !this.userId) return;

    const texto = this.mensaje.trim();

    const mensajeOptimista: ChatMessage = {
      id: Date.now(),
      user: this.usuario.name || 'Tú',
      user_photo: this.usuario.foto || null,
      text: texto,
      created_at: new Date().toISOString()
    };

    this.messages.push(mensajeOptimista);
    this.scrollToBottom();
    this.cdr.markForCheck();

    this.mensaje = '';

    this.chatService.mandarMensaje(this.streamId, texto, this.userId).subscribe({
      next: () => {
      },
      error: (err) => {
        console.error('Error enviando mensaje:', err);
        this.messages = this.messages.filter(m => m.id !== mensajeOptimista.id);
        this.cdr.markForCheck();
      }
    });
  }

  private scrollToBottom(): void {
    if (!this.chatContainer) return;

    setTimeout(() => {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 0);
  }

  trackByMessageId(index: number, msg: ChatMessage): number {
    return msg.id;
  }
}