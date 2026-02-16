import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';
import { SuscripcionesService } from './suscripciones.service';


@Injectable({
  providedIn: 'root'
})
export class UsuarioGlobalService {
  private usuarioSubject = new BehaviorSubject<any>(null);
  usuario$ = this.usuarioSubject.asObservable();

  private usuarioConCanalSubject = new BehaviorSubject<any>(null);
  usuarioConCanal$ = this.usuarioConCanalSubject.asObservable();

  private idCanalSubject = new BehaviorSubject<number | null>(null);
  idCanal$ = this.idCanalSubject.asObservable();

  private canalesSuscritosSubject = new BehaviorSubject<any[]>([]);
  canalesSuscritos$ = this.canalesSuscritosSubject.asObservable();

  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();
  
  constructor(
    private authService: AuthService,
    private suscripcionesService: SuscripcionesService
  ) {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.sidebarCollapsedSubject.next(JSON.parse(savedState));
    }
    this.inicializarUsuario();
  }

  toggleSidebar() {
    const newState = !this.sidebarCollapsedSubject.value;
    this.sidebarCollapsedSubject.next(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  }

  setSidebarVisible(visible: boolean) {
    this.sidebarCollapsedSubject.next(visible);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(visible));
  }
  

  private inicializarUsuario() {
    this.authService.usuario$.subscribe(usuario => {
      this.usuarioSubject.next(usuario);

      if (usuario) {
        this.cargarCanal(usuario.id);
        this.cargarSuscripciones(usuario.id);
      } else {
        this.usuarioConCanalSubject.next(null);
        this.idCanalSubject.next(null);
        this.canalesSuscritosSubject.next([]);
      }
    });
  }

  private cargarCanal(userId: number) {
    this.authService.obtenerCanalDelUsuario(userId).subscribe({
      next: (canal: any) => {
        this.usuarioConCanalSubject.next(canal || {});
        this.idCanalSubject.next(canal?.canales?.id || null);
      },
      error: () => {
        this.usuarioConCanalSubject.next({});
        this.idCanalSubject.next(null);
      }
    });
  }

  private cargarSuscripciones(userId: number) {
    this.suscripcionesService.listarSuscripciones(userId).subscribe({
      next: suscripciones => this.canalesSuscritosSubject.next(suscripciones || []),
      error: () => this.canalesSuscritosSubject.next([])
    });
  }


}
