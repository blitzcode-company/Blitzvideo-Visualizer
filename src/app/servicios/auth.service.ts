import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs';
import { catchError } from 'rxjs';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { Usuario } from '../clases/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authApiUrl = environment.authApiUrl;
  private apiUrl = environment.apiUrl;
  private usuarioSubject = new BehaviorSubject<any>(null);
  public usuario$: Observable<any> = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient, private cookie: CookieService, private dialog: MatDialog) { }
  
  mostrarUserLogueado() {
    if (this.usuarioSubject.value) {
      return of(this.usuarioSubject.value);
    }
    const token = this.cookie.get('accessToken');
    
    if (!token) {
      console.warn('No se encontró un token de acceso');
      return of(null); 
    }
  
    const url = `${this.authApiUrl}api/v1/validate`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };
  
    return this.http.get(url, httpOptions).pipe(
      tap(user => this.usuarioSubject.next(user)),
      catchError(error => {
        if (error.status === 401) {
          console.warn('Usuario no autenticado');
        }
        return of(null); 
      })
    );
  }

  

  obtenerCanalDelUsuario(id:number) {

    
    const url = `${this.apiUrl}api/v1/usuario/${id}`
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    } 
    return this.http.get(url, httpOptions);
  }

  editarUsuario(id: number, formData: FormData): Observable<any> {
    const url = `${this.apiUrl}api/v1/usuario/${id}`;
    const headers = { 'Authorization': 'Bearer ' + this.cookie.get('accessToken') };
  
    return this.http.post(url, formData, { headers }).pipe(
      catchError(error => {
        console.error('Error al editar usuario', error);
        return of(null);
      })
    );
  }

  actualizarUsuarioPremium(userId: number): Observable<any> {
    const url = `${this.apiUrl}api/v1/usuario/premium`
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.post(url, { user_id: userId }, httpOptions);
  }



}