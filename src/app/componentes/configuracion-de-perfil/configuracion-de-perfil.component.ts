import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { CanalService } from '../../servicios/canal.service';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Canal } from '../../clases/canal';
import { environment } from '../../../environments/environment';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-configuracion-de-perfil',
  templateUrl: './configuracion-de-perfil.component.html',
  styleUrl: './configuracion-de-perfil.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })) 
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })) 
      ])
    ])
  ]
})
export class ConfiguracionDePerfilComponent {
  usuario: any;
  fotoFile: File | undefined = undefined;
  alerta: string[] = [];
  usuarioSubscription: Subscription | undefined;
  alertMessageUser: string | null = null;
  alertMessageCanal: string | null = null;
  alertMessageCanalCreado: string | null = null;
  canal: Canal = new Canal();
  portada: File | undefined = undefined;
  serverIp = environment.serverIp
  tieneCanal: boolean = false;  
  mostrarPerfil: boolean = false; 
  mostrarCanal: boolean = false; 


  constructor(
    private router: Router,
    private authService: AuthService,
    private canalService: CanalService,
    private location: Location,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.obtenerUsuario();
    this.obtenerCanal();
    this.titleService.setTitle('Configuración de Perfil - BlitzVideo');
  }

  ngOnDestroy() {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  obtenerUsuario() {
    this.usuarioSubscription = this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      this.obtenerCanal();  
    });
    this.authService.mostrarUserLogueado().subscribe();
  }

  obtenerCanal(): void {
    this.canalService.obtenerUsuarioPorId(this.usuario.id).subscribe({
      next: (canal) => {
        if (canal && canal.canales.length > 0) {
          this.canal = canal.canales[0]; 
          this.tieneCanal = true;
          if (typeof this.canal.portada === 'string') {
            this.canal.portadaPreview = this.canal.portada; 
        } else {
            this.canal.portadaPreview = ''; 
        }
        } else {
          this.tieneCanal = false;
        }
      },
      error: () => {
        console.error('Error al obtener el canal del usuario');
        this.tieneCanal = false;
      }
    });
}

  onFileSelected(event: any): void {
    const file = event.target.files[0]; 
    if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.usuario.foto = e.target.result; 
        };
        reader.readAsDataURL(file); 
    }
}

  editarCanal(): void {
    const formData = new FormData();
   
    formData.append('nombre', this.canal.nombre);
    formData.append('descripcion', this.canal.descripcion);

    if (this.canal.portada) {
        formData.append('portada', this.canal.portada);
    }
  
    this.canalService.editarCanal(this.canal.id, formData).subscribe(
        res => {
            if (res) {
                console.log('Canal actualizado correctamente', res);
            }
        },
        error => {
            console.error('Errores de validación:', error);
        }
    );
}
  togglePerfil() {
    this.mostrarPerfil = !this.mostrarPerfil; 
    if (this.mostrarCanal) {
      this.mostrarCanal = false; 
    }
  }

  toggleCanal() {
    this.mostrarCanal = !this.mostrarCanal; 
    if (this.mostrarPerfil) {
      this.mostrarPerfil = false; 
    }
  }

  editarUsuario(): void {
    const userId = this.usuario.id;
    const formData = new FormData();
    formData.append('name', this.usuario.name);
    formData.append('fecha_de_nacimiento', this.usuario.fecha_de_nacimiento)

    if (this.fotoFile) {
      formData.append('foto', this.fotoFile);
    }

    this.authService.editarUsuario(userId, formData).subscribe(
      res => {
        if (res) {
          this.alerta.push('Usuario actualizado correctamente');
          
          this.obtenerUsuario();
        } else {
          this.alerta.push('Error al actualizar el usuario');
        }
      },
      error => {
        this.alerta.push('Error al actualizar el usuario');
      }
    );
  }



  onFileSelectedPortada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; 

    if (file) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            this.canal.portadaPreview = e.target?.result as string; 
            console.log('Vista previa de la portada actualizada'); 
        };
        reader.readAsDataURL(file); 
        this.canal.portada = file; 
    } else {
        console.error('No se ha seleccionado ningún archivo');
    }
}
  

  crearCanal(): void {
    if (!this.canal.nombre || !this.canal.descripcion || !this.canal.portada) {
      console.error('Faltan datos para crear el canal.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.canal.nombre);
    formData.append('descripcion', this.canal.descripcion);
    formData.append('portada', this.canal.portada);

    this.canalService.crearCanal(this.usuario.id, formData).subscribe({
      next: () => {
        window.location.href = `${this.serverIp}3001/misVideos`; 
      },
      error: (err) => {
        console.error('Error al crear el canal', err);
      }
    });
  }

 

  onSubmitUsuario(form: NgForm) {
    if (form.valid) {
      this.editarUsuario();
      this.alertMessageUser = 'Perfil actualizado exitosamente';

    }
  }

  onSubmitCanal(form: NgForm) {
    if (form.valid) {
      if (this.tieneCanal) {
        this.editarCanal();
        this.alertMessageCanal = 'Canal actualizado exitosamente';

      } else {
        this.crearCanal();
        this.alertMessageCanalCreado = 'Canal creado exitosamente';

      }
    }
  }


}
