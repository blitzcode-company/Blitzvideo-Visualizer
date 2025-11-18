import { Component, EventEmitter, HostListener,Input, OnInit, Output } from '@angular/core';
import { Comentario } from '../../clases/comentario';
import { ComentariosService } from '../../servicios/comentarios.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../servicios/auth.service';
import { ModalReporteComentarioComponent } from '../modal-reporte-comentario/modal-reporte-comentario.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalReportarUsuarioComponent } from '../modal-reportar-usuario/modal-reportar-usuario.component';




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
  serverIp = environment.serverIp
  userId:any
  usuarioBloqueado = false;
  mensaje = '';
  contadorDeMegustas = '';
  enviandoRespuesta = false;

  @Output() reportar = new EventEmitter<void>();

  constructor(private comentariosService: ComentariosService, private authService: AuthService,     public dialog: MatDialog,
  ) {}

  ngOnInit(): void {


  }

 @HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  const target = event.target as HTMLElement;

if (target.closest('.respuesta-container') || target.closest('.btn-responder')) {
    return;
  }

  if (this.selectedComentarioId !== null) {
    this.cancelarRespuesta();
  }

}

  obtenerUsuario() {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      if (this.usuario) {
        this.userId = this.usuario.id;
        console.log("User ID obtenido:", this.userId);
        
        if (this.usuario.bloqueado) {
          this.usuarioBloqueado = true;  
          this.mensaje = 'Tu cuenta está bloqueada, no puedes comentar.';
        } else {
          this.usuarioBloqueado = false;  
        }
      }
    });
  
    this.authService.mostrarUserLogueado();
  }

  eliminarComentario(idComentario: number): void {
    if (!this.usuario || !this.usuario.id) {
      return;
    }

    this.comentariosService.eliminarComentario(idComentario, this.usuario.id).subscribe(
      () => {
        this.comentarioEliminado.emit({ id: idComentario, usuario_id: this.usuario.id });
      },
      error => {
        console.error('Error al eliminar comentario:', error);
      }
    );
  }

  

toggleResponder(comentario: Comentario | null, event: Event): void {
  event.preventDefault();
  event.stopPropagation();

  if (!comentario || !comentario.id) {
    console.error('Comentario inválido o sin ID.');
    return;
  }

  if (this.selectedComentarioId === comentario.id) {
    this.cancelarRespuesta();
  } else {
    this.selectedComentarioId = comentario.id;
    this.respuestaComentario.mensaje = `${ ''} `;

    setTimeout(() => {
      const input = document.querySelector('.input-respuesta') as HTMLInputElement;
      input?.focus();
    }, 0);
  }
}


onKeydownRespuesta(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    this.enviarRespuesta();
  } else if (event.key === 'Escape') {
    this.cancelarRespuesta();
  }
}


cancelarRespuesta(): void {
  this.limpiarRespuesta();
}

enviarRespuesta(): void {
  if (!this.selectedComentarioId) {
    console.error('No hay comentario seleccionado para responder.');
    return;
  }

  if (!this.usuario?.id) {
    console.error('Usuario no definido.');
    return;
  }

  if (!this.respuestaComentario.mensaje?.trim()) {
    console.error('Mensaje vacío, no se puede enviar.');
    return;
  }

  const datos = {
    mensaje: this.respuestaComentario.mensaje.trim(),
    usuario_id: this.usuario.id,
    video_id: this.videoId
  };

  console.log('Enviando respuesta:', {
    comentarioPadreId: this.selectedComentarioId,
    datos
  });

  
  this.enviandoRespuesta = true;

  this.comentariosService.responderComentario(Number(this.selectedComentarioId), datos).subscribe({
    next: () => {
      
      this.nuevoComentario.emit();
      this.limpiarRespuesta();
    },
    error: (err) => {
      console.error('Error al responder:', err);
      this.enviandoRespuesta = false;
    }
  });
}
 
 
private limpiarRespuesta(): void {
  this.respuestaComentario.mensaje = '';
  this.selectedComentarioId = null;
  this.enviandoRespuesta = false;
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

  darMeGusta(): void {
    if (!this.usuario || !this.usuario.id) {
      window.location.href = `${this.serverIp}:3002/#/`; 
    }

    this.comentariosService.darMeGusta(this.comentario.id!, this.usuario.id).subscribe(
      (response) => {
        this.comentario.likedByUser = true;
        this.comentario.meGustaId = response.meGustaId;
        this.comentario.contadorDeLikes = (this.comentario.contadorDeLikes || 0) + 1;

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
        this.comentario.likedByUser = false;
        this.comentario.meGustaId = null; 
        this.comentario.contadorDeLikes = (this.comentario.contadorDeLikes || 1) - 1; 

      },
      (error) => {
        console.error('Error al quitar Me Gusta:', error);
      }
    );
  }

 


  reportarComentario(comentarioId: number) {
    const dialogRef = this.dialog.open(ModalReporteComentarioComponent, {
      width: '400px',
      data: { comentarioId: comentarioId, userId: this.usuario.id }
    });
  
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal fue cerrado. Resultado:', result);
    });
  }

  reportarUsuario(comentarioUserId: number) {
    const dialogRef = this.dialog.open(ModalReportarUsuarioComponent, {
      width: '400px',
      data: {
        id_reportado: this.comentario.usuario_id , 
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
