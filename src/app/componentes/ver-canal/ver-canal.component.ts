import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanalService } from '../../servicios/canal.service';
import { AuthService } from '../../servicios/auth.service';
import { Canal } from '../../clases/canal';
import { Videos } from '../../clases/videos';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SuscripcionesService } from '../../servicios/suscripciones.service';



@Component({
  selector: 'app-ver-canal',
  templateUrl: './ver-canal.component.html',
  styleUrls: ['./ver-canal.component.css']
})
export class VerCanalComponent implements OnInit {
  
  usuario:any;
  
  canal:any;
  canalId:any;
  canalNombre:any
  userId:any;
  mensaje: string = '';
  videos: Videos[] = [];
  public suscrito: boolean = false;
  duracionVideo: any;

  ultimoVideo:any;
  videosGeneral:any
  serverIp = environment.serverIp;

  ngOnInit() {
    this.canalId = this.route.snapshot.params['id'];
    this.obtenerCanal();
    this.obtenerUsuario();
    this.verificarSuscripcion();

  }
  constructor(private canalService: CanalService,
              private route: ActivatedRoute, 
              private titleService: Title,
              private suscripcionService: SuscripcionesService,
              private authService: AuthService,){}

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      this.userId = this.usuario.id
      this.verificarSuscripcion();

    });

    this.authService.mostrarUserLogueado().subscribe();
  }

  suscribirse(): void {
    this.suscripcionService.suscribirse(this.userId, this.canalId).subscribe(
      response => {
        this.mensaje = 'Suscripción exitosa';
        this.suscrito = true; 
      },
      error => this.handleError(error)
    );
  }

  anularSuscripcion(): void {
    this.suscripcionService.anularSuscripcion(this.userId, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción anulada';
        this.suscrito = false; 
      },
      error => this.handleError(error)
    );
  }

  
  toggleSuscripcion(): void {
    if (this.suscrito) {
      this.anularSuscripcion(); 
    } else {
      this.suscribirse(); 
    }
  }

  verificarSuscripcion(): void {
    this.suscripcionService.verificarSuscripcion(this.userId, this.canalId).subscribe(
      response => {
        this.suscrito = response.suscrito; 
      },
      error => {
        if (error.status === 404) {
          this.suscrito = false; 
          console.warn('El usuario no está suscrito a este canal.');
        } else {
          console.error('Error al verificar la suscripción:', error);
        }
      }
    );
  }
  

  obtenerCanal() {
    this.canalService.listarVideosDeCanal(this.canalId).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.canal = res[0].canal;
          this.canalNombre = this.canal.nombre;
          this.usuario = this.canal.user;
          this.videosGeneral = res;
          this.videos = res.slice(0, 3);
          this.userId = this.canal.user_id;
          duracionFormateada: this.convertirDuracion(this.videosGeneral.duracion)

          this.ultimoVideo = this.videosGeneral.reduce((prev:any, current:any) => (prev.id > current.id) ? prev : current);

          if (this.ultimoVideo) {
            this.ultimoVideo.indice = this.videos.findIndex(videosGeneral => videosGeneral.id === this.ultimoVideo.id) + 1;
          }

          if (this.canal && this.canal.nombre) {
            this.titleService.setTitle(this.canal.nombre + ' - BlitzVideo');
          }
          
          
          console.log(this.canal);
          console.log(this.usuario);
          console.log(this.videos);
          console.log(this.ultimoVideo); 
        } else {
          console.error('No se encontraron videos para este canal');
        }
      },
      error => {
        console.error('Error al obtener el canal:', error);
      }
    );
  }


  convertirDuracion (segundos:number): string {
    const minutos = Math.floor(segundos/ 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`
  }
  private handleError(error: any): void {
    if (error.status === 409) {
      this.mensaje = 'Ya estás suscrito a este canal.';
    } else {
      this.mensaje = error.error.message || 'Ha ocurrido un error inesperado.';
    }
  }


}
