import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { StatusService } from '../../servicios/status.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() usuarioConCanal: any; 
  @Input() idCanal: any; 
  canales: any[] = []; 
  userId: any;
  isLoading: boolean = false; 
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private suscripcionesService: SuscripcionesService,
    public status: StatusService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.authService.usuario$.subscribe(res => {
        this.userId = res ? res.id : null;
        console.log('Sidebar: userId obtenido:', this.userId);
        this.mostrarCanalesSuscritos();
      })
    );

    this.subscriptions.add(
      this.authService.mostrarUserLogueado().subscribe()
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  mostrarCanalesSuscritos() {
    if (this.userId) {
      this.isLoading = true;
      console.log('Sidebar: Cargando suscripciones para userId:', this.userId);
      this.subscriptions.add(
        this.suscripcionesService.listarSuscripciones(this.userId).subscribe({
          next: (suscripciones) => {
            this.canales = suscripciones;
            console.log('Sidebar: Suscripciones cargadas:', this.canales);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Sidebar: Error al cargar suscripciones:', error);
            this.canales = [];
            this.isLoading = false;
          }
        })
      );
    } else {
      console.log('Sidebar: No hay usuario autenticado, limpiando canales');
      this.canales = [];
      this.isLoading = false;
    }
  }
}