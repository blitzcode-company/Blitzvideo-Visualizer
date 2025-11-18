import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportesService } from '../../servicios/reportes.service';

interface ReporteForm {
  lenguaje_ofensivo: boolean;
  spam: boolean;
  contenido_enganoso: boolean;
  incitacion_al_odio: boolean;
  acoso: boolean;
  contenido_sexual: boolean;
  otros: boolean;
  detalle: string;
}

@Component({
  selector: 'app-modal-reporte-comentario',
  templateUrl: './modal-reporte-comentario.component.html',
  styleUrls: ['./modal-reporte-comentario.component.css']
})
export class ModalReporteComentarioComponent {
  loading = false;
  mostrarDetalle = false;

  reporte: ReporteForm = {
    lenguaje_ofensivo: false,
    spam: false,
    contenido_enganoso: false,
    incitacion_al_odio: false,
    acoso: false,
    contenido_sexual: false,
    otros: false,
    detalle: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ModalReporteComentarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { comentarioId: number; userId: number },
    private reportesService: ReportesService,
    private snackBar: MatSnackBar
  ) {}

  // === VALIDACIÓN ===
  esValido(): boolean {
    const algunMotivo = Object.values(this.reporte)
      .slice(0, 7)
      .some(v => v === true);
    if (!algunMotivo) return false;
    if (this.reporte.otros && !this.reporte.detalle.trim()) return false;
    return true;
  }

  // === CAMBIO EN "OTROS" ===
  onOtrosChange(checked: boolean): void {
    this.mostrarDetalle = checked;
    if (!checked) {
      this.reporte.detalle = '';
    }
  }

  // === ENVIAR REPORTE ===
  enviarReporteComentario(): void {
    if (!this.esValido()) {
      this.snackBar.open('Selecciona al menos un motivo', 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;

    const reportData = {
      comentario_id: this.data.comentarioId,
      user_id: this.data.userId,
      lenguaje_ofensivo: this.reporte.lenguaje_ofensivo ? 1 : 0,
      spam: this.reporte.spam ? 1 : 0,
      contenido_enganoso: this.reporte.contenido_enganoso ? 1 : 0,
      incitacion_al_odio: this.reporte.incitacion_al_odio ? 1 : 0,
      acoso: this.reporte.acoso ? 1 : 0,
      contenido_sexual: this.reporte.contenido_sexual ? 1 : 0,
      otros: this.reporte.otros ? 1 : 0,
      detalle: this.reporte.otros ? this.reporte.detalle.trim() : undefined
    };

    this.reportesService.crearReporteComentario(reportData).subscribe({
      next: (response) => {
        this.snackBar.open('Reporte enviado. Gracias.', 'OK', {
          duration: 4000,
          panelClass: ['snackbar-success']
        });
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al reportar comentario:', error);
        this.snackBar.open('Error al enviar el reporte.', 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
        this.loading = false;
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}