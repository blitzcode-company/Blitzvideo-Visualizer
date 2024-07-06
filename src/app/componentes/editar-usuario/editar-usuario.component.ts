import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css'
})
export class EditarUsuarioComponent implements OnInit{

usuario:any;
foto: File | undefined = undefined;
alerta: string[] = [];
fotoFile:  File | undefined = undefined;


constructor (public router:Router, private authService: AuthService, public location:Location, private titleService:Title) {}

ngOnInit() {
  this.obtenerUsuario();
  this.titleService.setTitle('Editar usuario - BlitzVideo');

}

obtenerUsuario() {
  this.authService.usuario$.subscribe(res => {
    this.usuario = res;
   
  });
  this.authService.mostrarUserLogueado().subscribe();
}



onFileSelected(event: any): void {
  this.fotoFile = event.target.files[0];
  if (this.fotoFile) {
    const reader = new FileReader();
    reader.onload = () => {
      const userPhoto = document.getElementById('userPhoto') as HTMLImageElement;
      if (userPhoto) {
        userPhoto.src = reader.result as string;
      }
    };
    reader.readAsDataURL(this.fotoFile);
  } else {
    console.error('No file selected');
  }
}
editarUsuario(): void {
  const userId = this.usuario.id;
  const formData = new FormData();
  formData.append('nombre', this.usuario.nombre); 

  if (this.fotoFile) {
    formData.append('foto', this.fotoFile);
  }


  this.authService.editarUsuario(userId, formData).subscribe(
    res => {
      console.log('Usuario actualizado correctamente', res);
      this.alerta.push('Usuario actualizado correctamente');

    },
    error => {
      console.error('Error al actualizar el usuario', error);
      this.alerta.push('Error al actualizar el usuario');

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
