import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PlaylistService } from '../../servicios/playlist.service';
import { AuthService } from '../../servicios/auth.service';
import { CrearListaComponent } from '../crear-lista/crear-lista.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Playlist } from '../../clases/playlist';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agregar-lista',
  templateUrl: './agregar-lista.component.html',
  styleUrls: ['./agregar-lista.component.css']
})
export class AgregarListaComponent implements OnDestroy {
  listas: Playlist[] = [];
  listaSeleccionada: number | null = null;
  userId: number | null = null;
  loading = false;
  private sub?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<AgregarListaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { videoId: number },
    private playlistService: PlaylistService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.obtenerUsuario();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  obtenerUsuario(): void {
    this.sub = this.authService.usuario$.subscribe(usuario => {
      if (usuario?.id) {
        this.userId = usuario.id;
        this.cargarListas(this.userId!);
      }
    });
  }

  cargarListas(userId: number): void {
      this.loading = true;
      this.playlistService.obtenerListasDeReproduccion(userId).subscribe({
        next: (listas) => {
          this.listas = listas;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar listas', err);
          this.snackBar.open('Error al cargar listas', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }

  agregarVideo(): void {
    if (!this.listaSeleccionada) {
      this.snackBar.open('Selecciona una lista', 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.playlistService.agregarVideoALista(this.listaSeleccionada, this.data.videoId).subscribe({
      next: (res) => {
        this.snackBar.open('Video agregado correctamente', 'OK', { duration: 3000 });
        this.dialogRef.close({ agregado: true });
      },
      error: (err) => {
        this.snackBar.open(err.error.message, 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  abrirCrearListaModal(): void {
    const dialogRef = this.dialog.open(CrearListaComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { videoId: this.data.videoId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarListas(this.userId!);
        this.listaSeleccionada = result.id;
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}