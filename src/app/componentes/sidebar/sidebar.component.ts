import { Component, OnInit, OnDestroy, Input, HostBinding, HostListener  } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { StatusService } from '../../servicios/status.service';
import { Subscription } from 'rxjs';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { trigger, style, animate, transition } from '@angular/animations';
import { EtiquetaService } from '../../servicios/etiqueta.service';
import { error } from 'console';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.3s ease-out')
      ])
    ])
  ],
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  @Input() collapsed: boolean = false; 
  @Input() isMobile = false;
  
  usuarioConCanal: any; 
  idCanal: number | null = null;
  canales: any[] = []; 
  userId: any;
  isLoading: boolean = false; 
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  etiquetas: any[] = []; 
  loadingEtiquetas = true;
  canalesPorPagina: number = 5; 
  paginasMostradas: number = 1;
  visibleCanales: any[] = [];  
  showExtra = false;
  canalesOcultos: number = 0;


  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private usuarioGlobal: UsuarioGlobalService,
    private breakpointObserver: BreakpointObserver,
    private suscripcionesService: SuscripcionesService,
    private etiquetasService: EtiquetaService,
    public status: StatusService
  ) {
    this.detectMobile();

  }



  @HostBinding('class.collapsed') get isCollapsed() {
    return this.collapsed;
  }

  ngOnInit() {
    this.obtenerUsuario();
    this.usuarioGlobal.usuarioConCanal$.subscribe(data => this.usuarioConCanal = data);
    this.usuarioGlobal.idCanal$.subscribe(id => this.idCanal = id);
    this.usuarioGlobal.canalesSuscritos$.subscribe(list => { this.canales = list; this.actualizarVisibleCanales();});
    this.obtenerEtiquetas()
    this.updateMobile();

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  @HostListener('window:resize', [])
  updateMobile() {
    this.isMobile = window.innerWidth <= 767;
  }
    
  private detectMobile() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  actualizarVisibleCanales() {
    this.visibleCanales = this.canales.slice(0, this.paginasMostradas * this.canalesPorPagina);
    this.canalesOcultos = this.canales.length - this.visibleCanales.length;
  }

  colapsarTodo() {
    this.paginasMostradas = 1;
    this.actualizarVisibleCanales();
  }


  hayMas(): boolean {
    return this.visibleCanales.length < this.canales.length;
  }
  

 mostrarMas() {
  this.paginasMostradas++;
  this.actualizarVisibleCanales();
  
  setTimeout(() => {
    const ultimoCanal = document.querySelector('.canalItem:last-child');
    ultimoCanal?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }, 150);
}

  obtenerEtiquetas() {
    this.loadingEtiquetas = true;
    this.etiquetasService.listarEtiquetas().subscribe(
      (response: any[]) => {
        this.etiquetas = response;
        this.loadingEtiquetas = false;
      },
      error => {
        console.error('Error al obtener las etiquetas:', error);
        this.loadingEtiquetas = false;
      }
    );
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