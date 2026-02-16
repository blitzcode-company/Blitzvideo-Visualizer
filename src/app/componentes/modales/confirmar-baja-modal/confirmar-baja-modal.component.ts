import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar-baja-modal',
  templateUrl: './confirmar-baja-modal.component.html',
  styleUrls: ['./confirmar-baja-modal.component.css']
})
export class ConfirmarBajaModalComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmarBajaModalComponent>) {}

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
