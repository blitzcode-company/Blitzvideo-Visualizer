import { Component, Input, Output, OnInit, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { Comentario } from '../../clases/comentario';
import { ComentariosService } from '../../servicios/comentarios.service';
import { StatusService } from '../../servicios/status.service';
import { AuthService } from '../../servicios/auth.service';
import moment from 'moment';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ModalReporteComentarioComponent } from '../modal-reporte-comentario/modal-reporte-comentario.component';
import { EventEmitter } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css']
})
export class ComentariosComponent implements OnInit {
  @Input() videoId: any;
  @Input() usuario: any;
  @Input() highlightId: number | null = null;
  @Output() cargados = new EventEmitter<void>();
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
  userId: any;
  comentarioId : any;
  usuarioBloqueado = false;
  mensaje = '';
  totalComentarios: number = 0; 
  cargandoComentarios = true;
  private yaResaltado = false;
  comentarioEliminado:any

  constructor(private comentariosService: ComentariosService, 
              private cdr: ChangeDetectorRef,
              public status: StatusService, 
              private authService: AuthService, 
              private activatedRoute: ActivatedRoute,   
              private router: Router,                   
              public dialog: MatDialog,) {}

  ngOnInit(): void {
    this.traerComentarios();
    this.obtenerUsuario();
    this.checkForHighlightComment();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['videoId'] && this.videoId) {
      this.traerComentarios();
    }

    
  }

  ngAfterViewChecked() {
    if (this.highlightId && !this.yaResaltado) {
      this.expandirYResaltar(this.highlightId);
      this.yaResaltado = true;
    }
  }
  ngAfterViewInit(): void {
    this.leerHighlightDesdeUrlOLocalStorage();
  }




  private leerHighlightDesdeUrlOLocalStorage(): void {
  this.activatedRoute.queryParams.subscribe(params => {
    const commentParam = params['comment'];
    if (commentParam) {
      const id = +commentParam;
      this.resaltarComentario(id);
      this.router.navigate([], { 
        relativeTo: this.activatedRoute, 
        queryParams: { comment: null }, 
        queryParamsHandling: 'merge',
        replaceUrl: true 
      });
    }
  });

  const highlightIdStr = localStorage.getItem('highlightCommentId') || localStorage.getItem('tempHighlightId');
  if (highlightIdStr) {
    const id = +highlightIdStr;
    localStorage.removeItem('highlightCommentId');
    localStorage.removeItem('tempHighlightId');
    
    setTimeout(() => this.resaltarComentario(id), 800);
  }
}

private expandirYResaltar(idBuscado: number) {
  localStorage.setItem('tempHighlightId', idBuscado.toString()); 
  
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      this.cdr.detectChanges();
      this.abrirTodoElArbol(this.comentarios);
      this.cdr.detectChanges();
    }, i * 150);
  }

  const intentar = () => {
    const el = document.getElementById('comentario-' + idBuscado);
    if (el?.isConnected) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      localStorage.removeItem('highlightCommentId');
      localStorage.removeItem('tempHighlightId');
    } else {
      setTimeout(intentar, 100);
    }
  };
  setTimeout(intentar, 600);
}

private checkForHighlightComment() {

  const url = new URL(window.location.href);
  const commentParam = url.searchParams.get('comment');
  const idToHighlight = this.highlightId || (commentParam ? +commentParam : null);

  if (idToHighlight && !this.yaResaltado) {
    this.resaltarComentario(idToHighlight);
  }
}



private abrirTodoElArbol(comentarios: any[]) {
  for (const c of comentarios) {
    if (c.respuestas?.length) {
      c.mostrarRespuestas = true;
      this.abrirTodoElArbol(c.respuestas);
    }
  }
}


private resaltarComentario(idBuscado: number) {
  {
  this.abrirHilosHastaComentario(idBuscado, this.comentarios);

  const intentarResaltar = (intentos = 0) => {
    this.cdr.detectChanges();

    const elemento = document.getElementById(`comentario-${idBuscado}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });

      elemento.classList.add('comentario-resaltado');
      setTimeout(() => elemento.classList.remove('comentario-resaltado'), 3000);

      this.yaResaltado = true;
      return;
    }

    if (intentos < 20) { 
      setTimeout(() => intentarResaltar(intentos + 1), 150);
    }
  };

  setTimeout(() => intentarResaltar(), 200);
} 

}

private abrirHilosHastaComentario(idBuscado: number, comentarios: any[]): boolean {
  for (const c of comentarios) {
    if (c.id === idBuscado) {
      return true;
    }
    if (c.respuestas?.length > 0) {
      if (this.abrirHilosHastaComentario(idBuscado, c.respuestas)) {
        c.mostrarRespuestas = true;
        this.cdr.detectChanges(); 
        return true;
      }
    }
  }
  return false;
}

  obtenerUsuario() {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      if (this.usuario) {
        this.userId = this.usuario.id;
        this.traerComentarios();
    
        if (this.usuario.bloqueado) {
          this.usuarioBloqueado = true;  
          this.mensaje = 'Tu cuenta está bloqueada, no puedes comentar.';
        } else {
          this.usuarioBloqueado = false;  
        }
  
        if (this.selectedComentarioId) {
          this.abrirModalReporte(this.selectedComentarioId);
        }
      }
    });
  
    this.authService.mostrarUserLogueado();
  }


traerComentarios() {
    if (!this.videoId) {
      this.cargandoComentarios = false;
      return;
    }

    this.cargandoComentarios = true;
    this.comentariosService.traerComentariosDelVideo(this.videoId, this.usuario?.id)
      .subscribe({
        next: (res: any[]) => {
          const visibles = this.organizarComentarios(res).filter(c => !c.bloqueado);
          this.comentarios = visibles;

          this.totalComentarios = visibles.reduce((total, c) => {
            const respuestasVisibles = c.respuestas?.filter(r => !r.bloqueado).length || 0;
            return total + 1 + respuestasVisibles;
          }, 0);
        },
        error: (err) => {
          console.error('Error al cargar comentarios:', err);
          this.comentarios = [];
          this.totalComentarios = 0;
        },
        complete: () => this.cargandoComentarios = false
      });
  }

crearComentario(): void {
  if (this.usuarioBloqueado || !this.nuevoComentario.mensaje?.trim()) return;

  const payload = {
    usuario_id: this.usuario.id,
    mensaje: this.nuevoComentario.mensaje.trim()
  };

  this.comentariosService.crearComentario(this.videoId, payload).subscribe(() => {
    this.nuevoComentario.mensaje = '';
    this.traerComentarios();
  });
}



eliminarComentario(idComentario: number): void {
  if (!this.usuario?.id) return;

  this.comentariosService.eliminarComentario(idComentario, this.usuario.id).subscribe(
    () => {
      this.comentarioEliminado.emit({ id: idComentario, usuario_id: this.usuario.id });
    },
    error => console.error('Error al eliminar comentario:', error)
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

  toggleRespuestas(comentario: Comentario): void {
    comentario.mostrarRespuestas = !comentario.mostrarRespuestas;
  }

 organizarComentarios(comentarios: Comentario[]): Comentario[] {
    const map = new Map<number, Comentario>();
    const raices: Comentario[] = [];

    comentarios.forEach(c => {
      c.respuestas = c.respuestas || [];
      map.set(c.id!, c);
      c.created_at = moment(c.created_at).fromNow();
    });

    comentarios.forEach(c => {
      if (c.respuesta_id) {
        const padre = map.get(c.respuesta_id);
        padre?.respuestas?.push(c);
      } else {
        raices.push(c);
      }
    });

    return raices;
  }


  darMeGusta(comentarioId: number): void {
    if (!this.usuario || !this.usuario.id) {
      window.location.href = `${this.serverIp}:3002/#/`; 
    }

    this.comentariosService.darMeGusta(comentarioId, this.usuario.id).subscribe(
      () => {
        this.traerComentarios();  
      },
      error => {
        console.error('Error al dar Me Gusta:', error);
      }
    );
  }

  quitarMeGusta(meGustaId: number): void {
    
    this.comentariosService.quitarMeGusta(meGustaId, this.usuario.id).subscribe(
      () => {
        this.traerComentarios(); 
      },
      error => {
        console.error('Error al quitar Me Gusta:', error);
      }
    );
  }
  
  abrirModalReporte(comentarioId: number | undefined) {
    if (!this.userId) {
      console.error("User ID no está definido. Asegúrate de que el usuario esté logueado.");
      this.obtenerUsuario();  
      return;
    }
  
   const dialogRef = this.dialog.open(ModalReporteComentarioComponent, {
      data: {
        userId: this.usuario.id, 
        comentarioId: comentarioId,
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal fue cerrado. Resultado:', result);
    });
  }

  
onComentarioEliminado(event: { id: number; usuario_id: number }) {
  const eliminarRecursivo = (comentarios: Comentario[]): Comentario[] => {
    return comentarios
      .map(c => ({
        ...c,
        respuestas: c.respuestas ? eliminarRecursivo(c.respuestas) : []
      }))
      .filter(c => c.id !== event.id); 
  };

  this.comentarios = eliminarRecursivo(this.comentarios);

  this.totalComentarios = this.comentarios.reduce((total, c) => {
    const respuestasVisibles = c.respuestas?.length || 0;
    return total + 1 + respuestasVisibles;
  }, 0);
}

onComentarioEditado() { this.traerComentarios(); }
}