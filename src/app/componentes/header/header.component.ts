import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from '../../servicios/status.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../servicios/auth.service';
import { Canal } from '../../clases/canal';
import { CanalService } from '../../servicios/canal.service';
import { environment } from '../../../environments/environment';

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
    private canalService: CanalService
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


  obtenerUsuario() {
    this.api.usuario$.subscribe(user => {

      
      this.usuario = user;
      this.obtenerCanal();

    });
    this.api.mostrarUserLogueado().subscribe();
  }

  buscarVideos(): void {
    if (this.nombre.trim()) {
      this.router.navigate(['/buscar', this.nombre]);
    }
  }


  obtenerURLImagen() {
    return this.usuario.foto ? this.usuario.foto : '../../../assets/images/user.png';
  }

  obtenerCanal(): void {
    if (this.usuario && this.usuario.id) {
      this.api.obtenerCanalDelUsuario(this.usuario.id).subscribe(
        (res: any) => {
          this.canal = res;
  
          if (res.canales && res.canales.length > 0) {
            this.canalId = res.canales[0].id;
            this.canalNombre = res.canales[0].nombre;
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
    this.router.navigate(['/']);
    
  }

  redirectToLogin() {
    window.location.href = this.serverIp + '3002/#/';
  }

  isDropdownOpen = false;

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isDropdownOpen = false;
    }
  }



}
