import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';  
import { ReportesService } from '../../servicios/reportes.service';

@Component({
  selector: 'app-modal-reporte-comentario',
  templateUrl: './modal-reporte-comentario.component.html',
  styleUrls: ['./modal-reporte-comentario.component.css']
})
export class ModalReporteComentarioComponent {

  constructor(
    public dialogRef: MatDialogRef<ModalReporteComentarioComponent>,
    private reportesService: ReportesService,
    private snackBar: MatSnackBar,  
    @Inject(MAT_DIALOG_DATA) public data: { comentarioId: any; userId: any }
  ) { }

  enviarReporteComentario(formData: any) {
    const reportData = {
      ...formData,
      comentario_id: this.data.comentarioId,
      user_id: this.data.userId,
      lenguaje_ofensivo: formData.lenguaje_ofensivo ? 1 : 0,
      spam: formData.spam ? 1 : 0,
      contenido_enganoso: formData.contenido_enganoso ? 1 : 0,
      incitacion_al_odio: formData.incitacion_al_odio ? 1 : 0,
      acoso: formData.acoso ? 1 : 0,
      contenido_sexual: formData.contenido_sexual ? 1 : 0,
      otros: formData.otros ? 1 : 0,
      detalle: formData.detalle
    };

    this.reportesService.crearReporteComentario(reportData).subscribe(
      response => {
        console.log('Reporte enviado exitosamente:', response);
        this.dialogRef.close(response);
        this.snackBar.open('Reporte enviado exitosamente', 'Cerrar', {
          duration: 3000, 
        });
      },
      error => {
        console.error('Error al enviar el reporte:', error);
        this.snackBar.open('Error al enviar el reporte. Intenta nuevamente', 'Cerrar', {
          duration: 3000, 
        });
      }
    );
  }
}
