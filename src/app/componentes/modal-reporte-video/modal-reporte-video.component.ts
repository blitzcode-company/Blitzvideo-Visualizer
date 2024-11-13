import { Component, Inject, Input} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportesService } from '../../servicios/reportes.service';


@Component({
  selector: 'app-modal-reporte-video',
  templateUrl: './modal-reporte-video.component.html',
  styleUrl: './modal-reporte-video.component.css'
})
export class ModalReporteVideoComponent {
  @Input() videoId: any; 
  @Input() userId: any;  

  constructor(
    public dialogRef: MatDialogRef<ModalReporteVideoComponent>,
    private reportesService: ReportesService,
    @Inject(MAT_DIALOG_DATA) public data: { videoId: any; userId: any}
  ) { }

  enviarReporteVideo(formData: any) {
    const reportData = {
      ...formData,
      video_id: this.data.videoId,
      user_id: this.data.userId,
      contenido_inapropiado: formData.contenido_inapropiado ? 1 : 0,
      spam: formData.spam ? 1 : 0,
      contenido_enganoso: formData.contenido_enganoso ? 1 : 0,
      violacion_derechos_autor: formData.violacion_derechos_autor ? 1 : 0,
      incitacion_al_odio: formData.incitacion_al_odio ? 1 : 0,
      violencia_grafica: formData.violencia_grafica ? 1 : 0,
      otros: formData.otros ? 1 : 0
  };

  
    this.reportesService.crearReporteVideo(reportData).subscribe(
      response => {
        console.log('Reporte enviado exitosamente:', response);
        this.dialogRef.close(response);
      },
      error => {
        console.error('Error al enviar el reporte:', error);
      }
    );
  }

}
