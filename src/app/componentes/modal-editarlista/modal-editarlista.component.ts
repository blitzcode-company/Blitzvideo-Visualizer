import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlaylistService } from '../../servicios/playlist.service';


@Component({
  selector: 'app-modal-editarlista',
  templateUrl: './modal-editarlista.component.html',
  styleUrl: './modal-editarlista.component.css'
})
export class ModalEditarlistaComponent {

  nombreLista: string = '';
  acceso: boolean = true;
  playlistId: number;

  constructor(
    public dialogRef: MatDialogRef<ModalEditarlistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { playlist: any },
    private playlistService: PlaylistService
  ) {
    this.playlistId = data.playlist.id;
    this.nombreLista = data.playlist.nombre;
    this.acceso = data.playlist.acceso;
  }

  modificarLista(): void {
    if (this.nombreLista.trim()) {
      this.playlistService.modificarPlaylist(this.playlistId, this.nombreLista, this.acceso).subscribe(
        response => {
          this.dialogRef.close(response);
          alert('Lista de reproducción modificada con éxito.'); 
        },
        error => {
          console.error('Error al modificar la lista:', error);
          this.dialogRef.close(); 
        }
      );
    } else {
      alert('El nombre de la lista no puede estar vacío.');
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
