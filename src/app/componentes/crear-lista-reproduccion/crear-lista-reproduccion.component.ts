import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlaylistService } from '../../servicios/playlist.service';
import { AuthService } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crear-lista-reproduccion',
  templateUrl: './crear-lista-reproduccion.component.html',
  styleUrls: ['./crear-lista-reproduccion.component.css']
})
export class CrearListaReproduccionComponent implements OnInit, OnDestroy {
  nombreLista: string = '';
  acceso: boolean = false;
  listas: any[] = [];
  isCreatingPlaylist = false;
  usuario: any;
  usuarioSubscription: Subscription | undefined;
  userId: number | null = null; 
  videoId: number | null = null;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<CrearListaReproduccionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    this.videoId = data.videoId;
  }

  ngOnInit() {
    this.obtenerUsuario();
    this.obtenerListasDeReproduccion(this.userId)
  }

  ngOnDestroy() {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  obtenerListasDeReproduccion(userId: number | null) {
    if (userId) {
      this.playlistService.obtenerListasDeReproduccion(userId).subscribe(listas => {
        this.listas = listas;
      });
    }
  }

  crearLista() {
    if (this.nombreLista.trim() && this.userId) {
      this.playlistService.crearLista(this.nombreLista, this.acceso, this.userId)
        .subscribe(() => {
          this.obtenerListasDeReproduccion(this.userId);
          this.isCreatingPlaylist = false;
          this.nombreLista = '';
          this.acceso = false;
          this.dialogRef.close(true); 
        });
    }
  }

  obtenerUsuario() {
    this.usuarioSubscription = this.authService.usuario$.subscribe(res => {
      this.userId = res?.id || null; 
      if (this.userId) {
        this.obtenerListasDeReproduccion(this.userId); 
      }
    });

    this.authService.mostrarUserLogueado().subscribe();
  }

  agregarVideoALista(playlistId: number) {
    if (this.videoId) {
      this.playlistService.agregarVideoALista(playlistId, this.videoId)
        .subscribe(() => {
          this.dialogRef.close(true); 
        });
    }
  }

  closeModal() {
    this.dialogRef.close(); 
  }
}
