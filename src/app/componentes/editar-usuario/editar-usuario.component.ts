import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css'
})
export class EditarUsuarioComponent implements OnInit{

usuario:any;
foto: File | undefined = undefined;


constructor (public router:Router, private authService: AuthService, public location:Location) {}

ngOnInit() {
  this.obtenerUsuario();
}

obtenerUsuario() {
  this.authService.usuario$.subscribe(res => {
    this.usuario = res;
   
  });
  this.authService.mostrarUserLogueado().subscribe();
}


onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.usuario.foto = file;
  }
  console.log('Archivo seleccionado:', this.usuario.foto);
}

onFileSelected(event: any): void {
  if (event.target.files.length > 0) {
    this.foto = event.target.files[0];
  }
}

editarUsuario(): void {
  const userId = this.usuario.id;
  this.authService.editarUsuario(userId, this.usuario, this.foto).subscribe(
    res => {
      console.log('Usuario actualizado correctamente', res);
    },
    error => {
      console.error('Error al actualizar el usuario', error);
    }
  );
}

onSubmit(dataform: any) {
  console.log('Formulario enviado', dataform);
  this.editarUsuario();
  
  this.router.navigateByUrl('/').then(() => {
    this.location.go(this.location.path());
    window.location.reload();
  });
}

}
