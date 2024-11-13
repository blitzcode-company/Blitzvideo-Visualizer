import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  
  public isLoggedIn: boolean = false;

    
  constructor(private cookie:CookieService) { 

    if(this.cookie.check('accessToken'))
      this.isLoggedIn = true;
  }

}
