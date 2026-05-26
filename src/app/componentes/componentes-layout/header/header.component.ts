import { Component, HostListener, Output, EventEmitter, ElementRef, effect } from '@angular/core';

import { Router } from '@angular/router';
import { StatusService } from '../../../servicios/status.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../servicios/auth.service';
import { Canal } from '../../../clases/canal';
import { CanalService } from '../../../servicios/canal.service';
import { StreamService } from '../../../servicios/stream.service';
import { environment } from '../../../../environments/environment';
import { NotificacionesService } from '../../../servicios/notificaciones.service';
import { Notificacion } from '../../../clases/notificacion';
import { UsuarioGlobalService } from '../../../servicios/usuario-global.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../servicios/theme.service';

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
    public themeService:ThemeService,
    private canalService: CanalService,
    private notificacionesService: NotificacionesService,
    private streamService: StreamService,
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
  isTemaDropdownOpen = false; 
  mostrandoTemas = false;
  mostrandoTemasUsuario = false;
  streamActivo: any = null;

  currentTheme: 'light' | 'dark' | 'auto' = 'auto';
  @Output() toggleSidebar = new EventEmitter<void>();

  onMenuClick() {
    this.usuarioGlobal.toggleSidebar();
  }


  ngOnInit() {
    this.obtenerUsuario();
    this.cargarHistorialBusquedas();
    effect(() => {
      this.currentTheme = this.themeService.temaActual();
    });
  }

  private cargarStreamActivo() {
    if (this.usuario?.id) {
      this.streamService.obtenerStreamActivo(this.usuario.id).subscribe({
        next: (response) => {
          this.streamActivo = response.stream;
        },
        error: (err) => {
          console.error('Error al cargar stream activo:', err);
          this.streamActivo = null;
        }
      });
    }
  }

  private cargarNotificacionesOrdenadas(userId: number) {
    this.notificacionesService.listarNotificaciones(userId).subscribe(res => {
      const lista = res.notificaciones || [];
      
      this.notificaciones = lista
        .slice() 
        .sort((a: any, b: any) => 
          new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        );
      
      this.contadorNotificaciones = this.notificaciones.filter(n => n.leido === 0).length;
    });
  }
  cambiarTema(tema: 'light' | 'dark' | 'auto') {
    this.themeService.setTema(tema);
    this.isTemaDropdownOpen = false;
    this.mostrandoTemas = false;
    this.mostrandoTemasUsuario = false;
    this.isUserDropdownOpen = false;
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
      this.cargarStreamActivo();
  
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

toggleNotiDropdown() {
  this.isNotiDropdownOpen = !this.isNotiDropdownOpen;
  this.isUserDropdownOpen = false;
  this.isCrearDropdownOpen = false;
}

toggleTemaDropdown() {
  this.isTemaDropdownOpen = !this.isTemaDropdownOpen;
  this.mostrandoTemas = false;
}

mostrarTemasView() {
  this.mostrandoTemas = true;
}

volverAlMenu() {
  this.mostrandoTemas = false;
}

toggleUserDropdown() {
  this.isUserDropdownOpen = !this.isUserDropdownOpen;
  this.isNotiDropdownOpen = false;
  this.isCrearDropdownOpen = false;
  this.mostrandoTemasUsuario = false;
}

mostrarTemasUsuarioView() {
  this.mostrandoTemasUsuario = true;
}

volverAlMenuUsuario() {
  this.mostrandoTemasUsuario = false;
}

toggleCrearDropdown() {
  this.isCrearDropdownOpen = !this.isCrearDropdownOpen;
  this.isUserDropdownOpen = false;
  this.isNotiDropdownOpen = false;
}

  irLive() {
    this.toggleCrearDropdown();
    
    if (this.streamActivo && this.streamActivo.id) {
      window.open(this.serverIp + '3001/#/monitorear-stream/' + this.streamActivo.id, '_blank');
    } else {
      window.open(this.serverIp + '3001/#/crearStream', '_blank');
    }
  }

  irSubirVideo() {
    this.toggleCrearDropdown();
    window.open(this.serverIp + '3001/#/subirVideo', '_blank');
  }

@HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  const target = event.target as HTMLElement;

  const clickedInside = target.closest('.dropdown');
  
  if (!clickedInside) {
    this.isCrearDropdownOpen = false;
    this.isUserDropdownOpen = false;
    this.isNotiDropdownOpen = false;
  }

  if (!target.closest('.search-wrapper') && !target.closest('.historial-dropdown')) {
    this.historialFiltrado = [];
  }
if (!target.closest('.dropdown')) {
    this.isTemaDropdownOpen = false;
  }

}


}