import { NgModule, CUSTOM_ELEMENTS_SCHEMA, PLATFORM_ID, Inject  } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ChunkPipe } from './pipes/chunk.pipe'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './componentes/home/home.component';
import { HeaderComponent } from './componentes/header/header.component';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VerVideoComponent } from './componentes/ver-video/ver-video.component';
import { EditarUsuarioComponent } from './componentes/editar-usuario/editar-usuario.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ComentariosComponent } from './componentes/comentarios/comentarios.component';
import { UsuarioRequeridoComponent } from './Modales/usuario-requerido/usuario-requerido.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ResultadoDeBusquedaComponent } from './componentes/resultado-de-busqueda/resultado-de-busqueda.component'; 
import { ComentariosService } from './servicios/comentarios.service';
import { ContenidoDeComentariosComponent } from './componentes/contenido-de-comentarios/contenido-de-comentarios.component';
import { VerCanalComponent } from './componentes/ver-canal/ver-canal.component';
import { VideosDelCanalComponent } from './componentes/videos-del-canal/videos-del-canal.component';
import {VgCoreModule} from '@videogular/ngx-videogular/core';
import {VgControlsModule} from '@videogular/ngx-videogular/controls';
import {VgOverlayPlayModule} from '@videogular/ngx-videogular/overlay-play';
import {VgBufferingModule} from '@videogular/ngx-videogular/buffering';
import { ReproductorVideoComponent } from './componentes/reproductor-video/reproductor-video.component'
import { RouterModule } from '@angular/router';
import { NoEncontradoComponent } from './componentes/no-encontrado/no-encontrado.component';
import { ListaDeReproduccionComponent } from './componentes/lista-de-reproduccion/lista-de-reproduccion.component';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/select';
import { ContenidoListaDeReproduccionComponent } from './componentes/contenido-lista-de-reproduccion/contenido-lista-de-reproduccion.component';
import { ConfirmacionDesuscribirModalComponent } from './componentes/confirmacion-desuscribir-modal/confirmacion-desuscribir-modal.component';
import { AgregarListaComponent } from './componentes/agregar-lista/agregar-lista.component';
import { CrearListaComponent } from './componentes/crear-lista/crear-lista.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ModalEditarlistaComponent } from './componentes/modal-editarlista/modal-editarlista.component';
import { PagosComponent } from './componentes/pagos/pagos.component';
import { ConfiguracionDePerfilComponent } from './componentes/configuracion-de-perfil/configuracion-de-perfil.component';
import { GraciasModalComponent } from './componentes/gracias-modal/gracias-modal.component';
import { SuscripcionPaypalComponent } from './componentes/suscripcion-paypal/suscripcion-paypal.component';
import { SeleccionPagoComponent } from './componentes/seleccion-pago/seleccion-pago.component';
import { ModalReporteVideoComponent } from './componentes/modal-reporte-video/modal-reporte-video.component';
import { ReportesService } from './servicios/reportes.service';
import { ModalReporteComentarioComponent } from './componentes/modal-reporte-comentario/modal-reporte-comentario.component';
import { ModalReportarUsuarioComponent } from './componentes/modal-reportar-usuario/modal-reportar-usuario.component';
import { MatCardModule } from '@angular/material/card';
import { VerStreamComponent } from './componentes/ver-stream/ver-stream.component';
import { ReproductorStreamComponent } from './componentes/reproductor-stream/reproductor-stream.component';
import { ConfiguracionStreamComponent } from './componentes/configuracion-stream/configuracion-stream.component';
import { SidebarComponent } from './componentes/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModocineService } from './servicios/modocine.service';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { TiempoPipe } from './pipes/tiempo.pipe';
import { ChatDeStreamComponent } from './componentes/chat-de-stream/chat-de-stream.component';
import { HistorialComponent } from './componentes/historial/historial.component';
import { TendenciasComponent } from './componentes/tendencias/tendencias.component';
import { NuevosComponent } from './componentes/nuevos/nuevos.component';
import { VideosDeEtiquetaComponent } from './componentes/videos-de-etiqueta/videos-de-etiqueta.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingBarComponent } from './componentes/shared/loading-bar/loading-bar.component';
import { LoadingBarService } from './servicios/loading-bar.service';
import { LoadingInterceptor } from './servicios/core/interceptors/loading.service';

@NgModule({
  declarations: [
    AppComponent,
    ChunkPipe,
    HomeComponent,
    HeaderComponent,
    VerVideoComponent,
    EditarUsuarioComponent,
    ComentariosComponent,
    UsuarioRequeridoComponent,
    ResultadoDeBusquedaComponent,
    ContenidoDeComentariosComponent,
    VideosDelCanalComponent,
    VerCanalComponent,
    ReproductorVideoComponent,
    NoEncontradoComponent,
    ListaDeReproduccionComponent,
    ContenidoListaDeReproduccionComponent,
    ConfirmacionDesuscribirModalComponent,
    AgregarListaComponent,
    CrearListaComponent,
    ModalEditarlistaComponent,
    PagosComponent,
    ConfiguracionDePerfilComponent,
    GraciasModalComponent,
    SuscripcionPaypalComponent,
    SeleccionPagoComponent,
    ModalReporteVideoComponent,
    ModalReporteComentarioComponent,
    ModalReportarUsuarioComponent,
    VerStreamComponent,
    ReproductorStreamComponent,
    ConfiguracionStreamComponent,
    SidebarComponent,
    TiempoPipe,
    ChatDeStreamComponent,
    HistorialComponent,
    TendenciasComponent,
    NuevosComponent,
    VideosDeEtiquetaComponent,
    SafeHtmlPipe,
    LoadingBarComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatCardModule,
    BrowserAnimationsModule, 
    RouterModule.forRoot([
      { path: 'video/:id', component: VerVideoComponent },
    ]),
    NgbModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    MatFormFieldModule,
    MatMenuModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatOption,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatCheckboxModule,
    DragDropModule,

  ],
  exports: [
    VerVideoComponent,
    ContenidoDeComentariosComponent,
    ComentariosComponent,
    SidebarComponent, 
    ChatDeStreamComponent
    
  ],
  providers: [
    CookieService, 
    LoadingBarService,
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    provideAnimationsAsync(),
    ComentariosService, 
    ModocineService,
    ReportesService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {
  
  
}
