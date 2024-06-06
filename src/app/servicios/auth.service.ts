import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = "http://localhost:8000/oauth/token"
  private logoutUrl = "http://localhost:8000/api/v1/logout"
  private registroUrl = "http://localhost:8000/api/v1/user"
  private userLogueado = "http://localhost:8000/api/v1/validate"
  private mostrarCanal = "http://localhost:8001/api/v1/usuario/"



  constructor(private http: HttpClient, private cookie: CookieService) { }


  sendLogin(credentials: any) {
    const body = {
      grant_type: "password",
      client_id: "1",
      client_secret: "GAemt97Hf1v3b92f2LLh2ZOWKHGj57lYsFQKLqm4",
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
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + this.cookie.get('accessToken')
      })
    } 
    return this.http.get(this.userLogueado, httpOptions)
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
