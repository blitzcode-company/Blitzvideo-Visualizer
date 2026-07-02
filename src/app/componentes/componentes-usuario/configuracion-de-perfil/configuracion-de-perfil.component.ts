import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../servicios/auth.service';
import { CanalService } from '../../../servicios/canal.service';
import { UsuarioGlobalService } from '../../../servicios/usuario-global.service';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subscription, Observable } from 'rxjs';
import { Canal } from '../../../clases/canal';
import { environment } from '../../../../environments/environment';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  fotoFile: File | null = null;
  fotoPreview: string | null = null;
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
  mostrarPassword: boolean = false;
  userId: number = 0;
  sidebarCollapsed$!: Observable<boolean>;
  
  passwordData = {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private usuarioGlobalService: UsuarioGlobalService,
    private canalService: CanalService,
    private location: Location,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.sidebarCollapsed$ = this.usuarioGlobalService.sidebarCollapsed$;
    this.obtenerUsuario();
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
      this.userId = this.usuario.id
      this.obtenerCanal(this.userId);
    });
    this.authService.mostrarUserLogueado().subscribe();
  }

  obtenerCanal(userId: number): void {
    this.canalService.obtenerUsuarioPorId(userId).subscribe({
      next: (res: any) => {
        if (res && res.canales) {
          this.canal = res.canales; 
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

cambiarContraseña(): void {
    if (!this.passwordData.current_password || !this.passwordData.new_password) {
      this.snackBar.open('Por favor completa todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.passwordData.new_password !== this.passwordData.new_password_confirmation) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
      return;
    }

    this.authService.cambiarPassword({
      user_id: this.usuario.id,
      current_password: this.passwordData.current_password,
      new_password: this.passwordData.new_password,
      new_password_confirmation: this.passwordData.new_password_confirmation
    }).subscribe({
      next: (res: any) => {
        this.snackBar.open('Contraseña cambiada exitosamente', 'Cerrar', { duration: 3000 });
        this.passwordData = {
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        };
      },
      error: (err: any) => {
        console.error('Error al cambiar contraseña:', err);
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Error al cambiar la contraseña';
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.fotoFile = input.files[0];
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoPreview = e.target.result;
    };
    reader.readAsDataURL(this.fotoFile);
  }
}

openFileInput(): void {
  const fileInput = document.getElementById('userPhoto') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
  }
}

openFileInputPortada(): void {
  const fileInput = document.getElementById('portadaImage') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
  }
}

  editarCanal(): void {
    const formData = new FormData();
   
    formData.append('nombre', this.canal.nombre);
    formData.append('descripcion', this.canal.descripcion);

    if (this.canal.portada && this.canal.portada instanceof File) {
        formData.append('portada', this.canal.portada);
    }
  
    this.canalService.editarCanal(this.canal.id, this.userId, formData).subscribe(
        res => {
            if (res) {
                console.log('Canal actualizado correctamente', res);
                this.snackBar.open('Canal actualizado exitosamente', 'Cerrar', { duration: 3000 });
            }
        },
        error => {
            console.error('Errores de validación:', error);
            this.snackBar.open('Error al actualizar el canal', 'Cerrar', { duration: 3000 });
        }
    );
}
  togglePerfil() {
    this.mostrarPerfil = !this.mostrarPerfil; 
    if (this.mostrarCanal) {
      this.mostrarCanal = false; 
    }
    if (this.mostrarPassword) {
      this.mostrarPassword = false;
    }
  }

  toggleCanal() {
    this.mostrarCanal = !this.mostrarCanal; 
    if (this.mostrarPerfil) {
      this.mostrarPerfil = false; 
    }
    if (this.mostrarPassword) {
      this.mostrarPassword = false;
    }
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
    if (this.mostrarPerfil) {
      this.mostrarPerfil = false;
    }
    if (this.mostrarCanal) {
      this.mostrarCanal = false;
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
          this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.obtenerUsuario();
        } else {
          this.alerta.push('Error al actualizar el usuario');
        }
      },
      error => {
        this.snackBar.open('Error al actualizar el perfil', 'Cerrar', { duration: 3000 });
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

  onSubmitPassword(form: NgForm) {
    if (form.valid) {
      this.cambiarContraseña();
    }
  }


}
