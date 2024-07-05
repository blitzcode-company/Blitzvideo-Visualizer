import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideosService } from '../../servicios/videos.service';
import { AuthService } from '../../servicios/auth.service';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../servicios/puntuaciones.service';
import { StatusService } from '../../servicios/status.service';
import { Observable } from 'rxjs';
import { Videos } from '../../clases/videos';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ver-video',
  templateUrl: './ver-video.component.html',
  styleUrls: ['./ver-video.component.css']
})
export class VerVideoComponent implements OnInit {
  puntuacionSeleccionada: number | null = null;
  videoId: any;
  videos = new Videos();
  video: any;
  comentario: any;
  usuario: any;
  visitaRealizada: boolean = false;
  visitaRealizadaInvitado: boolean = false;
  public loggedIn: boolean = false;
  puntuacionActual: any = {};
  valorPuntuacion: number | null = null; 
  serverIp = environment.serverIp

  constructor(
    private route: ActivatedRoute,
    private videoService: VideosService,
    private authService: AuthService,
    private titleService: Title,
    private puntuarService: PuntuacionesService,
    public status: StatusService
  ) {}

  ngOnInit(): void {
    this.videoId = this.route.snapshot.params['id'];
    this.mostrarVideo();
    this.obtenerUsuario();
    this.visitar();
  }

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      console.log('Usuario obtenido:', this.usuario);
      this.obtenerPuntuacionActual();  
    });

    this.authService.mostrarUserLogueado().subscribe();
  }

  mostrarVideo(): void {
    this.videoService.obtenerInformacionVideo(this.videoId).subscribe(res => {
      this.video = res;
      if (this.video && this.video.created_at) {
        const fecha = new Date(this.video.created_at);
        if (!isNaN(fecha.getTime())) {
          this.video.created_at = this.convertirFechaALineaDeTexto(fecha);
        }
      }

      if (this.video && this.video.titulo) {
        this.titleService.setTitle(this.video.titulo + ' - BlitzVideo');
      }
      console.log(this.video);
    });
  }

  puntuar(valora: number): void {
    if (!this.usuario || !this.usuario.id) {
      window.location.href = `${this.serverIp}:3002/#/`; 
    }

    if (this.puntuacionSeleccionada === valora) {
      this.eliminarPuntuacion();
    } else {
      this.valorPuntuacion = valora;
      this.puntuacionSeleccionada = valora;  
      this.crearActualizarPuntuacion();  
    }
  }

  obtenerPuntuacionActual(): void {
    this.puntuarService.obtenerPuntuacionActual(this.videoId, this.usuario.id).subscribe(
      response => {
        this.puntuacionActual = response;
        this.puntuacionSeleccionada = this.puntuacionActual.valora; 
        console.log('Puntuación actual:', this.puntuacionActual);
        console.log('Puntuación seleccionada:', this.puntuacionSeleccionada);
      },
      error => {
        if (error.status === 404) {
          console.warn('El usuario no ha dado una valoración para este video.');
          this.puntuacionSeleccionada = null; 
        } else {
          console.error('Error al obtener la puntuación actual:', error);
        }
      }
    );
  }

  eliminarPuntuacion(): void {
    if (this.valorPuntuacion === null) {
      console.error('No se ha seleccionado un valor de puntuación para eliminar.');
      return;
    }

    this.puntuarService.quitarPuntuacion(this.videoId, this.usuario.id, this.valorPuntuacion).subscribe(
      response => {
        console.log(response.message);
        this.puntuacionActual = null;
        this.valorPuntuacion = null; 
        this.puntuacionSeleccionada = null;  
      },
      error => {
        console.error('Error al eliminar la puntuación:', error.error.message);
      }
    );
  }

  crearActualizarPuntuacion(): void {
    if (this.valorPuntuacion === null) {
      console.error('No se ha seleccionado un valor de puntuación para crear o actualizar.');
      return;
    }

    this.puntuarService.puntuar(this.videoId, this.usuario.id, this.valorPuntuacion).subscribe(
      response => {
        console.log(response.message);
        this.obtenerPuntuacionActual();  
      },
      error => {
        console.error('Error al crear o actualizar la puntuación:', error.error.message);
      }
    );
  }

  visitar(): void {
    const esInvitado = !this.usuario;
    if ((esInvitado && !this.visitaRealizadaInvitado) || (!esInvitado && !this.visitaRealizada)) {
      let visitaObservable: Observable<any>;

      if (esInvitado) {
        visitaObservable = this.videoService.contarVisitaInvitado(this.videoId);
        this.visitaRealizadaInvitado = true;
      } else {
        if (this.usuario && this.usuario.id) {
          visitaObservable = this.videoService.contarVisita(this.videoId, this.usuario.id);
          this.visitaRealizada = true;
        } else {
          console.error('Usuario no está autenticado o no tiene un ID válido.');
          return;
        }
      }

      visitaObservable.subscribe(
        response => {
          console.log(response.message);
        },
        error => {
          console.error('Error al contar visita:', error);
        }
      );
    }
  }

  convertirFechaALineaDeTexto(fecha: Date): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia} de ${mes} de ${año}`;
  }
}
