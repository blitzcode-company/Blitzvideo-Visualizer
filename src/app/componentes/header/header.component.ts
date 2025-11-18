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
import { Subscription } from 'rxjs';

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
  private sub!: Subscription;

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
  historialBusquedas: string[] = [];
  maxHistorial = 5;
  isNotiDropdownOpen = false;
  isUserDropdownOpen = false;
  isCrearDropdownOpen = false;
  historialFiltrado: string[] = [];

  @Output() toggleSidebar = new EventEmitter<void>();

  onMenuClick() {
    this.usuarioGlobal.toggleSidebar();
  }


  ngOnInit() {
    this.obtenerUsuario();
    this.cargarHistorialBusquedas();
   
  }

  private cargarNotificacionesOrdenadas(userId: number) {
  this.notificacionesService.listarNotificaciones(userId).subscribe(res => {
    const lista = res.notificaciones || [];
    
    this.notificaciones = lista
      .slice() 
      .sort((a: any, b: any) => 
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      );
  });
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


  cargarHistorialBusquedas() {
    const historial = localStorage.getItem('historialBusquedas');
    if (historial) {
      this.historialBusquedas = JSON.parse(historial).slice(-this.maxHistorial);
    }
  }
  
  guardarBusqueda(nombre: string) {
    if (!nombre || nombre.trim() === '') return;
    
    this.historialBusquedas = [nombre, ...this.historialBusquedas.filter(b => b !== nombre)];
    
    this.historialBusquedas = this.historialBusquedas.slice(0, this.maxHistorial);
    
    localStorage.setItem('historialBusquedas', JSON.stringify(this.historialBusquedas));
  }

  filtrarHistorial() {
    if (!this.nombre) {
      this.historialFiltrado = [];
      return;
    }
    const termino = this.nombre.toLowerCase();
    this.historialFiltrado = this.historialBusquedas.filter(busqueda => 
      busqueda.toLowerCase().includes(termino)
    ).slice(0, 5);
  }
  
  seleccionarBusqueda(busqueda: string) {
    this.nombre = busqueda;
    this.historialFiltrado = [];
    this.buscarVideos();
  }
  
  eliminarBusqueda(busqueda: string) {
    this.historialBusquedas = this.historialBusquedas.filter(b => b !== busqueda);
    localStorage.setItem('historialBusquedas', JSON.stringify(this.historialBusquedas));
    this.filtrarHistorial();
  }
  
  limpiarHistorial() {
    this.historialBusquedas = [];
    localStorage.removeItem('historialBusquedas');
    this.historialFiltrado = [];
  }
  

  alternarNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

obtenerNotificacionesDelMes(userId: number): void {
  this.notificacionesService.listarNotificaciones(userId).subscribe({
    next: (response) => {
      console.log(response)
      if (response?.notificaciones && Array.isArray(response.notificaciones)) {
        this.notificaciones = response.notificaciones
          .map((n: any) => ({
            id: n.id,
            mensaje: n.mensaje,
            referencia_id: n.referencia_id,
            referencia_tipo: n.referencia_tipo,
            fecha_creacion: n.fecha_creacion,
            leido: n.leido,

            id_video: n.id_video,
            titulo_video: n.titulo_video ?? 'Video sin título',
            miniatura_video: n.miniatura_video ?? null,

            texto_comentario: n.texto_comentario ?? null,
            nombre_comentador: n.nombre_comentador ?? 'Usuario',
            foto_perfil_comentador: n.foto_perfil_comentador ?? null,

            nombre_subidor: n.nombre_subidor ?? null,
            foto_perfil_subidor: n.foto_perfil_subidor ?? null,
          }))
          .reverse();

        this.contadorNotificaciones = this.notificaciones.filter(n => n.leido === 0).length;
      } else {
        this.notificaciones = [];
        this.contadorNotificaciones = 0;
      }
    },
    error: (err) => {
      console.error('Error al cargar notificaciones:', err);
      this.notificaciones = [];
      this.contadorNotificaciones = 0;
    }
  });
}
  
irANotificacion(notif: any) {
  this.marcarComoVista(notif.id);

  if (notif.id_video && notif.referencia_id) {
    localStorage.setItem('highlightCommentId', notif.referencia_id.toString());
    
   this.router.navigate(['/video', notif.id_video]).then(() => {
     this.router.navigate(['/video', notif.id_video], { queryParams: { comment: notif.referencia_id } });
    });
  }
}

marcarComoVista(notificacionId: number): void {
  const notif = this.notificaciones.find(n => n.id === notificacionId);
  if (!notif || notif.leido === 1) return;

  this.notificacionesService.marcarNotificacionComoVista(notificacionId, this.usuario.id).subscribe({
    next: () => {
      notif.leido = 1;
      this.contadorNotificaciones = Math.max(0, this.contadorNotificaciones - 1); 
    },
    error: (err) => {
      console.error('Error al marcar como vista:', err);
    }
  });
}


  buscarVideos() {
    if (this.nombre?.trim()) {
      this.guardarBusqueda(this.nombre.trim());
      this.router.navigate(['/buscar'], { 
        queryParams: { q: this.nombre.trim() } 
      });
    }
    if (this.mobileSearchActive) this.toggleMobileSearch();
  }

  onSearchInput() {
    this.cargarHistorialBusquedas();
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

  mobileSearchActive = false;

  toggleMobileSearch() {
    this.mobileSearchActive = !this.mobileSearchActive;
    if (this.mobileSearchActive) {
      setTimeout(() => this.cargarHistorialBusquedas(), 100);
    }
  }

  

logout() {
  this.api.logout().subscribe({
    next: (response) => {
      console.log('Sesión cerrada en el servidor:', response);
      this.limpiarTodoYRedirigir();
    },
    error: (err) => {
      console.warn('Error al cerrar sesión en servidor, pero limpiamos igual:', err);
      this.limpiarTodoYRedirigir(); 
    }
  });
}

  private limpiarTodoYRedirigir() {
    this.cookie.deleteAll();
    this.cookie.deleteAll('/');     
    localStorage.clear();             
    sessionStorage.clear();

    this.status.isLoggedIn = false;
    window.location.reload();
  }

onImgError(event: any) {
  event.target.src = 'assets/images/cover-default.png'; 
}

  trackByNotif(index: number, notif: any): any {
    return notif.id;
  }

toggleNotiDropdown() {
  this.isNotiDropdownOpen = !this.isNotiDropdownOpen;
  this.isUserDropdownOpen = false;
  this.isCrearDropdownOpen = false;

  
}

toggleUserDropdown() {
  this.isUserDropdownOpen = !this.isUserDropdownOpen;
  this.isNotiDropdownOpen = false;
  this.isCrearDropdownOpen = false;
}

toggleCrearDropdown() {
  this.isCrearDropdownOpen = !this.isCrearDropdownOpen;
  this.isUserDropdownOpen = false;
  this.isNotiDropdownOpen = false;
}

  irLive() {
    this.toggleCrearDropdown();
    window.open(this.serverIp + '3001/#/crearStream', '_blank');
  }

  irSubirVideo() {
    this.toggleCrearDropdown();
    window.open(this.serverIp + '3001/#/subirVideo', '_blank');
  }



obtenerIconoNotificaciones(): string {
  if (this.contadorNotificaciones === 0) return 'notifications_none';
  if (this.isNotiDropdownOpen) return 'notifications_active';
  return 'notifications';
}


getNombreUsuario(n: Notificacion): string {
  switch (n.referencia_tipo) {
    case 'new_video':
      return n.nombre_subidor || 'Alguien';
    case 'new_comment':
    case 'new_reply':
      return n.nombre_comentador || 'Alguien';
    default:
      return n.nombre_comentador || n.nombre_subidor || 'Alguien';
  }
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  const target = event.target as HTMLElement;

  // SOLO cierra si el click está fuera de cualquier dropdown
  const clickedInside = target.closest('.dropdown');
  
  if (!clickedInside) {
    this.isCrearDropdownOpen = false;
    this.isUserDropdownOpen = false;
    this.isNotiDropdownOpen = false;
  }

  // Cerrar historial de búsqueda
  if (!target.closest('.search-wrapper') && !target.closest('.historial-dropdown')) {
    this.historialFiltrado = [];
  }
}


}