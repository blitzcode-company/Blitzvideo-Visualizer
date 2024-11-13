import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
  @Output() listaCreada = new EventEmitter<any>(); 
  usuario: any;
  userId: any;

  constructor(
    public dialogRef: MatDialogRef<CrearListaComponent>,
    private playlistService: PlaylistService,
    @Inject(MAT_DIALOG_DATA) public data: { videoId: number },
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.obtenerUsuario(); 
  }

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      this.userId = this.usuario.id;
    });

    this.authService.mostrarUserLogueado().subscribe();
  }

  crearLista(): void {
    if (this.nombreLista.trim()) {
        this.playlistService.crearLista(this.nombreLista, this.acceso, this.userId).subscribe(
            response => {
                if (response && response.playlist && response.playlist.id) {
                    this.agregarVideoALista(response.playlist.id, this.data.videoId);
                } else {
                    console.error('No se pudo obtener el ID de la lista creada:', response);
                    this.dialogRef.close();
                }
            },
            error => {
                console.error('Error al crear la lista:', error);
                this.dialogRef.close(); 
            }
        );
    } else {
        alert('El nombre de la lista no puede estar vacío.');
    }
}

  agregarVideoALista(listaId: number, videoId: number): void {
    this.playlistService.agregarVideoALista(listaId, videoId).subscribe(
      () => {
        this.snackBar.open('Video agregado a la lista con éxito.', 'Cerrar', {
            duration: 3000,
        });
        this.dialogRef.close();
        window.location.reload(); 

      },
      error => {
        console.error('Error al agregar video a la lista:', error);
        this.dialogRef.close(); 
      }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
