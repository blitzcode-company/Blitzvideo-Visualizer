import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlaylistService } from '../../servicios/playlist.service';
import { AuthService } from '../../servicios/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-crear-lista',
  templateUrl: './crear-lista.component.html',
  styleUrls: ['./crear-lista.component.css']
})
export class CrearListaComponent {
  nombreLista: string = '';
  acceso: boolean = true;
  userId: number | null = null;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<CrearListaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { videoId?: number },
    private playlistService: PlaylistService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.obtenerUsuarioId();
  }

obtenerUsuarioId(): void {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario?.id) {
        this.userId = usuario.id;
      }
    });
  }

  crearLista(): void {
    if (!this.userId) {
      this.snackBar.open('Error: usuario no identificado', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!this.nombreLista.trim()) {
      this.snackBar.open('El nombre no puede estar vacío', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.playlistService.crearLista(this.nombreLista.trim(), this.acceso, this.userId).subscribe({
      next: (response) => {
        const nuevaLista = response?.data;
        this.snackBar.open('Lista creada correctamente', 'OK', { duration: 3000 });

        if (this.data?.videoId && nuevaLista?.id) {
          this.agregarVideoALista(nuevaLista.id, this.data.videoId);
        } else {
          this.dialogRef.close(nuevaLista);
        }
      },
      error: (err) => {
        console.error('Error al crear lista', err);
        this.snackBar.open('Error al crear la lista', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private agregarVideoALista(listaId: number, videoId: number): void {
    this.playlistService.agregarVideoALista(listaId, videoId).subscribe({
      next: () => {
        this.snackBar.open('Video agregado a la lista', 'OK', { duration: 3000 });
        this.dialogRef.close({ listaId, videoAgregado: true });
      },
      error: () => {
        this.snackBar.open('Error al agregar video', 'Cerrar', { duration: 3000 });
        this.dialogRef.close();
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}