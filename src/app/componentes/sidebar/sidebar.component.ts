import { Component, OnInit, OnDestroy, Input, HostBinding  } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { StatusService } from '../../servicios/status.service';
import { Subscription } from 'rxjs';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  @Input() collapsed: boolean = false; 

  
  usuarioConCanal: any; 
  idCanal: number | null = null;
  canales: any[] = []; 
  userId: any;
  isLoading: boolean = false; 
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;


  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private usuarioGlobal: UsuarioGlobalService,
    private suscripcionesService: SuscripcionesService,
    public status: StatusService
  ) {}



  @HostBinding('class.collapsed') get isCollapsed() {
    return this.collapsed;
  }

  ngOnInit() {
    this.obtenerUsuario();

    this.usuarioGlobal.usuarioConCanal$.subscribe(data => this.usuarioConCanal = data);
    this.usuarioGlobal.idCanal$.subscribe(id => this.idCanal = id);
    this.usuarioGlobal.canalesSuscritos$.subscribe(list => this.canales = list);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  

  obtenerUsuario(): void {
    this.subscriptions.add(
      this.authService.usuario$.subscribe(res => {
        this.userId = res ? res.id : null;
      })
    );

    this.subscriptions.add(
      this.authService.mostrarUserLogueado().subscribe()
    );
  }

  reloadPage(event: Event) {
    event.preventDefault();  
    const target = event.currentTarget as HTMLAnchorElement;
    window.location.href = target.href;
  }

 
}