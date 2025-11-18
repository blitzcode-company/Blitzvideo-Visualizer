import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportesService } from '../../servicios/reportes.service';

interface ReporteForm {
  ciberacoso: boolean;
  privacidad: boolean;
  suplantacion_identidad: boolean;
  amenazas: boolean;
  incitacion_odio: boolean;
  otros: boolean;
  detalle: string;
}

@Component({
  selector: 'app-modal-reportar-usuario',
  templateUrl: './modal-reportar-usuario.component.html',
  styleUrls: ['./modal-reportar-usuario.component.css']
})
export class ModalReportarUsuarioComponent {
  loading = false;
  mostrarDetalle = false;

  reporte: ReporteForm = {
    ciberacoso: false,
    privacidad: false,
    suplantacion_identidad: false,
    amenazas: false,
    incitacion_odio: false,
    otros: false,
    detalle: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ModalReportarUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id_reportado: number; id_reportante: number },
    private reportesService: ReportesService,
    private snackBar: MatSnackBar
  ) {
    console.log('Datos recibidos:', data);
  }

  // === VALIDACIÓN ===
  esValido(): boolean {
    const algunMotivo = Object.values(this.reporte)
      .slice(0, 6)
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
  enviarReporteUsuario(): void {
    if (!this.esValido()) {
      this.snackBar.open('Selecciona al menos un motivo', 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;

    const reportData = {
      id_reportado: this.data.id_reportado,
      id_reportante: this.data.id_reportante,
      ciberacoso: this.reporte.ciberacoso ? 1 : 0,
      privacidad: this.reporte.privacidad ? 1 : 0,
      suplantacion_identidad: this.reporte.suplantacion_identidad ? 1 : 0,
      amenazas: this.reporte.amenazas ? 1 : 0,
      incitacion_odio: this.reporte.incitacion_odio ? 1 : 0,
      otros: this.reporte.otros ? 1 : 0,
      detalle: this.reporte.otros ? this.reporte.detalle.trim() : undefined
    };

    this.reportesService.crearReporteUsuario(reportData).subscribe({
      next: (response) => {
        this.snackBar.open('Reporte enviado. Gracias por ayudarnos.', 'OK', {
          duration: 4000,
          panelClass: ['snackbar-success']
        });
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al reportar usuario:', error);
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