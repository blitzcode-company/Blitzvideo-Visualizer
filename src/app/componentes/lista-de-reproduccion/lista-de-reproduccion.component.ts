import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlaylistService } from '../../servicios/playlist.service';
import { AuthService } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SuscripcionesService } from '../../servicios/suscripciones.service';

@Component({
  selector: 'app-lista-de-reproduccion',
  templateUrl: './lista-de-reproduccion.component.html',
  styleUrls: ['./lista-de-reproduccion.component.css']
})
export class ListaDeReproduccionComponent implements OnInit, OnDestroy {

  userId: any;
  listas: any[] = [];
  usuarioSubscription: Subscription | undefined;
  serverIp = environment.serverIp;
  usuario: any;
  canales: any;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService,
    private suscripcionService: SuscripcionesService,
  ) {}

  ngOnInit() {
    this.obtenerUsuario();
  }

  ngOnDestroy() {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  obtenerUsuario(): void {
    this.authService.usuario$.subscribe(res => {
      this.usuario = res;
      this.userId = this.usuario.id
      this.mostrarCanalesSuscritos();

      if (this.userId) {
        this.obtenerListasDeReproduccion(this.userId); 
      }
  
    });
  
    this.authService.mostrarUserLogueado().subscribe();
  }


  obtenerListasDeReproduccion(userId: number) {
    this.playlistService.obtenerListasDeReproduccion(userId).subscribe(
      listas => {
        this.listas = listas.map(lista => ({
          ...lista,
          imagen: this.obtenerMiniaturaDelUltimoVideo(lista.videos)
        }));
        console.log(this.listas);
      },
      error => {
        console.error('Error al obtener listas de reproducción', error);
      }
    );
  }

  mostrarCanalesSuscritos() {
    this.suscripcionService.listarSuscripciones(this.userId).subscribe(
      suscripciones => {
        this.canales = suscripciones.map((suscripcion: any) => suscripcion.canal);
        console.log('Canales suscritos:', this.canales);  
      },
      error => {
        console.error('Error al obtener listas de suscripciones', error);
      }
    );
  }
  

 

  

  private obtenerMiniaturaDelUltimoVideo(videos: any[]): string {
    if (videos.length > 0) {
      const ultimoVideo = videos[videos.length - 1];
      return ultimoVideo.miniatura || 'assets/images/miniaturaDefault.png';
    }
    return 'assets/images/miniaturaDefault.png';
  }
}
