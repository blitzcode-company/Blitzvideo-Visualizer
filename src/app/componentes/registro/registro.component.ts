import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';
import { StatusService } from '../../servicios/status.service';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  public sinCredenciales: boolean = false;
  public passwordSinCoincidir: boolean = false;

  constructor(private api:AuthService, private router:Router, private status: StatusService ){}

  registroUsuario(credentials:any) {
    if (
      !credentials.name ||
      !credentials.email ||
      !credentials.password ||
      !credentials.password_confirmation) 
      {
    this.sinCredenciales = true;
    return;
  }
  

    if (credentials.password !== credentials.password_confirmation) {
      this.passwordSinCoincidir = true;
      return;
  }

    this.api.registro(credentials).subscribe(
      (res: any) => {
        this.router.navigate(['/login']);
      },  
      (error) => {
        console.error('Error al registrar usuario', error)
      }


    );

  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.registroUsuario(form.value);
    }
  }
}
