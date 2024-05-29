import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';
import { StatusService } from '../../servicios/status.service';
import { CookieService } from 'ngx-cookie-service';
import { NgForm } from '@angular/forms';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  public loginError: boolean = false;
  public loginStatus: boolean = false;

  constructor(private api:AuthService, private router:Router, private status: StatusService, private cookie:CookieService ){}

  sendLogin(credentials: any) {
    
    return this.api.sendLogin(credentials).subscribe(
        (res:any) => {
          localStorage.setItem('accessToken', res.access_token);
          this.cookie.set('accessToken', res.access_token);
          this.status.isLoggedIn = true;
          this.router.navigateByUrl('/');
        },
        (error) => {
          this.loginError = true;
        }

    );

  }
  onSubmit(form: NgForm) {
    if (form.valid) {
      this.sendLogin(form.value);
    }
  }
}
