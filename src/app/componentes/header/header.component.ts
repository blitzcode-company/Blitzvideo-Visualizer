import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from '../../servicios/status.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(
    private router:Router, 
    public status:StatusService,
    private cookie:CookieService){}    

  public loggedIn: boolean=false;

  logout() {
    localStorage.removeItem("accessToken");
    this.cookie.delete('accessToken');
    this.status.isLoggedIn = false;
    this.router.navigateByUrl("/login")

  }



}
