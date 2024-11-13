import { Component, OnInit} from '@angular/core';
import { CanalService } from '../../servicios/canal.service';
import { ActivatedRoute } from '@angular/router';
import { SuscripcionesService } from '../../servicios/suscripciones.service';
import { AuthService } from '../../servicios/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalReportarUsuarioComponent } from '../modal-reportar-usuario/modal-reportar-usuario.component';

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
  cargando: boolean = true;

  videos:any;
  canalNombre:any
  userId:any;
  numeroDeSuscriptores:any;


  ngOnInit() {
    this.canalId = this.route.snapshot.params['id'];
    this.obtenerCanal();
    this.listarNumeroDeSuscriptores(); 
    this.obtenerUsuario();

  }
  constructor(private canalService: CanalService, 
              private route: ActivatedRoute,
              private authService:AuthService,
              private suscripcionService: SuscripcionesService,
              public dialog: MatDialog,
  ){}

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      if (this.usuario) { 
        this.userId = this.usuario.id;
        this.verificarSuscripcion();
      } 
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }

  obtenerCanal() {
    this.canalService.listarVideosDeCanal(this.canalId).subscribe(
      (res: any) => {
        console.log('Datos del canal:', res); 

        if (res.length > 0) {
          this.canal = res[0].canal;
          this.canalNombre = this.canal.nombre;
          this.usuario = this.canal.user;  
          this.videos = res.map((videoData: any) => {
            return {
              ...videoData,
              duracionFormateada: this.convertirDuracion(videoData.duracion)
            };
          });

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

  openReportModal() {
    const dialogRef = this.dialog.open(ModalReportarUsuarioComponent, {
      width: '400px',
      data: {
        id_reportado: this.canal.user_id , 
        id_reportante: this.usuario.id 
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.handleReportSubmitted(response);
      }
    });
  }

  handleReportSubmitted(response: any) {
    console.log('Reporte enviado exitosamente:', response);
    this.dialog.closeAll(); 
  }

  convertirDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    return `${minutos}:${segundosFormateados}`;
  }

  toggleSuscripcion(): void {
    const action = this.suscrito === 'suscrito' ? this.anularSuscripcion.bind(this) : this.suscribirse.bind(this);
    action();
  }

  suscribirse(): void {
    this.suscripcionService.suscribirse(this.usuario.id, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción exitosa';
        this.suscrito = 'suscrito'; 
      },
      error => this.handleError(error)
    );
  }

  anularSuscripcion(): void {
    this.suscripcionService.anularSuscripcion(this.usuario.id, this.canalId).subscribe(
      () => {
        this.mensaje = 'Suscripción anulada';
        this.suscrito = 'desuscrito'; 
      },
      error => this.handleError(error)
    );
  }

  verificarSuscripcion(): void {
    this.suscripcionService.verificarSuscripcion(this.usuario.id, this.canalId).subscribe(
      response => {
        this.suscrito = response.estado;
        console.log(response.estado)
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
