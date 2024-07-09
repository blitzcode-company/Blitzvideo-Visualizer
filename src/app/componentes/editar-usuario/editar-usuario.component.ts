import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css']
})
export class EditarUsuarioComponent implements OnInit, OnDestroy {

  usuario: any;
  fotoFile: File | undefined = undefined;
  alerta: string[] = [];
  usuarioSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.obtenerUsuario();
    this.titleService.setTitle('Editar usuario - BlitzVideo');
  }

  ngOnDestroy() {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  obtenerUsuario() {
    this.usuarioSubscription = this.authService.usuario$.subscribe(res => {
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

  triggerFileInput() {
    const fileInput = document.getElementById('foto') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  editarUsuario(): void {
    const userId = this.usuario.id;
    const formData = new FormData();
    formData.append('name', this.usuario.name); 

    if (this.fotoFile) {
      formData.append('foto', this.fotoFile);
    }

    this.authService.editarUsuario(userId, formData).subscribe(
      res => {
        if (res) {
          console.log('Usuario actualizado correctamente', res);
          this.alerta.push('Usuario actualizado correctamente');
          // Refrescar la vista del usuario después de la actualización
          this.obtenerUsuario();
        } else {
          console.error('Error al actualizar el usuario');
          this.alerta.push('Error al actualizar el usuario');
        }
      },
      error => {
        console.error('Error al actualizar el usuario', error);
        this.alerta.push('Error al actualizar el usuario');
      }
    );
  }

  onSubmit(dataform: NgForm) {
    console.log('Formulario enviado', dataform);
    this.editarUsuario();
  }
}
