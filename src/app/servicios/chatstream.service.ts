import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Observable, Subject } from 'rxjs';
import Pusher, { Channel } from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class ChatstreamService {
  private apiUrl = environment.apiUrl;
  private pusher: Pusher;
  private channel: Channel | null = null;
  private listeningStreamId: string | null = null;

  private messagesSubject = new Subject<{
    id: number;
    user: string;
    user_photo: string | null;
    text: string;
    created_at: string;
  }>();


  constructor(private http: HttpClient, private cookie: CookieService) {
    Pusher.logToConsole = true;


    this.pusher = new Pusher('blitzvideo-key', {
      wsHost: '172.18.0.17',
      wsPort: 6001,
      wssPort: 6001,
      forceTLS: false,
      enabledTransports: ['ws'],
      disableStats: true,
      cluster: '',
      authEndpoint: 'http://172.18.0.2:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: 'Bearer ' + this.cookie.get('accessToken')
        }
      }
    });
  }

  cargarMensaje(streamId: string): Observable<any> {
    const url = `${this.apiUrl}api/v1/streams/chat/mensajes/${streamId}`;
    return this.http.get(url);
  }

  mandarMensaje(streamId: string, message: string, usuario_id: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/streams/chat/enviar`;
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    const body = {
      message,
      stream_id: streamId,
      user_id: usuario_id
    };
    return this.http.post(url, body, httpOptions);
  }

  startListening(streamId: string): Observable<any> {
    if (this.listeningStreamId === streamId) {
      return this.messagesSubject.asObservable();
    }
  
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher.unsubscribe('private-stream.' + this.listeningStreamId);
    }
  
    this.listeningStreamId = streamId;
  
    this.channel = this.pusher.subscribe('private-stream.' + streamId);
  
    this.channel.bind('chat-message', (e: any) => {
      console.log('Mensaje recibido vía Pusher:', e);
  
      this.messagesSubject.next({
        id: e.id,
        user: e.user_name,
        user_photo: e.user_photo,
        text: e.message,
        created_at: e.created_at,
      });
    });
  
    return this.messagesSubject.asObservable();
  }
  
  leaveChannel(streamId: string) {
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher.unsubscribe('private-stream.' + streamId);
      this.channel = null;
    }
    this.listeningStreamId = null;
  }

  private getPrivateStreamChannel(streamId: string): string {
    return `private-stream.${streamId}`;
  }
}
