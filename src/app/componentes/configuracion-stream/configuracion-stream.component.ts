import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { CanalService } from '../../servicios/canal.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Canal } from '../../clases/canal';
import { environment } from '../../../environments/environment';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StreamService } from '../../servicios/stream.service';

@Component({
  selector: 'app-configuracion-stream',
  templateUrl: './configuracion-stream.component.html',
  styleUrl: './configuracion-stream.component.css',
  animations: [
    trigger('fadeInOut', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate('300ms ease-in', style({ opacity: 1 }))
        ]),
        transition(':leave', [
            animate('300ms ease-out', style({ opacity: 0 }))
        ])
    ])
]
})
export class ConfiguracionStreamComponent {

  usuario: any;
  canal: Canal = new Canal();
  streamData = { server: '', stream_key: '' };
  tieneCanal = false;
  mostrarRtmpServer = false;
  mostrarStreamKey = false;
  alertMessageStream: string | null = null;
  serverIp = environment.serverIp;
  apiUrl = environment.apiUrl; // Asegúrate de definir apiUrl en environment.ts
  usuarioSubscription: Subscription | undefined;

  constructor(
      private authService: AuthService,
      private canalService: CanalService,
      private streamService: StreamService,
      private httpClient: HttpClient,
      private titleService: Title
  ) {}

  ngOnInit() {
      this.titleService.setTitle('Configuración de Stream - BlitzVideo');
      this.obtenerUsuario();
  }

  ngOnDestroy() {
      if (this.usuarioSubscription) {
          this.usuarioSubscription.unsubscribe();
      }
  }

  obtenerUsuario() {
      this.usuarioSubscription = this.authService.usuario$.subscribe(res => {
          this.usuario = res;
          if (this.usuario && this.usuario.id) {
              this.obtenerCanal();
          }
      });
      this.authService.mostrarUserLogueado().subscribe();
  }

  obtenerCanal() {
      this.canalService.obtenerUsuarioPorId(this.usuario.id).subscribe({
          next: (response) => {
              if (response && response.canales) {
                  this.canal = response.canales;
                  this.tieneCanal = true;
                  this.cargarStreamData();
              } else {
                  this.tieneCanal = false;
              }
          },
          error: () => {
              this.tieneCanal = false;
              this.alertMessageStream = 'Error al verificar el canal.';
          }
      });
  }

  toggleMostrarRtmpServer() {
      this.mostrarRtmpServer = !this.mostrarRtmpServer;
  }

  toggleMostrarStreamKey() {
      this.mostrarStreamKey = !this.mostrarStreamKey;
  }



  cargarStreamData() {
      if (!this.canal.id || !this.usuario.id) {
          this.alertMessageStream = 'No se pudo cargar la información del canal.';
          return;
      }
      this.streamService.obtenerInformacionRTMP(this.canal.id, this.usuario.id).subscribe({
          next: (response) => {
              this.streamData = {
                  server: response.server,
                  stream_key: response.stream_key
              };
              this.alertMessageStream = 'Datos de stream cargados correctamente.';
          },
          error: (error) => {
              this.alertMessageStream = `Error al cargar datos de stream: ${error.error.message || error.message}`;
          }
      });
  }


}
