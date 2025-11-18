import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportesService } from '../../servicios/reportes.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

interface ReporteForm {
  contenido_inapropiado: boolean;
  spam: boolean;
  contenido_enganoso: boolean;
  violacion_derechos_autor: boolean;
  incitacion_al_odio: boolean;
  violencia_grafica: boolean;
  otros: boolean;
  detalle: string;
}

interface ReporteBackend {
  video_id: number;
  user_id: number;
  contenido_inapropiado: 0 | 1;
  spam: 0 | 1;
  contenido_enganoso: 0 | 1;
  violacion_derechos_autor: 0 | 1;
  incitacion_al_odio: 0 | 1;
  violencia_grafica: 0 | 1;
  otros: 0 | 1;
  detalle?: string;
}

@Component({
  selector: 'app-modal-reporte-video',
  templateUrl: './modal-reporte-video.component.html',
  styleUrls: ['./modal-reporte-video.component.css']
})
export class ModalReporteVideoComponent {
  loading = false;
  mostrarDetalle = false;

  reporte: ReporteForm = {
    contenido_inapropiado: false,
    spam: false,
    contenido_enganoso: false,
    violacion_derechos_autor: false,
    incitacion_al_odio: false,
    violencia_grafica: false,
    otros: false,
    detalle: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ModalReporteVideoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { videoId: number; userId: number },
    private reportesService: ReportesService,
    private snackBar: MatSnackBar
  ) {}

  esValido(): boolean {
    const algunMotivo = Object.values(this.reporte)
      .slice(0, 7)
      .some(v => v === true);

    if (!algunMotivo) return false;
    if (this.reporte.otros && !this.reporte.detalle.trim()) return false;
    return true;
  }

  onOtrosChange(checked: boolean): void {
    this.mostrarDetalle = checked; 
    if (!checked) {
      this.reporte.detalle = '';
    }
  }
  enviarReporteVideo(): void {
    if (!this.esValido()) {
      this.snackBar.open('Selecciona al menos un motivo', 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;

    const reportData: ReporteBackend = {
      video_id: this.data.videoId,
      user_id: this.data.userId,
      contenido_inapropiado: this.reporte.contenido_inapropiado ? 1 : 0,
      spam: this.reporte.spam ? 1 : 0,
      contenido_enganoso: this.reporte.contenido_enganoso ? 1 : 0,
      violacion_derechos_autor: this.reporte.violacion_derechos_autor ? 1 : 0,
      incitacion_al_odio: this.reporte.incitacion_al_odio ? 1 : 0,
      violencia_grafica: this.reporte.violencia_grafica ? 1 : 0,
      otros: this.reporte.otros ? 1 : 0,
      detalle: this.reporte.otros ? this.reporte.detalle.trim() : undefined
    };

    this.reportesService.crearReporteVideo(reportData).subscribe({
      next: (response) => {
        this.snackBar.open('Reporte enviado. Gracias por ayudarnos.', 'OK', {
          duration: 4000,
          panelClass: ['snackbar-success']
        });
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al enviar reporte:', error);
        this.snackBar.open('Error al enviar el reporte. Intenta más tarde.', 'Cerrar', {
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