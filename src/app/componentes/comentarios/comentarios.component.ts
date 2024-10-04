import { Component, Input, OnInit } from '@angular/core';
import { Comentario } from '../../clases/comentario';
import { ComentariosService } from '../../servicios/comentarios.service';
import { StatusService } from '../../servicios/status.service';
import { AuthService } from '../../servicios/auth.service';
import moment from 'moment';
import { environment } from '../../../environments/environment';

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
  editingComentarioId: number | null = null;  
  editingComentarioMensaje: string = '';  
  serverIp = environment.serverIp

  constructor(private comentariosService: ComentariosService, public status: StatusService, private authService: AuthService) {}

  ngOnInit(): void {
    this.traerComentarios();
    this.obtenerEstadosDeMeGusta();
  }

  obtenerUsuario() {
    this.authService.usuario$.subscribe(res => {
       this.usuario = res;
     });
     this.authService.mostrarUserLogueado();
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
      window.location.href = `${this.serverIp}:3002/#/`; 
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

  eliminarComentario(idComentario: number, usuario_id: number) {
    if (this.usuario.id !== usuario_id) {
      console.error('No tienes permiso para eliminar este comentario.');
      return;
    }

    this.comentariosService.eliminarComentario(idComentario, usuario_id).subscribe(
      response => {
        console.log('Comentario eliminado:', response);
        this.traerComentarios();  
      },
      error => {
        console.error('Error al eliminar comentario:', error);
      }
    );
  }

  editarComentario(comentario: Comentario) {
    this.editingComentarioId = comentario.id ?? null;
    this.editingComentarioMensaje = comentario.mensaje;
  }

  actualizarComentario(comentario: Comentario): void {
    if (this.editingComentarioId !== null) {
      this.comentariosService.editarComentario(this.editingComentarioId, this.editingComentarioMensaje, this.usuario.id).subscribe(() => {
        this.traerComentarios();
        this.editingComentarioId = null;
        this.editingComentarioMensaje = '';
      }, error => {
        console.error('Error al editar comentario:', error);
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
      comentario.created_at = moment(comentario.created_at).fromNow();
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

  obtenerEstadosDeMeGusta(): void {
    this.comentarios.forEach(comentario => {
      this.comentariosService.getEstadoMeGusta(comentario.id!, this.usuario.id).subscribe(
        (res: any) => {
          comentario.likedByUser = res.likedByUser;
          comentario.meGustaId = res.meGustaId;
        },
        (error) => {
          console.error('Error al obtener el estado de Me Gusta:', error);
        }
      );
    });
  }

  darMeGusta(comentarioId: number): void {
    if (!this.usuario || !this.usuario.id) {
      window.location.href = `${this.serverIp}:3002/#/`; 
    }

    this.comentariosService.darMeGusta(comentarioId, this.usuario.id).subscribe(
      () => {
        console.log('Me Gusta dado al comentario.');
        this.traerComentarios();  
      },
      error => {
        console.error('Error al dar Me Gusta:', error);
      }
    );
  }

  quitarMeGusta(comentarioId: number, meGustaId: number): void {
    
    this.comentariosService.quitarMeGusta(meGustaId, this.usuario.id).subscribe(
      () => {
        console.log('Me Gusta quitado del comentario.');
        this.traerComentarios(); 
      },
      error => {
        console.error('Error al quitar Me Gusta:', error);
      }
    );
  }
  
  
  onComentarioEliminado(event: { id: number, usuario_id: number }): void {
    console.log('Comentario Eliminado:', event);
  
  }

  onComentarioEditado(comentario: Comentario): void {
    console.log('Comentario Editado:', comentario);
  }
}