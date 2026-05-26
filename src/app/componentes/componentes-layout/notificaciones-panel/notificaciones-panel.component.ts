import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacionesService } from '../../../servicios/notificaciones.service';
import { Notificacion } from '../../../clases/notificacion';

@Component({
  selector: 'app-notificaciones-panel',
  templateUrl: './notificaciones-panel.component.html',
  styleUrl: './notificaciones-panel.component.css'
})
export class NotificacionesPanelComponent {

  @Input() isOpen: boolean = false;
  @Input() notificaciones: Notificacion[] = [];
  @Input() contadorNotificaciones: number = 0;
  @Input() usuarioId: number = 0;

  @Output() togglePanel = new EventEmitter<void>();
  @Output() notificacionesActualizadas = new EventEmitter<Notificacion[]>();
  @Output() contadorActualizado = new EventEmitter<number>();

  constructor(
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {}

  toggleNotiDropdown() {
    this.togglePanel.emit();
  }

  irANotificacion(notif: any) {
    this.marcarComoVista(notif.id);

    if (notif.id_video && notif.referencia_id) {
      localStorage.setItem('highlightCommentId', notif.referencia_id.toString());
      
      this.router.navigate(['/video', notif.id_video]).then(() => {
        this.router.navigate(['/video', notif.id_video], { queryParams: { comment: notif.referencia_id } });
      });
    }
  }

  marcarComoVista(notificacionId: number): void {
    const notif = this.notificaciones.find(n => n.id === notificacionId);
    if (!notif || notif.leido === 1) return;

    this.notificacionesService.marcarNotificacionComoVista(notificacionId, this.usuarioId).subscribe({
      next: () => {
        notif.leido = 1;
        const nuevoContador = Math.max(0, this.contadorNotificaciones - 1);
        this.contadorActualizado.emit(nuevoContador);
      },
      error: (err) => {
        console.error('Error al marcar como vista:', err);
      }
    });
  }

  trackByNotif(index: number, notif: any): any {
    return notif.id;
  }

  getNombreUsuario(n: Notificacion): string {
    switch (n.referencia_tipo) {
      case 'new_video':
        return n.nombre_subidor || 'Alguien';
      case 'new_comment':
      case 'new_reply':
        return n.nombre_comentador || 'Alguien';
      default:
        return n.nombre_comentador || n.nombre_subidor || 'Alguien';
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/images/cover-default.png';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.noti-bell-wrapper');
    
    if (!clickedInside && this.isOpen) {
      this.togglePanel.emit();
    }
  }
}
