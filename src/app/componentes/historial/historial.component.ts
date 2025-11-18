import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UsuarioGlobalService } from '../../servicios/usuario-global.service';
import { StatusService } from '../../servicios/status.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent implements OnInit {

  usuario: any;
  userId: any;
  loading = true;
  sidebarCollapsed = false;
  sidebarCollapsed$ = this.usuarioGlobal.sidebarCollapsed$;
  isMobile = window.innerWidth <= 768;
  videos: any[] = [];

  constructor(
    private titleService: Title,
    private usuarioGlobal: UsuarioGlobalService,
    private authService: AuthService,
    public status: StatusService,

  ) {}

  ngOnInit(): void {
      this.obtenerUsuario();
      this.titleService.setTitle('Historial de reproduccion - BlitzVideo');

  }

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      if (this.usuario) { 
        this.userId = this.usuario.id;
        this.obtenerHistorial(this.userId)
      } 
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/video-default.png';
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  obtenerHistorial(userId:number) {
    this.loading = true;
    this.authService.obtenerHistorialDelUsuario(userId).subscribe({
      next: (videos) => {
        console.log(videos)
        this.videos = videos;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }






  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  


}
