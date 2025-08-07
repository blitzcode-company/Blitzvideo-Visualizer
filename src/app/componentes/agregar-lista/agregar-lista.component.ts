import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PlaylistService } from '../../servicios/playlist.service';
import { AuthService } from '../../servicios/auth.service';
import { CrearListaComponent } from '../crear-lista/crear-lista.component'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { Playlist } from '../../clases/playlist';


@Component({
  selector: 'app-agregar-lista',
  templateUrl: './agregar-lista.component.html',
  styleUrls: ['./agregar-lista.component.css'] 
})
export class AgregarListaComponent {
  listas: Playlist[] = [];
  
  listaSeleccionada: number | null = null;
  usuario: any;
  userId: any;

  constructor(
    public dialogRef: MatDialogRef<AgregarListaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { videoId: number },
    private playlistService: PlaylistService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar 
  ) {
    this.obtenerUsuario(); 
    this.listarListas();
  }

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      this.userId = this.usuario.id;
      this.listarListas(); 
    });

    this.authService.mostrarUserLogueado().subscribe();
  }

  listarListas(): void {
    this.playlistService.obtenerListasDeReproduccion(this.userId).subscribe(
      res => {
        console.log('Respuesta transformada:', res);
        this.listas = res; 
        console.log('Listas asignadas:', this.listas);
      },
      error => {
        console.error('Error al cargar las lista:', error);
      }
    );
  }

  agregarVideo(): void {
    if (this.listaSeleccionada !== null) {
      this.playlistService.agregarVideoALista(this.listaSeleccionada, this.data.videoId).subscribe(
        response => {
          this.snackBar.open('Video agregado a la lista con éxito.', 'Cerrar', {
            duration: 3000, 
          });
          this.dialogRef.close(response);
        },
        error => {
          console.error('Error al agregar video a la lista:', error);
          this.dialogRef.close();
        }
      );
    } else {
      alert('Por favor, selecciona una lista.');
    }
  }

  abrirCrearListaModal(): void {
    const dialogRef = this.dialog.open(CrearListaComponent, {
      width: '400px',
      data: { videoId: this.data.videoId } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listarListas();

        this.listaSeleccionada = result.id;
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
