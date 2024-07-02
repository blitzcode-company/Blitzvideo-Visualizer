import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comentario } from '../../clases/comentario';
import { ComentariosService } from '../../servicios/comentarios.service';

@Component({
  selector: 'app-contenido-de-comentarios',
  templateUrl: './contenido-de-comentarios.component.html',
  styleUrl: './contenido-de-comentarios.component.css'
})
export class ContenidoDeComentariosComponent implements OnInit{

  @Input() comentario!: Comentario;
  @Input() videoId: any;
  @Input() usuario: any;
  @Output() nuevoComentario = new EventEmitter<void>();

  selectedComentarioId: number | null = null;
  respuestaComentario: any = {
    usuario_id: '',
    mensaje: ''
  };

  constructor(private comentariosService: ComentariosService) {}

  ngOnInit(): void {}

  toggleResponder(comentario: Comentario): void {
    this.selectedComentarioId = comentario.id ?? null;
    this.respuestaComentario.mensaje = `@${comentario.user?.name} `;
  }

  enviarRespuesta(): void {
    if (this.selectedComentarioId !== null) {
      this.respuestaComentario.video_id = this.videoId;
      this.respuestaComentario.usuario_id = this.usuario.id;
      this.respuestaComentario.respuesta_id = this.selectedComentarioId;

      this.comentariosService.responderComentario(this.selectedComentarioId, this.respuestaComentario).subscribe(() => {
        this.nuevoComentario.emit();
        this.respuestaComentario.mensaje = '';
        this.selectedComentarioId = null;
      }, error => {
        console.error('Error al responder comentario:', error);
      });
    }
  }

  toggleRespuestas(comentario: Comentario): void {
    comentario.mostrarRespuestas = !comentario.mostrarRespuestas;
  }
}

