import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment.prod';



@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private httpClient: HttpClient, private cookie:CookieService, ) { }

  private apiUrl = environment.apiUrl
  private pollingSubscription?: Subscription;
  private ultimaCantidad = 0;

  private notificaciones = new BehaviorSubject<number>(0);
  public notificaciones$ = this.notificaciones.asObservable();


  

  marcarNotificacionComoVista(notificacionId: number, usuarioId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };

    const url = `${this.apiUrl}api/v1/notificacion/vista`;
    const body = {
      notificacion_id: notificacionId,
      usuario_id: usuarioId,
    }

    return this.httpClient.post(url, body, httpOptions);
  }

  listarNotificaciones(usuarioId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };

    const url = `${this.apiUrl}api/v1/notificacion/usuario/${usuarioId}`
    return this.httpClient.get<any[]>(url, httpOptions);
  }
  
  actualizarCantidadDesdeApi(usuarioId: number): void {
    this.listarNotificaciones(usuarioId).subscribe((respuesta) => {
      const cantidadNoLeidas = Array.isArray(respuesta?.notificaciones)
        ? respuesta.notificaciones.filter((n: any) => n.leido === 0).length
        : 0;


      this.ultimaCantidad = cantidadNoLeidas;
      this.notificaciones.next(cantidadNoLeidas);
    });
  }

  borrarNotificacion(notificacionId: number, usuarioId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };

    const url = `${this.apiUrl}api/v1/notificacion/${notificacionId}/usuario/${usuarioId}`

    return this.httpClient.delete(url, httpOptions);
  }

  borrarTodasLasNotificaciones(usuarioId: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };

    const url = `${this.apiUrl}api/v1/notificacion/usuario/${usuarioId}`
    return this.httpClient.delete(url, httpOptions);
  }


  obtenerEstado(canalId: number, userId: number): Observable<{ notificaciones: boolean }> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };

    const url = `${this.apiUrl}api/v1/canal/${canalId}/usuario/${userId}/notificacion`;

    return this.httpClient.get<{ notificaciones: boolean }>(url, httpOptions);
  }

  cambiarEstado(canalId: number, userId: number, estado: boolean): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.cookie.get('accessToken'),
        'Content-Type': 'application/json'
      })
    };

    const url = `${this.apiUrl}api/v1/canal/${canalId}/usuario/${userId}/notificacion`;

    return this.httpClient.put(url, { estado }, httpOptions);
  }

}
