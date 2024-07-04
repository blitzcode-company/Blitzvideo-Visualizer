import { Component, EventEmitter, HostListener,Input, OnInit, Output } from '@angular/core';
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
  @Output() comentarioEliminado = new EventEmitter<{ id: number, usuario_id: number }>();
  @Output() comentarioEditado = new EventEmitter<Comentario>();
  
  showMenu: boolean = false;
  selectedComentarioId: number | null = null;
  respondingTo: any;
  respuestaComentario: any = {
    usuario_id: '',
    mensaje: ''
  };
  editingComentarioId: number | null = null;
  editingComentarioMensaje: string = '';
  constructor(private comentariosService: ComentariosService) {}

  ngOnInit(): void {
    if (this.comentario) {
      this.obtenerEstadosDeMeGusta();
    }

  }

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

  eliminarComentario(idComentario: number, usuario_id: number) {
    if (this.usuario?.id !== usuario_id) {
      console.error('No tienes permiso para eliminar este comentario.');
      return;
    }

    this.comentariosService.eliminarComentario(idComentario, usuario_id).subscribe(
      () => {
        this.comentarioEliminado.emit({ id: idComentario, usuario_id }); 
      },
      error => {
        console.error('Error al eliminar comentario:', error);
      }
    );
  }

  toggleEdit(comentario: Comentario | null): void {
    if (comentario) {
      this.editingComentarioId = comentario.id ?? null;
      this.editingComentarioMensaje = comentario.mensaje;
    } else {
      this.editingComentarioId = null;
    }
  }

  editarComentario(comentario: Comentario): void {
    if (this.editingComentarioMensaje.trim()) {
      this.comentariosService.editarComentario(comentario.id!, this.editingComentarioMensaje, this.usuario.id)
        .subscribe(() => {
          comentario.mensaje = this.editingComentarioMensaje;
          this.comentarioEditado.emit(comentario);
          this.toggleEdit(null);
        });
    }
  }

  obtenerEstadosDeMeGusta(): void {
    if (this.comentario && this.usuario?.id) {
      this.comentariosService.getEstadoMeGusta(this.comentario.id!, this.usuario.id).subscribe(
        (response: any) => {
          this.comentario.likedByUser = response.likedByUser;
          this.comentario.meGustaId = response.meGustaId;
        },
        (error) => {
          console.error('Error al obtener el estado de Me Gusta:', error);
        }
      );
    }
  }

  darMeGusta(): void {
    if (!this.usuario || !this.usuario.id) {
      window.location.href = 'http://localhost:3002/#/'; 
    }

    this.comentariosService.darMeGusta(this.comentario.id!, this.usuario.id).subscribe(
      (response) => {
        // Actualiza el estado de Me Gusta en la interfaz de usuario
        this.comentario.likedByUser = true;
        this.comentario.meGustaId = response.meGustaId; // Guarda el ID de "Me Gusta"
      },
      (error) => {
        console.error('Error al dar Me Gusta:', error);
      }
    );
  }

  quitarMeGusta(): void {
    if (!this.usuario?.id || !this.comentario.meGustaId) {
      console.error('Debes estar logueado para quitar Me Gusta.');
      return;
    }

    this.comentariosService.quitarMeGusta(this.comentario.meGustaId, this.usuario.id).subscribe(
      () => {
        // Actualiza el estado de Me Gusta en la interfaz de usuario
        this.comentario.likedByUser = false;
        this.comentario.meGustaId = null; // Limpia el ID de "Me Gusta"
      },
      (error) => {
        console.error('Error al quitar Me Gusta:', error);
      }
    );
  }

 
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.responderComentario') === null && target.closest('a') === null) {
      this.selectedComentarioId = null;
      this.respondingTo = '';
      this.respuestaComentario.mensaje = '';
    }
  }


  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  
    const clickListener = (e: MouseEvent) => {
      if (!((e.target as HTMLElement).closest('.comentario-actions-menu') || e.target === event.currentTarget)) {
        this.showMenu = false;
        document.removeEventListener('click', clickListener);
      }
    };
  
    document.addEventListener('click', clickListener);
  }

  toggleRespuestas(comentario: Comentario): void {
    comentario.mostrarRespuestas = !comentario.mostrarRespuestas;
  }
}

