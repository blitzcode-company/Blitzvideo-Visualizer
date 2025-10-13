import { Component, HostListener, Output, EventEmitter, ElementRef  } from '@angular/core';

import { Router } from '@angular/router';
import { StatusService } from '../../servicios/status.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../servicios/auth.service';
import { Canal } from '../../clases/canal';
import { CanalService } from '../../servicios/canal.service';
import { environment } from '../../../environments/environment';
import { NotificacionesService } from '../../servicios/notificaciones.service';
import { Notificacion } from '../../clases/notificacion';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(
    private router:Router, 
    public status:StatusService,
    private cookie:CookieService,
    private api:AuthService,
    private eRef: ElementRef,
    private usuarioGlobal:UsuarioGlobalService,
    private canalService: CanalService,
    private notificacionesService: NotificacionesService,
){}    

  serverIp = environment.serverIp;

  public loggedIn: boolean=false;

    ngOnInit() {
      this.obtenerUsuario();
    }

  usuario:any;
  canal:any;
  canals = new Canal();
  canalId:any;
  canalNombre:any
  nombre: string = '';
  notificaciones: Notificacion[] = [];
  mostrarNotificaciones: boolean = false; 
  contadorNotificaciones: number = 0;
  sidebarVisible: boolean = true;
  userId:number = 0;
  logoUrl: string | null = null; 

  @Output() toggleSidebar = new EventEmitter<void>();

  onMenuClick() {
    this.usuarioGlobal.toggleSidebar();
  }
  


  obtenerUsuario() {
    this.usuarioGlobal.usuario$.subscribe(user => {
      this.usuario = user;
  
      if (!this.usuario) {
        console.log('Usuario no logueado');
        return;
      }
  
      this.userId = this.usuario.id;
  
      this.obtenerCanal(this.userId);
      this.obtenerNotificacionesDelMes(this.userId);
  
      this.logoUrl = this.usuario.premium ? 'assets/images/logopremium.png' : 'assets/images/logo.png';
    });
  
    this.api.mostrarUserLogueado().subscribe();
  }

  alternarNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  obtenerNotificacionesDelMes(userId: number): void {
    this.notificacionesService.listarNotificaciones(userId).subscribe({
      next: (response) => {
        if (response?.notificaciones) {
          this.notificaciones = response.notificaciones.map((notificacion: any) => ({
            id: notificacion.id,
            mensaje: notificacion.mensaje,
            referencia_id: notificacion.referencia_id,
            referencia_tipo: notificacion.referencia_tipo,
            fecha_creacion: notificacion.fecha_creacion,
            leido: notificacion.leido,
          }))
          .reverse();

          const notificacionesNoLeidas = this.notificaciones.filter(notificacion => notificacion.leido === 0);
          this.contadorNotificaciones = notificacionesNoLeidas.length; 

        } else {
          console.warn('No se encontraron notificaciones.');
        }
      },
      error: (err) => {
        console.error('Error al cargar las notificaciones:', err);
      },
    });
  }
  



  marcarComoVista(notificacionId: number): void {
    this.notificacionesService.marcarNotificacionComoVista(notificacionId, this.usuario.id).subscribe({
      next: () => {
        console.log(`Notificación ${notificacionId} marcada como vista.`);
        this.notificaciones = this.notificaciones.map((notificacion) =>
          notificacion.id === notificacionId ? { ...notificacion, leido: 1 } : notificacion
        );
      },
      error: (err) => {
        console.error('Error al marcar la notificación como vista:', err);
      },
    });
  }


  buscarVideos(): void {
    if (this.nombre.trim()) {
      this.router.navigate(['/buscar', this.nombre]);
    }
  }


  obtenerURLImagen() {
    return this.usuario.foto ? this.usuario.foto : '../../../assets/images/user.png';
  }

  obtenerCanal(userId: number): void {
    if (userId) {
      this.api.obtenerCanalDelUsuario(userId).subscribe(
        (res: any) => {
          this.canal = res;
          if (res.canales) {
            this.canalId = res.canales.id;
            this.canalNombre = res.canales.nombre;
          } else {
            this.canalId = null;
            console.error('El usuario no tiene canal creado');
          }
        },
        (error) => {
          console.error('Error al obtener el canal:', error);
        }
      );
    } else {
      this.canalId = null;
    }
  }

  logout() {
    this.cookie.delete('accessToken');
    console.log('Cookie accessToken eliminada');
    this.status.isLoggedIn = false;
    window.location.reload();
    
  }

  redirectToLogin() {
    window.location.href = this.serverIp + '3002/#/';
  }

  isDropdownOpen = false;

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  obtenerIconoNotificaciones(): string {
    if (this.contadorNotificaciones === 0) {
      return 'notifications_none';
    } else if (this.mostrarNotificaciones) {
      return 'notifications_active';
    } else {
      return 'notifications'; 
    }
  }



  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
  
    if (this.mostrarNotificaciones && !this.eRef.nativeElement.querySelector('.lista-notificaciones')?.contains(target) 
        && !this.eRef.nativeElement.querySelector('.campanita')?.contains(target)) {
      this.mostrarNotificaciones = false;
    }
  
    if (this.isDropdownOpen && !target.closest('.dropdown')) {
      this.isDropdownOpen = false;
    }
  }



}