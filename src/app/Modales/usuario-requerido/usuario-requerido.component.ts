import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-usuario-requerido',
  templateUrl: './usuario-requerido.component.html',
  styleUrl: './usuario-requerido.component.css'
})
export class UsuarioRequeridoComponent {

  constructor(public dialogRef: MatDialogRef<UsuarioRequeridoComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }

}
