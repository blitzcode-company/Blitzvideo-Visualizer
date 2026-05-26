import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Observable, Subject, BehaviorSubject, filter, shareReplay } from 'rxjs';
import { initEcho } from '../../echo';
import Echo from 'laravel-echo';


type PusherChannelWithListen = any; 

export interface ChatMessage {
  id: number;
  user: string;
  user_photo: string | null;
  text: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatstreamService {
  private apiUrl = environment.apiUrl;
  private channel: PusherChannelWithListen = null;
    private channelPublic: PusherChannelWithListen = null;

  private listeningStreamId: number | null = null;
  private echo!: Echo<any>;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private viewerCountSubject = new BehaviorSubject<number>(0);
  public viewerCount$ = this.viewerCountSubject.asObservable();
  private messageStream$ = new Subject<ChatMessage>();
  
  private streamEventsSubject = new Subject<any>();

  constructor(
    private http: HttpClient,
    private cookie: CookieService,
    private ngZone: NgZone
  ) {
    console.log('[CHAT SERVICE] Inicializando servicio...');
    this.echo = initEcho(this.cookie);
    console.log('[CHAT SERVICE] Echo inicializado:', this.echo);
    
    (window as any).Echo = this.echo;
    console.log('[CHAT SERVICE] Echo expuesto en window.Echo');
  }

  cargarMensaje(streamId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/streams/chat/mensajes/${streamId}`;
    return this.http.get(url);
  }

  mandarMensaje(streamId: number, message: string, usuario_id: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/streams/chat/enviar`;
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.cookie.get('accessToken')
    });

    const body = { message, stream_id: streamId, user_id: usuario_id };
    return this.http.post(url, body, { headers });
  }

  startListening(streamId: number): Observable<ChatMessage> {
    if (this.listeningStreamId === streamId && this.channel) {
      console.log(`[CHAT SERVICE] Ya estamos escuchando el stream ${streamId}, reutilizando observable`);
      return this.messageStream$.asObservable();
    }

    this.leaveChannel();
    this.listeningStreamId = streamId;

    this.messagesSubject.next([]);

    return new Observable<ChatMessage>(observer => {
      const privateChannelName = `stream.${streamId}`; 
      const publicChannelName = `stream.${streamId}`;
      
      console.log(`[CHAT SERVICE] Conectando a canales:`);
      console.log(`[CHAT SERVICE] - Canal privado (usando .private()): ${privateChannelName}`);
      console.log(`[CHAT SERVICE] - Canal público (usando .channel()): ${publicChannelName}`);
      
      console.log('[CHAT SERVICE] Intentando conectar al canal privado...');
      this.channel = this.echo.private(privateChannelName);
      console.log('[CHAT SERVICE] Canal privado conectado:', this.channel);
      console.log('[CHAT SERVICE] Nombre real del canal:', this.channel.name);
      console.log('[CHAT SERVICE] Tipo de canal:', this.channel?.constructor?.name);
      
      console.log('[CHAT SERVICE] ¿Es canal privado?', typeof this.channel?.notification === 'function');
      
      console.log('[CHAT SERVICE] Intentando conectar al canal público...');
      this.channelPublic = this.echo.channel(publicChannelName);
      console.log('[CHAT SERVICE] Canal público conectado:', this.channelPublic);

      console.log(`[CHAT SERVICE] Canales conectados, configurando listeners...`);

      this.channelPublic.listen('.stream-event', (event: any) => {
        console.log('[CHAT SERVICE] Evento .stream-event recibido desde canal PÚBLICO:', event);
        
        this.streamEventsSubject.next(event);

        this.ngZone.run(() => {
          console.log("[VIEWERS EVENT EN NGZONE]", event);
        });
      });

      console.log('[CHAT SERVICE] Canal privado:', this.channel);
      
      this.channel.listen('.chat-message', (event: any) => {
        console.log('[CHAT SERVICE] ✉️ Evento .chat-message recibido desde canal PRIVADO:', event);
        
        this.ngZone.run(() => {
          const msg: ChatMessage = {
            id: event.id ?? Date.now(),
            user: event.user_name ?? event.user?.name ?? 'Anónimo',
            user_photo: event.user_photo ?? event.user?.foto ?? null,
            text: event.message ?? event.mensaje ?? '',
            created_at: event.created_at ?? new Date().toISOString()
          };

          console.log('[CHAT SERVICE] Mensaje procesado:', msg);

          const current = this.messagesSubject.getValue();
          this.messagesSubject.next([...current, msg]);

          observer.next(msg);
          this.messageStream$.next(msg); 
        });
      });
      
      this.channel.listen('chat-message', (event: any) => {
        console.log('[CHAT SERVICE] ✉️ Evento chat-message (sin punto) recibido:', event);
      });

      console.log('[CHAT SERVICE] Listeners configurados correctamente');

      return () => {
        this.leaveChannel();
      };
    }).pipe(
      shareReplay(1)
    );
  }

  leaveChannel() {
    if (this.channel && this.listeningStreamId) {
      try {
        this.channel.stopListening('.chat-message');
        this.echo.leave(`private-stream.${this.listeningStreamId}`);
      } catch (e) {
        console.warn('Error al dejar el canal privado:', e);
      }
    }
    
    if (this.channelPublic && this.listeningStreamId) {
      try {
        this.channelPublic.stopListening('.stream-event');
        this.echo.leave(`stream.${this.listeningStreamId}`);
      } catch (e) {
        console.warn('Error al dejar el canal público:', e);
      }
    }
    
    this.channel = null;
    this.channelPublic = null;
    this.listeningStreamId = null;
  }


  getStreamEvents(): Observable<any> {
    return this.streamEventsSubject.asObservable();
  }
}