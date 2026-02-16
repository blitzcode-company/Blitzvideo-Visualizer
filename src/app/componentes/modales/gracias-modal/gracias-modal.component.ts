import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-gracias-modal',
  templateUrl: './gracias-modal.component.html',
  styleUrl: './gracias-modal.component.css'
})
export class GraciasModalComponent {


  constructor(private dialogRef: MatDialogRef<GraciasModalComponent>) {}


  
  cerrar(): void {
    this.dialogRef.close();  
    location.reload();
  }


}
