import { Component, OnInit} from '@angular/core';
import { CanalService } from '../../servicios/canal.service';
import { ActivatedRoute } from '@angular/router';
import { SuscripcionesService } from '../../servicios/suscripciones.service';

@Component({
  selector: 'app-videos-del-canal',
  templateUrl: './videos-del-canal.component.html',
  styleUrl: './videos-del-canal.component.css'
})
export class VideosDelCanalComponent {

  usuario:any;
  canal:any;
  canalId:any;
  mensaje: string = '';
  public suscrito: string = '';

  videos:any;
  canalNombre:any
  userId:any;
  numeroDeSuscriptores:any;


  ngOnInit() {
    this.canalId = this.route.snapshot.params['id'];
    this.obtenerCanal();
    this.listarNumeroDeSuscriptores(); 


  }
  constructor(private canalService: CanalService, 
              private route: ActivatedRoute,
              private suscripcionService: SuscripcionesService
  ){}

  obtenerCanal() {
    this.canalService.listarVideosDeCanal(this.canalId).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.canal = res[0].canal;
          this.canalNombre = this.canal.nombre;
          this.usuario = this.canal.user;  
          this.videos = res; 
          this.userId = this.canal.user_id;  
          console.log(this.canal);
          console.log(this.usuario);
          console.log(this.videos);
        } else {
          console.error('No se encontraron videos para este canal');
        }
      },
      error => {
        console.error('Error al obtener el canal:', error);
      }
    );
  }

  toggleSuscripcion(): void {
    const action = this.suscrito === 'suscrito' ? this.anularSuscripcion.bind(this) : this.suscribirse.bind(this);
    action();
  }

  suscribirse(): void {
    this.suscripcionService.suscribirse(this.userId, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción exitosa';
        this.suscrito = 'suscrito'; 
      },
      error => this.handleError(error)
    );
  }

  anularSuscripcion(): void {
    this.suscripcionService.anularSuscripcion(this.userId, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción anulada';
        this.suscrito = 'desuscrito'; 
      },
      error => this.handleError(error)
    );
  }

  verificarSuscripcion(): void {
    this.suscripcionService.verificarSuscripcion(this.userId, this.canalId).subscribe(
      response => {
        this.suscrito = response.estado;
      },
      error => {
        if (error.status === 404) {
          console.warn('No se encontró la suscripción.');
          this.suscrito = 'desuscrito';
        } else {
          console.error('Error al verificar la suscripción:', error);
        }
      }
    );
  }


  listarNumeroDeSuscriptores() {
    this.suscripcionService.listarNumeroDeSuscriptores(this.canalId).subscribe(res => {
      this.numeroDeSuscriptores = res;
    });
  }

  private handleError(error: any): void {
    this.mensaje = error.error.message || 'Ha ocurrido un error inesperado.';
  }

}
