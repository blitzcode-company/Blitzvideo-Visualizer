import { Component, Input, OnInit } from '@angular/core';
import { Comentario } from '../../clases/comentario';
import { ComentariosService } from '../../servicios/comentarios.service';
import { StatusService } from '../../servicios/status.service';
import { UsuarioRequeridoComponent } from '../../Modales/usuario-requerido/usuario-requerido.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css']
})
export class ComentariosComponent implements OnInit {
  @Input() videoId: any;
  @Input() usuario: any;
  comentarios: Comentario[] = [];
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
  public loggedIn: boolean=false;

  constructor(private comentariosService: ComentariosService, public status: StatusService, public dialog: MatDialog 
  ) {}

  ngOnInit(): void {
    this.traerComentarios();

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

    if (!this.usuario || !this.usuario.id) {
      window.location.href = 'http://localhost:3002/#/'; 
  
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

  



}
