import { Component, Input, OnInit } from '@angular/core';
import { Comentario } from '../../clases/comentario';
import { ComentariosService } from '../../servicios/comentarios.service';
import { StatusService } from '../../servicios/status.service';
import { AuthService } from '../../servicios/auth.service';
import moment from 'moment';

@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css']
})
export class ComentariosComponent implements OnInit {
  @Input() videoId: any;
  @Input() usuario: any;
  @Input() comentarios: Comentario[] = [];
  nuevoComentario: any = {
    usuario_id: '',
    mensaje: ''
  };
  selectedComentarioId: number | null = null;
  respuestaComentario: any = {
    usuario_id: '',
    mensaje: ''
  };
  respondingTo: string = '';

  constructor(private comentariosService: ComentariosService, public status: StatusService, private authService: AuthService) {}

  ngOnInit(): void {
    this.traerComentarios();
  }

  traerComentarios(): void {
    this.comentariosService.traerComentariosDelVideo(this.videoId).subscribe(
      (res: any[]) => { 
        this.comentarios = this.organizarComentarios(res);
        console.log(this.comentarios);
      },
      (error) => {
        console.error('Error al obtener comentarios:', error);
      }
    );
  }

  crearComentario(): void {
    if (!this.nuevoComentario.mensaje.trim()) {
      console.error('El campo mensaje no puede estar vacío.');
      return;
    }

    if (!this.usuario || !this.usuario.id) {
      window.location.href = 'http://localhost:3002/#/';
    }

    this.nuevoComentario.usuario_id = this.usuario.id; 

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
    this.respondingTo = this.comentarios.find(c => c.id === idComentario)?.user?.name || '';
    this.respuestaComentario.mensaje = `@${this.respondingTo} `;
  }

  enviarRespuesta(): void {
    if (this.selectedComentarioId !== null) {
      this.respuestaComentario.video_id = this.videoId;
      this.respuestaComentario.usuario_id = this.usuario.id;
      this.respuestaComentario.respuesta_id = this.selectedComentarioId;

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
    const comentarioMap = new Map<number, Comentario>();
    const comentariosRaiz: Comentario[] = [];

    comentarios.forEach(comentario => {
      comentario.respuestas = comentario.respuestas || [];
      comentarioMap.set(comentario.id!, comentario);
      comentario.created_at = moment(comentario.created_at).fromNow();  // Formatear fecha
    });

    comentarios.forEach(comentario => {
      if (comentario.respuesta_id) {
        const padre = comentarioMap.get(comentario.respuesta_id);
        padre?.respuestas?.push(comentario);
      } else {
        comentariosRaiz.push(comentario);
      }
    });

    return comentariosRaiz;
  }
}
