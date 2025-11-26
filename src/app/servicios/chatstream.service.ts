import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Observable, Subject, BehaviorSubject, filter, shareReplay } from 'rxjs';
import Pusher from 'pusher-js';
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
    this.initEcho();
  }

  private initEcho() {
    Pusher.logToConsole = environment.production === false;

    const pusherClient = new Pusher('blitzvideo-key', {
      wsHost: '172.18.0.17',
      wsPort: 6001,
      wssPort: 6001,
      forceTLS: false,
      enabledTransports: ['ws'],
      cluster: 'mt1',
      disableStats: true,
      authEndpoint: 'http://172.18.0.2:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: 'Bearer ' + this.cookie.get('accessToken'),
        }
      }
    });

    this.echo = new Echo({
      broadcaster: 'pusher',
      client: pusherClient
    });

    pusherClient.connection.bind('connected', () => {
      console.log('%c[ECHO] Conectado al WebSocket', 'color: green; font-weight: bold');
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('%c[ECHO] Desconectado del WebSocket', 'color: red; font-weight: bold');
    });
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
      return this.messageStream$.asObservable();
    }

    this.leaveChannel();
    this.listeningStreamId = streamId;

    this.messagesSubject.next([]);

    return new Observable<ChatMessage>(observer => {
      const channelName = `stream.${streamId}`;
      this.channel = this.echo.private(channelName);
      this.channelPublic = this.echo.channel(channelName);


      this.channelPublic.listen('.stream-event', (event: any) => {
        console.log(event)
        if (event.type === 'viewer_count') {

          this.streamEventsSubject.next(event);

          this.ngZone.run(() => {
            console.log("[VIEWERS EVENT]", event);
          });
        }
      });

      this.channel.listen('.chat-message', (event: any) => {
        this.ngZone.run(() => {
          console.log('Evento recibido:', event);
          const msg: ChatMessage = {
            id: event.id ?? Date.now(),
            user: event.user_name ?? event.user?.name ?? 'Anónimo',
            user_photo: event.user_photo ?? event.user?.foto ?? null,
            text: event.message ?? event.mensaje ?? '',
            created_at: event.created_at ?? new Date().toISOString()
          };

          const current = this.messagesSubject.getValue();
          this.messagesSubject.next([...current, msg]);

          observer.next(msg);
          this.messageStream$.next(msg); 
        });
      });

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
        console.warn('Error al dejar el canal:', e);
      }
    }
    this.channel = null;
    this.listeningStreamId = null;
  }


  getStreamEvents(): Observable<any> {
    return this.streamEventsSubject.asObservable();
  }
}