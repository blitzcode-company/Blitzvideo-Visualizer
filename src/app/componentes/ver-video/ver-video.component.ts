import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { ComentariosService } from '../../servicios/comentarios.service';
import { ActivatedRoute } from '@angular/router';
import { Videos } from '../../clases/videos';
import { AuthService } from '../../servicios/auth.service';
import { Comentario } from '../../clases/comentario';
import { Title } from '@angular/platform-browser';
import { PuntuacionesService } from '../../servicios/puntuaciones.service';
import { StatusService } from '../../servicios/status.service';


@Component({
  selector: 'app-ver-video',
  templateUrl: './ver-video.component.html',
  styleUrl: './ver-video.component.css'
})
export class VerVideoComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef = {} as ElementRef;
  @ViewChild('comentariosContainer') comentariosContainer!: ElementRef | undefined;
 

  videoId: any;
  videos = new Videos();
  video: any;
  comentario: any;
  comentarios: Comentario[] = [];
  usuario: any;
  nuevoComentario: any = {
    usuario_id: '',
    mensaje: ''
  };
  respuestaComentario: any = {
    usuario_id: '',
    mensaje: ''
  };
  selectedComentarioId: number | null = null;
  respondingTo: string = ''; 
  visitaRealizada: boolean = false;
  visitaRealizadaInvitado: boolean = false;
  public loggedIn: boolean=false;



  constructor(private route:ActivatedRoute, 
              private videoService: VideosService, 
              private comentariosService: ComentariosService, 
              private authService: AuthService,
              private titleService: Title,
              private puntuarService: PuntuacionesService,
              public status:StatusService
              ) 
              {

              }

  ngOnInit(): void {
    this.videoId = this.route.snapshot.params['id']
    this.mostrarVideo();
    this.traerComentarios();
    this.obtenerUsuario();
    this.crearComentario();
    this.visita();
    this.visitaInvitado()
  }

  

  obtenerUsuario() {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      this.crearComentario();
      this.visita();
    });

    this.authService.mostrarUserLogueado().subscribe();
  }

  mostrarVideo() {
    this.videoService.obtenerInformacionVideo(this.videoId).subscribe(res => {
      this.videos = res;
      this.video = this.videos;
  
      if (this.video && this.video.created_at) {
        const fecha = new Date(this.video.created_at);
        if (!isNaN(fecha.getTime())) {
          this.video.created_at = this.convertirFechaALineaDeTexto(fecha);
        } 
      }
  
      setTimeout(() => {
        if (this.videoPlayer && this.videoPlayer.nativeElement) {
          this.videoPlayer.nativeElement.load();
        }
      });

      if (this.video && this.video.titulo) {
        this.titleService.setTitle(this.video.titulo + ' - BlitzVideo');
      }

      console.log(this.video);
    });

    
  }

  traerComentarios(): void {
    this.comentariosService.traerComentariosDelVideo(this.videoId).subscribe(res => {
      this.comentarios = this.organizarComentarios(res); // Organizar los comentarios al recibirlos
      console.log(this.comentarios)
    });
  }

  crearComentario(): void {
    if (!this.nuevoComentario.mensaje.trim()) {
      console.error('El campo mensaje no puede estar vacío.');
      return;
    }

    this.nuevoComentario.usuario_id = this.usuario.id;
    const usuarioFoto = this.usuario.foto;
    const usuarioNombre = this.usuario.name;
  
    const nuevoComentarioHTML: string = `
      <div style="display: flex;">
        <img src="${usuarioFoto}" style="width: 50px; border-radius: 100px;" alt="">
        <p>${usuarioNombre}</p>
      </div>
      
      <p>${this.nuevoComentario.mensaje}</p>
    `;

    const comentariosContainer: HTMLElement | null = document.getElementById('comentarios');
    if (comentariosContainer) {
      comentariosContainer.innerHTML += nuevoComentarioHTML;
    }
    
    this.comentariosService.crearComentario(this.videoId, this.nuevoComentario).subscribe(() => {
      this.traerComentarios();
     
      this.nuevoComentario.mensaje = '';
      this.selectedComentarioId = null;
    }, error => {
    
      console.error('Error al crear comentario:', error);
    });
  }
  

  responderComentario(idComentario: number) {
    this.selectedComentarioId = idComentario;
  }

  enviarRespuesta(): void {
    if (this.selectedComentarioId !== null) {
      this.respuestaComentario.video_id = this.videoId;
      this.respuestaComentario.usuario_id = this.usuario.id;

      this.comentariosService.responderComentario(this.selectedComentarioId, this.respuestaComentario).subscribe(() => {
        this.traerComentarios();
        this.respuestaComentario.mensaje = '';
        this.selectedComentarioId = null;
      }, error => {
        console.error('Error al responder comentario:', error);
      });
    }
  }

 toggleResponder(comentario: Comentario): void {
    this.selectedComentarioId = comentario.id ?? null;
    this.respondingTo = comentario.user?.name || '';
    this.respuestaComentario.mensaje = `@${this.respondingTo} `;
  }


  toggleRespuestas(comentario: Comentario): void {
    comentario.mostrarRespuestas = !comentario.mostrarRespuestas;
  }


  organizarComentarios(comentarios: Comentario[]): Comentario[] {
    const mapaComentarios: { [key: number]: Comentario } = {};
    const comentariosAnidados: Comentario[] = [];

    comentarios.forEach(comentario => {
      comentario.respuestas = []; // Inicializamos el array de respuestas para cada comentario
      if (comentario.id !== undefined) {
        mapaComentarios[comentario.id] = comentario;
      }    
    });

    comentarios.forEach(comentario => {
      if (comentario.respuesta_id && mapaComentarios[comentario.respuesta_id]) {
        mapaComentarios[comentario.respuesta_id].respuestas!.push(comentario);
      } else {
        comentariosAnidados.push(comentario);
      }
    });

    return comentariosAnidados;
  }

  puntuar(valora: number): void {
    this.puntuarService.puntuar(this.videoId, this.usuario.id, valora).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error.error.message);
    });
  }

  editarPuntuacion(idPuntua: number, valora: number): void {
    this.puntuarService.editarPuntuacion(idPuntua, valora).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error.error.message);
    });
  }

  bajaLogicaPuntuacion(idPuntua: number): void {
    this.puntuarService.quitarPuntuacion(idPuntua).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error.error.message);
    });
  }

  visita(): void {
    if (!this.visitaRealizada) {
      this.videoService.contarVisita(this.videoId, this.usuario.id).subscribe(
        response => {
          console.log(response.message); 
        }, 
        error => {
          console.error(error.error.message); 
        }
      );
      this.visitaRealizada = true; 
    }
  }

  visitaInvitado(): void {
    if (!this.visitaRealizadaInvitado) {
      this.videoService.contarVisitaInvitado(this.videoId).subscribe(
        response => {
          console.log(response.message); 
        }, 
        error => {
          console.error(error.error.message); 
        }
      );
      this.visitaRealizadaInvitado = true; 
    }
  }
  


  convertirFechaALineaDeTexto(fecha: Date): string {
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre"
    ];
  
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
  
    const lineaDeTexto = `${dia} de ${mes} de ${año}`;
    return lineaDeTexto;
  }
  
 

    
  }


