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
    const url = `${this.authApiUrl}api/v1/validate`
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.get(url, httpOptions).pipe(
      tap(user => this.usuarioSubject.next(user))
    );
  }
  mostrarUserConCanal(id:number): Observable<any> {
    const url = `${this.apiUrl}api/v1/usuario/${id}`
    return this.http.get<Usuario>(url)
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
    const url = `${this.apiUrl}api/v1/usuario/${id}`
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.post(url, formData, httpOptions).pipe(
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
