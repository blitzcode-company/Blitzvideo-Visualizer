import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportesService } from '../../servicios/reportes.service';

@Component({
  selector: 'app-modal-reportar-usuario',
  templateUrl: './modal-reportar-usuario.component.html',
  styleUrl: './modal-reportar-usuario.component.css'
})
export class ModalReportarUsuarioComponent {


  constructor(
    public dialogRef: MatDialogRef<ModalReportarUsuarioComponent>,
    private reportesService: ReportesService,
    @Inject(MAT_DIALOG_DATA) public data: { id_reportado: any; id_reportante: any}
  ) { 
    console.log(data)
  }


  enviarReporteUsuario(formData: any) {
    const reportData = {
      ...formData,
      id_reportado: this.data.id_reportado,
      id_reportante: this.data.id_reportante,
      ciberacoso: formData.ciberacoso ? 1 : 0,
      privacidad: formData.privacidad ? 1 : 0,
      suplantacion_identidad: formData.suplantacion_identidad ? 1 : 0,
      amenazas: formData.amenazas ? 1 : 0,
      incitacion_odio: formData.incitacion_odio ? 1 : 0,
      otros: formData.otros ? 1 : 0
  };

  
    this.reportesService.crearReporteUsuario(reportData).subscribe(
      response => {
        this.dialogRef.close(response);
      },
      error => {
        console.error('Error al enviar el reporte:', error);
      }
    );
  }


}
