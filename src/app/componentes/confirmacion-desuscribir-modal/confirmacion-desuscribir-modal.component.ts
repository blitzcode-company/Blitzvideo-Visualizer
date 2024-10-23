import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';



@Component({
  selector: 'app-confirmacion-desuscribir-modal',
  templateUrl: './confirmacion-desuscribir-modal.component.html',
  styleUrl: './confirmacion-desuscribir-modal.component.css'
})
export class ConfirmacionDesuscribirModalComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmacionDesuscribirModalComponent>) {}


  onNoClick(): void {
    this.dialogRef.close(false); 
  }

  confirmar(): void {
    this.dialogRef.close(true); 
  }


}
