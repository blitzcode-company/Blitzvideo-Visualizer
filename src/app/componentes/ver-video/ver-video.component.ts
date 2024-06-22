import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { VideosService } from '../../servicios/videos.service';
import { ComentariosService } from '../../servicios/comentarios.service';
import { ActivatedRoute } from '@angular/router';
import { Videos } from '../../clases/videos';
import { AuthService } from '../../servicios/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { Comentario } from '../../clases/comentario';

@Component({
  selector: 'app-ver-video',
  templateUrl: './ver-video.component.html',
  styleUrl: './ver-video.component.css'
})
export class VerVideoComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef = {} as ElementRef;
  @ViewChild('comentariosContainer') comentariosContainer!: ElementRef | undefined;


  id: any;
  videos = new Videos();
  video: any;
  comentario: any;
  comentarios: Comentario[] = [];
  usuario: any;
  nuevoComentarioMensaje: any;
  comentarioAResponder: Comentario | null = null;
  respuestaMensaje: { [key: string]: string } = {};



  constructor(private route:ActivatedRoute, 
              private fb: FormBuilder,
              private videoService: VideosService, 
              private comentariosService: ComentariosService, 
              private authService: AuthService,
              
              ) 
              {

              }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id']
    this.mostrarVideo();
    this.traerComentarios();
    this.obtenerUsuario();
    this.crearComentario();
    this.crearRespuesta(this.comentario);
  }

  obtenerUsuario() {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      this.crearComentario();
    });

    this.authService.mostrarUserLogueado().subscribe();
  }

  mostrarVideo() {
    this.videoService.obtenerInformacionVideo(this.id).subscribe(res => {
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

      console.log(this.video);
    });

    
  }

  traerComentarios(): void {
    this.comentariosService.traerComentariosDelVideo(this.id)
      .subscribe(res => {
        this.comentarios = res;
        console.log(this.comentarios);
        this.crearComentario();
      });
  }


  crearComentario(): void {
    if (!this.nuevoComentarioMensaje || !this.nuevoComentarioMensaje.trim()) {
      return; // No enviar comentarios vacíos
    }

    const usuarioFoto = this.usuario.foto;
    const usuarioNombre = this.usuario.name;

    const nuevoComentarioHTML: string = `
    <div style="display: flex;">
      <img src="${usuarioFoto}" style="width: 50px; border-radius: 100px;" alt="">
      <p>${usuarioNombre}</p>
    </div>
    
    <p>${this.nuevoComentarioMensaje}</p>
  `;
    const comentariosContainer: HTMLElement | null = document.getElementById('comentarios');
    if (comentariosContainer) {
      comentariosContainer.innerHTML += nuevoComentarioHTML;
    }
    const nuevoComentario: Comentario = {
      video_id: this.id,
      usuario_id: this.usuario.id,
      respuesta_id: null, 
      mensaje: this.nuevoComentarioMensaje
    };

    this.comentariosService.crearComentario(this.id, nuevoComentario)
      .subscribe(res => {
        console.log('Se ha creado el comentario con éxito', res);
        this.comentarios.push(res);
        this.nuevoComentarioMensaje = '';
        if (this.comentariosContainer && this.comentariosContainer.nativeElement) {
          this.comentariosContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }
      },
      error => {
        console.log('Error al crear comentario', error);
      });
  }


  crearRespuesta(comentario: Comentario): void {
    console.log('Comentario a responder:', comentario);

    this.comentarioAResponder = comentario;
    if (typeof comentario.id === 'undefined') {
        console.error('ID de comentario no definido');
        return;
    }
    const mensaje = this.respuestaMensaje && this.respuestaMensaje[comentario.id];
    console.log('Mensaje:', mensaje);
    if (!mensaje || !mensaje.trim()) {
        console.error('Mensaje vacío');
        return;
    }
    const usuarioId = this.usuario ? this.usuario.id : null;
    console.log('ID de usuario:', usuarioId);
    if (!usuarioId) {
        console.error('ID de usuario no encontrado');
        return;
    }
    const nuevaRespuesta: Comentario = {
        video_id: this.id,
        usuario_id: usuarioId,
        respuesta_id: comentario.id,
        mensaje: mensaje
    };

    console.log('Nueva respuesta:', nuevaRespuesta);
  
    this.comentariosService.responderComentario(comentario.id, nuevaRespuesta)
        .subscribe(res => {
            console.log('Respuesta exitosa:', res);
            comentario.respuestas_hijas = comentario.respuestas_hijas || [];
            comentario.respuestas_hijas.push(res);
            if (typeof comentario.id !== 'undefined') {
                this.respuestaMensaje[comentario.id] = '';
            }
            if (this.comentariosContainer && this.comentariosContainer.nativeElement) {
                this.comentariosContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
            }
        },
        error => {
            console.error('Error al crear respuesta:', error);
        });
}
  
  
  
toggleResponder(comentario: Comentario): void {
  console.log('Comentario a responder:', comentario);
  if (this.comentarioAResponder === comentario) {
      this.comentarioAResponder = null; 
  } else {
      this.comentarioAResponder = comentario; 
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
  
  onSubmit() {
      console.log('Formulario enviado', this.nuevoComentarioMensaje);
      this.crearComentario();
      
    }

    onSubmitComentario() {
      if (this.comentarioAResponder !== null) {
        console.log('Comentario a responder en onSubmit:', this.comentarioAResponder);
        console.log('Respuesta mensaje:', this.respuestaMensaje);
        this.crearRespuesta(this.comentarioAResponder);
    } else {
        console.error('No hay un comentario para responder');
    }
    }
  }


