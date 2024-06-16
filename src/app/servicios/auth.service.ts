import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs';
import { catchError } from 'rxjs';
import { of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = "http://localhost:8000/oauth/token"
  private logoutUrl = "http://localhost:8000/api/v1/logout"
  private registroUrl = "http://localhost:8000/api/v1/user"
  private userLogueado = "http://localhost:8000/api/v1/validate"
  private mostrarCanal = "http://localhost:8001/api/v1/usuario/"
  private editarUsuarioUrl = "http://localhost:8001/api/v1/usuario/"

  private usuarioSubject = new BehaviorSubject<any>(null);
  public usuario$: Observable<any> = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient, private cookie: CookieService) { }


  sendLogin(credentials: any) {
    const body = {
      grant_type: "password",
      client_id: "1",
      client_secret: "lbzFPOR6PyvT8RurLQsWjMHZ67UTisBIUkTEZ1m7",
      username: credentials.email,
      password: credentials.password

    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    };
    return this.http.post(this.loginUrl, body, httpOptions);


  }

  sendLogout(){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json',
        'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    
    return this.http.post(this.logoutUrl, httpOptions);



  };
  registro(credentials:any) {
    const body = {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      password_confirmation: credentials.password_confirmation
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    };
    return this.http.post(this.registroUrl, body, httpOptions)
  }

  mostrarUserLogueado() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cookie.get('accessToken')
      })
    };
    return this.http.get(this.userLogueado, httpOptions).pipe(
      tap(user => this.usuarioSubject.next(user))
    );
  }

  obtenerCanalDelUsuario(id:number) {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    } 
    
    return this.http.get(`${this.mostrarCanal}${id}`, httpOptions);

  }

  editarUsuario(id: number, usuario: any, foto?: File): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    };
  
    const formData: FormData = new FormData();
    formData.append('name', usuario.name);
    if (foto) {
      formData.append('foto', foto);
    }
  
    return this.http.post(`${this.editarUsuarioUrl}${id}`, formData, httpOptions).pipe(
      catchError(error => {
        console.error('Error al editar usuario', error);
        return of(null);
      })
    );
  }

  getToken() {
    let token = this.cookie.get('accessToken');
    if (!token) {
      token = localStorage.getItem('accessToken') || '';
      if (token) {
        this.cookie.set('accessToken', token);
      }
    }
    return token;
  }

}
