import { Component, Input, Output, AfterViewInit ,AfterViewChecked, ElementRef, ViewChild,  ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { StreamService } from '../../servicios/stream.service';
import { AuthService } from '../../servicios/auth.service';
import { ChatstreamService } from '../../servicios/chatstream.service';
import { Subject, Subscription } from 'rxjs';
import { bufferTime } from 'rxjs/operators';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { Usuario } from '../../clases/usuario';

@Component({
  selector: 'app-chat-de-stream',
  templateUrl: './chat-de-stream.component.html',
  styleUrl: './chat-de-stream.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ChatDeStreamComponent implements OnInit {


  @Input() streamId: string = '';

  @Input() userId: number = 0;


  chatMessagesList: { id: number; user: string; user_photo: string | null; text: string; created_at: string }[] = [];
  chatInput: string = '';
  private chatSubscription: Subscription | null = null;
  private subscription: Subscription | null = null;
  readonly MAX_MESSAGES = 100;
  private messagesBuffer = new Subject<any>();
  private isUserAtBottom = true;
  mensajes: any[] = [];  
  mensaje: string = '';
  usuario: Usuario = new Usuario();


  @ViewChild('chatMessages') chatMessages!: ElementRef;

  constructor(
    private streamService: StreamService,
    private authService: AuthService,
    private chatService: ChatstreamService,
    private cdr: ChangeDetectorRef,
    private usuarioGlobal:UsuarioGlobalService,


  ) {


   
  }

  ngOnInit(): void {

    this.messagesBuffer.pipe(bufferTime(200)).subscribe(messages => this.processBufferedMessages(messages));
    this.loadChatMessagesAndListen();
    
    this.chatService.cargarMensaje(this.streamId).subscribe((res) => {
      this.mensajes = res;
    });
    this.subscription = this.chatService.startListening(this.streamId).subscribe((nuevo) => {
      this.mensajes.push(nuevo);
    });

    

  }


  ngOnDestroy(): void {
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
    if (this.streamId) this.chatService.leaveChannel(this.streamId);
  }

  ngAfterViewInit(): void {
    const chatContainer = this.chatMessages.nativeElement;
    chatContainer.addEventListener('scroll', () => {
      const threshold = 50;
      this.isUserAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < threshold;
    });
  }



  obtenerUsuario() {
    this.usuarioGlobal.usuario$.subscribe(user => {
      this.usuario = new Usuario(user);
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }
  
  enviarMensaje() {
    if (!this.mensaje.trim()) return;

    this.chatService.mandarMensaje(this.streamId, this.mensaje.trim(), this.userId).subscribe(() => {
      this.mensaje = '';
    });
  }


  private processBufferedMessages(messages: any[]) {
    if (!messages.length) return;

    this.chatMessagesList.push(...messages);

    if (this.chatMessagesList.length > this.MAX_MESSAGES) {
      this.chatMessagesList = this.chatMessagesList.slice(-this.MAX_MESSAGES);
    }

    if (this.isUserAtBottom) this.scrollToBottom();
    this.cdr.markForCheck();
  }

  loadChatMessagesAndListen() {
    if (!this.streamId) return;
  
    this.chatService.cargarMensaje(this.streamId).subscribe({
      next: (messages: any) => {
        this.chatMessagesList = messages.map((msg: any) => ({
          id: msg.id,
          user: msg.user.name,
          user_photo: msg.user.foto,
          text: msg.mensaje,
          created_at: msg.created_at,
        }));
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error al cargar mensajes:', err);
      },
    });
  
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    this.chatSubscription = this.chatService.startListening(this.streamId).subscribe({
      next: (msg) => {
        console.log('Mensaje websocket recibido:', msg);
    
        this.chatMessagesList = [...this.chatMessagesList, msg];
    
        this.scrollToBottom();
        this.cdr.markForCheck();
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al recibir mensaje:', err);
      },
    });
  }
  
  onMensajeChange(value: string) {
    console.log('Valor de mensaje:', value);
  }

  sendChatMessage() {
    if (!this.chatInput.trim() || !this.streamId) return;
    this.chatService.mandarMensaje(this.streamId, this.chatInput, this.userId).subscribe({
      next: () => {
        this.chatInput = '';
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
      },
    });
  }
  

  private scrollToBottom() {
    requestAnimationFrame(() => {
      if (this.chatMessages && this.chatMessages.nativeElement) {
        const chatContainer = this.chatMessages.nativeElement;
        console.log('Desplazando al final, scrollHeight:', chatContainer.scrollHeight);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } else {
        console.warn('Contenedor de mensajes no disponible');
      }
    });
  }
  
}