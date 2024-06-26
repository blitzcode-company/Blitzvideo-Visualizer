import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';
import { StatusService } from '../../servicios/status.service';
import { CookieService } from 'ngx-cookie-service';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';

enum HttpStatusCode {
  Unauthorized = 401,
  BadRequest = 400
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent implements OnInit {

  public loginError: boolean = false;
  public loginAlerta: string = '';
  public loginStatus: boolean = false;
  defaultMensajeDeError: string = 'Error de red. Por favor, inténtalo de nuevo más tarde.';


  static mensajesDeError: { [key: number]: string } = {
    [HttpStatusCode.Unauthorized]: 'Usuario o contraseña incorrectos.',
    [HttpStatusCode.BadRequest]: 'Por favor, verifica tus datos.',
  };


  constructor(
    private api: AuthService,
    private router: Router,
    private status: StatusService,
    private cookie: CookieService,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Login - BlitzVideo');
  }

  sendLogin(credentials: any) {
    return this.api.sendLogin(credentials).subscribe(
      (res: any) => {
        localStorage.setItem('accessToken', res.access_token);
        this.cookie.set('accessToken', res.access_token);
        this.status.isLoggedIn = true;
        this.router.navigateByUrl('/');
      },
      (error) => {
        this.loginAlerta = LoginComponent.mensajesDeError[error.status] || this.defaultMensajeDeError;
      }
    );
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.sendLogin(form.value);
    }
  }
}
